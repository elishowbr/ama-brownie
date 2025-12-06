import Link from "next/link";
import Image from "next/image";
import { Plus, PackageX, Pencil } from "lucide-react";
import { getProducts } from "@/app/actions/admin";
import DeleteProductButton from "./delete-button";
import ProductStatusToggle from "./product-status-toggle";

// Utilitário para formatar moeda
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

export default async function AdminProductsPage() {
    // 1. Busca os dados no servidor (Server Action)
    const products = await getProducts();

    return (
        <div className="max-w-6xl mx-auto">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-amber-900 font-serif">Meus Produtos</h1>
                    <p className="text-amber-700/80 mt-1">Gerencie o cardápio da Ama Brownie.</p>
                </div>

                <Link
                    href="/admin/produtos/novo"
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-amber-900 hover:bg-amber-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Novo Produto
                </Link>
            </div>

            {/* Lista / Tabela */}
            <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">

                {products.length === 0 ? (
                    // Estado Vazio
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                        <div className="bg-amber-50 p-4 rounded-full mb-4">
                            <PackageX className="w-12 h-12 text-amber-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-amber-900 mb-2">Nenhum produto encontrado</h3>
                        <p className="text-gray-500 max-w-sm mb-6">
                            Parece que você ainda não cadastrou nenhum doce. Comece adicionando o primeiro!
                        </p>
                        <Link
                            href="/admin/produtos/novo"
                            className="text-amber-700 font-medium hover:underline"
                        >
                            Criar meu primeiro produto &rarr;
                        </Link>
                    </div>
                ) : (
                    // Tabela de Dados
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-amber-50/50 border-b border-amber-100 text-xs uppercase text-amber-800 font-semibold tracking-wider">
                                    <th className="p-4 pl-6">Produto</th>
                                    <th className="p-4">Categoria</th>
                                    <th className="p-4">Preço</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 pr-6 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-50">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-amber-50/30 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-4">

                                                <div className="w-12 h-12 rounded-lg bg-amber-100 overflow-hidden flex-shrink-0 border border-amber-200 relative">
                                                    {product.imageUrl ? (
                                                        <Image
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            fill // Preenche o quadrado de 12x12
                                                            className="object-cover"
                                                            sizes="48px"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-amber-300 text-xs font-bold">
                                                            🍫
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="font-medium text-amber-900">{product.name}</div>
                                                    {product.promoPrice && (
                                                        <span className="text-xs text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded">Promoção</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                {product.category?.name || "Sem Categoria"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {product.promoPrice ? (
                                                <div className="flex flex-col">
                                                    <span className="text-gray-400 text-xs line-through">{formatCurrency(product.price)}</span>
                                                    <span className="text-green-700 font-semibold">{formatCurrency(product.promoPrice)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-700 font-medium">{formatCurrency(product.price)}</span>
                                            )}
                                        </td>
                                        <td className="p-4 flex justify-center">
                                            <ProductStatusToggle id={product.id} isAvailable={product.isAvailable} />
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/produtos/editar/${product.id}`}
                                                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-5 h-5" />
                                                </Link>

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}