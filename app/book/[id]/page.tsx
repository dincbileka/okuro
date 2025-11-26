import { supabase } from "@/lib/supabaseClient";
import BookActions from "@/components/BookActions"; // <--- 1. EKLEME (Import)

export default async function BookDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  let bookData = null;

  try {
    // SENARYO 1: ID "google_" ile başlıyorsa
    if (id.startsWith("google_")) {
      const googleId = id.replace("google_", "");
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${googleId}?langRestrict=tr`);
      
      if (!res.ok) throw new Error("Google API hatası");
      
      const data = await res.json();
      const info = data.volumeInfo;

      bookData = {
        id: id,
        title: info.title,
        author: info.authors ? info.authors[0] : "Bilinmeyen Yazar",
        description: info.description || "Açıklama yok.",
        cover_url: info.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
        page_count: info.pageCount,
        publisher: info.publisher,
        published_date: info.publishedDate,
        isbn: info.industryIdentifiers?.[0]?.identifier || "Belirsiz",
        source: 'google'
      };
    } 
    // SENARYO 2: Bizim Veritabanı
    else {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", id) 
        .single();

      if (data) {
        bookData = {
          ...data,
          description: data.description || "Bu kitap yerel veritabanında kayıtlı."
        };
      }
    }
  } catch (err) {
    console.error("Genel Hata:", err);
  }

  if (!bookData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl mb-4">😕</h1>
        <h2 className="text-2xl font-bold">Kitap Bulunamadı</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700 flex flex-col md:flex-row gap-8">
        
        {/* SOL: Kapak */}
        <div className="flex-shrink-0 mx-auto md:mx-0">
            {bookData.cover_url ? (
                <img 
                  src={bookData.cover_url} 
                  alt={bookData.title} 
                  className="w-64 h-auto rounded-lg shadow-lg border border-gray-600"
                />
            ) : (
                <div className="w-64 h-96 bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 border border-gray-600">
                    Kapak Yok
                </div>
            )}
        </div>

        {/* SAĞ: Bilgiler */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">{bookData.title}</h1>
          <h2 className="text-xl text-gray-300 mb-6">✍️ {bookData.author}</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-400 bg-gray-900/30 p-4 rounded-lg">
            <div><span className="font-bold text-white">Yayınevi:</span> {bookData.publisher || '-'}</div>
            <div><span className="font-bold text-white">Yıl:</span> {bookData.published_date || '-'}</div>
            <div><span className="font-bold text-white">Sayfa:</span> {bookData.page_count || '-'}</div>
            <div><span className="font-bold text-white">ISBN:</span> {bookData.isbn || '-'}</div>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 mb-8">
            <h3 className="font-bold mb-2 text-gray-200">Kitap Özeti</h3>
            <p className="text-gray-400 leading-relaxed text-sm max-h-60 overflow-y-auto">
              {bookData.description?.replace(/<[^>]*>?/gm, '')}
            </p>
          </div>
          
          {/* --- 2. EKLEME: BUTONLARI GERİ GETİRDİK --- */}
          <div className="mt-8">
             <BookActions book={bookData} />
          </div>

        </div>
      </div>
    </div>
  );
}