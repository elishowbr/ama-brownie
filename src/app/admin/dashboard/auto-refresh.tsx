"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";

export default function AutoRefresh() {
    const router = useRouter();
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh(); 

        setTimeout(() => {
            setLastUpdate(new Date());
            setIsRefreshing(false);
        }, 1000);
    };
    useEffect(() => {
        const interval = setInterval(() => {
            handleRefresh();
        }, 30000);

        return () => clearInterval(interval);
    }, []);


    return (
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/50 px-3 py-1 rounded-full border border-gray-100">
            <span>Atualizado às {lastUpdate.toLocaleTimeString()}</span>
            <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-1 hover:text-chocolate-900 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                title="Atualizar agora"
            >
                <RefreshCcw className="w-3 h-3" />
            </button>
        </div>
    );
}