"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/prisma"; // Ajuste o caminho se necessário
import { put } from "@vercel/blob";

// ============================================================================
// 1. SCHEMAS DE VALIDAÇÃO
// ============================================================================

const categorySchema = z.object({
    name: z.string().min(1, "O nome da categoria é obrigatório"),
});

const productSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional(),
    price: z.coerce.number().min(0.01, "Preço inválido"),
    promoPrice: z.coerce.number().optional().nullable(),
    imageUrl: z.string().optional().nullable(), // Aceita string ou null
    categoryId: z.string().min(1, "Categoria é obrigatória"),

    options: z.array(z.object({
        name: z.string(),
        price: z.coerce.number()
    })).optional(),
    flavors: z.array(z.object({
        name: z.string(),
        price: z.coerce.number()
    })).optional()
});

// ============================================================================
// 2. CRUD DE CATEGORIAS (Mantido igual)
// ============================================================================

export async function getCategories() {
    try {
        return await prisma.category.findMany({ orderBy: { name: "asc" } });
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        return [];
    }
}

export async function createCategory(data: any) {
    const validation = categorySchema.safeParse(data);
    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors };
    }
    try {
        await prisma.category.create({
            data: {
                name: validation.data.name,
                slug: validation.data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
            },
        });
        revalidatePath("/admin/produtos");
        revalidatePath("/admin/categorias");
        return { success: true };
    } catch (error) {
        return { error: "Erro ao criar categoria." };
    }
}

export async function deleteCategory(id: string) {
    try {
        const count = await prisma.product.count({ where: { categoryId: id } });
        if (count > 0) return { error: `Esta categoria tem ${count} produtos. Remova-os primeiro.` };
        await prisma.category.delete({ where: { id } });
        revalidatePath("/admin/categorias");
        revalidatePath("/admin/produtos");
        return { success: true };
    } catch (error) {
        return { error: "Erro ao deletar categoria." };
    }
}

// ============================================================================
// 3. CRUD DE PRODUTOS
// ============================================================================

export async function getProducts() {
    try {
        return await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: { category: true, options: true, flavors: true }
        });
    } catch (error) { return []; }
}

export async function getProductById(id: string) {
    try {
        return await prisma.product.findUnique({
            where: { id },
            include: { options: true, flavors: true }
        });
    } catch (error) { return null; }
}

/**
 * Cria um produto novo (Apenas Upload de Arquivo)
 */
export async function createProduct(prevState: any, formData: FormData) {

    // 1. Processar Imagem (Vercel Blob)
    const imageFile = formData.get("imageFile") as File;
    let imageUrl = ""; // Começa vazio. Se não subir nada, salva vazio (ícone padrão)

    if (imageFile && imageFile.size > 0) {
        try {
            const blob = await put(imageFile.name, imageFile, { access: 'public' });
            imageUrl = blob.url;
        } catch (error) {
            console.error("Erro upload:", error);
            return { error: "Erro ao subir imagem." };
        }
    }

    // 2. Processar Arrays
    const rawOptions = formData.get("options") as string;
    const rawFlavors = formData.get("flavors") as string;
    const options = rawOptions ? JSON.parse(rawOptions) : [];
    const flavors = rawFlavors ? JSON.parse(rawFlavors) : [];

    // 3. Montar Objeto
    const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
        price: formData.get("price"),
        promoPrice: formData.get("promoPrice") || null,
        categoryId: formData.get("categoryId"),
        imageUrl: imageUrl || null, // Se for string vazia, manda null pro banco
        options,
        flavors
    };

    const validation = productSchema.safeParse(rawData);
    if (!validation.success) return { error: validation.error.flatten().fieldErrors };

    const data = validation.data;

    try {
        await prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                promoPrice: data.promoPrice,
                imageUrl: data.imageUrl,
                isAvailable: true,
                category: { connect: { id: data.categoryId } },
                options: {
                    create: data.options?.map(opt => ({ name: opt.name, price: opt.price })) || []
                },
                flavors: {
                    create: data.flavors?.map(flav => ({ name: flav.name, price: flav.price })) || []
                }
            }
        });

        revalidatePath("/admin/produtos");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Erro interno ao criar produto." };
    }
}

/**
 * Atualiza Produto
 */
export async function updateProduct(id: string, prevState: any, formData: FormData) {
    // 1. Processar Imagem
    const imageFile = formData.get("imageFile") as File;
    let imageUrl = undefined; // Undefined = não muda o que já está no banco

    // Só faz upload se o usuário mandou um arquivo novo
    if (imageFile && imageFile.size > 0) {
        try {
            const blob = await put(imageFile.name, imageFile, { access: 'public' });
            imageUrl = blob.url;
        } catch (error) {
            return { error: "Erro ao subir imagem." };
        }
    }

    const rawOptions = formData.get("options") as string;
    const rawFlavors = formData.get("flavors") as string;
    const options = rawOptions ? JSON.parse(rawOptions) : [];
    const flavors = rawFlavors ? JSON.parse(rawFlavors) : [];

    // Validamos apenas o que veio
    const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
        price: formData.get("price"),
        promoPrice: formData.get("promoPrice") || null,
        categoryId: formData.get("categoryId"),
        // Se imageUrl for undefined, o Zod ignora se for optional
        imageUrl: imageUrl,
        options,
        flavors
    };

    // Ajuste no schema para update (imagem opcional)
    const updateSchema = productSchema.extend({ imageUrl: z.string().optional().nullable() });
    const validation = updateSchema.safeParse(rawData);

    if (!validation.success) return { error: validation.error.flatten().fieldErrors };
    const data = validation.data;

    try {
        await prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                promoPrice: data.promoPrice,
                // Só atualiza a imagem se imageUrl tiver valor (se for undefined, o prisma ignora)
                ...(imageUrl !== undefined && { imageUrl: imageUrl }),
                categoryId: data.categoryId,
                options: {
                    deleteMany: {},
                    create: data.options?.map(opt => ({ name: opt.name, price: opt.price })) || []
                },
                flavors: {
                    deleteMany: {},
                    create: data.flavors?.map((flav) => ({ name: flav.name, price: flav.price })) || []
                }
            }
        });

        revalidatePath("/admin/produtos");
        return { success: true };
    } catch (error) {
        return { error: "Erro ao atualizar produto." };
    }
}

export async function deleteProduct(id: string) {
    try {
        await prisma.product.delete({ where: { id } });
        revalidatePath("/admin/produtos");
        return { success: true };
    } catch (error) {
        return { error: "Erro ao deletar produto." };
    }
}

export async function toggleProductAvailability(id: string, currentStatus: boolean) {
    try {
        await prisma.product.update({ where: { id }, data: { isAvailable: !currentStatus } });
        revalidatePath("/admin/produtos");
        return { success: true };
    } catch (error) { return { error: "Erro ao atualizar status." }; }
}