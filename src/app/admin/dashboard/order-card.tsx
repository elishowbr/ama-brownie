"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/app/actions/order";
import {
    Truck, Store, User, Clock, CheckCircle, XCircle,
    MapPin, MessageSquare, ChefHat, Bike,
    CreditCard, Banknote, QrCode, DollarSign,
    CalendarClock
} from "lucide-react";

// Tipagem (Mantida igual)
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
        setLoading(true);
        await updateOrderStatus(order.id, newStatus);
        setLoading(false);
    };
    const isScheduled = !!order.scheduledTo;
    const scheduleDate = order.scheduledTo ? new Date(order.scheduledTo) : null;

    // --- CONFIGURAÇÃO DE STATUS ---
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
        group relative flex flex-col bg-white rounded-2xl border transition-all duration-300 h-full
        ${order.status === 'COMPLETED' ? 'border-gray-100 opacity-80 hover:opacity-100' : 'border-amber-100 shadow-sm hover:shadow-lg hover:-translate-y-1'}
    `}>

            {/* 1. CABEÇALHO DO CARD (Responsivo: Flex-col no mobile, Flex-row no desktop) */}
            <div className="p-4 sm:p-5 pb-3 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">

                {/* Lado Esquerdo: Status e ID */}
                <div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${currentStatus.color} mb-2`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {currentStatus.label}
                    </div>
                    <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-mono text-xl sm:text-2xl font-bold text-chocolate-900 tracking-tight">
                            #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>

                {/* Lado Direito: Preço e Pagamento */}
                <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end border-t sm:border-t-0 border-gray-50 pt-2 sm:pt-0 mt-2 sm:mt-0">
                    <div className="text-xl font-bold text-chocolate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold ${paymentInfo.color}`}>
                        <PaymentIcon className="w-3.5 h-3.5" />
                        {paymentInfo.label}
                    </div>
                </div>
            </div>

            {/* 1.5 ALERTA DE AGENDAMENTO (Responsivo) */}
            {isScheduled && scheduleDate && (
                <div className="mx-4 sm:mx-5 mb-3 bg-indigo-50 border border-indigo-100 p-2.5 rounded-lg flex items-start sm:items-center gap-3 animate-pulse mt-3 sm:mt-0">
                    <div className="bg-indigo-100 p-1.5 rounded-full text-indigo-700 shrink-0">
                        <CalendarClock className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Encomenda Agendada</p>
                        <p className="text-sm font-bold text-indigo-900 leading-tight">
                            {scheduleDate.toLocaleDateString('pt-BR')} às {scheduleDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            )}

            {/* 2. DADOS DO CLIENTE */}
            <div className="bg-gray-50/80 px-4 sm:px-5 py-3 flex flex-col gap-2">
                <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">{order.user.name}</span>
                    </div>
                    <a
                        href={wppLink}
                        target="_blank"
                        className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md hover:bg-green-200 transition-colors shrink-0"
                    >
                        <MessageSquare className="w-3 h-3" /> WhatsApp
                    </a>
                </div>

                {order.type === 'DELIVERY' ? (
                    <div className="flex gap-2 text-xs text-gray-500 leading-snug items-start">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-chocolate-900" />
                        <span className="break-words">{order.address}</span>
                    </div>
                ) : (
                    <div className="flex gap-2 text-xs text-purple-700 font-bold bg-purple-50 p-1.5 rounded-lg w-fit">
                        <Store className="w-3.5 h-3.5" /> Retirada na Loja
                    </div>
                )}
            </div>

            {/* 3. LISTA DE ITENS */}
            <div className="p-4 sm:p-5 pt-3 space-y-3 flex-1">
                {order.items.map((item) => (
                    <div key={item.id} className="text-sm">
                        <div className="flex items-start justify-between">
                            <span className="text-gray-700 font-medium leading-tight">
                                <span className="bg-chocolate-100 text-chocolate-900 font-bold px-1.5 rounded text-xs mr-2 border border-chocolate-200 inline-block mb-1">
                                    {item.quantity}x
                                </span>
                                {item.productName}
                            </span>
                        </div>

                        {/* Adicionais */}
                        {item.chosenOption && (
                            <div className="ml-0 sm:ml-8 text-xs text-gray-500 mt-1 flex items-center gap-1 pl-2 border-l-2 border-gray-100">
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                {item.chosenOption}
                            </div>
                        )}

                        {/* OBSERVAÇÃO DESTAQUE */}
                        {item.observation && (
                            <div className="mt-1.5 ml-0 sm:ml-8 bg-amber-50 border border-amber-100 text-amber-800 text-xs p-2 rounded-lg italic flex gap-2 items-start">
                                <span className="font-bold not-italic shrink-0">⚠️</span>
                                <span className="break-words">"{item.observation}"</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* 4. AÇÕES */}
            {currentStatus.actions.length > 0 && (
                <div className="p-4 pt-0 mt-auto">
                    <div className="grid grid-cols-1 gap-2">
                        {currentStatus.actions.map((action: any, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => changeStatus(action.status)}
                                disabled={loading}
                                className={`w-full py-3 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${action.style}`}
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