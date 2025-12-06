"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2, Plus, Save, ArrowLeft, Loader2, AlertCircle, UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateProduct } from "@/app/actions/admin"; // Importamos a função de Update

// --- Tipos para as props ---
// Se tiver o arquivo types.ts centralizado, pode importar de lá
interface ProductOption {
    id?: string;
    name: string;
    price: number;
}

// Interface que espelha o Prisma GetPayload
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

    // 1. ESTADOS DO FORMULÁRIO
    const [formData, setFormData] = useState({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        promoPrice: product.promoPrice ? product.promoPrice.toString() : "",
        categoryId: product.categoryId,
        imageUrl: product.imageUrl || "", // URL antiga vinda do banco
    });

    // 2. ESTADOS DE IMAGEM (NOVO)
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(product.imageUrl || null); // Começa com a imagem do banco

    // 3. ESTADOS DE ARRAYS
    const [options, setOptions] = useState<ProductOption[]>(
        product.options.map(opt => ({ name: opt.name, price: opt.price }))
    );
    const [flavors, setFlavors] = useState<ProductOption[]>(
        product.flavors.map(flav => ({ name: flav.name, price: flav.price }))
    );

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

    // Upload de Imagem
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Verifica tamanho > 5MB
            if (file.size > 5 * 1024 * 1024) {
                alert("Imagem muito grande! Máximo 5MB.");
                e.target.value = "";
                return;
            }
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Preview local do novo arquivo
        }
    };

    // Limpar imagem (Se quiser remover a foto existente)
    // Nota: A lógica no backend precisaria saber que você quer DELETAR a foto. 
    // Por enquanto, vamos assumir que ele troca ou mantém.
    const clearImage = () => {
        setImageFile(null);
        setPreviewUrl(null);
        // Opcional: Se quiser permitir salvar sem foto, teria que passar uma flag pro backend
    };

    // --- ARRAYS (Options / Flavors) ---
    const addOption = () => setOptions([...options, { name: "", price: 0 }]);
    const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index));
    const updateOptionState = (index: number, field: keyof ProductOption, value: string | number) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], [field]: field === "price" ? parseFloat(value.toString()) || 0 : value };
        setOptions(newOptions);
    };

    const addFlavor = () => setFlavors([...flavors, { name: "", price: 0 }]);
    const removeFlavor = (index: number) => setFlavors(flavors.filter((_, i) => i !== index));
    const updateFlavorState = (index: number, field: keyof ProductOption, value: string | number) => {
        const newFlavors = [...flavors];
        newFlavors[index] = { ...newFlavors[index], [field]: field === "price" ? parseFloat(value.toString()) || 0 : value };
        setFlavors(newFlavors);
    };

    // --- SUBMIT (FORMDATA) ---
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

            // Lógica de Imagem:
            // 1. Se tem arquivo novo, manda o arquivo.
            // 2. Se não tem arquivo novo, manda a URL antiga (formData.imageUrl).
            // O backend vai decidir o que fazer.
            if (imageFile) {
                dataToSend.append("imageFile", imageFile);
            } else if (formData.imageUrl) {
                dataToSend.append("imageUrl", formData.imageUrl);
            }

            // Arrays -> String JSON
            dataToSend.append("options", JSON.stringify(options.filter((opt) => opt.name.trim() !== "")));
            dataToSend.append("flavors", JSON.stringify(flavors.filter((flav) => flav.name.trim() !== "")));

            // Chama o Update (passando o ID e o FormData)
            const result = await updateProduct(product.id, null, dataToSend);

            if (result?.error) {
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

    // --- RENDERIZAÇÃO ---
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

                {/* DADOS BÁSICOS */}
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

                        {/* --- UPLOAD DE IMAGEM --- */}
                        <div>
                            <label className="block text-sm font-medium text-amber-800 mb-1">Imagem do Produto</label>

                            <div className={`border-2 border-dashed rounded-xl p-4 transition-colors text-center relative ${previewUrl ? 'border-amber-400 bg-amber-50' : 'border-amber-200 bg-amber-50/30 hover:bg-amber-50 cursor-pointer'}`}>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />

                                {previewUrl ? (
                                    <div className="relative w-full h-40">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                            <p className="text-white text-xs font-bold">Clique para trocar</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-32 text-amber-800/60">
                                        <UploadCloud className="w-8 h-8 mb-2" />
                                        <span className="text-sm font-medium">Clique para enviar uma foto</span>
                                        <span className="text-xs">JPG, PNG (Máx 5MB)</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Descrição */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-amber-800 mb-1">Descrição</label>
                            <textarea rows={3} name="description" value={formData.description} onChange={handleChange}
                                className="w-full rounded-lg border-amber-200 bg-amber-50/30 focus:border-amber-500 p-2.5 text-gray-800" />
                        </div>
                    </div>
                </div>

                {/* SABORES */}
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
                                <input type="text" value={item.name} onChange={e => updateFlavorState(index, 'name', e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="Nome" />
                            </div>
                            <div className="w-32">
                                <input type="number" step="0.01" value={item.price} onChange={e => updateFlavorState(index, 'price', e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="R$" />
                            </div>
                            <button type="button" onClick={() => removeFlavor(index)} className="p-2 text-red-400"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    ))}
                </div>

                {/* OPÇÕES */}
                <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
                    <div className="flex justify-between items-center mb-4 border-b border-amber-100 pb-2">
                        <h2 className="text-xl font-semibold text-amber-900">Opções & Adicionais</h2>
                        <button type="button" onClick={addOption} className="text-sm bg-amber-100 text-amber-900 px-3 py-1 rounded hover:bg-amber-200">+ Adicionar</button>
                    </div>
                    {options.map((option, index) => (
                        <div key={index} className="flex gap-4 items-end mb-3">
                            <div className="flex-grow">
                                <input type="text" value={option.name} onChange={(e) => updateOptionState(index, "name", e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="Nome" />
                            </div>
                            <div className="w-32">
                                <input type="number" step="0.01" value={option.price} onChange={(e) => updateOptionState(index, "price", e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="R$" />
                            </div>
                            <button type="button" onClick={() => removeOption(index)} className="p-2 text-red-400"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    ))}
                </div>

                {/* BOTÃO SALVAR */}
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