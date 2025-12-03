"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2, Plus, Save, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateProduct } from "@/app/actions/admin"; // Importamos a função de Update

// Tipos para as props
interface ProductOption {
    id?: string; // Opcional pois novas opções não tem ID ainda
    name: string;
    price: number;
}

interface ProductData {
    id: string;
    name: string;
    description: string | null;
    price: number;
    promoPrice: number | null;
    imageUrl: string | null;
    categoryId: string;
    options: ProductOption[];
    flavors: ProductOption[];
}

interface Category {
    id: string;
    name: string;
}

interface EditProductFormProps {
    product: ProductData;
    categories: Category[];
}

export default function EditProductForm({ product, categories }: EditProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    // 1. INICIALIZAÇÃO DO ESTADO COM DADOS DO BANCO
    // Note que convertemos números para string para facilitar a edição no input
    const [formData, setFormData] = useState({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        promoPrice: product.promoPrice ? product.promoPrice.toString() : "",
        categoryId: product.categoryId,
        imageUrl: product.imageUrl || "",
    });

    // Inicializa as opções vindas do banco
    const [options, setOptions] = useState<ProductOption[]>(
        product.options.map(opt => ({ name: opt.name, price: opt.price }))
    );
    const [flavors, setFlavors] = useState<ProductOption[]>(
        product.flavors.map(flav => ({ name: flav.name, price: flav.price }))
    );

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

    const updateOptionState = (index: number, field: keyof ProductOption, value: string | number) => {
        const newOptions = [...options];
        newOptions[index] = {
            ...newOptions[index],
            [field]: field === "price" ? parseFloat(value.toString()) || 0 : value,
        };
        setOptions(newOptions);
    };

    const addFlavor = () => {
        setFlavors([...flavors, { name: "", price: 0 }]);
    };

    const removeFlavor = (index: number) => {
        const newFlavors = flavors.filter((_, i) => i !== index);
        setFlavors(newFlavors);
    };

    const updateFlavorState = (index: number, field: keyof ProductOption, value: string | number) => {
        const newFlavors = [...flavors];
        newFlavors[index] = {
            ...newFlavors[index],
            [field]: field === "price" ? parseFloat(value.toString()) || 0 : value,
        };
        setFlavors(newFlavors);
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
                flavors: flavors.filter((flav) => flav.name.trim() !== ""),
            };

            // CHAMADA À SERVER ACTION DE UPDATE
            // Passamos o ID do produto original + os dados novos
            const result = await updateProduct(product.id, payload);

            if (result.error) {
                if (typeof result.error === 'string') {
                    alert(result.error);
                } else {
                    setFieldErrors(result.error);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else {
                alert("Produto atualizado com sucesso!");
                router.push("/admin/produtos");
                router.refresh();
            }
        } catch (error) {
            alert("Erro ao atualizar.");
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

    // --- RENDERIZAÇÃO (Idêntica ao create, mas título diferente) ---
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-amber-900 font-serif">
                        Editar Produto
                    </h1>
                    <p className="text-amber-700/80 mt-1">
                        Editando: <span className="font-semibold">{product.name}</span>
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
                {/* CARD PRINCIPAL */}
                <div className="bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(120,53,15,0.1)] border border-amber-100 p-6 md:p-8">
                    <h2 className="text-xl font-semibold text-amber-900 mb-6 border-b border-amber-100 pb-2">
                        Dados Básicos
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nome */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-amber-800 mb-1">Nome</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange}
                                className={`w-full rounded-lg border bg-amber-50/30 p-2.5 text-gray-800 focus:ring focus:ring-opacity-50 ${fieldErrors.name ? 'border-red-400' : 'border-amber-200 focus:border-amber-500'}`} />
                            <ErrorMsg field="name" />
                        </div>

                        {/* Preço */}
                        <div>
                            <label className="block text-sm font-medium text-amber-800 mb-1">Preço (R$)</label>
                            <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange}
                                className={`w-full rounded-lg border bg-amber-50/30 p-2.5 text-gray-800 ${fieldErrors.price ? 'border-red-400' : 'border-amber-200 focus:border-amber-500'}`} />
                            <ErrorMsg field="price" />
                        </div>

                        {/* Promoção */}
                        <div>
                            <label className="block text-sm font-medium text-amber-800 mb-1">Promoção (R$)</label>
                            <input type="number" step="0.01" name="promoPrice" value={formData.promoPrice} onChange={handleChange}
                                className="w-full rounded-lg border-amber-200 bg-amber-50/30 focus:border-amber-500 p-2.5 text-gray-800" />
                            <ErrorMsg field="promoPrice" />
                        </div>

                        {/* Categoria */}
                        <div>
                            <label className="block text-sm font-medium text-amber-800 mb-1">Categoria</label>
                            <select name="categoryId" value={formData.categoryId} onChange={handleChange}
                                className="w-full rounded-lg border-amber-200 bg-amber-50/30 focus:border-amber-500 p-2.5 text-gray-800">
                                <option value="" disabled>Selecione...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <ErrorMsg field="categoryId" />
                        </div>

                        {/* Imagem */}
                        <div>
                            <label className="block text-sm font-medium text-amber-800 mb-1">URL Imagem</label>
                            <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange}
                                className="w-full rounded-lg border-amber-200 bg-amber-50/30 focus:border-amber-500 p-2.5 text-gray-800" />
                            <ErrorMsg field="imageUrl" />
                        </div>

                        {/* Descrição */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-amber-800 mb-1">Descrição</label>
                            <textarea rows={3} name="description" value={formData.description} onChange={handleChange}
                                className="w-full rounded-lg border-amber-200 bg-amber-50/30 focus:border-amber-500 p-2.5 text-gray-800" />
                        </div>
                    </div>
                </div>

                {/* --- NOVO BLOCO: SABORES --- */}
                <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 mb-6">
                    <div className="flex justify-between items-center mb-4 border-b border-amber-100 pb-2">
                        <div>
                            <h2 className="text-xl font-semibold text-amber-900">Sabores</h2>
                            <p className="text-xs text-gray-500">Ex: Nutella, Doce de Leite. Se vazio, será "Tradicional".</p>
                        </div>
                        <button type="button" onClick={addFlavor} className="text-sm bg-amber-100 text-amber-900 px-3 py-1 rounded hover:bg-amber-200">
                            + Adicionar
                        </button>
                    </div>

                    {flavors.map((item, index) => (
                        <div key={index} className="flex gap-4 mb-3 items-end">
                            <div className="flex-1">
                                <label className="text-xs text-gray-500">Nome do Sabor</label>
                                <input type="text" value={item.name} onChange={e => updateFlavorState(index, 'name', e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="Ex: Chocolate Belga" />
                            </div>
                            <div className="w-32">
                                <label className="text-xs text-gray-500">Preço Extra</label>
                                <input type="number" step="0.01" value={item.price} onChange={e => updateFlavorState(index, 'price', e.target.value)} className="w-full border rounded p-2 text-sm" />
                            </div>
                            <button type="button" onClick={() => removeFlavor(index)} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    ))}
                    {flavors.length === 0 && <p className="text-sm text-gray-400 italic text-center py-2">Nenhum sabor específico (Produto Tradicional)</p>}
                </div>

                {/* CARD OPÇÕES */}
                <div className="bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(120,53,15,0.1)] border border-amber-100 p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6 border-b border-amber-100 pb-2">
                        <h2 className="text-xl font-semibold text-amber-900">Opções & Adicionais</h2>
                        <button type="button" onClick={addOption} className="inline-flex items-center px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md text-sm font-medium">
                            <Plus className="w-4 h-4 mr-1" /> Adicionar
                        </button>
                    </div>
                    <div className="space-y-4">
                        {options.map((option, index) => (
                            <div key={index} className="flex gap-4 items-end bg-amber-50/50 p-4 rounded-lg border border-amber-100/50">
                                <div className="flex-grow">
                                    <label className="text-xs text-amber-800/70">Nome</label>
                                    <input type="text" value={option.name} onChange={(e) => updateOptionState(index, "name", e.target.value)}
                                        className="w-full rounded-md border-amber-200 p-2 text-sm bg-white" />
                                </div>
                                <div className="w-32">
                                    <label className="text-xs text-amber-800/70">Preço</label>
                                    <input type="number" step="0.01" value={option.price} onChange={(e) => updateOptionState(index, "price", e.target.value)}
                                        className="w-full rounded-md border-amber-200 p-2 text-sm bg-white" />
                                </div>
                                <button type="button" onClick={() => removeOption(index)} className="p-2 text-red-400 hover:text-red-600">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4 pb-10">
                    <button type="submit" disabled={loading}
                        className="inline-flex items-center px-8 py-3 bg-amber-900 hover:bg-amber-800 text-white rounded-lg shadow-lg hover:shadow-xl disabled:opacity-70 transition-all">
                        {loading ? <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Salvando...</> : <><Save className="mr-2 h-5 w-5" /> Atualizar Produto</>}
                    </button>
                </div>
            </form>
        </div>
    );
}