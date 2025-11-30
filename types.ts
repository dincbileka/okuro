export interface Book {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
    rating?: number;
    pages?: number;
    description?: string;
  }
  
  export interface User {
    id: string;
    name: string;
    handle: string;
    avatarUrl: string;
    role?: string;
    bio?: string;
    readingGoal?: {
      current: number;
      target: number;
    };
    currentRead?: Book;
  }
  
  export enum ActivityType {
    STARTED_READING = 'STARTED_READING',
    FINISHED_READING = 'FINISHED_READING',
    RATED = 'RATED',
    REVIEWED = 'REVIEWED',
    ADDED_TO_LIST = 'ADDED_TO_LIST',
  }
  
  export interface Activity {
    id: string;
    user: User;
    type: ActivityType;
    book: Book;
    timestamp: string;
    content?: string; // For reviews
    rating?: number; // For ratings
    likes: number;
    comments: number;
  }
  
  export interface Trend {
    id: string;
    title: string;
    count: number;
  }