"use client"; // <--- Etkileşim için şart

import React from 'react';
import { BookOpen, Target, Settings, LogOut } from 'lucide-react';
import { currentUser } from '../services/mockData'; // Şimdilik görsel buradan gelsin
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export const SidebarLeft = () => {
  const router = useRouter();
  
  // Mock verileri kullanıyoruz (İleride burayı gerçek kullanıcıya bağlayacağız)
  const { name, handle, avatarUrl, role, readingGoal, currentRead } = currentUser;
  const progressPercent = readingGoal ? Math.round((readingGoal.current / readingGoal.target) * 100) : 0;

  // --- ÇIKIŞ FONKSİYONU ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      
      {/* Profil Kartı */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-[2px]">
              <img src={avatarUrl} alt={name} className="rounded-full h-full w-full object-cover border-4 border-gray-800" />
            </div>
            <div className="absolute bottom-0 right-0 h-5 w-5 bg-green-500 border-4 border-gray-800 rounded-full"></div>
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">{name}</h2>
          <p className="text-sm text-gray-400">{handle}</p>
          <div className="mt-2 px-3 py-1 bg-gray-700 rounded-full text-xs font-medium text-blue-300 border border-gray-600">
            {role}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 text-center border-t border-gray-700 pt-4">
          <div>
            <div className="text-lg font-bold text-white">12</div> {/* Şimdilik sabit */}
            <div className="text-xs text-gray-500">Books</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">4</div>
            <div className="text-xs text-gray-500">Followers</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">8</div>
            <div className="text-xs text-gray-500">Following</div>
          </div>
        </div>
      </div>

      {/* Okuma Hedefi */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" /> 2025 Hedefi
          </h3>
          <span className="text-xs text-gray-400">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <p className="text-xs text-gray-400">
          Bu yıl <span className="text-white font-bold">{readingGoal?.target}</span> kitaptan <span className="text-white font-bold">{readingGoal?.current}</span> tanesini okudun. Harika gidiyorsun!
        </p>
      </div>

      {/* Şu An Okunuyor */}
      {currentRead && (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-green-400" /> Şu An Okuyorum
          </h3>
          <div className="flex gap-4">
            <img src={currentRead.coverUrl} alt={currentRead.title} className="w-16 h-24 object-cover rounded shadow-md group-hover:scale-105 transition-transform" />
            <div className="flex flex-col justify-center">
              <h4 className="font-bold text-white leading-tight">{currentRead.title}</h4>
              <p className="text-sm text-gray-400 mt-1">{currentRead.author}</p>
              <button className="mt-3 text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition">
                İlerlemeyi Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menü Linkleri */}
      <div className="space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition">
          <Settings className="h-5 w-5" /> Ayarlar
        </button>
        
        {/* ÇIKIŞ BUTONU */}
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