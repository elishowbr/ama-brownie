import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen md:h-screen w-full bg-creme text-chocolate-900 flex flex-col md:flex-row relative overflow-y-auto md:overflow-hidden">

      {/* DECORAÇÃO DE FUNDO (Fixa para não rolar junto no mobile se quiser, ou absoluta padrão) */}
      <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-caramelo-100 rounded-full opacity-50 blur-2xl md:w-96 md:h-96 md:top-[-100px] md:left-[-100px] pointer-events-none"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-60 h-60 bg-chocolate-800 rounded-full opacity-5 blur-3xl md:w-[500px] md:h-[500px] pointer-events-none"></div>

      {/* --- LADO ESQUERDO --- */}
      <section className="flex-1 flex flex-col justify-center items-center relative z-10 px-6 py-10 md:px-0 md:py-0">

        <div className="flex flex-col items-center md:items-start max-w-lg w-full md:pl-20">
          {/* LOGO */}
          <div className="w-32 h-32 bg-chocolate-900 rounded-full flex items-center justify-center shadow-xl mb-6 border-4 border-caramelo-500 md:w-40 md:h-40 shrink-0 relative overflow-hidden"> {/* 2. Adicione relative e overflow-hidden aqui */}
            <Image
              src="/images/ama-logo.png"
              alt="Logo Ama Brownie"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* TÍTULO */}
          <h1 className="text-4xl md:text-6xl font-[antic-didone] text-chocolate-900 tracking-wide leading-tight text-center md:text-left">
            AMA <br className="hidden md:block" /> BROWNIE
          </h1>
          <p className="text-chocolate-600 mt-4 text-lg italic md:text-xl text-center md:text-left">
            Explosão de amor em cada pedaço.
          </p>

          {/* BOTÕES */}
          <div className="w-full max-w-xs flex flex-col space-y-4 mt-8">
            <Link
              href="/main"
              className="w-full bg-chocolate-900 hover:bg-chocolate-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Ver Cardápio</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>

            <Link
              href="/login"
              className="w-full bg-transparent hover:bg-caramelo-100 text-chocolate-900 font-bold py-4 px-6 rounded-2xl border-2 border-chocolate-900 transition-colors flex items-center justify-center"
            >
              Meus Pedidos
            </Link>
          </div>
        </div>

      </section>

      {/* --- LADO DIREITO --- */}
      <div className="hidden md:flex flex-1 items-center justify-center relative z-0">

        {/* Círculo decorativo */}
        <div className="w-[400px] h-[400px] bg-chocolate-900 rounded-full absolute opacity-10 blur-xl"></div>

        {/* Card Flutuante */}
        <div className="relative w-full max-w-[400px] aspect-square lg:max-w-[450px] bg-gradient-to-br from-chocolate-800 to-chocolate-600 rounded-3xl shadow-2xl rotate-6 flex items-center justify-center border-8 border-white transition-transform hover:rotate-3 mx-4">
          <Image
            src="/images/ama-hero.png"
            alt="Logo Ama Brownie"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-10 -left-10 bg-white p-4 rounded-xl shadow-lg rotate-[-6deg]">
            <p className="font-serif font-bold text-chocolate-900">O melhor brownie</p>
            <p className="text-xs text-gray-500">do muuundo!</p>
          </div>
        </div>
      </div>

    </main>
  );
}