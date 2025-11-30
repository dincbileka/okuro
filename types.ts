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
  READ = 'READ',
  CURRENTLY_READING = 'CURRENTLY_READING',
  WANT_TO_READ = 'WANT_TO_READ',
  DNF = 'DNF' // Did not finish
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