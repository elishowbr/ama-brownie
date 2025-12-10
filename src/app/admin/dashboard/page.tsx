import { getOrders } from "@/app/actions/order";
import OrderCard from "./order-card";
import { PackageOpen } from "lucide-react";
import AutoRefresh from "./auto-refresh";
import HistoryList from "./history-list";

export const dynamic = 'force-dynamic';
export default async function AdminDashboard() {
    const orders = await getOrders();

    const activeOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELED');
    const historyOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'CANCELED');

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8">

            {/* CABEÇALHO */}
            {/* Ajuste: lg:flex-row garante que em tablets (com sidebar) ele fique lado a lado se der, senão quebra linha */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-amber-900 font-serif">Painel de Pedidos</h1>
                    <p className="text-amber-700/70">Gerencie a fila da cozinha e entregas.</p>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                    <AutoRefresh />

                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-amber-100 flex flex-col items-end">
                        <span className="text-xs text-gray-500 uppercase font-bold">Pendentes</span>
                        <p className="text-2xl font-bold text-chocolate-900 leading-none">{activeOrders.length}</p>
                    </div>
                </div>
            </div>

            {/* SEÇÃO PRINCIPAL */}
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Em Andamento ({activeOrders.length})
            </h2>

            {activeOrders.length === 0 ? (
                <div className="bg-white rounded-xl p-10 text-center border-2 border-dashed border-gray-200 mb-8">
                    <PackageOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 font-medium">Tudo tranquilo por aqui. Nenhum pedido pendente.</p>
                </div>
            ) : (
                // --- AQUI ESTÁ A CORREÇÃO DO GRID ---
                // Antes: lg:grid-cols-3 (Ficava espremido com a sidebar)
                // Agora: lg:grid-cols-2 (2 colunas em 1024px) e xl:grid-cols-3 (3 colunas só em telas grandes)
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {activeOrders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}

            {/* COMPONENTE RETRÁTIL */}
            {/* Nota: Se possível, aplique a mesma lógica de grid (xl:grid-cols-3) dentro do arquivo history-list.tsx também */}
            <HistoryList orders={historyOrders} />

        </div>
    );
}