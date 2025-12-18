
export interface User {
  id: string;
  username: string;
  nickname: string;
  uid: string; // 5-char UID
  timetable: TimetableData;
  friends: string[]; // List of friend UIDs
}

export interface TimetableData {
  [day: number]: { // 0: Mon, 1: Tue...
    [slot: number]: string; // 0: 8am, 1: 9am...
  };
}

export interface Restaurant {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  reviews: Review[];
}

export interface Review {
  userId: string;
  nickname: string;
  rating: number; // 1-5
  comment: string;
  timestamp: number;
}

export type BoardCategory = '情感' | '學業' | '生活' | '閒聊';

export interface Post {
  id: string;
  authorId: string;
  content: string;
  category: BoardCategory;
  image?: string;
  likes: string[]; // List of user IDs
  comments: PostComment[];
  timestamp: number;
}

export interface PostComment {
  id: string;
  authorId: string;
  content: string;
  timestamp: number;
}
