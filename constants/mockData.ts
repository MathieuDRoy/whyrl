import { Category } from './theme';

export type Source = 'newsapi' | 'reddit';

export interface TrendCard {
  id: string;
  title: string;
  summary: string;
  details: string;
  category: Category;
  source: Source;
  region: string;
  timestamp: string;
  trendingScore: number;
  engagements: number;
  hashtags: string[];
  isAd: boolean;
  adLabel?: string;
  adCta?: string;
  adUrl?: string;
  tall?: boolean;
}
