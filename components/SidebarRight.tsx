"use client";

import React from 'react';
import { TrendingUp, UserPlus, ArrowRight } from 'lucide-react';
import { trendingBooks, suggestedUsers } from '../services/mockData';
import Link from 'next/link';
import { useTranslation } from "@/lib/LanguageContext";

export const SidebarRight = () => {
  const { t } = useTranslation();
  
  return (
    <aside className="hidden xl:flex flex-col w-full h-full sticky top-24 space-y-6">
      
      {/* Trendler */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-purple-500" /> {t('sidebarRight.weeklyTrends')}
        </h3>
        <div className="space-y-4">
          {trendingBooks.map((book, idx) => (
            <div key={book.id} className="flex items-center gap-3 group cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition">
              <div className="text-lg font-bold text-gray-600 w-4">{idx + 1}</div>
              <img src={book.coverUrl} alt={book.title} className="h-12 w-8 object-cover rounded shadow-sm group-hover:scale-110 transition-transform" />
              <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-bold text-white truncate group-hover:text-purple-400 transition">{book.title}</h4>
                <p className="text-xs text-gray-400 truncate">{book.author}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 text-xs font-semibold text-gray-400 hover:text-white flex items-center justify-center gap-1 transition">
          {t('sidebarRight.seeAll')} <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Kimi Takip Etmeli */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-blue-500" /> {t('sidebarRight.suggestedReaders')}
        </h3>
        <div className="space-y-4">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full border border-gray-700" />
                <div>
                  <h4 className="text-sm font-bold text-white">{user.name}</h4>
                  <p className="text-xs text-gray-400">{user.handle}</p>
                </div>
              </div>
              <button className="text-xs bg-white text-gray-900 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition">
                {t('sidebarRight.follow')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-gray-500">
            <Link href="/about" className="hover:text-gray-300 transition">{t('sidebarRight.about')}</Link>
            <Link href="/privacy" className="hover:text-gray-300 transition">{t('sidebarRight.privacy')}</Link>
            <Link href="/terms" className="hover:text-gray-300 transition">{t('sidebarRight.terms')}</Link>
            <Link href="/contact" className="hover:text-gray-300 transition">{t('sidebarRight.contact')}</Link>
        </div>
        <div className="text-xs text-gray-600 text-center mt-3">
            &copy; 2025 Okuro Inc.
        </div>
      </div>

    </aside>
  );
};