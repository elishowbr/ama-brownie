import { getOrders } from "@/app/actions/order";
import OrderCard from "./order-card";
import { PackageOpen } from "lucide-react";
import AutoRefresh from "./auto-refresh"; // <--- IMPORTE O COMPONENTE

export default async function AdminDashboard() {
    // O Next.js vai buscar os dados novos toda vez que o AutoRefresh chamar router.refresh()
    const orders = await getOrders();

    const pendingOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELED');
    const completedOrders = orders.filter(o => o.status === 'COMPLETED');

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-amber-900 font-serif">Painel de Pedidos</h1>
                    <p className="text-amber-700/70">Gerencie a fila da cozinha e entregas.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* O componente de Auto Refresh fica aqui */}
                    <AutoRefresh />

                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-amber-100">
                        <span className="text-xs text-gray-500 uppercase font-bold">Pendentes</span>
                        <p className="text-2xl font-bold text-chocolate-900">{pendingOrders.length}</p>
                    </div>
                </div>
            </div>

            {/* ... Resto do seu código (Seção de Pedidos Ativos e Histórico) ... */}
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Em Andamento ({pendingOrders.length})
            </h2>

            {pendingOrders.length === 0 ? (
                <div className="bg-white rounded-xl p-10 text-center border-2 border-dashed border-gray-200 mb-8">
                    <PackageOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 font-medium">Tudo tranquilo por aqui. Nenhum pedido pendente.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {pendingOrders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}

            {/* Histórico Recente */}
            {completedOrders.length > 0 && (
                <>
                    <h2 className="text-lg font-bold text-gray-500 mb-4 border-t border-gray-200 pt-8">
                        Histórico Recente
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity">
                        {completedOrders.slice(0, 6).map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}