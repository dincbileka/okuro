"use client";

import React from 'react';
import { Star } from 'lucide-react';
import { UserBook, BookStatus } from '../types';
import Link from 'next/link';
import { useTranslation } from "@/lib/LanguageContext";

interface BookCardProps {
  userBook: UserBook;
  variant?: 'compact' | 'detailed' | 'shelf';
}

const BookCard: React.FC<BookCardProps> = ({ userBook, variant = 'detailed' }) => {
  const { t } = useTranslation();
  
  if (!userBook || !userBook.book) {
    return null;
  }

  const { book, status, rating, is_favorite, notes } = userBook;
  
  const currentStatus = status as unknown as string;

  // Raf Görünümü
  if (variant === 'shelf') {
    return (
      <Link href={`/book/${book.id}`} className="w-32 shrink-0 snap-start flex flex-col group cursor-pointer block">
        <div className="w-full aspect-[2/3] rounded-md shadow-sm overflow-hidden mb-2 relative bg-gray-800 border border-gray-700">
           {book.cover_url ? (
             <img 
               src={book.cover_url} 
               alt={book.title || t('book.bookCover')} 
               className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
             />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 text-center p-2">
                {book.title || t('book.noImage')}
             </div>
           )}
           
           {is_favorite && (
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
    <Link href={`/book/${book.id}`} className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex gap-4 transition-all hover:border-gray-700 hover:bg-gray-800/50 block h-full">
      {/* Kapak - Sabit yükseklik */}
      <div className="w-24 h-36 shrink-0 rounded-md overflow-hidden bg-gray-800 border border-gray-700">
        {book.cover_url ? (
          <img 
            src={book.cover_url} 
            alt={book.title || t('book.bookCover')} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 text-center p-2">
            {t('book.noImage')}
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-start gap-2">
          {/* Başlık ve Yazar - Sabit yükseklik */}
          <div className="min-w-0 h-16 overflow-hidden">
            <h3 className="font-bold text-lg leading-tight mb-1 text-white group-hover:text-blue-400 transition line-clamp-2">
                {book.title || t('book.unknownBook')}
            </h3>
            <p className="text-sm text-gray-400 truncate">
                {book.author || t('book.unknownAuthor')}
            </p>
          </div>
          {rating && (
            <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded text-yellow-500 text-sm font-medium border border-yellow-500/20 shrink-0">
              <Star size={14} fill="currentColor" />
              <span>{rating}</span>
            </div>
          )}
        </div>
        
        {/* Notlar - Sabit yükseklik */}
        <div className="h-16 mt-2">
          {notes && (
            <p className="text-sm text-gray-300 italic bg-gray-800/50 p-2 rounded border-l-2 border-blue-500 line-clamp-2">
              "{notes.length > 200 ? notes.slice(0, 200) + '...' : notes}"
            </p>
          )}
        </div>

        <div className="mt-auto pt-3 flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
          <span className={`px-2 py-0.5 rounded ${currentStatus === 'finished' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : currentStatus === 'reading' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
            {currentStatus ? t(`bookStatus.${currentStatus}`) : t('book.unknown')}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;