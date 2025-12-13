"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useTranslation } from "@/lib/LanguageContext";
import { 
  Search, 
  User,
  Mail,
  Calendar,
  BookOpen,
  Star,
  Heart,
  Eye,
  X
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  created_at: string;
  book_count?: number;
  rating_count?: number;
  favorite_count?: number;
}

interface UserDetail extends UserProfile {
  books: any[];
}

export default function AdminUsers() {
  const { t, language } = useTranslation();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && profiles) {
      // Her kullanıcı için kitap sayılarını çek
      const usersWithStats = await Promise.all(
        profiles.map(async (profile) => {
          const { count: bookCount } = await supabase
            .from("user_books")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.id);

          const { count: ratingCount } = await supabase
            .from("user_books")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.id)
            .not("rating", "is", null);

          const { count: favoriteCount } = await supabase
            .from("user_books")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.id)
            .eq("is_favorite", true);

          return {
            ...profile,
            book_count: bookCount || 0,
            rating_count: ratingCount || 0,
            favorite_count: favoriteCount || 0
          };
        })
      );

      setUsers(usersWithStats);
    }
    setLoading(false);
  };

  const viewUserDetail = async (user: UserProfile) => {
    setDetailLoading(true);
    setSelectedUser({ ...user, books: [] });

    const { data: books } = await supabase
      .from("user_books")
      .select(`
        *,
        book:books(title, author, cover_url)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    setSelectedUser({ ...user, books: books || [] });
    setDetailLoading(false);
  };

  const filteredUsers = users.filter(user =>
    (user.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const dateLocale = language === 'tr' ? 'tr-TR' : 'en-US';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{t('admin.userManagement')}</h1>
        <p className="text-gray-400 mt-1">{users.length} {t('admin.usersTotal')}</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={t('admin.searchUsers')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {searchQuery ? t('admin.noSearchResults') : t('admin.noUsersYet')}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div 
              key={user.id} 
              className="bg-gray-900 rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition"
            >
              <div className="flex items-start gap-4">
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt={user.full_name || user.email}
                  className="w-14 h-14 rounded-full border-2 border-gray-700"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold truncate">
                    {user.full_name || user.email?.split('@')[0] || 'User'}
                  </h3>
                  <p className="text-gray-400 text-sm truncate">{user.email}</p>
                  {user.location && (
                    <p className="text-gray-500 text-xs mt-1">{user.location}</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-800">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-400">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-bold">{user.book_count}</span>
                  </div>
                  <p className="text-xs text-gray-500">{t('admin.books')}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-400">
                    <Star className="h-4 w-4" />
                    <span className="font-bold">{user.rating_count}</span>
                  </div>
                  <p className="text-xs text-gray-500">{t('admin.ratings')}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-red-400">
                    <Heart className="h-4 w-4" />
                    <span className="font-bold">{user.favorite_count}</span>
                  </div>
                  <p className="text-xs text-gray-500">{t('admin.favorites')}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {t('admin.joined')}: {new Date(user.created_at).toLocaleDateString(dateLocale)}
                </span>
                <button
                  onClick={() => viewUserDetail(user)}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition"
                >
                  <Eye className="h-4 w-4" />
                  {t('admin.viewDetail')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div 
            className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">{t('admin.userDetail')}</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* User Info */}
              <div className="flex items-start gap-6 mb-8">
                <img
                  src={selectedUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.email}`}
                  alt=""
                  className="w-24 h-24 rounded-full border-4 border-gray-700"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white">
                    {selectedUser.full_name || selectedUser.email?.split('@')[0]}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-400 mt-1">
                    <Mail className="h-4 w-4" />
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>{t('admin.joined')}: {new Date(selectedUser.created_at).toLocaleDateString(dateLocale)}</span>
                  </div>
                  {selectedUser.bio && (
                    <p className="text-gray-400 mt-3">{selectedUser.bio}</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                  <BookOpen className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{selectedUser.book_count}</p>
                  <p className="text-sm text-blue-400">{t('admin.totalBooks')}</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
                  <Star className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{selectedUser.rating_count}</p>
                  <p className="text-sm text-yellow-400">{t('admin.totalRatings')}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                  <Heart className="h-6 w-6 text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{selectedUser.favorite_count}</p>
                  <p className="text-sm text-red-400">{t('admin.totalFavorites')}</p>
                </div>
              </div>

              {/* Recent Books */}
              <div>
                <h4 className="text-lg font-bold text-white mb-4">{t('admin.recentBooks')}</h4>
                {detailLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : selectedUser.books.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">{t('admin.noBooks')}</p>
                ) : (
                  <div className="space-y-3">
                    {selectedUser.books.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-xl">
                        {item.book?.cover_url ? (
                          <img src={item.book.cover_url} alt="" className="w-10 h-14 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-14 bg-gray-700 rounded flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-white font-medium">{item.book?.title || 'Unknown'}</p>
                          <p className="text-gray-400 text-sm">{item.book?.author || 'Unknown'}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.status === 'finished' ? 'bg-green-500/10 text-green-400' :
                            item.status === 'reading' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {t(`bookStatus.${item.status}`)}
                          </span>
                          {item.rating && (
                            <div className="flex items-center justify-end gap-1 mt-1 text-yellow-400">
                              <Star className="h-3 w-3 fill-yellow-400" />
                              <span className="text-xs">{item.rating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

