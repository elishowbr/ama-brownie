"use server";

import { prisma } from "@/prisma"; // Ajuste seu import do prisma
import { createSession } from "@/lib/auth"; // Use o arquivo de sessão que criamos antes
import { compare } from "bcryptjs";
import { redirect } from "next/navigation";

// 1. Verifica quem é o usuário pelo telefone
export async function checkUserRole(phone: string) {
    const user = await prisma.user.findUnique({
        where: { phone },
        select: { id: true, role: true } // Só precisamos saber isso por enquanto
    });

    if (!user) {
        return { error: "Telefone não cadastrado." };
    }

    return { success: true, role: user.role, userId: user.id };
}

// 2. Realiza o login (Com senha para Admin, direto para Cliente)
export async function authenticateUser(phone: string, password?: string) {
    const user = await prisma.user.findUnique({
        where: { phone }
    });

    if (!user) return { error: "Usuário não encontrado" };

    // LÓGICA DO ADMIN (Exige Senha)
    if (user.role === 'ADMIN') {
        if (!password) return { error: "Senha obrigatória para administradores." };

        const isValid = await compare(password, user.password || "");
        if (!isValid) return { error: "Senha incorreta." };
    }

    // LÓGICA DO CLIENTE (Não exige senha, login suave)
    // Se chegou aqui, ou é Cliente, ou é Admin com senha correta.

    // Cria a sessão (Cookie)
    await createSession(user.id, user.role);

    // Redireciona baseado no cargo
    if (user.role === 'ADMIN') {
        redirect("/admin/dashboard");
    } else {
        redirect("/meus-pedidos");
    }
}