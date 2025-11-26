import { supabase } from "@/lib/supabaseClient";
import SearchBar from "@/components/SearchBar";
import BookCard from "@/components/BookCard"; // <--- Yeni bileşenimiz

// Cache yapmasın, her F5'te taze veri çeksin
export const revalidate = 0;

export default async function Home() {
  // Veritabanından kitapları çek
  const { data: books, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("DB Hatası:", error);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Okuro Kütüphanesi
        </h1>

        <SearchBar />

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-300 border-b border-gray-700 pb-2">
            Son Eklenenler
          </h3>

          {!books || books.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg border border-dashed border-gray-700">
              <p className="text-gray-400 text-lg">Kütüphane boş görünüyor...</p>
              <p className="text-sm text-gray-500 mt-2">Yukarıdan bir kitap arayıp ekleyebilirsin!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.map((book) => (
                // Her kitap için akıllı kartı çağırıyoruz
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}