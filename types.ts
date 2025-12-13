export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  location: string;
  website?: string;
  followers_count: number;
  following_count: number;
  books_read_count: number;
  pages_read_count: number;
}

export enum BookStatus {
  FINISHED = 'finished', // Veritabanındaki 'finished' ile aynı olmalı
  READING = 'reading',
  WANT_TO_READ = 'want_to_read',
  DNF = 'dnf'
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string; // cover_url veya coverUrl karmaşasını önlemek için optional
  cover_url?: string; // DB'den gelen isim
  total_pages: number;
  rating_average?: number;
}

export interface UserBook {
  id: string;
  user_id: string;
  book_id: string;
  book: Book;
  status: BookStatus;
  rating?: number;
  notes?: string;
  is_favorite: boolean;
  progress_pages?: number;
  updated_at: string;
}

export interface Notification {
  id: string;
  type: 'LIKE' | 'FOLLOW' | 'COMMENT';
  actor_name: string;
  actor_avatar: string;
  message: string;
  created_at: string;
  read: boolean;
}

// --- EKLENEN KISIM (Hata Çözümü) ---

export enum ActivityType {
  FINISHED_READING = 'FINISHED_READING',
  STARTED_READING = 'STARTED_READING',
  RATED = 'RATED',
  REVIEWED = 'REVIEWED'
}

export interface Activity {
  id: string;
  user: {
    id: string;
    name: string;
    handle: string;
    avatarUrl: string;
    role?: string;
  };
  type: ActivityType;
  book: {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
    rating?: number;
  };
  rating?: number;
  content?: string;
  timestamp: string;
  likes: number;
  comments: number;
}

// --- SOSYAL ÖZELLİKLER ---

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface Friendship {
  id: number;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
  // Join ile gelen profil bilgileri
  requester?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
  };
  addressee?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
  };
}

export interface BookRecommendation {
  id: number;
  sender_id: string;
  receiver_id: string;
  book_id: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
  // Join ile gelen bilgiler
  sender?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
  };
  book?: Book;
}

export type NotificationType = 'friend_request' | 'friend_accepted' | 'book_recommendation' | 'book_rated';

export interface SocialNotification {
  id: number;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  related_user_id: string | null;
  related_book_id: string | null;
  is_read: boolean;
  created_at: string;
  // Join ile gelen bilgiler
  related_user?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  related_book?: Book;
}