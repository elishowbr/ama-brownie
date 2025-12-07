import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyOrders } from "@/app/actions/order";
import {
    ArrowLeft, Package, Clock, CheckCircle, ChefHat, Bike, Store, XCircle, Calendar
} from "lucide-react";

export default async function MeusPedidosPage() {
    // 1. Busca os dados no servidor
    const orders = await getMyOrders();

    // 2. Se retornou null, significa que não tem sessão -> Manda logar
    if (orders === null) {
        redirect("/login");
    }

    // Configuração visual dos status
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PENDING': return { label: 'Aguardando', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock };
            case 'PREPARING': return { label: 'Preparando', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: ChefHat };
            case 'DELIVERING': return { label: 'Em Rota', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Bike };
            case 'READY_TO_PICKUP': return { label: 'Pronto p/ Retirada', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Store };
            case 'COMPLETED': return { label: 'Entregue', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
            case 'CANCELED': return { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle };
            default: return { label: status, color: 'bg-gray-100 text-gray-700', icon: Package };
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] pb-20 font-sans">

            {/* HEADER */}
            <header className="bg-chocolate-900 text-white p-6 pb-16 sm:pb-20 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="max-w-md mx-auto relative z-10">
                    <Link href="/" className="inline-flex items-center text-caramelo-200 hover:text-white mb-6 transition-colors text-sm font-bold group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Voltar ao Cardápio
                    </Link>
                    <h1 className="text-3xl font-serif font-bold tracking-wide mb-1">Meus Pedidos</h1>
                    <p className="text-caramelo-200/80 text-sm">Acompanhe suas delícias em tempo real.</p>
                </div>
            </header>

            {/* CONTEÚDO (LISTA) */}
            <div className="max-w-md mx-auto px-4 mt-10 relative z-20">

                {/* Estado Vazio */}
                {orders.length === 0 && (
                    <div className="bg-white rounded-3xl p-8 text-center shadow-md border border-amber-50 mt-4 animate-fadeIn">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-10 h-10 text-amber-300" />
                        </div>
                        <h3 className="text-lg font-bold text-chocolate-900 mb-2">Nenhum pedido ainda</h3>
                        <p className="text-gray-500 text-sm mb-6 px-4">Que tal pedir um brownie agora mesmo para começar?</p>
                        <Link href="/" className="block w-full bg-chocolate-900 text-white font-bold py-3.5 rounded-xl hover:bg-chocolate-800 transition-all shadow-lg active:scale-95">
                            Ver Cardápio
                        </Link>
                    </div>
                )}

                {/* Lista de Pedidos */}
                <div className="space-y-4">
                    {orders.map((order, index) => {
                        const statusInfo = getStatusInfo(order.status);
                        const StatusIcon = statusInfo.icon;
                        const isScheduled = !!order.scheduledTo;
                        const scheduleDate = order.scheduledTo ? new Date(order.scheduledTo) : null;

                        return (
                            <div
                                key={order.id}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-slideUpPanel transition-all hover:shadow-md hover:-translate-y-0.5"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >

                                {/* Linha Superior: ID e Data */}
                                <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-50">
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Pedido</span>
                                        <p className="font-mono font-bold text-lg text-chocolate-900 tracking-tight">#{order.id.slice(-6).toUpperCase()}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Data</span>
                                        <p className="text-xs font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                                            {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border mb-4 ${statusInfo.color}`}>
                                    <StatusIcon className="w-5 h-5 shrink-0" />
                                    <span className="text-xs font-bold uppercase tracking-wide">{statusInfo.label}</span>
                                </div>

                                {/* Se for Agendado */}
                                {isScheduled && scheduleDate && (
                                    <div className="mb-4 flex items-center gap-2.5 text-xs bg-indigo-50 text-indigo-800 p-2.5 rounded-xl border border-indigo-100">
                                        <Calendar className="w-5 h-5 text-indigo-600 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase text-indigo-400">Agendado Para</span>
                                            <span className="font-bold text-sm">
                                                {scheduleDate.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Resumo dos Itens */}
                                <div className="space-y-2.5 pt-1">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="flex justify-between text-sm text-gray-700 items-start">
                                            <div className="flex-1">
                                                <span className="font-bold text-chocolate-900 mr-2 bg-chocolate-100 px-1.5 py-0.5 rounded text-xs">
                                                    {item.quantity}x
                                                </span>
                                                <span className="font-medium">{item.productName}</span>
                                                {item.chosenOption && (
                                                    <p className="text-xs text-gray-400 mt-0.5 ml-8 pl-2 border-l-2 border-gray-100 line-clamp-1">
                                                        {item.chosenOption}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Rodapé do Card: Total */}
                                <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total</span>
                                    <span className="text-xl font-bold text-chocolate-900 font-serif">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}