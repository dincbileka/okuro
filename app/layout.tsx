import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { LanguageProvider } from "@/lib/LanguageContext";

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
      {/* Arka plan rengini burada sabitliyoruz */}
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen font-sans antialiased`}>
        <LanguageProvider>
          {/* Üst Menü (Sabit) */}
          <Navbar />
          
          {/* Sayfa İçeriği (Navbar fixed olduğu için padding-top veriyoruz) */}
          <div className="pt-16">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}