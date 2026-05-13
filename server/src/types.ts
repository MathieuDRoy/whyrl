export type Category = 'politics' | 'finance' | 'sport' | 'entertainment' | 'tech' | 'world';

export interface TrendCard {
  id: string;
  title: string;
  summary: string;
  details: string;
  category: Category;
  source: 'twitter' | 'reddit';
  region: string;
  timestamp: string;
  trendingScore: number;
  engagements: number;
  hashtags: string[];
  tall?: boolean;
}

export interface RawPost {
  title: string;
  body: string;
  score: number;
  comments: number;
  subreddit?: string;
  source: 'twitter' | 'reddit';
}

export interface TrendsQuery {
  region: string;
  categories: Category[];
}
