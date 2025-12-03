"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { X, Minus, Plus } from "lucide-react";
import Image from "next/image";

// --- INTERFACES ---
interface ProductOption {
    id: string;
    name: string;
    price: number;
}

interface Produto {
    id: string;
    name: string;
    description: string | null;
    price: number;
    promoPrice?: number | null;
    imageUrl?: string | null;
    options?: ProductOption[]; // Adicionais / Tamanhos
    flavors?: ProductOption[]; // Sabores
}

interface ProductModalProps {
    produto: Produto;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductModal({ produto, isOpen, onClose }: ProductModalProps) {
    const [quantidade, setQuantidade] = useState(1);
    const [observacao, setObservacao] = useState("");

    // --- ESTADOS SEPARADOS (CORREÇÃO) ---
    const [saborEscolhido, setSaborEscolhido] = useState<ProductOption | null>(null);
    const [opcaoEscolhida, setOpcaoEscolhida] = useState<ProductOption | null>(null); // Estado separado para opção

    const { addToCart } = useCart();

    // --- 1. INICIALIZAÇÃO ---
    useEffect(() => {
        if (isOpen && produto) {
            setQuantidade(1);
            setObservacao("");

            // Lógica de Sabor (Seleciona 1º automático)
            if (produto.flavors && produto.flavors.length > 0) {
                setSaborEscolhido(produto.flavors[0]);
            } else {
                setSaborEscolhido(null);
            }

            // Lógica de Opção (Reseta para null)
            setOpcaoEscolhida(null);
        }
    }, [isOpen, produto]);

    if (!isOpen || !produto) return null;

    // --- CÁLCULOS DE PREÇO ---
    const basePrice = (produto.promoPrice !== null && produto.promoPrice !== undefined)
        ? Number(produto.promoPrice)
        : Number(produto.price);

    const isOnSale = (produto.promoPrice !== null && produto.promoPrice !== undefined) && produto.promoPrice < produto.price;

    const flavorPrice = saborEscolhido ? Number(saborEscolhido.price) : 0;
    const optionPrice = opcaoEscolhida ? Number(opcaoEscolhida.price) : 0; // Preço da opção separado

    const unitPrice = basePrice + flavorPrice + optionPrice; // Soma tudo
    const totalPrice = unitPrice * quantidade;

    const handleConfirm = () => {
        // Formata o texto da opção para exibir no carrinho (ex: "Tamanho G (+ R$ 5,00)")
        const textoOpcao = opcaoEscolhida
            ? `${opcaoEscolhida.name} ${opcaoEscolhida.price > 0 ? `(+ ${formatCurrency(opcaoEscolhida.price)})` : ''}`
            : undefined;

        addToCart({
            id: produto.id,
            // O ID temporário agora considera Sabor E Opção para ser único
            tempId: `${produto.id}-${saborEscolhido?.id || 'std'}-${opcaoEscolhida?.id || 'std'}-${Date.now()}`,
            name: produto.name,
            price: unitPrice,
            quantity: quantidade,
            image: produto.imageUrl || null,
            observacao: observacao,

            // Envia os dados separadamente para o Contexto
            flavor: saborEscolhido?.name,
            opcao: textoOpcao,
        });
        onClose();
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="fixed inset-0 z-[999] flex justify-center items-end md:items-center p-0 md:p-4">
            <div
                className="absolute inset-0 bg-chocolate-900/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="
                relative bg-white flex flex-col overflow-hidden shadow-2xl
                w-full h-[90vh] md:h-auto md:max-h-[90vh] md:max-w-[500px]
                rounded-t-[2rem] md:rounded-3xl
                animate-slideUpPanel md:animate-zoomIn
            ">

                {/* IMAGEM HEADER */}
                <div className="relative h-56 w-full bg-gray-100 shrink-0">
                    {produto.imageUrl ? (
                        <Image
                            fill
                            src={produto.imageUrl}
                            alt={produto.name}
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50 text-amber-800/40">
                            <span className="font-serif font-bold text-xl">AMA BROWNIE</span>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/90 hover:bg-white text-chocolate-900 rounded-full p-2 shadow-sm transition-all z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {isOnSale && (
                        <div className="absolute bottom-4 left-6 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            PROMOÇÃO
                        </div>
                    )}
                </div>

                {/* CONTEÚDO SCROLL */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide">

                    {/* Info Produto */}
                    <div>
                        <div className="flex justify-between items-start gap-4">
                            <h2 className="text-2xl font-serif font-bold text-chocolate-900 leading-tight">
                                {produto.name}
                            </h2>
                            <div className="flex flex-col items-end shrink-0">
                                {isOnSale && (
                                    <span className="text-sm text-gray-400 line-through">
                                        {formatCurrency(produto.price)}
                                    </span>
                                )}
                                <span className={`text-xl font-bold ${isOnSale ? 'text-green-600' : 'text-chocolate-900'}`}>
                                    {formatCurrency(basePrice)}
                                </span>
                            </div>
                        </div>
                        {produto.description && (
                            <p className="text-chocolate-600/80 text-sm mt-2 leading-relaxed">
                                {produto.description}
                            </p>
                        )}
                    </div>

                    <hr className="border-gray-100" />

                    {/* --- 1. ESCOLHA DE SABOR (Rádio Obrigatório) --- */}
                    {produto.flavors && produto.flavors.length > 0 && (
                        <div className="space-y-3 mb-6">
                            <h4 className="font-bold text-gray-700 text-sm">Escolha o Sabor</h4>
                            <div className="flex flex-col gap-2">
                                {produto.flavors.map(sabor => (
                                    <div
                                        key={sabor.id}
                                        onClick={() => setSaborEscolhido(sabor)} // Atualiza APENAS o sabor
                                        className={`p-3 border-2 rounded-xl cursor-pointer flex justify-between ${saborEscolhido?.id === sabor.id ? 'border-chocolate-900 bg-amber-50' : 'border-gray-100'}`}
                                    >
                                        <span className="font-medium text-chocolate-900">{sabor.name}</span>
                                        {sabor.price > 0 && <span className="text-green-700 font-bold text-xs">+ {formatCurrency(sabor.price)}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- 2. ESCOLHA DE OPÇÃO/ADICIONAL (Toggle Opcional) --- */}
                    {produto.options && produto.options.length > 0 && (
                        <div className="space-y-3 mb-6">
                            <h4 className="font-bold text-gray-700 text-sm">Adicionais / Tamanho</h4>
                            <div className="flex flex-col gap-2">
                                {produto.options.map(opt => (
                                    <div
                                        key={opt.id}
                                        // CORREÇÃO: Atualiza APENAS a opção (Toggle)
                                        onClick={() => setOpcaoEscolhida(prev => prev?.id === opt.id ? null : opt)}
                                        className={`p-3 border-2 rounded-xl cursor-pointer flex justify-between ${opcaoEscolhida?.id === opt.id ? 'border-chocolate-900 bg-amber-50' : 'border-gray-100'}`}
                                    >
                                        <span className="font-medium text-chocolate-900">{opt.name}</span>
                                        {opt.price > 0 && <span className="text-green-700 font-bold text-xs">+ {formatCurrency(opt.price)}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Observação */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-gray-400 text-xs uppercase tracking-widest">Observações</h4>
                        <textarea
                            className="w-full h-24 p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-chocolate-900 focus:ring-1 focus:ring-chocolate-900 outline-none resize-none text-sm transition-all placeholder:text-gray-400"
                            placeholder="Ex: Caprichar na calda..."
                            value={observacao}
                            onChange={(e) => setObservacao(e.target.value)}
                        />
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
                    <div className="flex items-center gap-4">
                        {/* Quantidade */}
                        <div className="flex items-center bg-gray-100 rounded-xl px-2 h-14 shrink-0">
                            <button
                                onClick={() => setQuantidade(q => Math.max(1, q - 1))}
                                className="w-10 h-full flex items-center justify-center text-chocolate-900 hover:text-caramelo-600 active:scale-90 transition-transform disabled:opacity-50"
                                disabled={quantidade <= 1}
                            >
                                <Minus className="w-5 h-5" />
                            </button>
                            <span className="w-8 text-center font-bold text-lg text-chocolate-900">{quantidade}</span>
                            <button
                                onClick={() => setQuantidade(q => q + 1)}
                                className="w-10 h-full flex items-center justify-center text-chocolate-900 hover:text-caramelo-600 active:scale-90 transition-transform"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Botão Adicionar */}
                        <button
                            onClick={handleConfirm}
                            className="flex-1 h-14 bg-chocolate-900 hover:bg-chocolate-800 text-white rounded-xl font-bold text-base flex justify-between items-center px-6 shadow-lg shadow-chocolate-900/20 active:scale-[0.98] transition-all"
                        >
                            <span>Adicionar</span>
                            <span className="bg-white/10 px-2 py-1 rounded text-sm font-mono tracking-tighter">
                                {formatCurrency(totalPrice)}
                            </span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}