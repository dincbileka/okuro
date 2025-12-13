"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useTranslation } from "@/lib/LanguageContext";
import { 
  BookOpen, 
  Users, 
  Star, 
  TrendingUp,
  BookMarked,
  CheckCircle,
  Clock,
  Heart,
  Activity
} from "lucide-react";

interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  totalReviews: number;
  totalFavorites: number;
  booksThisMonth: number;
  usersThisMonth: number;
  readingNow: number;
  finished: number;
  wantToRead: number;
  recentActivities: any[];
  topBooks: any[];
  topUsers: any[];
}

export default function AdminDashboard() {
  const { t, language } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalUsers: 0,
    totalReviews: 0,
    totalFavorites: 0,
    booksThisMonth: 0,
    usersThisMonth: 0,
    readingNow: 0,
    finished: 0,
    wantToRead: 0,
    recentActivities: [],
    topBooks: [],
    topUsers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Toplam kitap sayısı
        const { count: totalBooks } = await supabase
          .from("books")
          .select("*", { count: "exact", head: true });

        // Toplam kullanıcı sayısı
        const { count: totalUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Puanlı kitaplar (incelemeler)
        const { count: totalReviews } = await supabase
          .from("user_books")
          .select("*", { count: "exact", head: true })
          .not("rating", "is", null);

        // Favoriler
        const { count: totalFavorites } = await supabase
          .from("user_books")
          .select("*", { count: "exact", head: true })
          .eq("is_favorite", true);

        // Okuma durumları
        const { count: readingNow } = await supabase
          .from("user_books")
          .select("*", { count: "exact", head: true })
          .eq("status", "reading");

        const { count: finished } = await supabase
          .from("user_books")
          .select("*", { count: "exact", head: true })
          .eq("status", "finished");

        const { count: wantToRead } = await supabase
          .from("user_books")
          .select("*", { count: "exact", head: true })
          .eq("status", "want_to_read");

        // Bu ay eklenen kitaplar
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: booksThisMonth } = await supabase
          .from("books")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startOfMonth.toISOString());

        // Bu ay kayıt olan kullanıcılar
        const { count: usersThisMonth } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startOfMonth.toISOString());

        // Son aktiviteler
        const { data: recentActivities } = await supabase
          .from("user_books")
          .select(`
            *,
            book:books(title, cover_url),
            profile:profiles(full_name, email)
          `)
          .order("created_at", { ascending: false })
          .limit(5);

        // En popüler kitaplar
        const { data: topBooks } = await supabase
          .from("books")
          .select(`
            *,
            user_books(count)
          `)
          .limit(5);

        // En aktif kullanıcılar
        const { data: topUsers } = await supabase
          .from("profiles")
          .select(`
            *,
            user_books(count)
          `)
          .limit(5);

        setStats({
          totalBooks: totalBooks || 0,
          totalUsers: totalUsers || 0,
          totalReviews: totalReviews || 0,
          totalFavorites: totalFavorites || 0,
          booksThisMonth: booksThisMonth || 0,
          usersThisMonth: usersThisMonth || 0,
          readingNow: readingNow || 0,
          finished: finished || 0,
          wantToRead: wantToRead || 0,
          recentActivities: recentActivities || [],
          topBooks: topBooks || [],
          topUsers: topUsers || []
        });

      } catch (error) {
        console.error("Dashboard stats error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const dateLocale = language === 'tr' ? 'tr-TR' : 'en-US';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { label: t('admin.totalBooks'), value: stats.totalBooks, icon: BookOpen, color: "blue", change: `+${stats.booksThisMonth} ${t('admin.thisMonth')}` },
    { label: t('admin.totalUsers'), value: stats.totalUsers, icon: Users, color: "green", change: `+${stats.usersThisMonth} ${t('admin.thisMonth')}` },
    { label: t('admin.totalReviews'), value: stats.totalReviews, icon: Star, color: "yellow", change: null },
    { label: t('admin.totalFavorites'), value: stats.totalFavorites, icon: Heart, color: "red", change: null },
  ];

  const readingStats = [
    { label: t('admin.reading'), value: stats.readingNow, icon: BookMarked, color: "blue" },
    { label: t('admin.finished'), value: stats.finished, icon: CheckCircle, color: "green" },
    { label: t('admin.wantToRead'), value: stats.wantToRead, icon: Clock, color: "yellow" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('admin.dashboard')}</h1>
          <p className="text-gray-400 mt-1">{t('admin.dashboardSubtitle')}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{t('admin.lastUpdate')}</p>
          <p className="text-white font-medium">
            {new Date().toLocaleDateString(dateLocale, { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value.toLocaleString()}</p>
                {stat.change && (
                  <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {stat.change}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-500/10`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reading Stats */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-400" />
          {t('admin.readingStatus')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {readingStats.map((stat, index) => (
            <div key={index} className={`p-4 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20`}>
              <div className="flex items-center gap-3">
                <stat.icon className={`h-8 w-8 text-${stat.color}-400`} />
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className={`text-sm text-${stat.color}-400`}>{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{t('admin.readingDistribution')}</span>
            <span>{stats.readingNow + stats.finished + stats.wantToRead} {t('admin.total')}</span>
          </div>
          <div className="h-4 bg-gray-800 rounded-full overflow-hidden flex">
            <div 
              className="bg-blue-500 h-full" 
              style={{ width: `${(stats.readingNow / (stats.readingNow + stats.finished + stats.wantToRead) * 100) || 0}%` }}
            />
            <div 
              className="bg-green-500 h-full" 
              style={{ width: `${(stats.finished / (stats.readingNow + stats.finished + stats.wantToRead) * 100) || 0}%` }}
            />
            <div 
              className="bg-yellow-500 h-full" 
              style={{ width: `${(stats.wantToRead / (stats.readingNow + stats.finished + stats.wantToRead) * 100) || 0}%` }}
            />
          </div>
          <div className="flex gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-full"></span> {t('admin.reading')}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-full"></span> {t('admin.finished')}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded-full"></span> {t('admin.wantToRead')}</span>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-6">{t('admin.recentActivities')}</h2>
        <div className="space-y-4">
          {stats.recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('admin.noActivities')}</p>
          ) : (
            stats.recentActivities.map((activity: any, index: number) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-xl">
                {activity.book?.cover_url ? (
                  <img src={activity.book.cover_url} alt="" className="w-10 h-14 object-cover rounded" />
                ) : (
                  <div className="w-10 h-14 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-500">
                    N/A
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {activity.profile?.full_name || activity.profile?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-gray-400 text-sm truncate">
                    {activity.book?.title || 'Unknown Book'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === 'finished' ? 'bg-green-500/10 text-green-400' :
                    activity.status === 'reading' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {t(`bookStatus.${activity.status}`)}
                  </span>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(activity.created_at).toLocaleDateString(dateLocale)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

