"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function BookActions({ book }: { book: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<any>(null);

  // 1. Sayfa açılınca: Kullanıcı kim ve durumu ne?
  useEffect(() => {
    const checkUserBook = async () => {
      // DÜZELTME BURADA: getSession yerine direkt getUser ile en güncel veriyi alıyoruz
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("user_books")
          .select("status, is_favorite")
          .eq("user_id", user.id)
          .eq("book_id", book.id)
          .single();
        
        if (data) {
          setStatus(data.status);
          setIsFavorite(data.is_favorite);
        }
      }
    };
    checkUserBook();
  }, [book.id]);

  // --- LİSTEYE EKLEME ---
  const handleSave = async () => {
    if (!user) {
      if (confirm("Listenize eklemek için giriş yapmalısınız. Giriş sayfasına gidilsin mi?")) router.push("/login");
      return;
    }

    setLoading(true);

    try {
      // 1. Kitap yoksa havuza ekle
      await supabase.from("books").upsert({
          id: book.id,
          title: book.title,
          author: book.author,
          cover_url: book.cover_url,
          isbn: book.isbn,
          normalized_title: book.title.toLowerCase(),
          description: book.description,
          publisher: book.publisher,
          published_date: book.published_date,
          page_count: book.page_count
        }, { onConflict: 'id', ignoreDuplicates: true });

      // 2. Kullanıcı rafına ekle (Mevcut favori durumunu korumak lazım)
      // En güvenli yol: Önce var mı diye bak, varsa update, yoksa insert.
      
      const { data: existing } = await supabase
        .from("user_books")
        .select("id")
        .eq("user_id", user.id)
        .eq("book_id", book.id)
        .single();

      if (existing) {
         await supabase.from("user_books").update({ status: 'want_to_read' }).eq("id", existing.id);
      } else {
         await supabase.from("user_books").insert({
           user_id: user.id,
           book_id: book.id,
           status: 'want_to_read',
           is_favorite: false
         });
      }

      setStatus('want_to_read');

    } catch (error: any) {
      console.error("Hata:", error);
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FAVORİ (KALP) ---
  const handleToggleFavorite = async () => {
    if (!user) {
      if (confirm("Favorilere eklemek için giriş yapmalısınız. Giriş sayfasına gidilsin mi?")) router.push("/login");
      return;
    }

    setFavLoading(true);
    const newFavStatus = !isFavorite;

    try {
      // 1. Kitap havuzda var mı? (Garanti olsun)
      await supabase.from("books").upsert({
        id: book.id,
        title: book.title,
        author: book.author,
        cover_url: book.cover_url,
        normalized_title: book.title.toLowerCase(),
      }, { onConflict: 'id', ignoreDuplicates: true });

      // 2. user_books güncelle
      const { data: existing } = await supabase
        .from("user_books")
        .select("id")
        .eq("user_id", user.id)
        .eq("book_id", book.id)
        .single();

      if (existing) {
        // Kayıt varsa sadece favoriyi güncelle
        await supabase
          .from("user_books")
          .update({ is_favorite: newFavStatus })
          .eq("id", existing.id);
      } else {
        // Kayıt yoksa yeni oluştur
        await supabase.from("user_books").insert({
          user_id: user.id,
          book_id: book.id,
          status: 'want_to_read', // Varsayılan durum
          is_favorite: newFavStatus
        });
        setStatus('want_to_read');
      }

      // 3. Ekranı güncelle
      setIsFavorite(newFavStatus);

    } catch (error: any) {
      console.error("Favori hatası:", error);
      alert("Hata: " + error.message);
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <div className="flex gap-4">
      {/* EKLE BUTONU */}
      <button
        onClick={handleSave}
        disabled={loading || !!status} 
        className={`flex-1 font-bold py-3 px-6 rounded-lg transition transform active:scale-95 flex items-center justify-center gap-2
          ${status 
            ? "bg-green-600/20 text-green-400 border border-green-600 cursor-default" 
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/50"
          }
          ${loading ? "opacity-70 cursor-not-allowed" : ""}
        `}
      >
        {loading ? "..." : status ? <>✓ Rafınızda Ekli</> : <>📚 Listeme Ekle</>}
      </button>

      {/* ❤️ FAVORİ BUTONU */}
      <button 
        onClick={handleToggleFavorite}
        disabled={favLoading}
        className={`px-4 py-3 rounded-lg transition text-2xl border flex items-center justify-center
          ${isFavorite 
            ? "bg-red-600/20 text-red-500 border-red-600 shadow-lg shadow-red-900/30 scale-105" // Kırmızı
            : "bg-gray-700 hover:bg-gray-600 text-gray-400 border-gray-600 hover:text-white" // Gri
          }
        `}
      >
        {favLoading ? <span className="text-sm animate-spin">⌛</span> : (isFavorite ? "❤️" : "🤍")}
      </button>
    </div>
  );
}