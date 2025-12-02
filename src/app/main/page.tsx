import { getProducts } from "@/app/actions/admin"; // Reutilizamos a função que criaos antes!
import StoreInterface from "@/components/StoreInterface"; // Importe o componente que criamos acima

// Isso faz a página ser renderizada no servidor (SSR/SSG)
export default async function HomePage() {

    // 1. Busca direta no banco (sem fetch /api/...)
    // Como é server-side, isso é ultra rápido e seguro
    const products = await getProducts();

    // 2. Passamos os dados para o componente visual
    // O 'products' aqui contém ID, nome, preço, url da imagem, categoria...
    return (
        <StoreInterface initialProducts={products} />
    );
}