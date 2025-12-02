"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, ShoppingBag, Plus, Minus } from "lucide-react";

export default function CartSidebar() {
  const { 
    isSidebarOpen, 
    closeSidebar, 
    items, 
    removeFromCart, 
    cartTotal, 
    increaseItem, // Agora pegamos direto daqui
    decreaseItem  // Agora pegamos direto daqui
  } = useCart();

  // Fecha com ESC e Bloqueia o scroll da página de trás
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'; 
      
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeSidebar();
      };
      window.addEventListener('keydown', handleEsc);
      
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isSidebarOpen, closeSidebar]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-chocolate-900/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* A Gaveta */}
      <aside 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#FDFBF7] shadow-2xl z-[60] transform transition-transform duration-300 ease-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog" 
        aria-modal="true"
        aria-label="Carrinho de Compras"
      >
        
        {/* Header */}
        <header className="bg-chocolate-900 text-white p-5 flex justify-between items-center shadow-md shrink-0">
          <h2 className="font-serif font-bold text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-caramelo-500" />
            Sua Sacola <span className="text-sm bg-caramelo-500 text-chocolate-900 px-2 py-0.5 rounded-full font-bold">{items.length}</span>
          </h2>
          <button 
            onClick={closeSidebar} 
            className="p-2 hover:bg-chocolate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-caramelo-500"
            aria-label="Fechar carrinho"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-chocolate-900/40 text-center space-y-4">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <div>
                <p className="font-bold text-lg">Sua sacola está vazia.</p>
                <p className="text-sm">Que tal experimentar uma de nossas delícias?</p>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.tempId} className="bg-white p-3 rounded-2xl shadow-sm border border-amber-100 flex gap-4 transition-all hover:shadow-md">
                
                {/* Imagem */}
                <div className="w-20 h-20 bg-amber-50 rounded-xl flex-shrink-0 overflow-hidden relative border border-amber-100">
                  {item.image ? (
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fill 
                      className="object-cover" 
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🍫
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-chocolate-900 text-sm leading-tight line-clamp-2">
                        {item.name}
                      </h3>
                      <button 
                        onClick={() => removeFromCart(item.tempId)} 
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1"
                        aria-label={`Remover ${item.name} do carrinho`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {item.opcao && (
                      <p className="text-xs text-caramelo-600 font-medium mt-1 bg-caramelo-50 inline-block px-1.5 py-0.5 rounded">
                        {item.opcao}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-end mt-2">
                    {/* Controle de Quantidade Miniatura */}
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 h-7">
                        
                        {/* CORREÇÃO AQUI: Removi a prop 'disabled' e adicionei a função */}
                        <button 
                            onClick={() => decreaseItem(item.tempId)} 
                            className="px-2 text-gray-400 hover:text-chocolate-900 transition-colors"
                            aria-label="Diminuir quantidade"
                        > 
                            <Minus className="w-3 h-3" />
                        </button>

                        <span className="text-xs font-bold text-chocolate-900 px-1 min-w-[1.5rem] text-center">
                            {item.quantity}
                        </span>

                        <button 
                            onClick={() => increaseItem(item.tempId)} 
                            className="px-2 text-gray-400 hover:text-chocolate-900 transition-colors"
                            aria-label="Aumentar quantidade"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>

                    <span className="font-bold text-chocolate-900 text-sm">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 font-medium text-sm uppercase tracking-wider">Subtotal</span>
              <span className="text-2xl font-serif font-bold text-chocolate-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}
              </span>
            </div>
            
            <Link 
              href="/carrinho" 
              onClick={closeSidebar}
              className="group relative flex w-full justify-center items-center overflow-hidden rounded-xl bg-chocolate-900 px-8 py-4 font-bold text-white transition-all hover:bg-chocolate-800 active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Finalizar Pedido <span className="text-caramelo-400">→</span>
              </span>
            </Link>
            <p className="text-center text-xs text-gray-400 mt-3">Taxa de entrega calculada na próxima etapa</p>
          </div>
        )}
      </aside>
    </>
  );
}