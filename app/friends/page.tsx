"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useTranslation } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FriendButton from "@/components/FriendButton";
import { 
  Users, 
  UserPlus, 
  BookOpen, 
  Bell,
  Check,
  X,
  Loader2,
  Search,
  MessageSquare,
  SearchX
} from "lucide-react";

interface Friend {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  friendship_id: number;
}

interface FriendRequest {
  id: number;
  requester: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
  };
  created_at: string;
}

interface Recommendation {
  id: number;
  sender: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
  };
  book: {
    id: string;
    title: string;
    author: string;
    cover_url: string;
  };
  message: string | null;
  created_at: string;
  is_read: boolean;
}

interface SearchUser {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
}

export default function FriendsPage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'recommendations' | 'findUsers'>('friends');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Find Users state
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setCurrentUserId(session.user.id);
      await fetchData(session.user.id);
    };
    init();
  }, [router]);

  const fetchData = async (userId: string) => {
    setLoading(true);
    await Promise.all([
      fetchFriends(userId),
      fetchRequests(userId),
      fetchRecommendations(userId)
    ]);
    setLoading(false);
  };

  const fetchFriends = async (userId: string) => {
    const { data: friendships } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id")
      .eq("status", "accepted")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (!friendships || friendships.length === 0) {
      setFriends([]);
      return;
    }

    const friendIds = friendships.map(f => ({
      id: f.requester_id === userId ? f.addressee_id : f.requester_id,
      friendship_id: f.id
    }));

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", friendIds.map(f => f.id));

    const friendsWithFriendshipId = profiles?.map(p => ({
      ...p,
      friendship_id: friendIds.find(f => f.id === p.id)?.friendship_id || 0
    })) || [];

    setFriends(friendsWithFriendshipId);
  };

  const fetchRequests = async (userId: string) => {
    // Önce bekleyen istekleri al
    const { data: pendingRequests } = await supabase
      .from("friendships")
      .select("id, requester_id, created_at")
      .eq("addressee_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!pendingRequests || pendingRequests.length === 0) {
      setRequests([]);
      return;
    }

    // İstek gönderenlerin profillerini al
    const requesterIds = pendingRequests.map(r => r.requester_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", requesterIds);

    // İstekleri profil bilgileriyle birleştir
    const requestsWithProfiles = pendingRequests.map(req => ({
      id: req.id,
      created_at: req.created_at,
      requester: profiles?.find(p => p.id === req.requester_id) || null
    }));

    setRequests(requestsWithProfiles as any);
  };

  const fetchRecommendations = async (userId: string) => {
    // Önce önerileri al
    const { data: recs } = await supabase
      .from("book_recommendations")
      .select("id, sender_id, book_id, message, is_read, created_at")
      .eq("receiver_id", userId)
      .order("created_at", { ascending: false });

    if (!recs || recs.length === 0) {
      setRecommendations([]);
      return;
    }

    // Gönderenlerin profillerini al
    const senderIds = [...new Set(recs.map(r => r.sender_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", senderIds);

    // Kitap bilgilerini al
    const bookIds = [...new Set(recs.map(r => r.book_id))];
    const { data: books } = await supabase
      .from("books")
      .select("id, title, author, cover_url")
      .in("id", bookIds);

    // Önerileri profil ve kitap bilgileriyle birleştir
    const recsWithDetails = recs.map(rec => ({
      id: rec.id,
      message: rec.message,
      created_at: rec.created_at,
      is_read: rec.is_read,
      sender: profiles?.find(p => p.id === rec.sender_id) || null,
      book: books?.find(b => b.id === rec.book_id) || null
    }));

    setRecommendations(recsWithDetails as any);
  };

  const handleAcceptRequest = async (requestId: number, requesterId: string) => {
    setActionLoading(requestId);
    try {
      await supabase
        .from("friendships")
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq("id", requestId);

      // Bildirim gönder
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", currentUserId)
        .single();

      await supabase.from("notifications").insert({
        user_id: requesterId,
        type: 'friend_accepted',
        title: t('social.friendAcceptedTitle'),
        message: `${myProfile?.full_name || myProfile?.email?.split('@')[0]} ${t('social.acceptedFriendRequest')}`,
        related_user_id: currentUserId
      });

      setRequests(requests.filter(r => r.id !== requestId));
      if (currentUserId) await fetchFriends(currentUserId);
    } catch (error) {
      console.error("Accept error:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    setActionLoading(requestId);
    try {
      await supabase
        .from("friendships")
        .delete()
        .eq("id", requestId);

      setRequests(requests.filter(r => r.id !== requestId));
    } catch (error) {
      console.error("Reject error:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFriend = async (friendshipId: number) => {
    if (!confirm(t('social.confirmRemoveFriend'))) return;
    
    setActionLoading(friendshipId);
    try {
      await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);

      setFriends(friends.filter(f => f.friendship_id !== friendshipId));
    } catch (error) {
      console.error("Remove friend error:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const markRecommendationRead = async (recId: number) => {
    await supabase
      .from("book_recommendations")
      .update({ is_read: true })
      .eq("id", recId);

    setRecommendations(recommendations.map(r => 
      r.id === recId ? { ...r, is_read: true } : r
    ));
  };

  const filteredFriends = friends.filter(f =>
    (f.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (f.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const searchUsers = async () => {
    if (!userSearchQuery.trim() || !currentUserId) return;
    
    setSearchLoading(true);
    setHasSearched(true);
    
    try {
      const searchTerm = userSearchQuery.toLowerCase().trim();
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .neq("id", currentUserId) // Kendimi hariç tut
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("User search error:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchUsers();
    }
  };

  const dateLocale = language === 'tr' ? 'tr-TR' : 'en-US';
  const unreadRecommendations = recommendations.filter(r => !r.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-400 animate-pulse">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {t('social.friends')}
          </h1>
          <p className="text-gray-400 mt-1">{t('social.friendsSubtitle')}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 pb-4">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'friends'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            {t('social.myFriends')} ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition relative ${
              activeTab === 'requests'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            {t('social.requests')}
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {requests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition relative ${
              activeTab === 'recommendations'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            {t('social.recommendations')}
            {unreadRecommendations > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadRecommendations}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('findUsers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'findUsers'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Search className="h-4 w-4" />
            {t('social.findUsers')}
          </button>
        </div>

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('social.searchFriends')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500"
              />
            </div>

            {friends.length === 0 ? (
              <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-dashed border-gray-700">
                <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-xl text-gray-400 font-medium">{t('social.noFriendsYet')}</p>
                <p className="text-gray-500 mt-2">{t('social.startAddingFriends')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFriends.map((friend) => (
                  <div key={friend.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition">
                    <div className="flex items-center gap-4">
                      <Link href={`/u/${friend.email?.split('@')[0]}`}>
                        <img
                          src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.email}`}
                          alt=""
                          className="w-14 h-14 rounded-full border-2 border-gray-700 hover:border-blue-500 transition"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/u/${friend.email?.split('@')[0]}`} className="hover:text-blue-400 transition">
                          <h3 className="text-white font-bold truncate">
                            {friend.full_name || friend.email?.split('@')[0]}
                          </h3>
                        </Link>
                        <p className="text-gray-500 text-sm truncate">{friend.email}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFriend(friend.friendship_id)}
                        disabled={actionLoading === friend.friendship_id}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title={t('social.removeFriend')}
                      >
                        {actionLoading === friend.friendship_id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <X className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            {requests.length === 0 ? (
              <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-dashed border-gray-700">
                <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-xl text-gray-400 font-medium">{t('social.noRequests')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center gap-4">
                      <Link href={`/u/${request.requester?.email?.split('@')[0]}`}>
                        <img
                          src={request.requester?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.requester?.email}`}
                          alt=""
                          className="w-14 h-14 rounded-full border-2 border-gray-700"
                        />
                      </Link>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">
                          {request.requester?.full_name || request.requester?.email?.split('@')[0]}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {new Date(request.created_at).toLocaleDateString(dateLocale)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id, request.requester?.id)}
                          disabled={actionLoading === request.id}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          {t('social.accept')}
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={actionLoading === request.id}
                          className="p-2 bg-gray-800 hover:bg-red-600/20 text-gray-400 hover:text-red-400 rounded-lg transition"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div>
            {recommendations.length === 0 ? (
              <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-dashed border-gray-700">
                <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-xl text-gray-400 font-medium">{t('social.noRecommendations')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div 
                    key={rec.id} 
                    className={`bg-gray-900 rounded-xl p-4 border transition ${
                      rec.is_read ? 'border-gray-800' : 'border-purple-500/50 bg-purple-500/5'
                    }`}
                    onClick={() => !rec.is_read && markRecommendationRead(rec.id)}
                  >
                    <div className="flex items-start gap-4">
                      <Link href={`/u/${rec.sender?.email?.split('@')[0]}`}>
                        <img
                          src={rec.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rec.sender?.email}`}
                          alt=""
                          className="w-12 h-12 rounded-full border-2 border-gray-700"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-400 text-sm">
                          <Link href={`/u/${rec.sender?.email?.split('@')[0]}`} className="text-white font-medium hover:text-blue-400">
                            {rec.sender?.full_name || rec.sender?.email?.split('@')[0]}
                          </Link>
                          {' '}{t('social.recommendedYou')}
                        </p>
                        
                        <Link href={`/book/${rec.book?.id}`} className="mt-3 flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition">
                          {rec.book?.cover_url ? (
                            <img src={rec.book.cover_url} alt="" className="w-10 h-14 object-cover rounded" />
                          ) : (
                            <div className="w-10 h-14 bg-gray-700 rounded flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <h4 className="text-white font-medium">{rec.book?.title}</h4>
                            <p className="text-gray-500 text-sm">{rec.book?.author}</p>
                          </div>
                        </Link>

                        {rec.message && (
                          <div className="mt-3 flex items-start gap-2 text-gray-400 text-sm">
                            <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>"{rec.message}"</p>
                          </div>
                        )}

                        <p className="text-gray-600 text-xs mt-2">
                          {new Date(rec.created_at).toLocaleDateString(dateLocale)}
                        </p>
                      </div>
                      {!rec.is_read && (
                        <span className="w-3 h-3 bg-purple-500 rounded-full shrink-0"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Find Users Tab */}
        {activeTab === 'findUsers' && (
          <div>
            {/* Search Input */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('social.searchUsersPlaceholder')}
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition"
                />
              </div>
              <button
                onClick={searchUsers}
                disabled={searchLoading || !userSearchQuery.trim()}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-medium transition flex items-center gap-2"
              >
                {searchLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
                {t('common.search')}
              </button>
            </div>

            {/* Search Results */}
            {!hasSearched ? (
              <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-dashed border-gray-700">
                <UserPlus className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-xl text-gray-400 font-medium">{t('social.findFriendsTitle')}</p>
                <p className="text-gray-500 mt-2">{t('social.findFriendsSubtitle')}</p>
              </div>
            ) : searchLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-dashed border-gray-700">
                <SearchX className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-xl text-gray-400 font-medium">{t('social.noUsersFound')}</p>
                <p className="text-gray-500 mt-2">{t('social.tryDifferentSearch')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-400 text-sm mb-4">
                  {searchResults.length} {t('social.usersFound')}
                </p>
                {searchResults.map((user) => (
                  <div key={user.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition">
                    <div className="flex items-center gap-4">
                      <Link href={`/u/${user.email?.split('@')[0]}`}>
                        <img
                          src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                          alt=""
                          className="w-14 h-14 rounded-full border-2 border-gray-700 hover:border-green-500 transition"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/u/${user.email?.split('@')[0]}`} className="hover:text-green-400 transition">
                          <h3 className="text-white font-bold truncate">
                            {user.full_name || user.email?.split('@')[0]}
                          </h3>
                        </Link>
                        <p className="text-gray-500 text-sm truncate">{user.email}</p>
                      </div>
                      <FriendButton 
                        targetUserId={user.id}
                        currentUserId={currentUserId}
                        onStatusChange={() => {
                          // Arkadaşlık durumu değiştiğinde listeyi güncelle
                          if (currentUserId) fetchFriends(currentUserId);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

