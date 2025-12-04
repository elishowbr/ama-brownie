"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createOrder, getUserByPhone } from "@/app/actions/order";
import FullScreenLoader from "@/components/FullScreenLoader";
import {
    Trash2, Plus, Minus, ArrowLeft, MessageCircle,
    MapPin, User, CreditCard, Search, Store, Bike, Loader2, Phone, Check, AlertCircle, Sparkles,
    Calendar, Clock, AlertTriangle, ChefHat
} from "lucide-react";

export default function CarrinhoPage() {
    const { items, removeFromCart, cartTotal, addToCart, increaseItem, decreaseItem, clearCart } = useCart();
    const router = useRouter();

    // --- ESTADOS DO FORMULÁRIO ---
    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [tipoEntrega, setTipoEntrega] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
    const [metodoPagamento, setMetodoPagamento] = useState("PIX");

    // --- ESTADOS DE ENDEREÇO ---
    const [cep, setCep] = useState("");
    const [rua, setRua] = useState("");
    const [numero, setNumero] = useState("");
    const [bairro, setBairro] = useState("");
    const [cidade, setCidade] = useState("");
    const [complemento, setComplemento] = useState("");

    // --- ESTADOS DE AGENDAMENTO ---
    const [agendarPedido, setAgendarPedido] = useState(false);
    const [dataAgendamento, setDataAgendamento] = useState("");
    const [horaAgendamento, setHoraAgendamento] = useState("");

    // --- ESTADOS DE UI/LOADING ---
    const [loading, setLoading] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);
    const [loadingUser, setLoadingUser] = useState(false);
    const [userFound, setUserFound] = useState(false);
    const [isFirstOrder, setIsFirstOrder] = useState(false);
    const [phoneError, setPhoneError] = useState("");

    const numeroInputRef = useRef<HTMLInputElement>(null);

    // --- MÁSCARA DE TELEFONE ---
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);

        if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }
        if (value.length > 10) {
            value = `${value.slice(0, 10)}-${value.slice(10)}`;
        } else if (value.length > 6) {
            value = `${value.slice(0, 9)}-${value.slice(9)}`;
        }

        setTelefone(value);
        setPhoneError("");
        setUserFound(false);
        setIsFirstOrder(false);
    };

    // --- BUSCA USUÁRIO AUTOMÁTICA ---
    const handlePhoneBlur = async () => {
        const rawPhone = telefone.replace(/\D/g, "");
        if (rawPhone.length < 10) {
            setPhoneError("Telefone inválido. Digite o DDD + Número.");
            return;
        }

        setLoadingUser(true);
        setUserFound(false);
        setIsFirstOrder(false);

        try {
            const user = await getUserByPhone(telefone);
            if (user) {
                setNome(user.name);
                setUserFound(true);
                if (user.address && tipoEntrega === 'DELIVERY') {
                    try {
                        const cepMatch = user.address.match(/\((\d{5}-\d{3}|\d{8})\)/);
                        if (cepMatch) setCep(cepMatch[1]);
                        const parts = user.address.split(',');
                        if (parts.length > 0) setRua(parts[0].trim());
                    } catch (e) {
                        console.log("Endereço complexo, não preenchido auto.");
                    }
                }
            } else {
                setIsFirstOrder(true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingUser(false);
        }
    };

    // --- BUSCA CEP ---
    const handleBuscarCep = async () => {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;
        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setRua(data.logradouro);
                setBairro(data.bairro);
                setCidade(`${data.localidade} - ${data.uf}`);
                numeroInputRef.current?.focus();
            }
        } catch (error) { console.error(error); }
        finally { setLoadingCep(false); }
    };

    // --- FINALIZAR PEDIDO ---
    const handleCheckout = async () => {
        if (!nome || !telefone) { alert("Preencha nome e telefone!"); return; }
        if (tipoEntrega === "DELIVERY" && (!rua || !numero || !bairro)) { alert("Endereço incompleto!"); return; }
        if (phoneError) { alert("Corrija o telefone antes de continuar."); return; }

        // Validação de Agendamento
        let dataISO = null;
        if (agendarPedido) {
            if (!dataAgendamento || !horaAgendamento) {
                alert("Selecione data e hora para o agendamento.");
                return;
            }
            const dataCombinada = new Date(`${dataAgendamento}T${horaAgendamento}`);
            if (dataCombinada < new Date()) {
                alert("Data de agendamento inválida (passado).");
                return;
            }
            dataISO = dataCombinada.toISOString();
        }

        setLoading(true);

        const enderecoFormatado = tipoEntrega === "DELIVERY"
            ? `${rua}, ${numero} - ${bairro}, ${cidade} (${cep}) ${complemento ? `- ${complemento}` : ''}`
            : undefined;

        const payload = {
            customerName: nome,
            customerPhone: telefone,
            type: tipoEntrega,
            address: enderecoFormatado,
            paymentMethod: metodoPagamento as any,
            total: cartTotal,
            scheduledTo: dataISO,
            items: items
        };

        const result = await createOrder(payload);

        if (result.success) {
            clearCart();
            router.push(`/pedido/sucesso/${result.orderId}`);
        } else {
            alert("Erro ao enviar pedido: " + result.error);
            setLoading(false);
        }
    };

    // --- RENDERIZAÇÃO ---

    if (loading) {
        return <FullScreenLoader />;
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
                <div className="p-10 text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-bold text-chocolate-900 mb-2">Seu carrinho está vazio</h2>
                    <Link href="/" className="text-caramelo-600 underline font-bold">Voltar ao Cardápio</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">

                {/* Header Simples */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 hover:bg-amber-100 rounded-full transition-colors text-chocolate-900">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-serif font-bold text-chocolate-900">Finalizar Pedido</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* --- COLUNA ESQUERDA: RESUMO --- */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100">
                            <h2 className="font-bold text-lg mb-4 text-chocolate-900">Resumo do Pedido</h2>
                            <div className="space-y-4">
                                {items.map(item => (
                                    <div key={item.tempId} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">

                                        {/* Imagem */}
                                        <div className="w-16 h-16 bg-amber-50 rounded-lg shrink-0 overflow-hidden relative border border-amber-100 hidden sm:block">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl">🍫</div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="font-medium text-chocolate-900">
                                                    <span className="font-bold mr-1">{item.quantity}x</span>
                                                    {item.name}
                                                </div>
                                                <div className="font-bold text-chocolate-900 whitespace-nowrap">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                                                </div>
                                            </div>

                                            {/* Detalhes */}
                                            <div className="mt-1 space-y-1">
                                                {item.flavor && (
                                                    <div className="text-xs font-bold text-purple-700 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                                        Sabor: {item.flavor}
                                                    </div>
                                                )}
                                                {item.opcao && (
                                                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded w-fit">
                                                        + {item.opcao}
                                                    </div>
                                                )}
                                                {item.observacao && (
                                                    <div className="text-xs text-gray-500 italic bg-amber-50 border border-amber-100 p-2 rounded-lg mt-2 flex gap-2">
                                                        <span className="font-bold not-italic text-amber-600">Obs:</span>
                                                        "{item.observacao}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- COLUNA DIREITA: FORMULÁRIO --- */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden p-6 space-y-6">

                            {/* 1. TIPO DE ENTREGA */}
                            <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-xl">
                                <button onClick={() => setTipoEntrega("DELIVERY")} className={`flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${tipoEntrega === "DELIVERY" ? 'bg-white text-chocolate-900 shadow-sm' : 'text-gray-500'}`}>
                                    <Bike className="w-4 h-4" /> Entrega
                                </button>
                                <button onClick={() => setTipoEntrega("PICKUP")} className={`flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${tipoEntrega === "PICKUP" ? 'bg-white text-chocolate-900 shadow-sm' : 'text-gray-500'}`}>
                                    <Store className="w-4 h-4" /> Retirada
                                </button>
                            </div>

                            {/* 2. AGENDAMENTO */}
                            <div className="space-y-3 pt-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4" /> Quando você quer receber?
                                </label>
                                <div className="flex gap-3 bg-gray-100 p-1 rounded-xl">
                                    <button onClick={() => setAgendarPedido(false)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!agendarPedido ? 'bg-white text-chocolate-900 shadow-sm' : 'text-gray-500'}`}>Agora</button>
                                    <button onClick={() => setAgendarPedido(true)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${agendarPedido ? 'bg-white text-chocolate-900 shadow-sm' : 'text-gray-500'}`}>Agendar</button>
                                </div>
                                {agendarPedido && (
                                    <div className="grid grid-cols-2 gap-3 animate-fadeIn bg-amber-50 p-4 rounded-xl border border-amber-100">
                                        <div>
                                            <label className="text-xs font-bold text-chocolate-900 mb-1 block">Dia</label>
                                            <input type="date" value={dataAgendamento} onChange={(e) => setDataAgendamento(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full rounded-lg border-amber-200 p-2 text-sm focus:ring-2 focus:ring-chocolate-900 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-chocolate-900 mb-1 block">Hora</label>
                                            <input type="time" value={horaAgendamento} onChange={(e) => setHoraAgendamento(e.target.value)} className="w-full rounded-lg border-amber-200 p-2 text-sm focus:ring-2 focus:ring-chocolate-900 outline-none" />
                                        </div>
                                        <div className="col-span-2 flex items-start gap-2 text-xs text-amber-800 bg-white p-2 rounded border border-amber-100">
                                            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                                            <span>Sujeito à disponibilidade da cozinha.</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 3. DADOS DO CLIENTE */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                        <Phone className="w-4 h-4" /> Telefone (WhatsApp)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            value={telefone}
                                            onChange={handlePhoneChange}
                                            onBlur={handlePhoneBlur}
                                            className={`w-full rounded-lg border p-3 text-sm outline-none focus:ring-2 transition-all ${phoneError ? 'border-red-400 bg-red-50' : userFound ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                                            placeholder="(85) 99999-9999"
                                        />
                                        <div className="absolute right-3 top-3">
                                            {loadingUser ? <Loader2 className="w-4 h-4 animate-spin text-chocolate-900" /> : userFound ? <Check className="w-4 h-4 text-green-600" /> : null}
                                        </div>
                                    </div>
                                    {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                                    {userFound && <p className="text-xs text-green-700 mt-1 font-bold">Que bom te ver de novo, {nome.split(' ')[0]}!</p>}
                                    {isFirstOrder && !phoneError && <p className="text-xs text-blue-600 mt-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Primeira vez? Preencha seus dados abaixo!</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1"><User className="w-4 h-4" /> Nome</label>
                                    <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:ring-2 focus:ring-chocolate-900" placeholder="Seu nome" />
                                </div>
                            </div>

                            {/* 4. ENDEREÇO */}
                            {tipoEntrega === "DELIVERY" ? (
                                <div className="space-y-4 animate-fadeIn border-t border-gray-100 pt-4">
                                    <div className="flex gap-3 items-end">
                                        <div className="flex-1">
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">CEP</label>
                                            <div className="relative">
                                                <input type="text" value={cep} onChange={e => setCep(e.target.value)} onBlur={handleBuscarCep} className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-chocolate-900 outline-none" placeholder="00000-000" maxLength={9} />
                                                {loadingCep && <div className="absolute right-3 top-3"><Loader2 className="w-4 h-4 animate-spin" /></div>}
                                            </div>
                                        </div>
                                        <div className="pb-3 text-xs text-blue-600 underline"><a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank">Não sei meu CEP</a></div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="col-span-3"><input type="text" value={rua} onChange={e => setRua(e.target.value)} placeholder="Rua" className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm" /></div>
                                        <div className="col-span-1"><input ref={numeroInputRef} type="text" value={numero} onChange={e => setNumero(e.target.value)} placeholder="Nº" className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm" /></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Bairro" className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm" />
                                        <input type="text" value={cidade} readOnly className="w-full rounded-lg border-gray-200 bg-gray-100 p-3 text-sm cursor-not-allowed" />
                                    </div>
                                    <input type="text" value={complemento} onChange={e => setComplemento(e.target.value)} placeholder="Complemento (Opcional)" className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm" />

                                </div>
                            ) : (
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center animate-fadeIn mt-4">
                                    <Store className="w-8 h-8 text-chocolate-900 mx-auto mb-2" />
                                    <h3 className="font-bold text-chocolate-900">Retirada na Loja</h3>
                                    <p className="text-sm text-gray-600 mt-1">Rua dos Brownies, 123 - Centro<br />Fortaleza - CE</p>
                                    <p className="text-xs text-green-700 font-bold mt-2">Sem custo de frete</p>
                                </div>
                            )}

                            {/* AVISO DE PRODUÇÃO */}
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start animate-fadeIn">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-700 shrink-0 mt-0.5"><ChefHat className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="text-sm font-bold text-blue-900">Produção Artesanal</h3>
                                    <p className="text-xs text-blue-700/90 mt-1 leading-relaxed">
                                        Você receberá atualizações sobre a produção do seu pedido (Preparação, Saída) diretamente no seu <strong>WhatsApp</strong>.
                                    </p>
                                </div>
                            </div>

                            {/* AVISO DE FRETE */}
                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3 items-start mt-2">
                                <div className="bg-orange-100 p-2 rounded-full text-orange-700 shrink-0 mt-0.5"><Bike className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="text-sm font-bold text-orange-900">Entrega por Uber Flash</h3>
                                    <p className="text-xs text-orange-800/90 mt-1 leading-relaxed">
                                        O custo da entrega é <strong>por conta do cliente</strong>. Cotaremos o valor exato no WhatsApp após a confirmação.
                                    </p>
                                </div>
                            </div>

                            {/* 5. PAGAMENTO */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1"><CreditCard className="w-4 h-4" /> Pagamento</label>
                                <select value={metodoPagamento} onChange={e => setMetodoPagamento(e.target.value)} className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm outline-none">
                                    <option value="PIX">PIX</option>
                                    <option value="CREDIT_CARD">Cartão de Crédito</option>
                                    <option value="DEBIT_CARD">Cartão de Débito</option>
                                    <option value="CASH">Dinheiro</option>
                                </select>
                            </div>

                            {/* TOTAL E BOTÃO */}
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-end mb-4">
                                    <span className="font-bold text-chocolate-900">Total</span>
                                    <span className="text-2xl font-serif font-bold text-chocolate-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
                                </div>
                                <button onClick={handleCheckout} disabled={loading} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                                    {loading ? <Loader2 className="animate-spin" /> : <><MessageCircle className="w-5 h-5" /> Confirmar Pedido</>}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}