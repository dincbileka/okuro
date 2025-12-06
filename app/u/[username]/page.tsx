"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Link as LinkIcon, UserPlus, MoreHorizontal, Star, Edit3 } from 'lucide-react'; // Edit3 eklendi
import { supabase } from "@/lib/supabaseClient";
import BookCard from '@/components/BookCard';
import Link from 'next/link'; // Link eklendi

// Veri tipleri
interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location?: string;
  website?: string;
}

interface UserBook {
    id: number;
    status: string;
    is_favorite: boolean;
    rating: number | null; 
    notes: string | null;
    created_at: string;
    book: {
        id: string;
        title: string;
        author: string;
        cover_url: string | null;
        isbn: string | null;
    };
}

export default function ProfilePage() {
  const params = useParams();
  const username = typeof params?.username === 'string' ? params.username : '';

  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null); // Giriş yapan kullanıcı
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [activeTab, setActiveTab] = useState<'activity' | 'shelves' | 'reviews'>('activity');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ books: 0, pages: 0, followers: 0 });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username) return;
      
      setIsLoading(true);
      
      try {
        // 0. Önce oturum açan kişiyi bul
        const { data: { session } } = await supabase.auth.getSession();
        setCurrentUser(session?.user || null);

        // 1. Profil sahibini bul
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', `${username}@%`)
          .limit(1);

        if (profileError || !profiles || profiles.length === 0) {
          console.error("Profil bulunamadı:", profileError);
          setProfile(null);
          setIsLoading(false);
          return;
        }

        const userProfile = profiles[0];
        setProfile(userProfile);

        // 2. Kitapları çek
        const { data: booksData } = await supabase
          .from("user_books")
          .select(`
            *,
            book:books (*) 
          `)
          .eq("user_id", userProfile.id)
          .order("created_at", { ascending: false });

        if (booksData) {
          setUserBooks(booksData as unknown as UserBook[]);
          const totalBooks = booksData.length;
          const totalPages = booksData.reduce((acc, curr) => acc + (curr.book?.page_count || 0), 0);
          setStats({ books: totalBooks, pages: totalPages, followers: 12 });
        }

      } catch (err) {
        console.error("Hata:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [username]);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-950 text-gray-500 flex items-center justify-center animate-pulse">Profil yükleniyor...</div>;
  }

  if (!profile) {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
            <h1 className="text-4xl">😕</h1>
            <p className="text-xl font-bold">Kullanıcı Bulunamadı</p>
            <p className="text-gray-500">@{username} adında bir okur yok.</p>
        </div>
    );
  }

  const currentlyReading = userBooks.find(b => b.status === 'reading');
  const favorites = userBooks.filter(b => b.is_favorite);
  const reviewedBooks = userBooks.filter(b => b.notes && b.notes.length > 0);
  const activityFeed = [...userBooks];

  const displayAvatar = profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`;
  
  // Kendi profilim mi kontrolü
  const isOwnProfile = currentUser && profile && currentUser.id === profile.id;

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-12">
      
      {/* --- HEADER --- */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 pt-10 pb-6 mb-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start">
          
          {/* Avatar */}
          <div className="relative shrink-0 mx-auto md:mx-0">
            <div className="h-32 w-32 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-purple-500">
                <img 
                src={displayAvatar} 
                alt={profile.full_name || ""} 
                className="w-full h-full rounded-full object-cover border-4 border-gray-900 bg-gray-800"
                />
            </div>
          </div>
          
          {/* Bilgiler */}
          <div className="flex-1 w-full text-center md:text-left">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white">{profile.full_name}</h1>
                <p className="text-gray-400">@{username}</p>
              </div>
              
              {/* --- AKILLI BUTON ALANI --- */}
              <div className="flex gap-3 justify-center md:justify-start">
                {isOwnProfile ? (
                    // Kendi Profilin: Ayarlara Git
                    <Link 
                        href="/settings" 
                        className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
                    >
                        <Edit3 size={16} /> Profili Düzenle
                    </Link>
                ) : (
                    // Başkasının Profili: Takip Et
                    <>
                        <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20">
                        <UserPlus size={16} /> Takip Et
                        </button>
                        <button className="p-2 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-400 transition">
                        <MoreHorizontal size={18} />
                        </button>
                    </>
                )}
              </div>
              {/* ------------------------- */}

            </div>

            <p className="text-gray-300 mb-6 leading-relaxed max-w-2xl mx-auto md:mx-0">
                {profile.bio || "Henüz bir biyografi eklenmemiş."}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400 mb-6">
              {profile.location && (
                <div className="flex items-center gap-1">
                    <MapPin size={14} /> {profile.location}
                </div>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                  <LinkIcon size={14} /> Website
                </a>
              )}
            </div>

            {/* İstatistikler */}
            <div className="flex justify-center md:justify-start gap-12 border-t border-gray-800 pt-6">
              <div>
                <span className="block font-bold text-white text-xl">{stats.books}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Kitap</span>
              </div>
              <div>
                <span className="block font-bold text-white text-xl">{(stats.pages / 1000).toFixed(1)}k</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Sayfa</span>
              </div>
              <div>
                <span className="block font-bold text-white text-xl">{stats.followers}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Takipçi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-10">
        
        {/* --- FAVORİLER RAFI --- */}
        {favorites.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Star size={20} className="text-yellow-500 fill-yellow-500" />
              <h2 className="font-bold text-xl text-white">Favoriler</h2>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x md:grid md:grid-cols-6 md:overflow-visible">
              {favorites.map(ub => (
                <BookCard key={ub.id} userBook={ub} variant="shelf" />
              ))}
            </div>
          </section>
        )}

        {/* --- ŞU AN OKUYOR --- */}
        {currentlyReading && (
          <section className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4">Şu An Okuyor</h2>
            <div className="flex gap-6">
              {currentlyReading.book.cover_url ? (
                <img src={currentlyReading.book.cover_url} alt="cover" className="w-20 h-32 object-cover rounded-lg shadow-md" />
              ) : (
                <div className="w-20 h-32 bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-500 border border-gray-700">No Img</div>
              )}
              
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-bold text-2xl text-white mb-1">{currentlyReading.book.title}</h3>
                <p className="text-gray-400 mb-4">{currentlyReading.book.author}</p>
                <div className="w-full max-w-md bg-gray-800 rounded-full h-2 mb-2">
                  <div className="bg-blue-600 h-2 rounded-full w-1/3"></div>
                </div>
                <p className="text-xs text-gray-500 font-mono">%33 tamamlandı</p>
              </div>
            </div>
          </section>
        )}

        {/* --- İÇERİK SEKMELERİ --- */}
        <div className="mt-8">
          <div className="flex border-b border-gray-800 mb-8">
            <button 
              onClick={() => setActiveTab('activity')}
              className={`pb-4 px-6 text-sm font-bold transition-colors border-b-2 ${activeTab === 'activity' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-white'}`}
            >
              Aktivite
            </button>
            <button 
              onClick={() => setActiveTab('shelves')}
              className={`pb-4 px-6 text-sm font-bold transition-colors border-b-2 ${activeTab === 'shelves' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-white'}`}
            >
              Raflar
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 px-6 text-sm font-bold transition-colors border-b-2 ${activeTab === 'reviews' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-white'}`}
            >
              İncelemeler ({reviewedBooks.length})
            </button>
          </div>

          <div className="min-h-[300px]">
            {activeTab === 'activity' && (
              <div className="space-y-4">
                {activityFeed.map(ub => (
                  <BookCard key={ub.id} userBook={ub} />
                ))}
              </div>
            )}

            {activeTab === 'shelves' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {userBooks.map(ub => (
                  <BookCard key={ub.id} userBook={ub} variant="shelf" />
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviewedBooks.length === 0 ? (
                  <div className="text-center py-10 bg-gray-900 rounded-xl border border-dashed border-gray-800 text-gray-500">
                    Henüz inceleme yok.
                  </div>
                ) : (
                  reviewedBooks.map(ub => (
                     <div key={ub.id} className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                        <div className="flex gap-4 mb-4">
                           {ub.book.cover_url ? (
                             <img src={ub.book.cover_url} className="w-12 h-16 rounded shadow-sm object-cover" alt={ub.book.title} />
                           ) : (
                             <div className="w-12 h-16 bg-gray-800 rounded flex items-center justify-center text-[10px] text-gray-500 border border-gray-700">No Img</div>
                           )}
                           
                           <div>
                              <h4 className="font-bold text-white">{ub.book.title}</h4>
                              <div className="flex text-yellow-500 text-sm mt-1">
                                 {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill={i < (ub.rating || 0) ? "currentColor" : "none"} className={i < (ub.rating || 0) ? "" : "text-gray-700"} />
                                 ))}
                              </div>
                           </div>
                        </div>
                        <p className="text-gray-300 leading-relaxed italic">"{ub.notes}"</p>
                     </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}