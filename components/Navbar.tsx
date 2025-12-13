"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, X, BookOpen, LogOut, User as UserIcon, Settings, Library, Users, UserPlus, Check, BookOpenCheck } from 'lucide-react';
import { searchBooksWithGemini } from '../services/geminiService';
import { Book } from '../types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from "@/lib/supabaseClient";
import { useTranslation } from "@/lib/LanguageContext";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_user_id?: string;
}

export const Navbar = () => {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url, email')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setUserAvatar(data.avatar_url);
          if (data.email) setUsername(data.email.split('@')[0]);
        }
        
        // Bildirimleri getir
        fetchNotifications(session.user.id);
      }
    };
    fetchUser();

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async (uid: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAsRead = async (notifId: number) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notifId);
    
    setNotifications(notifications.map(n => 
      n.id === notifId ? { ...n, is_read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus className="h-4 w-4 text-blue-400" />;
      case 'friend_accepted':
        return <Check className="h-4 w-4 text-green-400" />;
      case 'book_recommendation':
        return <BookOpenCheck className="h-4 w-4 text-purple-400" />;
      default:
        return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

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
          
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Okuro
            </span>
          </Link>

          {/* Arama Barı */}
          <div className="hidden md:block flex-1 max-w-lg mx-8 relative">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-full leading-5 bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all"
                placeholder={t('navbar.searchPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {loading && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}
            </form>

            {isSearchOpen && results.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden z-50">
                <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700 bg-gray-850">
                  <span className="text-xs font-semibold text-gray-400">{t('navbar.results')}</span>
                  <button onClick={() => setIsSearchOpen(false)}><X className="h-4 w-4 text-gray-400" /></button>
                </div>
                {results.map((book) => (
                  <div key={book.id} onClick={() => handleBookClick(book.id)} className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer transition border-b border-gray-700/50 last:border-0">
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

          <div className="flex items-center gap-4">
            {/* Bildirim İkonu */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-xl border border-gray-700 shadow-xl z-50 overflow-hidden">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700 bg-gray-850">
                    <span className="font-semibold text-white">{t('notifications.title')}</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        {t('notifications.markAllRead')}
                      </button>
                    )}
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>{t('notifications.empty')}</p>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          onClick={() => {
                            if (!notif.is_read) markAsRead(notif.id);
                            setIsNotifOpen(false);
                            if (notif.type === 'friend_request' || notif.type === 'friend_accepted') {
                              router.push('/friends');
                            }
                          }}
                          className={`flex items-start gap-3 p-3 hover:bg-gray-700 cursor-pointer transition border-b border-gray-700/50 last:border-0 ${
                            !notif.is_read ? 'bg-blue-500/10' : ''
                          }`}
                        >
                          <div className="mt-1">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notif.is_read ? 'text-white font-medium' : 'text-gray-300'}`}>
                              {notif.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notif.created_at).toLocaleDateString(
                                language === 'tr' ? 'tr-TR' : 'en-US',
                                { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
                              )}
                            </p>
                          </div>
                          {!notif.is_read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Link 
                    href="/friends" 
                    onClick={() => setIsNotifOpen(false)}
                    className="block text-center py-3 text-sm text-blue-400 hover:bg-gray-700 border-t border-gray-700 transition"
                  >
                    {t('notifications.viewAll')}
                  </Link>
                </div>
              )}
            </div>

            {/* Profil Menüsü */}
            <div className="relative" ref={profileRef}>
                <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 p-[2px] cursor-pointer hover:scale-105 transition transform">
                    <img src={userAvatar || "https://i.pravatar.cc/150?u=guest"} alt="Profile" className="rounded-full h-full w-full object-cover border-2 border-gray-900 bg-gray-800" />
                </div>

                {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl border border-gray-700 shadow-xl py-1 z-50 overflow-hidden">
                        
                        {/* Kütüphanem */}
                        <Link href="/library" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition">
                            <Library className="h-4 w-4" /> {t('navbar.myLibrary')}
                        </Link>

                        {/* Arkadaşlarım */}
                        <Link href="/friends" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition">
                            <Users className="h-4 w-4" /> {t('navbar.friends')}
                        </Link>
                        
                        {/* Profilim */}
                        <Link 
                            href={`/u/${username || 'me'}`} 
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition w-full text-left"
                        >
                            <UserIcon className="h-4 w-4" /> {t('navbar.myProfile')}
                        </Link>

                        {/* Ayarlar */}
                        <Link 
                            href="/settings"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition w-full text-left"
                        >
                            <Settings className="h-4 w-4" /> {t('navbar.settings')}
                        </Link>
                        
                        <div className="h-px bg-gray-700 my-1"></div>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition text-left">
                            <LogOut className="h-4 w-4" /> {t('navbar.logout')}
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