"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/app/actions/order";
import {
    Truck, Store, User, Clock, CheckCircle, XCircle,
    MapPin, MessageSquare, ChefHat, Bike,
    CreditCard, Banknote, QrCode, DollarSign,
    CalendarClock
} from "lucide-react";

// Tipagem
interface OrderProps {
    order: {
        id: string;
        status: string;
        total: number;
        paymentMethod: string;
        type: string;
        address: string | null;
        createdAt: Date;
        scheduledTo: Date | null;
        user: { name: string; phone: string };
        items: {
            id: string;
            quantity: number;
            productName: string;
            chosenOption: string | null;
            observation: string | null;
        }[];
    };
}

export default function OrderCard({ order }: OrderProps) {
    const [loading, setLoading] = useState(false);

    const changeStatus = async (newStatus: string) => {
        // Feedback visual imediato é bom, mas vamos manter o loading por segurança
        setLoading(true);
        await updateOrderStatus(order.id, newStatus);
        setLoading(false);
    };
    const isScheduled = !!order.scheduledTo; // Se não for null, é true
    const scheduleDate = order.scheduledTo ? new Date(order.scheduledTo) : null;

    // --- CONFIGURAÇÃO DE STATUS (Cores e Ícones) ---
    const statusConfig: any = {
        PENDING: {
            color: "bg-yellow-50 text-yellow-700 border-yellow-200",
            label: "Pendente",
            icon: Clock,
            actions: [
                { label: "Aceitar Pedido", status: "PREPARING", style: "bg-blue-600 text-white hover:bg-blue-700" },
                { label: "Recusar", status: "CANCELED", style: "bg-white text-red-500 border border-red-200 hover:bg-red-50" }
            ]
        },
        PREPARING: {
            color: "bg-blue-50 text-blue-700 border-blue-200",
            label: "Preparando",
            icon: ChefHat,
            actions: order.type === 'DELIVERY'
                ? [{ label: "Saiu para Entrega", status: "DELIVERING", style: "bg-orange-500 text-white hover:bg-orange-600" }]
                : [{ label: "Pronto p/ Retirada", status: "READY_TO_PICKUP", style: "bg-purple-600 text-white hover:bg-purple-700" }]
        },
        DELIVERING: {
            color: "bg-orange-50 text-orange-700 border-orange-200",
            label: "Em Rota",
            icon: Bike,
            actions: [{ label: "Confirmar Entrega", status: "COMPLETED", style: "bg-green-600 text-white hover:bg-green-700" }]
        },
        READY_TO_PICKUP: {
            color: "bg-purple-50 text-purple-700 border-purple-200",
            label: "Aguardando Cliente",
            icon: Store,
            actions: [{ label: "Entregue ao Cliente", status: "COMPLETED", style: "bg-green-600 text-white hover:bg-green-700" }]
        },
        COMPLETED: {
            color: "bg-green-50 text-green-700 border-green-200",
            label: "Concluído",
            icon: CheckCircle,
            actions: []
        },
        CANCELED: {
            color: "bg-red-50 text-red-700 border-red-200",
            label: "Cancelado",
            icon: XCircle,
            actions: []
        },
    };

    // --- CONFIGURAÇÃO DE PAGAMENTO ---
    const paymentConfig: any = {
        PIX: { icon: QrCode, label: "Pix", color: "text-green-600" },
        CREDIT_CARD: { icon: CreditCard, label: "Crédito", color: "text-blue-600" },
        DEBIT_CARD: { icon: CreditCard, label: "Débito", color: "text-blue-800" },
        CASH: { icon: Banknote, label: "Dinheiro", color: "text-green-800" },
    };

    const currentStatus = statusConfig[order.status] || statusConfig.PENDING;
    const StatusIcon = currentStatus.icon;
    const paymentInfo = paymentConfig[order.paymentMethod] || { icon: DollarSign, label: order.paymentMethod, color: "text-gray-600" };
    const PaymentIcon = paymentInfo.icon;

    const wppLink = `https://wa.me/55${order.user.phone.replace(/\D/g, '')}`;



    return (
        <div className={`
        group relative flex flex-col bg-white rounded-2xl border transition-all duration-300
        ${order.status === 'COMPLETED' ? 'border-gray-100 opacity-80 hover:opacity-100' : 'border-amber-100 shadow-sm hover:shadow-lg hover:-translate-y-1'}
    `}>

            {/* 1. CABEÇALHO DO CARD */}
            <div className="p-5 pb-3 border-b border-gray-50 flex justify-between items-start">
                <div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${currentStatus.color} mb-2`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {currentStatus.label}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="font-mono text-2xl font-bold text-chocolate-900 tracking-tight">
                            #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                            {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>

                {isScheduled && scheduleDate && (
                    <div className="mx-5 mb-3 bg-indigo-50 border border-indigo-100 p-2 rounded-lg flex items-center gap-3 animate-pulse">
                        <div className="bg-indigo-100 p-1.5 rounded-full text-indigo-700">
                            <CalendarClock className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Encomenda Agendada</p>
                            <p className="text-sm font-bold text-indigo-900">
                                {scheduleDate.toLocaleDateString('pt-BR')} às {scheduleDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                )}

                <div className="text-right">
                    <div className="text-xl font-bold text-chocolate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                    </div>
                    <div className={`flex items-center justify-end gap-1 text-xs font-bold ${paymentInfo.color}`}>
                        <PaymentIcon className="w-3.5 h-3.5" />
                        {paymentInfo.label}
                    </div>
                </div>
            </div>

            {/* 2. DADOS DO CLIENTE (Bloco cinza sutil) */}
            <div className="bg-gray-50/80 px-5 py-3 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <User className="w-4 h-4 text-gray-400" />
                        {order.user.name}
                    </div>
                    <a
                        href={wppLink}
                        target="_blank"
                        className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md hover:bg-green-200 transition-colors"
                    >
                        <MessageSquare className="w-3 h-3" /> WhatsApp
                    </a>
                </div>

                {order.type === 'DELIVERY' ? (
                    <div className="flex gap-2 text-xs text-gray-500 leading-snug">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-chocolate-900" />
                        <span>{order.address}</span>
                    </div>
                ) : (
                    <div className="flex gap-2 text-xs text-purple-700 font-bold bg-purple-50 p-1.5 rounded-lg w-fit">
                        <Store className="w-3.5 h-3.5" /> Retirada na Loja
                    </div>
                )}
            </div>

            {/* 3. LISTA DE ITENS */}
            <div className="p-5 pt-3 space-y-3 flex-1">
                {order.items.map((item) => (
                    <div key={item.id} className="text-sm">
                        <div className="flex items-start justify-between">
                            <span className="text-gray-700 font-medium">
                                <span className="bg-chocolate-100 text-chocolate-900 font-bold px-1.5 rounded text-xs mr-2 border border-chocolate-200">
                                    {item.quantity}x
                                </span>
                                {item.productName}
                            </span>
                        </div>

                        {/* Adicionais */}
                        {item.chosenOption && (
                            <div className="ml-8 text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                {item.chosenOption}
                            </div>
                        )}

                        {/* OBSERVAÇÃO DESTAQUE */}
                        {item.observation && (
                            <div className="mt-1.5 ml-8 bg-amber-50 border border-amber-100 text-amber-800 text-xs p-2 rounded-lg italic flex gap-2 items-start">
                                <span className="font-bold not-italic">⚠️</span>
                                "{item.observation}"
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* 4. AÇÕES (Botões no rodapé) */}
            {currentStatus.actions.length > 0 && (
                <div className="p-4 pt-0 mt-auto">
                    <div className="grid grid-cols-1 gap-2">
                        {currentStatus.actions.map((action: any, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => changeStatus(action.status)}
                                disabled={loading}
                                className={`w-full py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${action.style}`}
                            >
                                {loading ? "Processando..." : action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}