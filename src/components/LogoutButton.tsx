"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            // 1. Chama a API para apagar o cookie
            await fetch("/api/auth/logout", {
                method: "POST"
            });

            router.push("/login");
            router.refresh();

        } catch (error) {
            console.error("Erro ao sair", error);
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-300 hover:text-red-100 transition-colors text-sm p-2 w-full text-center hover:cursor-pointer"
        >
            🚪 Sair
        </button>
    );
}