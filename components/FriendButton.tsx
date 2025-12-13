"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useTranslation } from "@/lib/LanguageContext";
import { UserPlus, UserCheck, UserX, Clock, Loader2 } from "lucide-react";

interface FriendButtonProps {
  targetUserId: string;
  currentUserId: string | null;
  onStatusChange?: () => void;
}

type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'blocked';

export default function FriendButton({ targetUserId, currentUserId, onStatusChange }: FriendButtonProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<FriendStatus>('none');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (currentUserId && targetUserId !== currentUserId) {
      checkFriendshipStatus();
    } else {
      setLoading(false);
    }
  }, [currentUserId, targetUserId]);

  const checkFriendshipStatus = async () => {
    try {
      // Gönderilen istek var mı?
      const { data: sentRequest } = await supabase
        .from("friendships")
        .select("*")
        .eq("requester_id", currentUserId)
        .eq("addressee_id", targetUserId)
        .single();

      if (sentRequest) {
        if (sentRequest.status === 'accepted') setStatus('friends');
        else if (sentRequest.status === 'pending') setStatus('pending_sent');
        else if (sentRequest.status === 'blocked') setStatus('blocked');
        setLoading(false);
        return;
      }

      // Alınan istek var mı?
      const { data: receivedRequest } = await supabase
        .from("friendships")
        .select("*")
        .eq("requester_id", targetUserId)
        .eq("addressee_id", currentUserId)
        .single();

      if (receivedRequest) {
        if (receivedRequest.status === 'accepted') setStatus('friends');
        else if (receivedRequest.status === 'pending') setStatus('pending_received');
        setLoading(false);
        return;
      }

      setStatus('none');
    } catch (error) {
      console.error("Friendship check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    if (!currentUserId) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from("friendships")
        .insert({
          requester_id: currentUserId,
          addressee_id: targetUserId,
          status: 'pending'
        });

      if (error) throw error;

      // Bildirim oluştur
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", currentUserId)
        .single();

      await supabase.from("notifications").insert({
        user_id: targetUserId,
        type: 'friend_request',
        title: t('social.friendRequestTitle'),
        message: `${myProfile?.full_name || myProfile?.email?.split('@')[0]} ${t('social.sentFriendRequest')}`,
        related_user_id: currentUserId
      });

      setStatus('pending_sent');
      onStatusChange?.();
    } catch (error: any) {
      console.error("Send request error:", error);
      alert(t('common.error') + ": " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const acceptFriendRequest = async () => {
    if (!currentUserId) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq("requester_id", targetUserId)
        .eq("addressee_id", currentUserId);

      if (error) throw error;

      // Bildirim oluştur
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", currentUserId)
        .single();

      await supabase.from("notifications").insert({
        user_id: targetUserId,
        type: 'friend_accepted',
        title: t('social.friendAcceptedTitle'),
        message: `${myProfile?.full_name || myProfile?.email?.split('@')[0]} ${t('social.acceptedFriendRequest')}`,
        related_user_id: currentUserId
      });

      setStatus('friends');
      onStatusChange?.();
    } catch (error: any) {
      console.error("Accept request error:", error);
      alert(t('common.error') + ": " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const cancelOrRejectRequest = async () => {
    if (!currentUserId) return;
    setActionLoading(true);

    try {
      // Her iki yönde de sil
      await supabase
        .from("friendships")
        .delete()
        .or(`and(requester_id.eq.${currentUserId},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${currentUserId})`);

      setStatus('none');
      onStatusChange?.();
    } catch (error: any) {
      console.error("Cancel request error:", error);
      alert(t('common.error') + ": " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const removeFriend = async () => {
    if (!confirm(t('social.confirmRemoveFriend'))) return;
    await cancelOrRejectRequest();
  };

  // Kendi profilinse gösterme
  if (!currentUserId || targetUserId === currentUserId) {
    return null;
  }

  if (loading) {
    return (
      <button disabled className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-400 rounded-lg">
        <Loader2 className="h-4 w-4 animate-spin" />
      </button>
    );
  }

  // Duruma göre buton render et
  switch (status) {
    case 'friends':
      return (
        <button
          onClick={removeFriend}
          disabled={actionLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/50 rounded-lg hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/50 transition group"
        >
          {actionLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <UserCheck className="h-4 w-4 group-hover:hidden" />
              <UserX className="h-4 w-4 hidden group-hover:block" />
            </>
          )}
          <span className="group-hover:hidden">{t('social.friends')}</span>
          <span className="hidden group-hover:block">{t('social.removeFriend')}</span>
        </button>
      );

    case 'pending_sent':
      return (
        <button
          onClick={cancelOrRejectRequest}
          disabled={actionLoading}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 text-yellow-400 border border-yellow-600/50 rounded-lg hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/50 transition"
        >
          {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
          {t('social.requestSent')}
        </button>
      );

    case 'pending_received':
      return (
        <div className="flex gap-2">
          <button
            onClick={acceptFriendRequest}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
            {t('social.accept')}
          </button>
          <button
            onClick={cancelOrRejectRequest}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-red-600/20 text-gray-400 hover:text-red-400 rounded-lg transition"
          >
            <UserX className="h-4 w-4" />
          </button>
        </div>
      );

    default:
      return (
        <button
          onClick={sendFriendRequest}
          disabled={actionLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          {t('social.addFriend')}
        </button>
      );
  }
}

