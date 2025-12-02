"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`fixed z-[100] top-6 left-0 w-full flex justify-center px-4 pointer-events-none md:top-auto md:left-auto md:bottom-8 md:right-8 md:w-auto md:block animate-toastSlideDown md:animate-slideUpFade`}>
      <div className="
        bg-chocolate-900 text-white px-6 py-4 rounded-xl shadow-2xl 
        flex items-center gap-4 border-l-4 border-green-500 
        pointer-events-auto 
        w-full max-w-sm md:w-auto md:min-w-[300px]
      ">

        <div className="bg-green-500/20 rounded-full p-1.5 text-green-400 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-caramelo-100 mb-0.5">Sucesso</p>
          <p className="text-sm font-medium opacity-90 truncate">{message}</p>
        </div>

        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors flex-shrink-0 p-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>
  );
}