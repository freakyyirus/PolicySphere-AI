// ============================================
// PolicySphere AI — Supabase Auth Middleware
// ============================================
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey
);

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'NO_TOKEN'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError);
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      username: profile?.username || user.email.split('@')[0],
      settings: profile?.settings || {}
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
}

export async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Create profile
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      username,
      settings: { darkMode: false, notifications: true }
    });
  }
  
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}

export async function signOut(token) {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return true;
}

export async function getUser(token) {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid token');
  }
  
  return user;
}

export { supabase };