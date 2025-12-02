import { NextResponse } from "next/server";
import { compare } from "bcryptjs"; 
import { createSession } from "@/lib/auth"; 
import { prisma } from "@/prisma";

export async function POST(request: Request) {
    try {
        const { phone, password } = await request.json();

        const user = await prisma.user.findUnique({
            where: { phone }
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
        }

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
        }

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Acesso restrito a administradores" }, { status: 403 });
        }

        await createSession(user.id, user.role);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}