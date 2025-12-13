"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useTranslation } from "@/lib/LanguageContext";
import { X, Send, Search, Loader2, BookOpen } from "lucide-react";

interface Friend {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
}

interface BookRecommendModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: {
    id: string;
    title: string;
    author: string;
    cover_url?: string;
  };
  currentUserId: string;
}

export default function BookRecommendModal({ 
  isOpen, 
  onClose, 
  book, 
  currentUserId 
}: BookRecommendModalProps) {
  const { t } = useTranslation();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [sentTo, setSentTo] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
      setSentTo([]);
      setMessage("");
    }
  }, [isOpen]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      // Kabul edilmiş arkadaşlıkları çek
      const { data: friendships } = await supabase
        .from("friendships")
        .select(`
          requester_id,
          addressee_id
        `)
        .eq("status", "accepted")
        .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);

      if (!friendships || friendships.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      // Arkadaş ID'lerini çıkar
      const friendIds = friendships.map(f => 
        f.requester_id === currentUserId ? f.addressee_id : f.requester_id
      );

      // Profil bilgilerini çek
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", friendIds);

      setFriends(profiles || []);
    } catch (error) {
      console.error("Fetch friends error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendRecommendation = async (friendId: string) => {
    setSending(friendId);

    try {
      // Öneri gönder
      const { error } = await supabase
        .from("book_recommendations")
        .upsert({
          sender_id: currentUserId,
          receiver_id: friendId,
          book_id: book.id,
          message: message || null
        }, { onConflict: 'sender_id,receiver_id,book_id' });

      if (error) throw error;

      // Bildirim oluştur
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", currentUserId)
        .single();

      await supabase.from("notifications").insert({
        user_id: friendId,
        type: 'book_recommendation',
        title: t('social.bookRecommendationTitle'),
        message: `${myProfile?.full_name || myProfile?.email?.split('@')[0]} ${t('social.recommendedBook')}: "${book.title}"`,
        related_user_id: currentUserId,
        related_book_id: book.id
      });

      setSentTo([...sentTo, friendId]);
    } catch (error: any) {
      console.error("Send recommendation error:", error);
      alert(t('common.error') + ": " + error.message);
    } finally {
      setSending(null);
    }
  };

  const filteredFriends = friends.filter(friend =>
    (friend.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (friend.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">{t('social.recommendBook')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Book Info */}
        <div className="p-4 bg-gray-800/50 border-b border-gray-800">
          <div className="flex items-center gap-4">
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} className="w-12 h-16 object-cover rounded shadow" />
            ) : (
              <div className="w-12 h-16 bg-gray-700 rounded flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-gray-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate">{book.title}</h3>
              <p className="text-gray-400 text-sm">{book.author}</p>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-b border-gray-800">
          <label className="block text-sm text-gray-400 mb-2">{t('social.addMessage')}</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('social.messagePlaceholder')}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
          />
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('social.searchFriends')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('social.noFriendsYet')}</p>
              <p className="text-gray-600 text-sm mt-1">{t('social.addFriendsFirst')}</p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <p className="text-center text-gray-500 py-8">{t('admin.noSearchResults')}</p>
          ) : (
            <div className="space-y-3">
              {filteredFriends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img
                      src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.email}`}
                      alt=""
                      className="w-10 h-10 rounded-full border border-gray-700"
                    />
                    <div>
                      <p className="text-white font-medium">
                        {friend.full_name || friend.email?.split('@')[0]}
                      </p>
                      <p className="text-gray-500 text-sm">{friend.email}</p>
                    </div>
                  </div>
                  
                  {sentTo.includes(friend.id) ? (
                    <span className="text-green-400 text-sm flex items-center gap-1">
                      ✓ {t('social.sent')}
                    </span>
                  ) : (
                    <button
                      onClick={() => sendRecommendation(friend.id)}
                      disabled={sending === friend.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition disabled:opacity-50"
                    >
                      {sending === friend.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {t('social.send')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

