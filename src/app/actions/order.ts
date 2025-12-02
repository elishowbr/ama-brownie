"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma";


import { OrderType, PaymentMethod, OrderStatus } from "@/../generated/prisma"

interface CreateOrderData {
    customerName: string;
    customerPhone: string;
    address?: string;
    type: "DELIVERY" | "PICKUP";
    paymentMethod: "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH";
    total: number;
    items: any[];
    scheduledTo?: string | null;
}


export async function createOrder(data: CreateOrderData) {
    try {
        // 1. Lógica de Usuário: Find or Create
        let user = await prisma.user.findUnique({
            where: { phone: data.customerPhone }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: data.customerName,
                    phone: data.customerPhone,
                    role: "CLIENT",
                    address: data.address,
                }
            });
        } else {
            // Atualiza endereço se necessário
            if (data.address) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { address: data.address }
                });
            }
        }

        // 2. Criar o Pedido
        const order = await prisma.order.create({
            data: {
                user: {
                    connect: { id: user.id }
                },
                type: data.type as OrderType,
                status: "PENDING" as OrderStatus,
                paymentMethod: data.paymentMethod as PaymentMethod,
                address: data.type === "DELIVERY" ? data.address : null,
                total: data.total,
                scheduledTo: data.scheduledTo ? new Date(data.scheduledTo) : null,

                // 3. Criar os Itens
                items: {
                    create: data.items.map((item) => ({
                        // Relacionamento com Produto
                        product: {
                            connect: { id: item.id } // O ID do produto que vem do carrinho
                        },
                        productName: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        // Mapeamento correto dos nomes do Schema
                        chosenOption: item.opcao || null,      // Schema: chosenOption
                        observation: item.observacao || null   // Schema: observation
                    }))
                }
            }
        });

        revalidatePath("/admin/dashboard");

        return { success: true, orderId: order.id };

    } catch (error) {
        console.error("Erro detalhado ao criar pedido:", error);
        // Retorna o erro como string para facilitar o debug no alert do front
        return { success: false, error: String(error) };
    }
}

export async function getOrders() {
    return await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: true,
            items: true
        }
    });
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus as any } // Cast para o Enum do Prisma
        });

        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        return { success: false, error: "Falha ao atualizar" };
    }
}

export async function getUserByPhone(phone: string) {
    try {
        // Busca exata pelo telefone
        const user = await prisma.user.findUnique({
            where: { phone },
            select: {
                name: true,
                address: true // Pega o último endereço salvo
            }
        });

        return user;
    } catch (error) {
        return null;
    }
}