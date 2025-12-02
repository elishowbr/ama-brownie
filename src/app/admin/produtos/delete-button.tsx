"use client";

import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { deleteProduct } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ id, productName }: { id: string, productName: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        const confirm = window.confirm(`Tem certeza que deseja excluir o "${productName}"?`);
        if (!confirm) return;

        setIsDeleting(true);

        const result = await deleteProduct(id);

        if (result.success) {
            router.refresh();
        } else {
            alert("Erro ao excluir: " + result.error);
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir produto"
        >
            {isDeleting ? (
                <Loader2 className="w-5 h-5 animate-spin text-red-500" />
            ) : (
                <Trash2 className="w-5 h-5" />
            )}
        </button>
    );
}