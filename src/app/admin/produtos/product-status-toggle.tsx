"use client";

import { useState } from "react";
import { toggleProductAvailability } from "@/app/actions/admin";
import { Loader2, Power, PowerOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface ToggleProps {
    id: string;
    isAvailable: boolean;
}

export default function ProductStatusToggle({ id, isAvailable }: ToggleProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleToggle = async () => {
        setLoading(true);

        // Chama a Server Action que você já tinha!
        await toggleProductAvailability(id, isAvailable);

        // Atualiza a tela sem recarregar
        router.refresh();
        setLoading(false);
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`
                flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border
                ${isAvailable
                    ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'}
                ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
            `}
            title={isAvailable ? "Clique para pausar vendas" : "Clique para ativar vendas"}
        >
            {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
                isAvailable ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />
            )}
            {isAvailable ? "" : ""}
        </button>
    );
}