import { getCategories } from "@/app/actions/admin";
import CategoryManager from "./category-manager";

export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-amber-900 font-serif">Gerenciar Categorias</h1>
                <p className="text-amber-700/80 mt-1">Organize os tipos de brownies e doces da loja.</p>
            </div>

            {/* 2. Passamos os dados para o componente interativo */}
            <CategoryManager initialCategories={categories} />
        </div>
    );
}