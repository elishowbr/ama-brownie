"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, ChevronRight } from "lucide-react";
import Footer from "./Footer";

interface Produto {
    id: string;
    name: string;
    description: string | null;
    price: number;
    promoPrice?: number | null;
    category: { name: string };
    imageUrl?: string | null;
    options?: any[];
    flavors?: any[];
    isAvailable: boolean;
}

interface StoreInterfaceProps {
    initialProducts: Produto[];
}

export default function StoreInterface({ initialProducts }: StoreInterfaceProps) {
    const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
    const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
    const [scrolled, setScrolled] = useState(false);

    const { openSidebar, cartCount } = useCart();

    // Efeito para detectar o scroll e mudar o estilo do header
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const produtosFiltrados = initialProducts.filter(p => {
        const matchesCategory = categoriaAtiva === "Todos" || p.category.name === categoriaAtiva;
        const matchesAvailability = p.isAvailable === true;
        return matchesCategory && matchesAvailability;
    });

    const nomesCategorias = ["Todos", ...Array.from(new Set(initialProducts.map(p => p.category.name))).sort()];

    return (
        <div className="min-h-screen bg-[#FDFBF7] pb-24 font-sans">

            {/* --- HEADER PREMIUM --- */}
            <header
                className={`
                    sticky top-0 z-40 transition-all duration-300 ease-in-out border-b
                    ${scrolled
                        ? 'bg-chocolate-900/95 backdrop-blur-md border-chocolate-800 shadow-md py-2'
                        : 'bg-chocolate-900 border-transparent py-5'}
                `}
            >
                <div className="max-w-7xl mx-auto w-full px-4 md:px-6">

                    {/* Linha 1: Marca e Carrinho */}
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/" className="group flex flex-col cursor-pointer">
                            <span className={`text-[10px] text-creme font-bold tracking-[0.2em] uppercase transition-all ${scrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 mb-1'}`}>
                                Cardápio Digital
                            </span>
                            <h1 className={`font-serif font-bold text-white tracking-wide transition-all ${scrolled ? 'text-xl' : 'text-3xl'}`}>
                                AMA BROWNIE
                            </h1>
                        </Link>

                        <button
                            onClick={openSidebar}
                            className={`
                                relative p-3 rounded-2xl transition-all duration-300 active:scale-95 group
                                ${scrolled ? 'bg-white/10 hover:bg-white/20' : 'bg-white/5 hover:bg-white/15'}
                            `}
                        >
                            <ShoppingBag className="w-6 h-6 text-caramelo-100 group-hover:text-white transition-colors" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-caramelo-500 text-chocolate-900 text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-sm ring-2 ring-chocolate-900 animate-bounce">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Linha 2: Categorias (Scroll Horizontal Suave) */}
                    <div className={`transition-all duration-300 ${scrolled ? 'mt-0' : 'mt-2'}`}>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2 md:mx-0 md:px-0 scroll-smooth">
                            {nomesCategorias.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoriaAtiva(cat)}
                                    className={`
                                        whitespace-nowrap px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 tracking-wide
                                        ${categoriaAtiva === cat
                                            ? 'bg-caramelo-500 text-chocolate-900 shadow-lg shadow-caramelo-900/20 translate-y-[-1px]'
                                            : 'bg-white/5 text-caramelo-100/70 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10'}
                                    `}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* --- ÁREA DE CONTEÚDO --- */}
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">

                {/* Título da Seção Ativa */}
                <div className="flex items-center gap-3 mb-6 opacity-80">
                    <h2 className="text-lg font-bold text-chocolate-900 uppercase tracking-widest">
                        {categoriaAtiva}
                    </h2>
                    <div className="h-px bg-chocolate-900/10 flex-1"></div>
                    <span className="text-xs font-medium text-gray-400">
                        {produtosFiltrados.length} opções
                    </span>
                </div>

                {/* Grid de Produtos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {produtosFiltrados.map((produto, index) => (
                        <div
                            key={produto.id}
                            className="animate-fadeIn"
                            style={{ animationDelay: `${index * 50}ms` }} // Efeito cascata
                        >
                            <ProductCard
                                produto={{
                                    ...produto,
                                    tag: null
                                }}
                                onSelect={() => setProdutoSelecionado(produto)}
                            />
                        </div>
                    ))}
                </div>

                {/* Estado Vazio */}
                {produtosFiltrados.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-center opacity-60">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-5xl mb-4 grayscale">
                            🍪
                        </div>
                        <h3 className="text-lg font-bold text-chocolate-900">Poxa, acabou tudo!</h3>
                        <p className="text-sm text-gray-500 mt-1">Não encontramos produtos nesta categoria.</p>
                        <button
                            onClick={() => setCategoriaAtiva("Todos")}
                            className="mt-6 text-caramelo-600 font-bold hover:underline flex items-center gap-1"
                        >
                            Ver todo o cardápio <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </main>

            <Footer />

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