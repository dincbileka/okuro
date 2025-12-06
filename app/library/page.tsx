"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import BookCard from "@/components/BookCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReviewModal from "@/components/ReviewModal";
// Global tipleri kullanıyoruz
import { UserBook, BookStatus } from "@/types";

export default function LibraryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [myBooks, setMyBooks] = useState<UserBook[]>([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<UserBook | null>(null);

  const fetchLibrary = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    // Veritabanından verileri çekiyoruz
    const { data, error } = await supabase
      .from("user_books")
      .select(`
        *,
        book:books (*) 
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Kütüphane verisi çekilirken hata:", error);
    
    // TİP DÜZELTMESİ: Gelen veriyi zorla UserBook[] tipine çeviriyoruz
    setMyBooks((data as unknown as UserBook[]) || []); 
    setLoading(false);
  };

  useEffect(() => {
    fetchLibrary();
  }, [router]);

  const handleStatusChange = async (recordId: number | string, newStatus: string) => {
    if (newStatus === "remove") {
      const confirmDelete = confirm("Bu kitabı listenizden kaldırmak istediğinize emin misiniz?");
      if (!confirmDelete) return;

      const { error } = await supabase.from("user_books").delete().eq("id", recordId);
      
      if (!error) {
        // ID karşılaştırmasında String() kullanarak tür uyuşmazlığını önlüyoruz
        setMyBooks((prev) => prev.filter((item) => String(item.id) !== String(recordId)));
      } else {
        alert("Silinirken hata oluştu.");
      }
      return;
    }

    const { error } = await supabase
      .from("user_books")
      .update({ status: newStatus })
      .eq("id", recordId);

    if (!error) {
      setMyBooks((prev) =>
        prev.map((item) =>
          // Status güncellemesini arayüze anında yansıtıyoruz
          // 'as BookStatus' diyerek TypeScript'e güven veriyoruz
          String(item.id) === String(recordId) ? { ...item, status: newStatus as BookStatus } : item
        )
      );
    } else {
      console.error("Durum güncelleme hatası:", error);
      alert("Durum güncellenemedi.");
    }
  };

  const openReviewModal = (bookItem: UserBook) => {
    setSelectedBook(bookItem);
    setIsModalOpen(true);
  };

  const handleReviewSaved = (newRating: number | null, newNotes: string | null) => {
    if (selectedBook) {
        setMyBooks((prev) =>
            prev.map((item) =>
                String(item.id) === String(selectedBook.id) ? { ...item, rating: newRating || undefined, notes: newNotes || undefined } : item
            )
        );
    }
    setIsModalOpen(false); 
  };

  const renderRatingStars = (rating: number | null | undefined) => {
    if (!rating) return null;
    return (
        <div className="flex text-yellow-400 text-lg">
            {Array(rating).fill('★').join('')}
            {Array(5 - rating).fill('☆').join('')}
        </div>
    );
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-400 animate-pulse">Yükleniyor...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <main className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Kütüphanem
            </h1>
            <p className="text-gray-400 text-sm mt-1">Okuma serüveninin kontrol paneli</p>
          </div>
          
          <div className="flex items-center gap-4 bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
            <span className="text-sm text-gray-400">Toplam Kitap:</span>
            <span className="text-white font-bold text-lg">{myBooks.length}</span>
          </div>
        </div>

        {myBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-800/30 rounded-3xl border border-dashed border-gray-700">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-2xl text-gray-300 font-semibold mb-2">Henüz rafında kitap yok</p>
            <Link 
              href="/" 
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition shadow-lg shadow-blue-900/40 flex items-center gap-2 mt-8"
            >
              <span>🔍</span> Kitap Ara ve Ekle
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myBooks.map((item: UserBook) => (
              <div key={item.id} className="relative group bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20">
                
                {/* BookCard çağrısı */}
                {item.book && <BookCard userBook={item} />}

                <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-700">
                    <div className="flex items-center gap-3">
                        {item.rating ? (
                            <div className="flex items-center gap-1">
                                {renderRatingStars(item.rating)}
                                <span className="text-sm text-gray-400">({item.rating}/5)</span>
                            </div>
                        ) : (
                            <span className="text-sm text-gray-500">Puanlanmadı</span>
                        )}
                    </div>

                    {item.is_favorite && (
                        <span className="text-red-500 text-2xl" title="Favori Kitabın">❤️</span>
                    )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <select
                      // status değerini string'e çevirerek value'ya atıyoruz
                      value={item.status as unknown as string} 
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`
                        appearance-none cursor-pointer text-xs font-bold w-full text-center px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all
                        ${(item.status as unknown as string) === 'want_to_read' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/20' : ''}
                        ${(item.status as unknown as string) === 'reading' ? 'bg-blue-500/10 text-blue-400 border-blue-500/50 hover:bg-blue-500/20' : ''}
                        ${(item.status as unknown as string) === 'finished' ? 'bg-green-500/10 text-green-400 border-green-500/50 hover:bg-green-500/20' : ''}
                      `}
                    >
                      {/* Option value'ları veritabanındaki (küçük harf) değerlerle aynı olmalı */}
                      <option value="want_to_read" className="bg-gray-800 text-yellow-500">⏳ Okunacak</option>
                      <option value="reading" className="bg-gray-800 text-blue-400">📖 Okuyorum</option>
                      <option value="finished" className="bg-gray-800 text-green-400">✅ Bitti</option>
                      <option disabled>──────────</option>
                      <option value="remove" className="bg-gray-800 text-red-400">🗑️ Listeden Kaldır</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>

                  <button
                    onClick={() => openReviewModal(item)}
                    className="px-4 py-1.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition whitespace-nowrap"
                  >
                    📝 İncele
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>

      {selectedBook && (
        <ReviewModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)} 
            // ID Number mı String mi çelişkisini çözmek için Number()
            userBookId={Number(selectedBook.id)} 
            initialRating={selectedBook.rating || null}
            initialNotes={selectedBook.notes || null}
            bookTitle={selectedBook.book.title}
            onReviewSaved={handleReviewSaved}
        />
      )}
    </div>
  );
}