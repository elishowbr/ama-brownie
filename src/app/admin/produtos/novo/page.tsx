"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Trash2, Plus, Save, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCategories, createProduct } from "@/app/actions/admin"; 

interface Category {
    id: string;
    name: string;
}

interface ProductOptionItem {
    name: string;
    price: number;
}

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        promoPrice: "",
        categoryId: "",
        imageUrl: "",
    });

    const [options, setOptions] = useState<ProductOptionItem[]>([]);

    useEffect(() => {
        async function loadData() {
            const data = await getCategories();
            setCategories(data);
        }
        loadData();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const addOption = () => {
        setOptions([...options, { name: "", price: 0 }]);
    };

    const removeOption = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    const updateOption = (
        index: number,
        field: keyof ProductOptionItem,
        value: string | number
    ) => {
        const newOptions = [...options];
        newOptions[index] = {
            ...newOptions[index],
            [field]: field === "price" ? parseFloat(value.toString()) || 0 : value,
        };
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFieldErrors({}); 

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price), 
                promoPrice: formData.promoPrice ? parseFloat(formData.promoPrice) : null,
                options: options.filter((opt) => opt.name.trim() !== ""),
            };

            const result = await createProduct(payload);

            if (result.error) {
                if (typeof result.error === 'string') {
                    alert(result.error);
                } else {
                    setFieldErrors(result.error);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else {
                alert("Produto criado com sucesso!"); // Pode trocar por um Toast depois
                router.push("/admin/produtos");
                router.refresh();
            }
        } catch (error) {
            alert("Erro crítico de comunicação.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const ErrorMsg = ({ field }: { field: string }) => {
        if (!fieldErrors[field]) return null;
        return (
            <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {fieldErrors[field][0]}
            </p>
        );
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-amber-900 font-serif">
                            Novo Produto
                        </h1>
                        <p className="text-amber-700/80 mt-1">
                            Adicione uma nova delícia ao cardápio da Ama Brownie.
                        </p>
                    </div>
                    <Link
                        href="/admin/produtos"
                        className="flex items-center text-amber-800 hover:text-amber-600 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(120,53,15,0.1)] border border-amber-100 p-6 md:p-8">
                        <h2 className="text-xl font-semibold text-amber-900 mb-6 border-b border-amber-100 pb-2">
                            Informações do Produto
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nome */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-amber-800 mb-1">
                                    Nome do Produto
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ex: Brownie de Doce de Leite"
                                    className={`w-full rounded-lg border bg-amber-50/30 p-2.5 text-gray-800 focus:ring focus:ring-opacity-50 ${fieldErrors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-amber-200 focus:border-amber-500 focus:ring-amber-200'}`}
                                />
                                <ErrorMsg field="name" />
                            </div>

                            {/* Preço */}
                            <div>
                                <label className="block text-sm font-medium text-amber-800 mb-1">
                                    Preço Base (R$)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className={`w-full rounded-lg border bg-amber-50/30 p-2.5 text-gray-800 focus:ring focus:ring-opacity-50 ${fieldErrors.price ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-amber-200 focus:border-amber-500 focus:ring-amber-200'}`}
                                />
                                <ErrorMsg field="price" />
                            </div>

                            {/* Promoção */}
                            <div>
                                <label className="block text-sm font-medium text-amber-800 mb-1">
                                    Preço Promocional (Opcional)
                                </label>
                                <input
                                    type="number"
                                    name="promoPrice"
                                    step="0.01"
                                    value={formData.promoPrice}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full rounded-lg border-amber-200 bg-amber-50/30 focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 p-2.5 text-gray-800"
                                />
                                <ErrorMsg field="promoPrice" />
                            </div>

                            {/* Categoria */}
                            <div>
                                <label className="block text-sm font-medium text-amber-800 mb-1">
                                    Categoria
                                </label>
                                <div className="relative">
                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        className={`w-full appearance-none rounded-lg border bg-amber-50/30 p-2.5 text-gray-800 focus:ring focus:ring-opacity-50 ${fieldErrors.categoryId ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-amber-200 focus:border-amber-500 focus:ring-amber-200'}`}
                                    >
                                        <option value="" disabled>Selecione...</option>
                                        {categories.length > 0 ? (
                                            categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>Carregando ou sem categorias...</option>
                                        )}
                                    </select>
                                </div>
                                <ErrorMsg field="categoryId" />
                            </div>

                            {/* Imagem */}
                            <div>
                                <label className="block text-sm font-medium text-amber-800 mb-1">
                                    URL da Imagem
                                </label>
                                <input
                                    type="text"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    className="w-full rounded-lg border-amber-200 bg-amber-50/30 focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 p-2.5 text-gray-800"
                                />
                                <ErrorMsg field="imageUrl" />
                            </div>

                            {/* Descrição */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-amber-800 mb-1">
                                    Descrição
                                </label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-amber-200 bg-amber-50/30 focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 p-2.5 text-gray-800"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Opções */}
                    <div className="bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(120,53,15,0.1)] border border-amber-100 p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6 border-b border-amber-100 pb-2">
                            <h2 className="text-xl font-semibold text-amber-900">
                                Opções & Adicionais
                            </h2>
                            <button
                                type="button"
                                onClick={addOption}
                                className="inline-flex items-center px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md text-sm font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Adicionar
                            </button>
                        </div>

                        <div className="space-y-4">
                            {options.length === 0 && (
                                <p className="text-center text-gray-400 italic py-4">
                                    Nenhuma opção adicionada (ex: Adicional de Nutella).
                                </p>
                            )}
                            {options.map((option, index) => (
                                <div key={index} className="flex gap-4 items-end bg-amber-50/50 p-4 rounded-lg border border-amber-100/50">
                                    <div className="flex-grow">
                                        <label className="text-xs text-amber-800/70">Nome</label>
                                        <input
                                            type="text"
                                            value={option.name}
                                            onChange={(e) => updateOption(index, "name", e.target.value)}
                                            className="w-full rounded-md border-amber-200 p-2 text-sm bg-white"
                                        />
                                    </div>
                                    <div className="w-32">
                                        <label className="text-xs text-amber-800/70">Preço</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={option.price}
                                            onChange={(e) => updateOption(index, "price", e.target.value)}
                                            className="w-full rounded-md border-amber-200 p-2 text-sm bg-white"
                                        />
                                    </div>
                                    <button type="button" onClick={() => removeOption(index)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Botão Salvar */}
                    <div className="flex justify-end pt-4 pb-10">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-8 py-3 bg-amber-900 hover:bg-amber-800 text-white rounded-lg shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                        >
                            {loading ? (
                                <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Salvando...</>
                            ) : (
                                <><Save className="mr-2 h-5 w-5" /> Salvar Produto</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}