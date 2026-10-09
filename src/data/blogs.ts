export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string[];
  author?: string;
}

export const BLOG_POSTS: BlogPost[] = [];
