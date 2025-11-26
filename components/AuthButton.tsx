"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Sayfa ilk açıldığında: Mevcut oturum var mı bak
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkUser();

    // 2. Dinleyici: Biri giriş yaparsa veya çıkarsa anında yakala
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login"); // Çıkış yapınca giriş sayfasına at
    router.refresh();      // Sayfayı tazeleyerek temizle
  };

  if (loading) {
    return <div className="text-gray-500 text-sm">...</div>;
  }

  // --- EĞER KULLANICI GİRİŞ YAPMIŞSA ---
  if (user) {
    return (
      <div className="flex items-center gap-4">
        {/* Kullanıcı Maili (Mobilde gizle, sadece masaüstünde göster) */}
        <span className="text-sm text-gray-300 hidden md:block">
          {user.email}
        </span>
        
        {/* Çıkış Yap Butonu */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-200 text-sm font-semibold border border-red-600/50 transition"
        >
          Çıkış
        </button>
      </div>
    );
  }

  // --- EĞER KULLANICI YOKSA ---
  return (
    <Link 
      href="/login"
      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition text-sm shadow-lg shadow-blue-500/20"
    >
      Giriş Yap
    </Link>
  );
}