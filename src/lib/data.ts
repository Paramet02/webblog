// ─── Types ────────────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  date: string;
  readTime: number;
  views: number;
  likes: number;
  status: 'published' | 'draft' | 'scheduled';
  thumbVariant: string;
  featured?: boolean;
}

export interface Work {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  tags: string[];
  description: string;
  thumbVariant: string;
  featured?: boolean;
  role: string;
  stack: string;
  duration: string;
  status: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  date: string;
  status: 'approved' | 'pending' | 'spam';
  likes: number;
}

export interface MediaItem {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  thumbVariant: string;
  url?: string;
  storagePath?: string;
}

export interface ActivityItem {
  id: string;
  type: 'publish' | 'edit' | 'draft' | 'comment';
  text: string;
  when: string;
}

export interface Tag {
  name: string;
  count: number;
  hot?: boolean;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export interface StoreData {
  posts: Post[];
  works: Work[];
  comments: Comment[];
  media: MediaItem[];
  activity: ActivityItem[];
}

