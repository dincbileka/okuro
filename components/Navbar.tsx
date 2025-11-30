"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, X, BookOpen, LogOut, User as UserIcon, Settings, Library } from 'lucide-react';
import { searchBooksWithGemini } from '../services/geminiService';
import { Book } from '../types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from "@/lib/supabaseClient";

export const Navbar = () => {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  
  // --- YENİ EKLENEN STATE'LER ---
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Profil menüsü açık mı?
  const [isNotifOpen, setIsNotifOpen] = useState(false);     // Bildirim menüsü açık mı?
  
  // Dışarı tıklayınca menüleri kapatmak için ref
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLButtonElement>(null);

  // 1. Profil Resmini Çek
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single();
        
        if (data?.avatar_url) {
          setUserAvatar(data.avatar_url);
        }
      }
    };
    fetchUser();

    // Dışarı tıklama kontrolü
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Çıkış Yap Fonksiyonu
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const books = await searchBooksWithGemini(query);
    setResults(books);
    setLoading(false);
    setIsSearchOpen(true);
  };

  const handleBookClick = (bookId: string) => {
    setIsSearchOpen(false);
    setQuery('');
    router.push(`/book/${bookId}`);
  };

  return (
    <nav className="fixed top-0 w-full bg-gray-950/90 backdrop-blur-md border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Okuro
            </span>
          </Link>

          {/* Orta Arama Barı */}
          <div className="hidden md:block flex-1 max-w-lg mx-8 relative">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-full leading-5 bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all"
                placeholder="Kitap ara..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {loading && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}
            </form>

            {/* Arama Sonuçları */}
            {isSearchOpen && results.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden z-50">
                <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700 bg-gray-850">
                  <span className="text-xs font-semibold text-gray-400">SONUÇLAR</span>
                  <button onClick={() => setIsSearchOpen(false)}><X className="h-4 w-4 text-gray-400" /></button>
                </div>
                {results.map((book) => (
                  <div 
                    key={book.id} 
                    onClick={() => handleBookClick(book.id)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer transition border-b border-gray-700/50 last:border-0"
                  >
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-10 h-14 object-cover rounded shadow-sm" />
                    ) : (
                      <div className="w-10 h-14 bg-gray-700 rounded flex items-center justify-center text-xs">No Img</div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-gray-200">{book.title}</h4>
                      <p className="text-xs text-gray-400">{book.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sağ İkonlar */}
          <div className="flex items-center gap-4">
            
            {/* Bildirim İkonu */}
            <div className="relative">
                <button 
                    ref={notifRef}
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition relative"
                >
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-gray-900"></span>
                </button>
                {/* Bildirim Dropdown */}
                {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-xl border border-gray-700 shadow-xl py-2 z-50">
                        <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700">Bildirimler</div>
                        <div className="px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer">
                            Henüz yeni bildirim yok.
                        </div>
                    </div>
                )}
            </div>
            
            {/* --- PROFİL MENÜSÜ (DROPDOWN) --- */}
            <div className="relative" ref={profileRef}>
                <div 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 p-[2px] cursor-pointer hover:scale-105 transition transform"
                >
                    <img 
                        src={userAvatar || "https://i.pravatar.cc/150?u=guest"} 
                        alt="Profile" 
                        className="rounded-full h-full w-full object-cover border-2 border-gray-900 bg-gray-800"
                    />
                </div>

                {/* Açılır Menü */}
                {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl border border-gray-700 shadow-xl py-1 z-50 overflow-hidden">
                        <Link href="/library" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition">
                            <Library className="h-4 w-4" /> Kütüphanem
                        </Link>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition text-left">
                            <UserIcon className="h-4 w-4" /> Profilim
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition text-left">
                            <Settings className="h-4 w-4" /> Ayarlar
                        </button>
                        <div className="h-px bg-gray-700 my-1"></div>
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition text-left"
                        >
                            <LogOut className="h-4 w-4" /> Çıkış Yap
                        </button>
                    </div>
                )}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
};