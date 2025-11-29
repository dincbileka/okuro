"use client"; // <--- ARTIK TARAYICIDA ÇALIŞACAK

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import BookCard from "@/components/BookCard";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LibraryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [myBooks, setMyBooks] = useState<any[]>([]);

  useEffect(() => {
    const getData = async () => {
      // 1. Oturum kontrolü (Artık Client tarafında yapıyoruz, LocalStorage'ı okur)
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Oturum yoksa Login'e at
        router.push("/login");
        return;
      }

      // 2. Veriyi çek
      const { data, error } = await supabase
        .from("user_books")
        .select(`
          *,
          book:books (*) 
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Kütüphane hatası:", error);
      }
      
      setMyBooks(data || []);
      setLoading(false);
    };

    getData();
  }, [router]);

  // Yüklenme ekranı
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-blue-500 text-xl animate-pulse">Kütüphane Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <main className="max-w-6xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Kütüphanem
          </h1>
          <div className="text-sm text-gray-400">
            Toplam: <span className="text-white font-bold">{myBooks.length}</span> Kitap
          </div>
        </div>

        {myBooks.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/50 rounded-2xl border border-dashed border-gray-700">
            <p className="text-2xl text-gray-400 mb-4">Henüz rafında kitap yok 😔</p>
            <p className="text-gray-500 mb-8">Okuduğun veya okumak istediğin kitapları eklemeye başla.</p>
            <Link 
              href="/" 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition shadow-lg shadow-blue-900/40"
            >
              Kitap Ara ve Ekle
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myBooks.map((item: any) => (
              <div key={item.id} className="relative group">
                {/* Asıl Kitap Kartı */}
                {/* item.book null gelirse patlamasın diye kontrol ekledik */}
                {item.book && <BookCard book={item.book} />}
                
                {/* Durum Etiketi */}
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur text-[10px] px-2 py-1 rounded border border-gray-600 text-green-400 font-mono uppercase tracking-wider shadow-lg">
                   {item.status === 'want_to_read' ? 'Okunacak' : item.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}