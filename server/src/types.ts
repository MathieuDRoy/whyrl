export type Category = 'politics' | 'finance' | 'sport' | 'entertainment' | 'tech' | 'world';

export interface TrendCard {
  id: string;
  title: string;
  summary: string;
  details: string;
  category: Category;
  source: 'newsapi';
  region: string;
  timestamp: string;
  trendingScore: number;
  hashtags: string[];
  tall?: boolean;
}

export interface RawPost {
  title: string;
  body: string;
  source: 'newsapi';
  publishedAt?: string;
}

export interface TrendsQuery {
  region: string;
  categories: Category[];
}
