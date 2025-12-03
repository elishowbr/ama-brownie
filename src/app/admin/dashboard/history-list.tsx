"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, History } from "lucide-react";
import OrderCard from "./order-card";

// Reutilizamos a tipagem do card ou definimos any para facilitar aqui
export default function HistoryList({ orders }: { orders: any[] }) {
    const [isOpen, setIsOpen] = useState(false);

    if (orders.length === 0) return null;

    return (
        <div className="mt-12 border-t border-gray-200 pt-8">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-gray-500 hover:text-chocolate-900 transition-colors group w-full"
            >
                <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-amber-100 transition-colors`}>
                    <History className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg">Histórico de Pedidos ({orders.length})</span>
                <div className="ml-auto">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </button>

            {/* Animação simples de altura */}
            <div className={`grid transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}