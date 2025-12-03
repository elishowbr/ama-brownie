"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao entrar");
            }

            router.push("/admin/dashboard");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

        const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é número

        // Limita a 11 dígitos
        if (value.length > 11) value = value.slice(0, 11);

        // Aplica a máscara (XX) XXXXX-XXXX
        if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }
        if (value.length > 10) {
            value = `${value.slice(0, 10)}-${value.slice(10)}`;
        } else if (value.length > 6) { // Ajuste para números fixos ou móveis incompletos
            value = `${value.slice(0, 9)}-${value.slice(9)}`;
        }

        setPhone(value);

    };

    return (
        <div className="min-h-screen bg-creme flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm p-8 rounded-3xl shadow-xl border border-caramelo-100 animate-zoomIn">

                {/* Cabeçalho */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-chocolate-900 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4 border-4 border-caramelo-500 text-3xl">
                        🔐
                    </div>
                    <h1 className="font-serif font-bold text-2xl text-chocolate-900">Acesso Restrito</h1>
                    <p className="text-chocolate-600 text-sm">Área administrativa da Ama Brownie</p>
                </div>

                {/* Formulário */}
                <form onSubmit={handleLogin} className="space-y-4">

                    <div>
                        <label className="block text-xs font-bold text-chocolate-600 uppercase mb-1 ml-1">Telefone</label>
                        <input
                            type="tel"
                            required
                            placeholder="5511999999999"
                            className="w-full p-4 bg-gray-50 border-gray-200 focus:bg-white"
                            value={phone}
                            onChange={(e) => { setPhone(e.target.value); handlePhoneChange(e); }}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-chocolate-600 uppercase mb-1 ml-1">Senha</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••"
                            className="w-full p-4 bg-gray-50 border-gray-200 focus:bg-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl text-center border border-red-100">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-chocolate-900 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-chocolate-800'}`}
                    >
                        {loading ? "Entrando..." : "Acessar Painel"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/" className="text-sm text-caramelo-500 hover:text-chocolate-900 transition-colors">
                        Voltar
                    </Link>
                </div>

            </div>
        </div>
    );
}