import Image from "next/image";

interface Produto {
    id: string;
    name: string;
    description: string | null; // Pode vir null do banco
    price: number;
    promoPrice?: number | null;
    imageUrl?: string | null;   // ADICIONADO: Campo da imagem
    tag?: string | null;        // Mantido como opcional
}

interface ProductCardProps {
    produto: Produto;
    onSelect: (produto: any) => void;
}

export default function ProductCard({ produto, onSelect }: ProductCardProps) {

    const isOnSale = produto.promoPrice != null && produto.promoPrice < produto.price;
    const currentPrice = isOnSale ? produto.promoPrice! : produto.price;

    return (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col relative border border-gray-100 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">

            {/* TAGS (Promoção ganha prioridade) */}
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 items-start">
                {isOnSale && (
                    <span className="bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-md animate-pulse">
                        OFERTA
                    </span>
                )}
                {produto.tag && !isOnSale && (
                    <span className="bg-chocolate-900 text-caramelo-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-md">
                        ★ {produto.tag}
                    </span>
                )}
            </div>

            {/* ÁREA DA IMAGEM */}
            <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                {produto.imageUrl ? (
                    // SE TIVER IMAGEM REAL
                    <Image 
                        src={produto.imageUrl} 
                        alt={produto.name} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    // SE NÃO TIVER (FALLBACK - O SEU DESIGN ORIGINAL)
                    <div className="h-full w-full bg-gradient-to-br from-chocolate-800 to-chocolate-600 flex items-center justify-center">
                        <span className="text-6xl drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                            🍫
                        </span>
                    </div>
                )}
                
                {/* Gradiente sutil na base da imagem para destacar o texto se necessário */}
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* CONTEÚDO */}
            <div className="p-5 pt-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h2 className="text-lg font-serif font-bold text-chocolate-900 leading-tight line-clamp-2" title={produto.name}>
                        {produto.name}
                    </h2>

                    {/* PREÇO INTELIGENTE */}
                    <div className="flex flex-col items-end shrink-0">
                        {isOnSale ? (
                            <>
                                <span className="text-xs text-gray-400 line-through font-medium">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.price)}
                                </span>
                                <span className="text-lg font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg whitespace-nowrap">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentPrice)}
                                </span>
                            </>
                        ) : (
                            <span className="text-lg font-bold text-caramelo-600 bg-caramelo-50 px-2 py-1 rounded-lg whitespace-nowrap">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.price)}
                            </span>
                        )}
                    </div>
                </div>

                <p className="text-gray-500 text-xs mb-5 border-l-2 border-caramelo-200 pl-3 line-clamp-2 flex-grow">
                    {produto.description || "Delicioso brownie artesanal feito com chocolate nobre."}
                </p>

                <button
                    onClick={() => onSelect(produto)}
                    className={`w-full text-white py-3.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2
                    ${isOnSale 
                        ? 'bg-green-600 hover:bg-green-700 shadow-green-900/10' 
                        : 'bg-chocolate-900 hover:bg-chocolate-800 shadow-chocolate-900/10'}
                    `}
                >
                    <span>{isOnSale ? 'APROVEITAR OFERTA' : 'ADICIONAR À SACOLA'}</span>
                </button>
            </div>
        </div>
    );
}