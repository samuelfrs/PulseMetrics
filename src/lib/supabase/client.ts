import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ggorriqjhfisqvznqwvf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnb3JyaXFqaGZpc3F2em5xd3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTg3MTQsImV4cCI6MjEwMjQ3NDcxNH0.NDNSSUKSZ8nKj6hoZwYoactxTFV_3VWmT2VHHgX_Oto';

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
