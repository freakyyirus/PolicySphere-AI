// ============================================
// PolicySphere AI — Supabase Service
// ============================================
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function createUserProfile(userId, email, username) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      username,
      settings: { darkMode: false, notifications: true }
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
  return data;
}

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error getting profile:', error);
    throw error;
  }
  return data;
}

export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
  return data;
}

export async function saveAnalysis(userId, analysisData) {
  const { data, error } = await supabase
    .from('analyses')
    .insert({
      user_id: userId,
      ...analysisData
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
  return data;
}

export async function getUserAnalyses(userId, options = {}) {
  let query = supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .order('analyzed_at', { ascending: false });
  
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error getting analyses:', error);
    throw error;
  }
  return data || [];
}

export async function getAnalysisById(analysisId, userId) {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', analysisId)
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error getting analysis:', error);
    throw error;
  }
  return data;
}

export async function deleteAnalysis(analysisId, userId) {
  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('id', analysisId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error deleting analysis:', error);
    throw error;
  }
  return true;
}

export async function searchAnalyses(userId, searchParams = {}) {
  let query = supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId);
  
  if (searchParams.policyType) {
    query = query.eq('policy_type', searchParams.policyType);
  }
  
  if (searchParams.sector) {
    query = query.eq('sector', searchParams.sector);
  }
  
  if (searchParams.search) {
    query = query.ilike('title', `%${searchParams.search}%`);
  }
  
  const { data, error } = await query.order('analyzed_at', { ascending: false });
  
  if (error) {
    console.error('Error searching analyses:', error);
    throw error;
  }
  return data || [];
}

export async function getUserAnalytics(userId) {
  const analyses = await getUserAnalyses(userId);
  
  const riskDistribution = { low: 0, moderate: 0, high: 0 };
  const sectorBreakdown = {};
  const policyTypeBreakdown = {};
  let totalRisk = 0;
  
  for (const a of analyses) {
    if (a.risk_score <= 35) riskDistribution.low++;
    else if (a.risk_score <= 65) riskDistribution.moderate++;
    else riskDistribution.high++;
    
    sectorBreakdown[a.sector] = (sectorBreakdown[a.sector] || 0) + 1;
    policyTypeBreakdown[a.policy_type] = (policyTypeBreakdown[a.policy_type] || 0) + 1;
    totalRisk += a.risk_score;
  }
  
  return {
    totalAnalyses: analyses.length,
    riskDistribution,
    sectorBreakdown,
    policyTypeBreakdown,
    avgRiskScore: analyses.length > 0 ? Math.round(totalRisk / analyses.length) : 0,
    recentTrend: analyses.slice(0, 10)
  };
}