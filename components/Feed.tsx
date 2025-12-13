"use client";

import React, { useEffect, useState } from 'react';
import { Heart, MessageSquare, Share2, MoreHorizontal, BookOpen, Star } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import { useTranslation } from "@/lib/LanguageContext";

interface FeedItem {
  id: number;
  created_at: string;
  status: string;
  rating: number | null;
  notes: string | null;
  book: {
    id: string;
    title: string;
    author: string;
    cover_url: string | null;
  };
  user_id: string;
}

export const Feed = () => {
  const { t, language } = useTranslation();
  const [activities, setActivities] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const fetchFeed = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUserEmail(session.user.email || t('common.user'));

        // Sadece kendi hareketlerini çekelim (Şimdilik)
        const { data, error } = await supabase
          .from("user_books")
          .select(`
            *,
            book:books (title, author, cover_url)
          `)
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }) // En yeni en üstte
          .limit(10); // Son 10 hareket

        if (!error && data) {
          setActivities(data as any[]);
        }
      }
      setLoading(false);
    };

    fetchFeed();
  }, []);

  if (loading) {
    return <div className="text-gray-500 text-center py-10 animate-pulse">{t('feed.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* "Ne Okuyorsun?" Widget'ı */}
      <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 shadow-lg">
        <div className="flex gap-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-[2px]">
             <img src={`https://ui-avatars.com/api/?name=${userEmail}&background=random`} className="h-full w-full rounded-full object-cover border border-gray-900" alt="Me" />
          </div>
          <div className="flex-1">
            <input 
              type="text" 
              placeholder={t('feed.placeholder')} 
              className="w-full bg-gray-900 border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50"
            />
            <div className="flex justify-end items-center mt-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition">
                {t('feed.share')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gerçek Akış */}
      {activities.length === 0 ? (
        <div className="text-center text-gray-500 py-10">{t('feed.noActivity')}</div>
      ) : (
        activities.map((act) => (
          <ActivityCard key={act.id} activity={act} userEmail={userEmail} language={language} />
        ))
      )}
    </div>
  );
};

const ActivityCard = ({ activity, userEmail, language }: { activity: FeedItem, userEmail: string, language: string }) => {
  const { t } = useTranslation();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 10));

  const handleLike = () => {
    if (liked) setLikes(likes - 1);
    else setLikes(likes + 1);
    setLiked(!liked);
  };

  // Duruma göre metin ve renk
  const getStatusInfo = (status: string, rating: number | null) => {
    if (rating) return { text: t('feed.ratedBook'), color: "text-yellow-400" };
    if (status === 'finished') return { text: t('feed.finishedBook'), color: "text-green-400" };
    if (status === 'reading') return { text: t('feed.startedReading'), color: "text-blue-400" };
    return { text: t('feed.addedToList'), color: "text-gray-400" };
  };

  const statusInfo = getStatusInfo(activity.status, activity.rating);
  
  // Dil bazında tarih formatı
  const dateLocale = language === 'tr' ? 'tr-TR' : 'en-US';
  const date = new Date(activity.created_at).toLocaleDateString(dateLocale, { 
    day: 'numeric', 
    month: 'long', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg hover:border-gray-600 transition duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <img src={`https://ui-avatars.com/api/?name=${userEmail}&background=random`} alt="User" className="h-10 w-10 rounded-full border border-gray-600" />
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="font-bold text-white text-sm hover:underline cursor-pointer">{userEmail.split('@')[0]}</h3>
              <span className={`text-xs ${statusInfo.color}`}>{statusInfo.text}</span>
            </div>
            <p className="text-xs text-gray-500">{date}</p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-white"><MoreHorizontal className="h-5 w-5" /></button>
      </div>

      {/* Content */}
      <div className="flex gap-4 mb-4 bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
        {activity.book.cover_url ? (
             <img src={activity.book.cover_url} alt={activity.book.title} className="h-24 w-16 object-cover rounded shadow-md" />
        ) : (
            <div className="h-24 w-16 bg-gray-700 rounded flex items-center justify-center text-xs">{t('feed.noImage')}</div>
        )}
       
        <div className="flex-1">
          <h4 className="font-bold text-white text-lg">{activity.book.title}</h4>
          <p className="text-sm text-gray-400 mb-2">{activity.book.author}</p>
          
          {activity.rating && (
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-3 w-3 ${i < activity.rating! ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {activity.notes && (
        <div className="bg-gray-700/30 p-3 rounded-lg border-l-4 border-blue-500 mb-4">
            <p className="text-gray-300 text-sm italic">
            "{activity.notes}"
            </p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-700">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 text-sm transition ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-red-500' : ''}`} /> {likes}
        </button>
        <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition">
          <MessageSquare className="h-4 w-4" /> 0
        </button>
        <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition ml-auto">
          <Share2 className="h-4 w-4" /> {t('feed.share')}
        </button>
      </div>

    </div>
  );
};