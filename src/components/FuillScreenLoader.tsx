import { ChefHat, Loader2 } from "lucide-react";

export default function FullScreenLoader() {
    return (
        <div className="fixed inset-0 z-[100] bg-[#FDFBF7] flex flex-col items-center justify-center">

            {/* Ícone Animado */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-chocolate-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-white p-6 rounded-full shadow-xl border border-amber-100">
                    <ChefHat className="w-12 h-12 text-chocolate-900 animate-bounce" />
                </div>
            </div>

            <h2 className="text-2xl font-serif font-bold text-chocolate-900 mb-2">
                Enviando seu pedido...
            </h2>

            <p className="text-gray-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Aguarde só um instante
            </p>
        </div>
    );
}