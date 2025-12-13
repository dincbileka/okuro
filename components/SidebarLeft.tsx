"use client";

import React, { useEffect, useState } from 'react';
import { Target, Settings, LogOut, User, BookOpen } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useTranslation } from "@/lib/LanguageContext";

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

export const SidebarLeft = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ books: 0, reading: 0, done: 0 });

  const ADMIN_EMAIL = "dincbileka@gmail.com";
  const isAdmin = profile?.email === ADMIN_EMAIL;

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, email')
          .eq('id', session.user.id)
          .single();
        
        if (profileData) setProfile(profileData);

        const { data: booksData } = await supabase
          .from('user_books')
          .select('status')
          .eq('user_id', session.user.id);

        if (booksData) {
          const totalBooks = booksData.length;
          const readingCount = booksData.filter(b => b.status === 'reading').length;
          const doneCount = booksData.filter(b => b.status === 'finished').length;
          setStats({ books: totalBooks, reading: readingCount, done: doneCount });
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return <div className="p-6 text-gray-500 text-sm animate-pulse">{t('sidebar.profileLoading')}</div>;
  }

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || "Misafir";
  const username = profile?.email?.split('@')[0] || "misafir";
  const displayHandle = `@${username}`;
  const displayAvatar = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;

  // --- STİL DÜZELTMESİ YAPILDI (Dark Mode) ---
  return (
    <aside className="hidden lg:flex flex-col w-full h-full sticky top-24 space-y-6">
      
      {/* Profil Kartı */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg">
        <Link href={`/u/${username}`} className="flex flex-col items-center group cursor-pointer">
          <div className="relative">
            <div className={`h-20 w-20 rounded-full p-[2px] ${isAdmin ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}>
              <img 
                src={displayAvatar} 
                alt={displayName} 
                className="rounded-full h-full w-full object-cover border-4 border-gray-900 bg-gray-800 group-hover:opacity-90 transition" 
              />
            </div>
            <div className="absolute bottom-0 right-0 h-5 w-5 bg-green-500 border-4 border-gray-900 rounded-full"></div>
          </div>
          
          <h2 className="mt-4 text-xl font-bold text-white text-center group-hover:text-blue-400 transition">{displayName}</h2>
          <p className="text-sm text-gray-400">{displayHandle}</p>
          
          <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold border shadow-sm
            ${isAdmin 
              ? "bg-red-900/20 text-red-200 border-red-500/30" 
              : "bg-gray-800 text-blue-300 border-gray-700"
            }`}
          >
            {isAdmin ? t('sidebar.systemAdmin') : t('sidebar.bookworm')}
          </div>
        </Link>

        {/* İstatistikler */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center border-t border-gray-800 pt-4">
          <div>
            <div className="text-lg font-bold text-white">{stats.books}</div>
            <div className="text-xs text-gray-500">{t('sidebar.total')}</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{stats.reading}</div>
            <div className="text-xs text-gray-500">{t('sidebar.reading')}</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{stats.done}</div>
            <div className="text-xs text-gray-500">{t('sidebar.finished')}</div>
          </div>
        </div>
      </div>

      {/* Okuma Hedefi */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" /> {t('sidebar.yearGoal')}
          </h3>
          <span className="text-xs text-gray-400">40%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full" style={{ width: `40%` }}></div>
        </div>
        <p className="text-xs text-gray-400">
          {t('sidebar.goalProgress')}
        </p>
      </div>

      {/* Menü Linkleri */}
      <div className="space-y-2">
        <Link 
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition w-full"
        >
          <Settings className="h-5 w-5" /> {t('sidebar.settings')}
        </Link>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition"
        >
          <LogOut className="h-5 w-5" /> {t('sidebar.logout')}
        </button>
      </div>

    </aside>
  );
};