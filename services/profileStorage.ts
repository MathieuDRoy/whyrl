import { supabase } from './supabase';

export interface UserProfile {
  name: string;
  country: string;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, country')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return { name: data.name as string, country: data.country as string };
}

export async function saveProfile(userId: string, profile: UserProfile): Promise<string | null> {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, name: profile.name, country: profile.country });
  return error?.message ?? null;
}

export async function updateProfileName(userId: string, name: string): Promise<string | null> {
  const { error } = await supabase
    .from('profiles')
    .update({ name })
    .eq('id', userId);
  return error?.message ?? null;
}
