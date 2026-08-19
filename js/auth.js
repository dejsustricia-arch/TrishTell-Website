import { supabase } from './supabase-config.js';

export async function getCurrentProfile() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) return null;
  return { ...user, ...profile };
}

export async function requireAuth() {
  const profile = await getCurrentProfile();
  if (!profile) window.location.href = 'login.html';
  return profile;
}

export async function signUpUser(email, password, username, displayName) {
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username.toLowerCase())
    .maybeSingle();

  if (existingUser) throw new Error('Username is already taken.');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username.toLowerCase(),
        display_name: displayName || username
      }
    }
  });

  if (error) throw error;
  return data;
}

export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logoutUser() {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
}
