import AuthButton from "@/components/AuthButton"; // <--- YENİ
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link"; // <--- Link servisini çağırdık
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Okuro Kütüphanesi",
  description: "Kişisel kitap takip sisteminiz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen`}>
        
        {/* --- NAVBAR (ÜST MENÜ) BAŞLANGICI --- */}
        <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            
            {/* SOL: LOGO (Ana Sayfa Linki) */}
            <Link 
              href="/" 
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition"
            >
              Okuro
            </Link>

            {/* SAĞ: Akıllı Auth Alanı */}
            <div className="flex gap-4 items-center">
              <AuthButton /> {/* <--- YENİ */}
            </div>

          </div>
        </nav>
        {/* --- NAVBAR BİTİŞİ --- */}

        {/* Sayfaların içeriği buraya yüklenir */}
        {children}
        
      </body>
    </html>
  );
}