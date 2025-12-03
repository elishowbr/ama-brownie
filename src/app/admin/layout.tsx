"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Package, ShoppingBag, Tag } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Fecha a sidebar automaticamente ao navegar (no mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-gray-50">

            {/* --- HEADER MOBILE (Aparece até 1023px) --- */}
            {/* MUDANÇA AQUI: de md:hidden para lg:hidden */}
            <div className="lg:hidden bg-chocolate-900 text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
                <span className="font-serif font-bold text-lg tracking-wide">AMA ADMIN</span>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 hover:bg-chocolate-800 rounded-lg transition-colors"
                >
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* --- BACKDROP (Fundo escuro no mobile) --- */}
            {isSidebarOpen && (
                <div
                    // MUDANÇA AQUI: de md:hidden para lg:hidden
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* --- SIDEBAR --- */}
            <aside className={`
                fixed top-0 left-0 h-full w-64 bg-chocolate-900 text-white flex flex-col shadow-2xl z-40
                transition-transform duration-300 ease-in-out
                /* No mobile está escondida (-translate-x-full). Se abrir, aparece (translate-x-0). */
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                
                /* MUDANÇA AQUI: Só fixa a partir de telas grandes (lg) */
                lg:translate-x-0 
            `}>
                <div className="p-6 text-center border-b border-chocolate-800 relative">
                    <h2 className="font-serif font-bold text-xl tracking-wide">AMA ADMIN</h2>
                    <p className="text-xs text-caramelo-500 mt-1">Painel de Controle</p>

                    {/* Botão fechar extra para mobile */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        // MUDANÇA AQUI: de md:hidden para lg:hidden
                        className="absolute top-4 right-4 lg:hidden text-caramelo-500 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <NavLink href="/admin/dashboard" icon={Package} active={pathname === "/admin/dashboard"}>
                        Pedidos
                    </NavLink>
                    <NavLink href="/admin/produtos" icon={ShoppingBag} active={pathname.startsWith("/admin/produtos")}>
                        Produtos
                    </NavLink>
                    <NavLink href="/admin/categorias" icon={Tag} active={pathname.startsWith("/admin/categorias")}>
                        Categorias
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-chocolate-800">
                    <LogoutButton />
                </div>
            </aside>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            {/* MUDANÇA AQUI: A margem só aplica em telas grandes (lg) */}
            <main className="flex-1 p-4 md:p-8 lg:ml-64 transition-all duration-300">
                {children}
            </main>
        </div>
    );
}

// Componente NavLink (sem alterações)
function NavLink({ href, icon: Icon, active, children }: any) {
    return (
        <Link
            href={href}
            className={`
                flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-medium
                ${active
                    ? "bg-caramelo-500 text-chocolate-900 shadow-md font-bold"
                    : "hover:bg-white/10 text-white/90 hover:text-white"}
            `}
        >
            <Icon className={`w-5 h-5 ${active ? "text-chocolate-900" : "text-caramelo-500"}`} />
            {children}
        </Link>
    );
}