"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/prisma";


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
    imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
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
// 2. CRUD DE CATEGORIAS
// ============================================================================

/**
 * Busca todas as categorias ordenadas por nome
 */
export async function getCategories() {
    try {
        return await prisma.category.findMany({ orderBy: { name: "asc" } });
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        return [];
    }
}

/**
 * Cria uma nova categoria
 */
export async function createCategory(data: any) {
    const validation = categorySchema.safeParse(data);
    console.log('entrei')
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
        console.log('erro', error)
        return { error: "Erro ao criar categoria. Verifique se já existe." };
    }
}

/**
 * Deleta uma categoria
 * ATENÇÃO: Isso pode falhar se existirem produtos vinculados a ela.
 */
export async function deleteCategory(id: string) {
    try {
        // Verifica se tem produtos antes de deletar (opcional, mas recomendado)
        const count = await prisma.product.count({ where: { categoryId: id } });
        if (count > 0) {
            return { error: `Esta categoria tem ${count} produtos. Remova-os primeiro.` };
        }

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

/**
 * Busca produtos com suas categorias
 */
export async function getProducts() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                category: true,
                options: true,
                flavors: true
            }
        });
        return products;
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        return [];
    }
}

/**
 * Busca UM produto específico para edição (incluindo as opções)
 */
export async function getProductById(id: string) {
    try {
        return await prisma.product.findUnique({
            where: { id },
            include: { options: true, flavors: true }
        });
    } catch (error) {
        return null;
    }
}

/**
 * Cria um produto novo
 */
export async function createProduct(data: any) {
    const validation = productSchema.safeParse(data);
    if (!validation.success) return { error: validation.error.flatten().fieldErrors };

    const { name, description, price, promoPrice, imageUrl, categoryId, options, flavors } = validation.data;

    try {
        await prisma.product.create({
            data: {
                name,
                description,
                price,
                promoPrice,
                imageUrl,
                isAvailable: true,
                category: { connect: { id: categoryId } },
                options: {
                    create: options?.map(opt => ({ name: opt.name, price: opt.price })) || []
                },
                flavors: {
                    create: flavors?.map(flav => ({ name: flav.name, price: flav.price })) || []
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
 * Atualiza um produto existente
 * AULA: Atualizar relações (Opções) é chato. A estratégia mais simples para esse caso
 * é deletar todas as opções antigas e recriar as novas.
 */
export async function updateProduct(id: string, data: any) {
    const validation = productSchema.safeParse(data);
    if (!validation.success) return { error: validation.error.flatten().fieldErrors };

    const { name, description, price, promoPrice, imageUrl, categoryId, options, flavors } = validation.data;

    try {
        await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price,
                promoPrice,
                imageUrl,
                categoryId,
                options: {
                    deleteMany: {},
                    create: options?.map(opt => ({ name: opt.name, price: opt.price })) || []
                },
                flavors: {
                    deleteMany: {},
                    create: flavors?.map((flav) => ({ name: flav.name, price: flav.price })) || []
                }
            }
        });

        revalidatePath("/admin/produtos");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Erro ao atualizar produto." };
    }
}

/**
 * Deleta um produto
 */
export async function deleteProduct(id: string) {
    try {
        await prisma.product.delete({ where: { id } });
        revalidatePath("/admin/produtos");
        return { success: true };
    } catch (error) {
        return { error: "Erro ao deletar produto." };
    }
}

/**
 * Alternar disponibilidade (Estoque Rápido)
 */
export async function toggleProductAvailability(id: string, currentStatus: boolean) {
    try {
        await prisma.product.update({
            where: { id },
            data: { isAvailable: !currentStatus }
        });
        revalidatePath("/admin/produtos");
        return { success: true };
    } catch (error) {
        return { error: "Erro ao atualizar status." };
    }
}