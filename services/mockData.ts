import { Activity, ActivityType, User, Book } from "../types";

export const currentUser: User = {
  id: 'curr-1',
  name: 'Alican D.',
  handle: '@alican_sys',
  avatarUrl: 'https://i.pravatar.cc/150?u=alican',
  role: 'System Admin & Reader',
  bio: 'Building systems and reading sci-fi. 🚀',
  readingGoal: {
    current: 12,
    target: 30
  },
  currentRead: {
    id: 'b-dune',
    title: 'Dune',
    author: 'Frank Herbert',
    coverUrl: 'https://covers.openlibrary.org/b/id/14535317-M.jpg',
    pages: 896
  }
};

export const activities: Activity[] = [
  {
    id: 'act-1',
    user: {
      id: 'u-2',
      name: 'Ayşe Yılmaz',
      handle: '@ayse_reads',
      avatarUrl: 'https://i.pravatar.cc/150?u=ayse',
      role: 'Editor',
    },
    type: ActivityType.FINISHED_READING,
    book: {
      id: 'b-1984',
      title: '1984',
      author: 'George Orwell',
      coverUrl: 'https://covers.openlibrary.org/b/id/12623347-M.jpg',
      rating: 5
    },
    timestamp: '2h ago',
    content: 'Wow. Just wow. This book is terrifyingly relevant today. A must-read for everyone.',
    likes: 24,
    comments: 5
  },
  {
    id: 'act-2',
    user: {
      id: 'u-3',
      name: 'Mehmet Ak',
      handle: '@mehmet_dev',
      avatarUrl: 'https://i.pravatar.cc/150?u=mehmet',
      role: 'Developer',
    },
    type: ActivityType.STARTED_READING,
    book: {
      id: 'b-sapiens',
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      coverUrl: 'https://covers.openlibrary.org/b/id/8377073-M.jpg',
    },
    timestamp: '5h ago',
    likes: 12,
    comments: 1
  },
  {
    id: 'act-3',
    user: {
      id: 'u-4',
      name: 'Zeynep K.',
      handle: '@zeynep_lit',
      avatarUrl: 'https://i.pravatar.cc/150?u=zeynep',
      role: 'Librarian',
    },
    type: ActivityType.RATED,
    book: {
      id: 'b-pride',
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      coverUrl: 'https://covers.openlibrary.org/b/id/14569396-M.jpg',
    },
    rating: 4.5,
    timestamp: '1d ago',
    content: 'A timeless classic. Mr. Darcy is simpler than I remembered!',
    likes: 45,
    comments: 8
  }
];

export const trendingBooks: Book[] = [
  { id: 't-1', title: 'The Midnight Library', author: 'Matt Haig', coverUrl: 'https://covers.openlibrary.org/b/id/10636683-M.jpg' },
  { id: 't-2', title: 'Atomic Habits', author: 'James Clear', coverUrl: 'https://covers.openlibrary.org/b/id/12869377-M.jpg' },
  { id: 't-3', title: 'Project Hail Mary', author: 'Andy Weir', coverUrl: 'https://covers.openlibrary.org/b/id/12826132-M.jpg' },
];

export const suggestedUsers: User[] = [
  { id: 's-1', name: 'Canan Can', handle: '@canan_c', avatarUrl: 'https://i.pravatar.cc/150?u=canan' },
  { id: 's-2', name: 'Burak B.', handle: '@burak_code', avatarUrl: 'https://i.pravatar.cc/150?u=burak' },
];