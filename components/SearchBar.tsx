"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  // KURAL 2: Hook'lar fonksiyonun içinde tanımlanır
  const router = useRouter(); 
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/search?q=${value}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Arama hatası:", error);
    }
    
    setLoading(false);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          placeholder="Kitap ara... (Örn: Harry Potter)"
          value={query}
          onChange={handleSearch}
          className="w-full p-4 pl-12 rounded-full bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500 transition shadow-lg"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 animate-spin">
            ↻
          </span>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto">
          {results.map((book) => (
            <div
              key={book.id}
              className="p-4 hover:bg-gray-700 cursor-pointer flex items-center gap-4 transition border-b border-gray-700 last:border-0"
              onClick={() => {
                // Tıklanınca detay sayfasına git
                router.push(`/book/${book.id}`);
                setResults([]); // Listeyi temizle/kapat
                setQuery("");   // Arama kutusunu temizle
              }}
            >
              {book.cover_url ? (
                 <img src={book.cover_url} alt={book.title} className="w-10 h-14 object-cover rounded" />
              ) : (
                <div className="w-10 h-14 bg-gray-600 rounded flex items-center justify-center text-xs text-center p-1">No Img</div>
              )}
              
              <div>
                <h4 className="font-bold text-white text-sm">{book.title}</h4>
                <p className="text-xs text-gray-400">{book.author}</p>
                {book.source === 'google' && (
                  <span className="text-[10px] text-green-400 border border-green-400 px-1 rounded ml-2">WEB</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}