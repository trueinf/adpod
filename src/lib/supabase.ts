import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mcmujegylxaemjzyohds.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbXVqZWd5bHhhZW1qenlvaGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzAzODgsImV4cCI6MjA2OTkwNjM4OH0.sIXUIXaePPJ6zVY7LFph0pgUarA6dzY50HIlzD3po8U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Get user profile from modpod_users table
export const getUserProfile = async (authUserId: string) => {
  const { data, error } = await supabase
    .from('modpod_users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();
  
  return { data, error };
};

// Update user profile
export const updateUserProfile = async (authUserId: string, updates: {
  full_name?: string;
  organization?: string;
  avatar_url?: string;
}) => {
  const { data, error } = await supabase
    .from('modpod_users')
    .update(updates)
    .eq('auth_user_id', authUserId)
    .select()
    .single();
  
  return { data, error };
};

