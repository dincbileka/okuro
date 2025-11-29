"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function BookActions({ book }: { book: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null); // Kullanıcının rafında var mı?
  const [user, setUser] = useState<any>(null);

  // 1. Sayfa açılınca: Kullanıcı giriş yapmış mı ve bu kitabı daha önce eklemiş mi?
  useEffect(() => {
    const checkUserBook = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // user_books tablosuna bak: Benim ID'mle bu Kitap ID'si eşleşen kayıt var mı?
        const { data } = await supabase
          .from("user_books")
          .select("status")
          .eq("user_id", user.id)
          .eq("book_id", book.id)
          .single();
        
        if (data) setStatus(data.status);
      }
    };
    checkUserBook();
  }, [book.id]);

  const handleSave = async () => {
    // Giriş yapmamışsa uyarı ver ve login'e at
    if (!user) {
      if (confirm("Listenize eklemek için giriş yapmalısınız. Giriş sayfasına gidilsin mi?")) {
        router.push("/login");
      }
      return;
    }

    setLoading(true);

    try {
      // ADIM A: Kitabı GENEL DEPOYA (books) "Güvenli" Ekle
      // 'ignoreDuplicates: true' sayesinde varsa hata vermez, yoksa ekler.
      const { error: bookError } = await supabase.from("books").upsert({
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
        }, 
        { onConflict: 'id', ignoreDuplicates: true }
      );

      if (bookError) throw bookError;

      // ADIM B: Kitabı benim 'user_books' tabloma bağla (Zimmetle)
      const { error: userBookError } = await supabase.from("user_books").upsert({
        user_id: user.id,
        book_id: book.id,
        status: 'want_to_read'
      });

      if (userBookError) throw userBookError;

      // Başarılı olursa butonu güncelle
      setStatus('want_to_read');
      // alert("Kitap rafınıza eklendi! 📚"); // İstersen açabilirsin

    } catch (error: any) {
      // --- DEBUG BLOĞU ---
      // Hata boş {} geliyorsa içini açıp bakalım
      console.error("HAM HATA:", error);
      console.error("DETAYLI HATA:", JSON.stringify(error, null, 2));
      
      const errorMsg = error.message || error.details || error.hint || "Bilinmeyen hata (Konsola bak)";
      alert("Bir sorun oluştu: " + errorMsg);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4">
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
        {loading ? (
          "İşleniyor..."
        ) : status ? (
          <>✓ Rafınızda Ekli</>
        ) : (
          <>📚 Listeme Ekle</>
        )}
      </button>

      {/* Favori butonu (şimdilik görsel) */}
      <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-2xl border border-gray-600">
        ❤️
      </button>
    </div>
  );
}