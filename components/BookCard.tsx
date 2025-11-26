"use client";

import { useRouter } from "next/navigation";

export default function BookCard({ book }: { book: any }) {
  const router = useRouter();

  return (
    <div 
      onClick={() => router.push(`/book/${book.id}`)}
      className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 hover:bg-gray-750 transition cursor-pointer flex gap-4 items-start group relative overflow-hidden"
    >
      {/* Tıklama Efekti İçin Görünmez Katman */}
      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-10 bg-blue-500 transition" />

      {/* Resim Alanı */}
      <div className="z-10 flex-shrink-0">
        {book.cover_url ? (
          <img 
            src={book.cover_url} 
            alt={book.title} 
            className="w-20 h-28 object-cover rounded shadow-lg border border-gray-600"
            onError={(e) => {
              // Eğer resim yüklenemezse (kırık link), yedek kutuya dön
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        
        {/* Yedek Resim Kutusu (Resim yoksa veya yüklenemezse görünür) */}
        <div className={`w-20 h-28 bg-gray-700 rounded flex items-center justify-center text-xs text-center p-2 text-gray-400 border border-gray-600 ${book.cover_url ? 'hidden' : ''}`}>
          Resim Yok
        </div>
      </div>

      {/* Yazı Alanı */}
      <div className="z-10 flex-1">
        <h2 className="text-xl font-bold text-gray-100 group-hover:text-blue-400 transition leading-tight">
          {book.title}
        </h2>
        <p className="text-gray-400 mt-2 text-sm">✍️ {book.author}</p>
        
        {/* Debug için ID'yi küçükçe yazalım */}
        <p className="text-[10px] text-gray-600 mt-4 font-mono">ID: {book.id}</p>
      </div>
    </div>
  );
}