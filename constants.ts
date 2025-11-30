import { Profile, Book, UserBook, BookStatus, Notification } from './types';

export const CURRENT_USER_ID = 'user-123';

export const MOCK_PROFILE: Profile = {
  id: 'user-123',
  username: 'elara_reads',
  full_name: 'Elara Vance',
  avatar_url: 'https://picsum.photos/200',
  bio: 'Speculative fiction enthusiast. Tea drinker. Collecting first editions.',
  location: 'Kyoto, Japan',
  website: 'https://elara.books',
  followers_count: 1204,
  following_count: 450,
  books_read_count: 342,
  pages_read_count: 124500,
};

export const MOCK_BOOKS: Book[] = [
  { id: 'b1', title: 'The Wind-Up Bird Chronicle', author: 'Haruki Murakami', cover_url: 'https://picsum.photos/300/450?random=1', total_pages: 607, rating_average: 4.5 },
  { id: 'b2', title: 'Dune', author: 'Frank Herbert', cover_url: 'https://picsum.photos/300/450?random=2', total_pages: 412, rating_average: 4.7 },
  { id: 'b3', title: 'Circe', author: 'Madeline Miller', cover_url: 'https://picsum.photos/300/450?random=3', total_pages: 393, rating_average: 4.3 },
  { id: 'b4', title: 'Project Hail Mary', author: 'Andy Weir', cover_url: 'https://picsum.photos/300/450?random=4', total_pages: 496, rating_average: 4.8 },
  { id: 'b5', title: 'Klara and the Sun', author: 'Kazuo Ishiguro', cover_url: 'https://picsum.photos/300/450?random=5', total_pages: 303, rating_average: 4.1 },
];

export const MOCK_USER_BOOKS: UserBook[] = [
  { id: 'ub1', user_id: 'user-123', book_id: 'b1', book: MOCK_BOOKS[0], status: BookStatus.READ, rating: 5, is_favorite: true, updated_at: '2023-10-15' },
  { id: 'ub2', user_id: 'user-123', book_id: 'b2', book: MOCK_BOOKS[1], status: BookStatus.CURRENTLY_READING, progress_pages: 204, is_favorite: false, updated_at: '2023-10-26' },
  { id: 'ub3', user_id: 'user-123', book_id: 'b3', book: MOCK_BOOKS[2], status: BookStatus.READ, rating: 4, notes: "Beautiful prose, loved the character arc.", is_favorite: true, updated_at: '2023-09-10' },
  { id: 'ub4', user_id: 'user-123', book_id: 'b4', book: MOCK_BOOKS[3], status: BookStatus.WANT_TO_READ, is_favorite: false, updated_at: '2023-10-01' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'LIKE', actor_name: 'Ahmet Yilmaz', actor_avatar: 'https://picsum.photos/50?random=10', message: 'liked your review of Circe', created_at: '2m ago', read: false },
  { id: 'n2', type: 'FOLLOW', actor_name: 'Sophie Chen', actor_avatar: 'https://picsum.photos/50?random=11', message: 'started following you', created_at: '1h ago', read: false },
  { id: 'n3', type: 'COMMENT', actor_name: 'Mark Doe', actor_avatar: 'https://picsum.photos/50?random=12', message: 'commented: "Totally agree about the ending!"', created_at: '1d ago', read: true },
];
