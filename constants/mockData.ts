import { Category } from './theme';

export type Source = 'newsapi';

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
  hashtags: string[];
  isAd: boolean;
  adLabel?: string;
  adCta?: string;
  adUrl?: string;
  tall?: boolean;
}
