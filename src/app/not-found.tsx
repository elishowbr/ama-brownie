import Link from "next/link";
import { Cookie, Home, SearchX } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">

            {/* Ilustração / Ícone */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-chocolate-100 rounded-full animate-pulse opacity-50 blur-xl"></div>
                <div className="relative bg-white p-8 rounded-full shadow-xl border border-amber-100">
                    <div className="relative">
                        <Cookie className="w-20 h-20 text-chocolate-900" />
                        <div className="absolute -bottom-2 -right-2 bg-red-100 p-1.5 rounded-full border-2 border-white">
                            <SearchX className="w-6 h-6 text-red-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Textos */}
            <h1 className="text-4xl font-serif font-bold text-chocolate-900 mb-2">
                Ops! Brownie não encontrado
            </h1>

            <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                Parece que a página que você tentou acessar foi comida ou nunca existiu.
                Verifique o endereço ou volte para o nosso cardápio delicioso.
            </p>

            {/* Botão de Ação */}
            <Link
                href="/"
                className="group relative inline-flex items-center justify-center px-8 py-3.5 bg-chocolate-900 text-white font-bold rounded-xl shadow-lg hover:bg-chocolate-800 hover:-translate-y-1 transition-all duration-300"
            >
                <Home className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Voltar para o Início
            </Link>

            {/* Decorativo de rodapé */}
            <div className="absolute bottom-10 text-xs text-gray-400">
                Erro 404 • Ama Brownie
            </div>
        </div>
    );
}