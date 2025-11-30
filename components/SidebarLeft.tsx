"use client";

import React, { useEffect, useState } from 'react';
import { BookOpen, Target, Settings, LogOut, User } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// Profil verisi için tip tanımı
interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

export const SidebarLeft = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ books: 0, reading: 0, done: 0 });

  useEffect(() => {
    const fetchProfile = async () => {
      // 1. Oturumu al
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // 2. Profil bilgilerini çek
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, email')
          .eq('id', session.user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }

        // 3. İstatistikleri çek (Kaç kitap okudu, kaçını okuyor?)
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
    return <div className="p-6 text-gray-500 text-sm animate-pulse">Profil yükleniyor...</div>;
  }

  // Varsayılan değerler (Eğer profil boşsa)
  const displayName = profile?.full_name || profile?.email?.split('@')[0] || "Misafir";
  const displayHandle = profile?.email ? `@${profile.email.split('@')[0]}` : "@misafir";
  // Avatar yoksa DiceBear API ile otomatik oluştur
  const displayAvatar = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;

  return (
    <div className="space-y-6">
      
      {/* Profil Kartı */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-[2px]">
              <img 
                src={displayAvatar} 
                alt={displayName} 
                className="rounded-full h-full w-full object-cover border-4 border-gray-800 bg-gray-700" 
              />
            </div>
            {/* Online İkonu */}
            <div className="absolute bottom-0 right-0 h-5 w-5 bg-green-500 border-4 border-gray-800 rounded-full"></div>
          </div>
          
          <h2 className="mt-4 text-xl font-bold text-white text-center">{displayName}</h2>
          <p className="text-sm text-gray-400">{displayHandle}</p>
          
          <div className="mt-2 px-3 py-1 bg-gray-700 rounded-full text-xs font-medium text-blue-300 border border-gray-600">
            Kitap Kurdu 📚
          </div>
        </div>

        {/* İstatistikler */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center border-t border-gray-700 pt-4">
          <div>
            <div className="text-lg font-bold text-white">{stats.books}</div>
            <div className="text-xs text-gray-500">Toplam</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{stats.reading}</div>
            <div className="text-xs text-gray-500">Okuyor</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{stats.done}</div>
            <div className="text-xs text-gray-500">Bitti</div>
          </div>
        </div>
      </div>

      {/* Menü Linkleri */}
      <div className="space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition">
          <Settings className="h-5 w-5" /> Ayarlar
        </button>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition"
        >
          <LogOut className="h-5 w-5" /> Çıkış Yap
        </button>
      </div>

    </div>
  );
};