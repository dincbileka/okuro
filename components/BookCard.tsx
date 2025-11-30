"use client";

import React from 'react';
import { Star } from 'lucide-react';
import { UserBook } from '../types';
import Link from 'next/link';

interface BookCardProps {
  userBook: UserBook;
  variant?: 'compact' | 'detailed' | 'shelf';
}

const BookCard: React.FC<BookCardProps> = ({ userBook, variant = 'detailed' }) => {
  // GÜVENLİK KONTROLÜ: Eğer userBook veya içindeki book yoksa hiçbir şey gösterme (veya loading göster)
  if (!userBook || !userBook.book) {
    return null; // Veya <div className="animate-pulse bg-gray-800 h-32 w-24 rounded"></div>
  }

  const { book, status, rating } = userBook;

  // Raf Görünümü (Sadece Kapak)
  if (variant === 'shelf') {
    return (
      <Link href={`/book/${book.id}`} className="w-32 shrink-0 snap-start flex flex-col group cursor-pointer">
        <div className="w-full aspect-[2/3] rounded-md shadow-sm overflow-hidden mb-2 relative bg-gray-800">
           {book.cover_url ? (
             <img 
               src={book.cover_url} 
               alt={book.title} 
               className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
             />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 border border-gray-700">No Img</div>
           )}
           
           {userBook.is_favorite && (
             <div className="absolute top-2 right-2 bg-yellow-400/90 text-white p-1 rounded-full shadow-sm">
               <Star size={12} fill="currentColor" />
             </div>
           )}
        </div>
      </Link>
    );
  }

  // Detaylı Liste Görünümü
  return (
    <Link href={`/book/${book.id}`} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex gap-4 transition-all hover:shadow-md block">
      <div className="w-24 shrink-0 aspect-[2/3] rounded-md overflow-hidden bg-stone-200">
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-500">No Img</div>
        )}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-serif font-bold text-lg leading-tight mb-1 text-ink">{book.title}</h3>
            <p className="text-sm text-stone-500 mb-2">{book.author}</p>
          </div>
          {rating && (
            <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded text-orange-700 text-sm font-medium">
              <Star size={14} fill="currentColor" />
              <span>{rating}</span>
            </div>
          )}
        </div>
        
        {userBook.notes && (
          <p className="text-sm text-stone-600 line-clamp-2 mt-2 italic bg-stone-50 p-2 rounded border-l-2 border-stone-300">
            "{userBook.notes}"
          </p>
        )}

        <div className="mt-auto pt-3 flex items-center gap-2 text-xs text-stone-400 font-medium uppercase tracking-wider">
          <span className={`px-2 py-0.5 rounded ${status === 'READ' ? 'bg-green-100 text-green-700' : status === 'CURRENTLY_READING' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-500'}`}>
            {status ? status.replace(/_/g, ' ') : 'UNKNOWN'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;