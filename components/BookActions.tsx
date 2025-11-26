"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function BookActions({ book }: { book: any }) {
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    try {
      // 1. Önce bu kitap veritabanımızda var mı kontrol et
      const { data: existingBook } = await supabase
        .from("books")
        .select("id")
        .eq("id", book.id)
        .single();

      // 2. Eğer yoksa, TÜM DETAYLARIYLA kaydet
      if (!existingBook) {
        const { error: insertError } = await supabase.from("books").insert({
          id: book.id,
          title: book.title,
          author: book.author,
          cover_url: book.cover_url,
          isbn: book.isbn,
          normalized_title: book.title.toLowerCase(), // Arama için küçük harf
          
          // --- YENİ EKLENEN SÜTUNLAR ---
          description: book.description,     // Kitap Özeti
          publisher: book.publisher,         // Yayınevi
          published_date: book.published_date, // Basım Yılı
          page_count: book.page_count        // Sayfa Sayısı
        });

        if (insertError) throw insertError;
      } else {
        // Opsiyonel: Eğer kitap zaten varsa ama detayları eksikse (eski kayıtsa) güncellemek istersen buraya update kodu yazılabilir.
        // Şimdilik "Zaten var" deyip geçiyoruz.
        console.log("Kitap zaten veritabanında mevcut, tekrar eklenmedi.");
      }

      // Başarılı
      setIsSaved(true);
      alert("Kitap ve tüm detayları başarıyla kaydedildi! ✅");

    } catch (error: any) {
      console.error("Kaydetme hatası:", error);
      alert("Hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={handleSave}
        disabled={loading || isSaved}
        className={`flex-1 font-bold py-3 px-6 rounded-lg transition transform active:scale-95 flex items-center justify-center gap-2
          ${isSaved 
            ? "bg-green-600 hover:bg-green-700 text-white cursor-default" 
            : "bg-blue-600 hover:bg-blue-700 text-white"
          }
          ${loading ? "opacity-70 cursor-not-allowed" : ""}
        `}
      >
        {loading ? (
          "İşleniyor..."
        ) : isSaved ? (
          "✓ Listede Ekli"
        ) : (
          <>
            📚 Listeme Ekle
          </>
        )}
      </button>

      <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-2xl">
        ❤️
      </button>
    </div>
  );
}