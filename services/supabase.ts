import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uvkrnjpbrtekdeslvdwn.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2a3JuanBicnRla2Rlc2x2ZHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzUyNjcsImV4cCI6MjA5NDIxMTI2N30.EKLjCNWgtuWNM__LwRMjlEFF23Y3cGk_ZiG0szEomoo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
