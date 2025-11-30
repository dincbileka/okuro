import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Okuro",
  description: "Sosyal Kitap Takip Platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      {/* GÜNCELLEME BURADA: bg-gray-900 yerine bg-gray-950 yapıldı */}
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen font-sans antialiased`}>
        
        {/* Üst Menü (Sabit) */}
        <Navbar />
        
        {/* Sayfa İçeriği (Navbar fixed olduğu için padding-top veriyoruz) */}
        <div className="pt-16">
          {children}
        </div>
        
      </body>
    </html>
  );
}