import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartSidebar from "@/components/CartSidebar";
import { Poppins, Antic_Didone } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--poppins",
});

const anticDidone = Antic_Didone({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--antic-didone",
});

export const metadata: Metadata = {
  title: "Ama Brownie",
  description: "O melhor brownie do mundo!",
  authors : [{ name: "Ama Brownie" }],
  keywords : [ "doceria", "brownie", "sobremesa", "chocolate", "bolo", "doce", "gourmet", "artesanal", "delícia", "confeitaria", "sobremesas", "guloseimas", "presentes", "festas", "celebrações", "culinária", "gastronomia", "sabor", "amor", "feito à mão" ],
  icons : { icon: "icon", href: "/favicon.ico" },
  robots : {
    index: true,
    follow: true,},
  openGraph : {
    title: "Ama Brownie",
    description: "O melhor brownie do mundo!",
    siteName: "Ama Brownie",
    type: "website",
    locale: "pt_BR",
    images : [
      {
        url: "https://ama-brownie.vercel.app/preview.jpeg",
        width: 1200,
        height: 630,
        alt: "Ama Brownie"
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.variable} ${anticDidone.variable} antialiased`}>
        <CartProvider>
          {children}
          <CartSidebar />
        </CartProvider>
      </body>
    </html>
  );
}