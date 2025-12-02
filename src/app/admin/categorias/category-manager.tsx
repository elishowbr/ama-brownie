"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Tag } from "lucide-react";
import { createCategory, deleteCategory } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

interface Category {
    id: string;
    name: string;
}

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
    const router = useRouter();

    // Estados para carregamento
    const [isCreating, setIsCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Estado do formulário
    const [newCategoryName, setNewCategoryName] = useState("");

    // --- FUNÇÃO DE CRIAR ---
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        setIsCreating(true);

        // Chama a Server Action
        const result = await createCategory({ name: newCategoryName });

        if (result.success) {
            setNewCategoryName(""); // Limpa o input
            router.refresh(); // MÁGICA: Atualiza os dados da página sem recarregar tudo
        } else {
            alert("Erro: " + JSON.stringify(result.error));
        }

        setIsCreating(false);
    };

    // --- FUNÇÃO DE DELETAR ---
    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

        setDeletingId(id);

        const result = await deleteCategory(id);

        if (result.success) {
            router.refresh(); // Atualiza a lista removendo o item
        } else {
            // Aqui mostramos aquele erro amigável se houver produtos vinculados
            alert(result.error);
        }

        setDeletingId(null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* COLUNA DA ESQUERDA: Formulário de Criação */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 sticky top-8">
                    <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5" /> Nova Categoria
                    </h2>

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-amber-800 mb-1">Nome</label>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Ex: Brownies Recheados"
                                className="w-full rounded-lg border-amber-200 bg-amber-50/30 focus:border-amber-500 focus:ring-amber-200 p-2.5 text-gray-800"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isCreating || !newCategoryName}
                            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-amber-900 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isCreating ? <Loader2 className="animate-spin w-5 h-5" /> : "Adicionar Categoria"}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-amber-50 rounded-lg text-xs text-amber-800/70">
                        <p>💡 <strong>Dica:</strong> Crie as categorias antes de cadastrar os produtos. Ex: <em>Tradicional</em>, <em>Recheado</em>, <em>Edição Limitada</em>.</p>
                    </div>
                </div>
            </div>

            {/* COLUNA DA DIREITA: Lista de Categorias */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
                    <div className="p-6 border-b border-amber-100 bg-amber-50/30">
                        <h3 className="text-lg font-semibold text-amber-900">Categorias Existentes</h3>
                    </div>

                    {initialCategories.length === 0 ? (
                        <div className="p-10 text-center text-gray-400">
                            <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Nenhuma categoria cadastrada ainda.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-amber-100">
                            {initialCategories.map((cat) => (
                                <li key={cat.id} className="p-4 flex items-center justify-between hover:bg-amber-50/20 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-8 bg-amber-200 rounded-full group-hover:bg-amber-500 transition-colors"></div>
                                        <span className="font-medium text-gray-700 text-lg">{cat.name}</span>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        disabled={deletingId === cat.id}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Excluir Categoria"
                                    >
                                        {deletingId === cat.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                                        ) : (
                                            <Trash2 className="w-5 h-5" />
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

        </div>
    );
}