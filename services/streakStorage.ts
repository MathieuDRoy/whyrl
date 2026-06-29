import { supabase } from './supabase';

export interface StreakData {
  currentStreak: number;
  lastActiveDate: string;
}

export async function getStreak(userId: string): Promise<StreakData> {
  const { data, error } = await supabase
    .from('streaks')
    .select('current_streak, last_active_date')
    .eq('user_id', userId)
    .single();

  if (error || !data) return { currentStreak: 0, lastActiveDate: '' };
  return {
    currentStreak: data.current_streak as number,
    lastActiveDate: data.last_active_date as string,
  };
}

export async function recordVisit(userId: string): Promise<StreakData> {
  const today = new Date().toISOString().slice(0, 10);

  const existing = await getStreak(userId);
  if (existing.lastActiveDate === today) return existing;

  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const newStreak = existing.lastActiveDate === yesterday
    ? existing.currentStreak + 1
    : 1;

  const { error } = await supabase.from('streaks').upsert({
    user_id: userId,
    current_streak: newStreak,
    last_active_date: today,
  });

  if (error) {
    console.warn('[streakStorage] recordVisit:', error.message);
    return existing;
  }

  return { currentStreak: newStreak, lastActiveDate: today };
}
