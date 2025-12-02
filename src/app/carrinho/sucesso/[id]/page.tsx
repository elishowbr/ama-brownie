import Link from "next/link";
import { PrismaClient } from "@/../generated/prisma";
import { CheckCircle, MessageCircle, CalendarClock, Clock } from "lucide-react";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true, user: true }
    });

    if (!order) return notFound();

    // Lógica de Data
    const isScheduled = !!order.scheduledTo;
    const dataAgendada = isScheduled
        ? new Date(order.scheduledTo!).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        : "Imediata (O mais rápido possível)";

    // Mensagem WhatsApp
    const telefoneLoja = "5511999999999";
    let msg = `Olá! Fiz o pedido *#${order.id.slice(-6).toUpperCase()}* no site!\n`;
    if (isScheduled) msg += `*Agendado para:* ${dataAgendada}\n`;
    msg += `*Cliente:* ${order.user.name}\n`;
    msg += `*Status:* ${order.status}\n`;
    msg += `*Total:* R$ ${order.total.toFixed(2)}\n`;
    msg += `Poderiam confirmar?`;

    const whatsappUrl = `https://wa.me/${telefoneLoja}?text=${encodeURIComponent(msg)}`;

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-green-100 max-w-md w-full animate-slideUpPanel">

                {/* ÍCONE SUCESSO */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h1 className="text-3xl font-serif font-bold text-chocolate-900 mb-2">Pedido Recebido!</h1>
                <p className="text-gray-500 mb-6">Obrigado, {order.user.name.split(' ')[0]}!</p>

                {/* BLOCO DE INFORMAÇÕES */}
                <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left border border-gray-100">

                    {/* Linha do Número do Pedido */}
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Pedido</p>
                            <p className="text-xl font-mono font-bold text-chocolate-900">#{order.id.slice(-6).toUpperCase()}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${isScheduled ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {isScheduled ? 'Agendado' : 'Imediato'}
                        </div>
                    </div>

                    {/* BLOCO DE DATA DE ENTREGA (NOVO) */}
                    <div className={`flex items-center gap-3 p-3 rounded-lg border mb-4 ${isScheduled ? 'bg-purple-50 border-purple-100' : 'bg-blue-50 border-blue-100'}`}>
                        <div className={`p-2 rounded-full ${isScheduled ? 'bg-purple-200 text-purple-700' : 'bg-blue-200 text-blue-700'}`}>
                            {isScheduled ? <CalendarClock className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className={`text-[10px] font-bold uppercase tracking-wide ${isScheduled ? 'text-purple-400' : 'text-blue-400'}`}>
                                {isScheduled ? 'Agendado Para' : 'Previsão'}
                            </p>
                            <p className={`font-bold text-sm ${isScheduled ? 'text-purple-900' : 'text-blue-900'}`}>
                                {dataAgendada}
                            </p>
                        </div>
                    </div>

                    <div className="h-px bg-gray-200 my-4"></div>

                    {/* Lista de Itens */}
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">Resumo</p>
                    <div className="space-y-2">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="text-sm text-gray-600 flex justify-between">
                                <span>
                                    <span className="font-bold text-chocolate-900">{item.quantity}x</span> {item.productName}
                                    {item.chosenOption && <span className="text-xs text-gray-400 ml-1">({item.chosenOption})</span>}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <a
                    href={whatsappUrl}
                    target="_blank"
                    className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all mb-3 flex items-center justify-center gap-2"
                >
                    <MessageCircle className="w-5 h-5" /> Enviar Comprovante
                </a>

                <Link
                    href="/"
                    className="block w-full bg-white border-2 border-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-all"
                >
                    Voltar para o Início
                </Link>
            </div>
        </div>
    );
}