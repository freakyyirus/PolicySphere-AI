// ============================================
// API Client — Production API
// ============================================

const API_BASE = '/api';

const Auth = {
  getToken: () => localStorage.getItem('policysphere_token'),
  setToken: (token) => localStorage.setItem('policysphere_token', token),
  clearToken: () => localStorage.removeItem('policysphere_token'),
  getUser: () => JSON.parse(localStorage.getItem('policysphere_user') || 'null'),
  setUser: (user) => localStorage.setItem('policysphere_user', JSON.stringify(user)),
  clearUser: () => localStorage.removeItem('policysphere_user'),
  isLoggedIn: () => !!localStorage.getItem('policysphere_token'),
};

function authHeaders() {
  const token = Auth.getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handleResponse(response) {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${response.status}`);
  }
  return response.json();
}

export async function register(username, email, password) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });

  const json = await handleResponse(response);
  Auth.setToken(json.token);
  Auth.setUser(json.user);
  return json;
}

export async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const json = await handleResponse(response);
  Auth.setToken(json.token);
  Auth.setUser(json.user);
  return json;
}

export async function logout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: authHeaders()
    });
  } catch (e) {}
  Auth.clearToken();
  Auth.clearUser();
}

export async function analyzePolicy(policyType, sector, magnitude, duration) {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify({ policyType, sector, magnitude, duration }),
  });

  return handleResponse(response).then(json => json.data);
}

export async function getAnalyses() {
  const response = await fetch(`${API_BASE}/analyses`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
}

export async function searchAnalyses(params = {}) {
  const queryParts = [];
  if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
  if (params.policyType) queryParts.push(`policyType=${params.policyType}`);
  if (params.sector) queryParts.push(`sector=${params.sector}`);
  
  const url = `${API_BASE}/analyses${queryParts.length ? '?' + queryParts.join('&') : ''}`;
  const response = await fetch(url, { headers: authHeaders() });
  return handleResponse(response);
}

export async function getAnalytics() {
  const response = await fetch(`${API_BASE}/analytics`, {
    headers: authHeaders(),
  });
  return handleResponse(response).then(json => json.data);
}

export async function getAIInsights(policyType, sector, magnitude, duration) {
  const response = await fetch(`${API_BASE}/ai-insights`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify({ policyType, sector, magnitude, duration }),
  });

  return handleResponse(response).then(json => json.insights);
}

export async function analyzeDocument(content, type = 'text') {
  const response = await fetch(`${API_BASE}/analyze/document`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify({ content, type }),
  });

  return handleResponse(response).then(json => json.data);
}

export async function analyzeURL(url) {
  const response = await fetch(`${API_BASE}/analyze/document`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify({ url }),
  });

  return handleResponse(response).then(json => json.data);
}

export async function askQuestion(question, analysisId = null) {
  const response = await fetch(`${API_BASE}/analyze/ask`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify({ question, analysisId }),
  });

  return handleResponse(response).then(json => json.data);
}

export async function getTemplates(category = null, search = null) {
  let url = `${API_BASE}/templates`;
  const params = [];
  if (category) params.push(`category=${category}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (params.length > 0) url += '?' + params.join('&');
  
  const res = await fetch(url);
  const json = await res.json();
  return json.data;
}

export async function getTemplate(id) {
  const res = await fetch(`${API_BASE}/templates/${id}`);
  const json = await res.json();
  return json.data;
}

export async function getOptions() {
  const res = await fetch(`${API_BASE}/options`);
  return await res.json();
}

export async function healthCheck() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch {
    return { status: 'offline' };
  }
}

export async function getAIStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    const json = await res.json();
    return {
      configured: json.ai?.configured || false,
      provider: json.ai?.provider || 'None'
    };
  } catch {
    return { configured: false, provider: 'Offline' };
  }
}

export { Auth };