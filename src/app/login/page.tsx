"use client";

import { useState } from "react";
import { checkUserRole, authenticateUser } from "@/app/api/auth/login/route";
import { Loader2, Phone, Lock, ArrowRight, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [step, setStep] = useState<"PHONE" | "PASSWORD">("PHONE");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    // Máscara de Telefone
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 11) val = val.slice(0, 11);
        if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
        if (val.length > 10) val = `${val.slice(0, 10)}-${val.slice(10)}`;
        else if (val.length > 6) val = `${val.slice(0, 9)}-${val.slice(9)}`;
        setPhone(val);
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (step === "PHONE") {
                // PASSO 1: Verificar quem é
                const result = await checkUserRole(phone);

                if (result.error) {
                    setError(result.error);
                    setLoading(false);
                    return;
                }

                if (result.role === 'ADMIN') {
                    setStep("PASSWORD");
                    setLoading(false);
                } else {
                    await authenticateUser(phone);
                    router.push("/meus-pedidos");
                }

            } else {
                // PASSO 2: Admin
                const result = await authenticateUser(phone, password);
                if (result?.error) {
                    setError(result.error);
                    setLoading(false);
                }
            }
        } catch (err) {
            console.error(err);
            setError("Ocorreu um erro. Tente novamente.");
            setLoading(false);
        }
    };

    return (
        // Usei 'min-h-[100dvh]' para lidar melhor com a barra de endereço móvel
        <div className="min-h-[100dvh] bg-[#FDFBF7] flex flex-col justify-center items-center p-4 sm:p-6">

            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden flex flex-col">

                {/* Header */}
                <div className="bg-chocolate-900 p-6 sm:p-8 text-center shrink-0">
                    <h1 className="text-xl sm:text-2xl font-serif text-white tracking-wide">AMA BROWNIE</h1>
                    <p className="text-creme text-xs sm:text-sm mt-1">Checar status do pedido</p>
                </div>

                <div className="p-6 sm:p-8 flex-1">
                    <form onSubmit={handleSubmit} className="space-y-5 flex flex-col h-full justify-center">

                        {/* Input Telefone */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Telefone</label>
                            <div className="relative">
                                <div className="absolute left-3 top-3.5 text-gray-400 pointer-events-none">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <input
                                    type="tel" // Importante para abrir teclado numérico
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    disabled={step === "PASSWORD"}
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 outline-none transition-all text-base ${step === 'PASSWORD' ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-chocolate-900 focus:bg-white'}`}
                                    placeholder="(00) 00000-0000"
                                />
                                {step === "PASSWORD" && (
                                    <button
                                        type="button"
                                        onClick={() => { setStep("PHONE"); setPassword(""); setError(""); }}
                                        className="absolute right-3 top-3.5 text-xs text-blue-600 hover:underline font-bold bg-white/80 px-2 py-0.5 rounded"
                                    >
                                        Alterar
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Input Senha */}
                        {step === "PASSWORD" && (
                            <div className="animate-fadeIn">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Senha de Admin</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-3.5 text-gray-400 pointer-events-none">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoFocus
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-chocolate-900 focus:bg-white transition-all text-base"
                                        placeholder="••••••"
                                    />
                                </div>
                                <p className="text-xs text-center text-gray-500 mt-3 bg-amber-50 p-2.5 rounded-lg leading-relaxed border border-amber-100">
                                    <span className="font-bold block text-amber-800 mb-0.5">Área Restrita</span>
                                    Identificamos que você é um administrador. Por segurança, insira sua senha.
                                </p>
                            </div>
                        )}

                        {/* Mensagem de Erro */}
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium border border-red-100 animate-pulse">
                                {error}
                            </div>
                        )}

                        {/* Botão (Margin Auto empurra pro final se precisar) */}
                        <div className="mt-auto pt-2">
                            <button
                                type="submit"
                                disabled={loading || phone.length < 14}
                                className="w-full bg-chocolate-900 hover:bg-chocolate-800 text-white font-bold py-4 sm:py-3.5 rounded-xl shadow-lg shadow-chocolate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : step === "PHONE" ? (
                                    <>Continuar <ArrowRight className="w-5 h-5" /></>
                                ) : (
                                    <>Entrar no Painel <User className="w-5 h-5" /></>
                                )}
                            </button>
                        </div>
                    </form>
                    <Link href="/" className="text-sm text-gray-500 hover:underline mt-4 inline-block text-center w-full">
                        Voltar
                    </Link>
                </div>
            </div>
        </div>
    );
}