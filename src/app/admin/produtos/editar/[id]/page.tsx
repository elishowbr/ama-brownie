import { notFound } from "next/navigation";
import { getProductById, getCategories } from "@/app/actions/admin";
import EditProductForm from "./edit-form";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditProductPage(props: PageProps) {
    const params = await props.params;
    const id = params.id;

    const [product, categories] = await Promise.all([
        getProductById(id),
        getCategories(),
    ]);

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <EditProductForm product={product} categories={categories} />
        </div>
    );
}