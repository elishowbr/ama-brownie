"use client";

import { useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { useCart } from "@/context/CartContext";

interface Produto {
    id: string; 
    name: string;
    description: string | null; 
    price: number;
    promoPrice?: number | null;
    category: { name: string };
    imageUrl?: string | null;
    options?: any[]; 
    isAvailable: boolean;
}

interface StoreInterfaceProps {
    initialProducts: Produto[];
}

export default function StoreInterface({ initialProducts }: StoreInterfaceProps) {
    
    const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
    const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
    const { openSidebar, cartCount } = useCart();

    const produtosFiltrados = initialProducts.filter(p => {
        const matchesCategory = categoriaAtiva === "Todos" || p.category.name === categoriaAtiva;
        const matchesAvailability = p.isAvailable === true;
        
        return matchesCategory && matchesAvailability;
    });

    const nomesCategorias = ["Todos", ...Array.from(new Set(initialProducts.map(p => p.category.name))).sort()];

    return (
        <div className="min-h-screen bg-creme pb-24">
            {/* HEADER RESPONSIVO */}
            <header className="sticky top-0 z-40 bg-chocolate-900 shadow-xl rounded-b-3xl">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex items-center justify-between p-4 text-white">
                        <Link href="/" className="p-2 hover:bg-chocolate-800 rounded-full transition-colors">
                            <span className="text-xl">←</span>
                        </Link>

                        <div className="flex flex-col items-center">
                            <span className="text-xs text-caramelo-500 font-bold tracking-widest uppercase">Cardápio</span>
                            <h1 className="text-xl font-serif font-bold tracking-wide">AMA BROWNIE</h1>
                        </div>

                        <button
                            onClick={openSidebar}
                            className="relative p-2 hover:bg-chocolate-800 rounded-full transition"
                        >
                            🛒
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-caramelo-500 text-chocolate-900 text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Categorias */}
                    <div className="px-4 pb-4 pt-1 flex gap-3 overflow-x-auto no-scrollbar md:justify-center">
                        {nomesCategorias.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategoriaAtiva(cat)}
                                className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all border-2 ${categoriaAtiva === cat ? 'bg-caramelo-500 text-chocolate-900 border-caramelo-500 shadow-md' : 'bg-chocolate-800 text-caramelo-100 border-chocolate-800 hover:bg-chocolate-600'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* LISTA DE PRODUTOS */}
            <main className="p-6 mt-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {produtosFiltrados.map((produto) => (
                        <ProductCard
                            key={produto.id}
                            produto={{
                                ...produto,
                                // Adaptação caso seu componente Card espere 'tag' e o banco não tenha
                                tag: null 
                            }}
                            onSelect={() => setProdutoSelecionado(produto)}
                        />
                    ))}
                </div>

                {/* Estado Vazio */}
                {produtosFiltrados.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p>Nenhum produto encontrado nesta categoria.</p>
                    </div>
                )}
            </main>

            {/* MODAL */}
            {produtoSelecionado && (
                <ProductModal
                    produto={produtoSelecionado}
                    isOpen={!!produtoSelecionado}
                    onClose={() => setProdutoSelecionado(null)}
                />
            )}
        </div>
    );
}