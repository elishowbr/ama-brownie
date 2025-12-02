import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* SIDEBAR (Lateral Esquerda) */}
            <aside className="w-64 bg-chocolate-900 text-white flex flex-col fixed h-full shadow-xl z-20">
                <div className="p-6 text-center border-b border-chocolate-800">
                    <h2 className="font-serif font-bold text-xl tracking-wide">AMA ADMIN</h2>
                    <p className="text-xs text-caramelo-500 mt-1">Painel de Controle</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin/dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium">
                        📦 Pedidos
                    </Link>
                    <Link href="/admin/produtos" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium">
                        🍩 Produtos
                    </Link>
                    <Link href="/admin/categorias" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium">
                        🏷️ Categorias
                    </Link>
                </nav>

                {/* Botão Sair */}
                <div className="p-4 border-t border-chocolate-800">
                    <LogoutButton />
                </div>
            </aside>

            {/* ÁREA DE CONTEÚDO PRINCIPAL (Direita) */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}