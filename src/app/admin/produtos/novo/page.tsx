"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Trash2, Plus, Save, ArrowLeft, Loader2, AlertCircle, UploadCloud, X } from "lucide-react";
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

    // ESTADOS DO FORMULÁRIO
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        promoPrice: "",
        categoryId: "",
        // imageUrl removido daqui pois não usamos mais input de texto
    });

    // ESTADO PARA O ARQUIVO DE IMAGEM
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [flavors, setFlavors] = useState<ProductOptionItem[]>([]);
    const [options, setOptions] = useState<ProductOptionItem[]>([]);

    useEffect(() => {
        async function loadData() {
            const data = await getCategories();
            setCategories(data);
        }
        loadData();
    }, []);

    // --- HANDLERS ---

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

    // Handler para o arquivo de imagem
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            // Verifica se é maior que 5MB (Configurado no next.config.ts)
            if (file.size > 5 * 1024 * 1024) {
                alert("A imagem é muito grande! Por favor, escolha uma imagem menor que 5MB.");
                e.target.value = "";
                return;
            }

            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Remover imagem selecionada (Resetar para padrão)
    const clearImage = () => {
        setImageFile(null);
        setPreviewUrl(null);
    };

    const addOption = () => setOptions([...options, { name: "", price: 0 }]);
    const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index));
    const updateOption = (index: number, field: keyof ProductOptionItem, value: string | number) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], [field]: field === "price" ? parseFloat(value.toString()) || 0 : value };
        setOptions(newOptions);
    };

    const addFlavor = () => setFlavors([...flavors, { name: "", price: 0 }]);
    const removeFlavor = (index: number) => setFlavors(flavors.filter((_, i) => i !== index));
    const updateFlavor = (index: number, field: keyof ProductOptionItem, value: string | number) => {
        const newFlavors = [...flavors];
        newFlavors[index] = { ...newFlavors[index], [field]: field === "price" ? parseFloat(value.toString()) || 0 : value };
        setFlavors(newFlavors);
    };

    // --- SUBMIT ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFieldErrors({});

        try {
            const dataToSend = new FormData();

            dataToSend.append("name", formData.name);
            dataToSend.append("description", formData.description);
            dataToSend.append("price", formData.price);
            dataToSend.append("categoryId", formData.categoryId);
            if (formData.promoPrice) dataToSend.append("promoPrice", formData.promoPrice);

            // Apenas anexa se tiver arquivo. Se não tiver, o backend entende e salva null.
            if (imageFile) {
                dataToSend.append("imageFile", imageFile);
            }

            dataToSend.append("options", JSON.stringify(options.filter((opt) => opt.name.trim() !== "")));
            dataToSend.append("flavors", JSON.stringify(flavors.filter((flav) => flav.name.trim() !== "")));

            const result = await createProduct(null, dataToSend);

            if (result?.error) {
                if (typeof result.error === 'string') {
                    alert(result.error);
                } else {
                    setFieldErrors(result.error);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else {
                alert("Produto criado com sucesso!");
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
                        <h1 className="text-3xl font-bold text-amber-900 font-serif">Novo Produto</h1>
                        <p className="text-amber-700/80 mt-1">Adicione uma nova delícia ao cardápio.</p>
                    </div>
                    <Link href="/admin/produtos" className="flex items-center text-amber-800 hover:text-amber-600 transition-colors cursor-pointer">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 md:p-8">
                        <h2 className="text-xl font-semibold text-amber-900 mb-6 border-b border-amber-100 pb-2">Informações do Produto</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Nome */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-amber-800 mb-1">Nome do Produto</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Brownie de Doce de Leite" className={`w-full rounded-lg border bg-amber-50/30 p-2.5 text-gray-800 focus:ring focus:ring-opacity-50 ${fieldErrors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-amber-200 focus:border-amber-500 focus:ring-amber-200'}`} />
                                <ErrorMsg field="name" />
                            </div>

                            {/* Preço */}
                            <div>
                                <label className="block text-sm font-medium text-amber-800 mb-1">Preço Base (R$)</label>
                                <input type="number" name="price" step="0.01" value={formData.price} onChange={handleChange} placeholder="0.00" className={`w-full rounded-lg border bg-amber-50/30 p-2.5 text-gray-800 focus:ring focus:ring-opacity-50 ${fieldErrors.price ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-amber-200 focus:border-amber-500 focus:ring-amber-200'}`} />
                                <ErrorMsg field="price" />
                            </div>

                            {/* Promo */}
                            <div>
                                <label className="block text-sm font-medium text-amber-800 mb-1">Preço Promocional (Opcional)</label>
                                <input type="number" name="promoPrice" step="0.01" value={formData.promoPrice} onChange={handleChange} placeholder="0.00" className="w-full rounded-lg border-amber-200 bg-amber-50/30 focus:border-amber-500 focus:ring focus:ring-amber-200 p-2.5 text-gray-800" />
                            </div>

                            {/* Categoria */}
                            <div>
                                <label className="block text-sm font-medium text-amber-800 mb-1">Categoria</label>
                                <select name="categoryId" value={formData.categoryId} onChange={handleChange} className={`w-full rounded-lg border bg-amber-50/30 p-2.5 text-gray-800 focus:ring focus:ring-opacity-50 ${fieldErrors.categoryId ? 'border-red-400' : 'border-amber-200 focus:border-amber-500'}`}>
                                    <option value="" disabled>Selecione...</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <ErrorMsg field="categoryId" />
                            </div>

                            {/* --- ÁREA DE IMAGEM (SOMENTE UPLOAD) --- */}
                            <div>
                                <label className="block text-sm font-medium text-amber-800 mb-1">Imagem do Produto</label>

                                <div className={`border-2 border-dashed rounded-xl p-4 transition-colors text-center relative ${previewUrl ? 'border-amber-400 bg-amber-50' : 'border-amber-200 bg-amber-50/30 hover:bg-amber-50 cursor-pointer'}`}>

                                    {!previewUrl && (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="flex flex-col items-center justify-center h-32 text-amber-800/60">
                                                <UploadCloud className="w-8 h-8 mb-2" />
                                                <span className="text-sm font-medium">Clique para enviar uma foto</span>
                                                <span className="text-xs">JPG, PNG, WEBP</span>
                                            </div>
                                        </>
                                    )}

                                    {previewUrl && (
                                        <div className="relative w-full h-40">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />

                                            {/* Botão para limpar a imagem */}
                                            <button
                                                type="button"
                                                onClick={clearImage}
                                                className="absolute top-2 right-2 bg-red-100 hover:bg-red-200 text-red-600 p-1 rounded-full shadow-sm transition-colors"
                                                title="Remover imagem"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <p className="text-xs text-amber-700 mt-2">Imagem selecionada</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Descrição */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-amber-800 mb-1">Descrição</label>
                                <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full rounded-lg border-amber-200 bg-amber-50/30 focus:border-amber-500 p-2.5 text-gray-800" />
                            </div>
                        </div>
                    </div>

                    {/* Sabores */}
                    <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
                        <div className="flex justify-between items-center mb-4 border-b border-amber-100 pb-2">
                            <div>
                                <h2 className="text-xl font-semibold text-amber-900">Sabores</h2>
                                <p className="text-xs text-gray-500">Ex: Nutella, Doce de Leite.</p>
                            </div>
                            <button type="button" onClick={addFlavor} className="text-sm bg-amber-100 text-amber-900 px-3 py-1 rounded hover:bg-amber-200">+ Adicionar</button>
                        </div>
                        {flavors.map((item, index) => (
                            <div key={index} className="flex gap-4 mb-3 items-end">
                                <div className="flex-1">
                                    <input type="text" value={item.name} onChange={e => updateFlavor(index, 'name', e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="Nome" />
                                </div>
                                <div className="w-32">
                                    <input type="number" step="0.01" value={item.price} onChange={e => updateFlavor(index, 'price', e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="Preço Extra" />
                                </div>
                                <button type="button" onClick={() => removeFlavor(index)} className="p-2 text-red-400"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        ))}
                    </div>

                    {/* Opções */}
                    <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
                        <div className="flex justify-between items-center mb-4 border-b border-amber-100 pb-2">
                            <h2 className="text-xl font-semibold text-amber-900">Opções & Adicionais</h2>
                            <button type="button" onClick={addOption} className="text-sm bg-amber-100 text-amber-900 px-3 py-1 rounded hover:bg-amber-200">+ Adicionar</button>
                        </div>
                        {options.map((option, index) => (
                            <div key={index} className="flex gap-4 items-end mb-3">
                                <div className="flex-grow">
                                    <input type="text" value={option.name} onChange={(e) => updateOption(index, "name", e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="Nome" />
                                </div>
                                <div className="w-32">
                                    <input type="number" step="0.01" value={option.price} onChange={(e) => updateOption(index, "price", e.target.value)} className="w-full border rounded p-2 text-sm" />
                                </div>
                                <button type="button" onClick={() => removeOption(index)} className="p-2 text-red-400"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        ))}
                    </div>

                    {/* Botão Salvar */}
                    <div className="flex justify-end pt-4 pb-10">
                        <button type="submit" disabled={loading} className="inline-flex items-center px-8 py-3 bg-amber-900 hover:bg-amber-800 text-white rounded-lg shadow-lg disabled:opacity-70 transition-all">
                            {loading ? <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Salvando...</> : <><Save className="mr-2 h-5 w-5" /> Salvar Produto</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}