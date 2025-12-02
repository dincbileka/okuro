"use client";

import React from 'react';
import { Star } from 'lucide-react';
import { UserBook, BookStatus } from '../types'; // BookStatus import edildi
import Link from 'next/link';

interface BookCardProps {
  userBook: UserBook;
  variant?: 'compact' | 'detailed' | 'shelf';
}

const BookCard: React.FC<BookCardProps> = ({ userBook, variant = 'detailed' }) => {
  if (!userBook || !userBook.book) return null;

  const { book, status, rating } = userBook;

  // Raf Görünümü
  if (variant === 'shelf') {
    return (
      <Link href={`/book/${book.id}`} className="w-32 shrink-0 snap-start flex flex-col group cursor-pointer">
        <div className="w-full aspect-[2/3] rounded-md shadow-sm overflow-hidden mb-2 relative bg-gray-800 border border-gray-700">
           {book.cover_url ? (
             <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Img</div>
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

  // Liste Görünümü
  return (
    <Link href={`/book/${book.id}`} className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 flex gap-4 transition-all hover:border-gray-500 hover:shadow-xl block">
      <div className="w-24 shrink-0 aspect-[2/3] rounded-md overflow-hidden bg-gray-700 border border-gray-600">
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Img</div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg leading-tight mb-1 text-white group-hover:text-blue-400 transition">{book.title}</h3>
            <p className="text-sm text-gray-400 mb-2">{book.author}</p>
          </div>
          {rating && (
            <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded text-yellow-500 text-sm font-medium border border-yellow-500/20">
              <Star size={14} fill="currentColor" />
              <span>{rating}</span>
            </div>
          )}
        </div>
        
        {userBook.notes && (
          <p className="text-sm text-gray-300 line-clamp-2 mt-2 italic bg-gray-700/50 p-2 rounded border-l-2 border-blue-500">
            "{userBook.notes}"
          </p>
        )}

        <div className="mt-auto pt-3 flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
          <span className={`px-2 py-0.5 rounded ${status === BookStatus.FINISHED ? 'bg-green-500/10 text-green-400 border border-green-500/20' : status === BookStatus.READING ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-gray-700 text-gray-400 border border-gray-600'}`}>
            {status ? (status as string).replace(/_/g, ' ') : 'UNKNOWN'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;