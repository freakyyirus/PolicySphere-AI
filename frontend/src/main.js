// ============================================
// PolicySphere AI — Frontend Main Orchestrator
// ============================================
import { analyzePolicy, login, register, logout, Auth, getAIInsights, analyzeDocument, analyzeURL, askQuestion, getTemplates, getTemplate, healthCheck, getAIStatus } from './api.js';
import { drawRiskGauge } from './gauge.js';
import { renderImpactChart, renderRadarChart } from './charts.js';
import { downloadReport } from './report.js';

// ── State ──
let currentDuration = 'short';
let currentResult = null;
let savedScenarios = [];

const POLICY_LABELS = { tax: 'Tax Reform', subsidy: 'Subsidy', regulation: 'Regulation' };
const SECTOR_LABELS = {
  fuel: 'Fuel & Energy', healthcare: 'Healthcare', education: 'Education',
  agriculture: 'Agriculture', technology: 'Technology', manufacturing: 'Manufacturing',
  finance: 'Finance', energy: 'Energy',
};

// ── Toast Notifications ──
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };
  
  toast.innerHTML = `
    ${icons[type] || icons.info}
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;
  
  container.appendChild(toast);
  
  if (duration > 0) {
    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// ── Bootstrap ──
document.addEventListener('DOMContentLoaded', () => {
  initHeroAnimations();
  initNavigation();
  initFormControls();
  initCookieBanner();
  initAuthModals();
  initAuthState();
  initAIInsights();
  initDocumentAnalyzer();
  initTemplates();
  initSettings();
  checkAIStatus();
});

async function checkAIStatus() {
  try {
    const status = await getAIStatus();
    const indicator = document.getElementById('aiStatusIndicator');
    const text = document.getElementById('aiStatusText');
    if (indicator && text) {
      if (status.configured) {
        indicator.classList.add('active');
        text.textContent = `AI Engine: ${status.provider} - Active`;
      } else {
        indicator.classList.remove('active');
        indicator.classList.add('demo');
        text.textContent = 'AI Engine: Demo Mode (Rule-based)';
      }
    }
  } catch (err) {
    console.error('Failed to check AI status:', err);
  }
}

// ============================================
// HERO ANIMATIONS
// ============================================
function initHeroAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in, .slide-up').forEach(el => observer.observe(el));
}

// ============================================
// AUTHENTICATION
// ============================================
function initAuthState() {
  updateAuthUI();
}

function updateAuthUI() {
  const isLoggedIn = Auth.isLoggedIn();
  const user = Auth.getUser();
  const showLoginBtn = document.getElementById('showLoginBtn');
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  const authRequiredMsg = document.getElementById('authRequiredMsg');

  if (isLoggedIn && user) {
    showLoginBtn.style.display = 'none';
    userInfo.style.display = 'flex';
    userName.textContent = user.username;
    userAvatar.textContent = user.username.charAt(0).toUpperCase();
    if (authRequiredMsg) authRequiredMsg.style.display = 'none';
    
    // Update Overview welcome text
    const welcomeUser = document.getElementById('welcomeUserName');
    if (welcomeUser) welcomeUser.textContent = user.username;
  } else {
    showLoginBtn.style.display = 'flex';
    userInfo.style.display = 'none';
    if (authRequiredMsg) authRequiredMsg.style.display = 'flex';
  }
}

function initAuthModals() {
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  
  document.getElementById('showLoginBtn')?.addEventListener('click', () => openModal(loginModal));
  document.getElementById('navLoginBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(loginModal);
  });
  document.getElementById('showRegisterModal')?.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(registerModal);
  });
  document.getElementById('showLoginModal')?.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(registerModal);
    openModal(loginModal);
  });
  document.getElementById('closeLoginModal')?.addEventListener('click', () => closeModal(loginModal));
  document.getElementById('closeRegisterModal')?.addEventListener('click', () => closeModal(registerModal));
  
  loginModal?.addEventListener('click', (e) => { if (e.target === loginModal) closeModal(loginModal); });
  registerModal?.addEventListener('click', (e) => { if (e.target === registerModal) closeModal(registerModal); });

  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
  document.getElementById('authRequiredLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(loginModal);
  });

  const userDropdown = document.getElementById('userDropdown');
  const userInfo = document.getElementById('userInfo');
  userInfo?.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('show');
  });
  document.addEventListener('click', () => userDropdown?.classList.remove('show'));
}

function openModal(modal) {
  if (modal) modal.classList.add('show');
}

function closeModal(modal) {
  if (modal) modal.classList.remove('show');
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  const landingPage = document.getElementById('landing-page');
  const app = document.getElementById('app-section');
  const footer = document.getElementById('siteFooter');

  try {
    errorEl.style.display = 'none';
    await login(email, password);
    closeModal(document.getElementById('loginModal'));
    updateAuthUI();
    document.getElementById('loginForm').reset();
    showToast('Welcome back! Login successful', 'success');
    
    if (landingPage && app && footer) {
      landingPage.style.display = 'none';
      app.style.display = 'block';
      app.classList.add('active');
      footer.style.display = 'none';
    }
    loadOverviewData();
    showDashboardSection('dashboard-home');
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = 'block';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const errorEl = document.getElementById('registerError');
  const landingPage = document.getElementById('landing-page');
  const app = document.getElementById('app-section');
  const footer = document.getElementById('siteFooter');

  try {
    errorEl.style.display = 'none';
    await register(username, email, password);
    closeModal(document.getElementById('registerModal'));
    updateAuthUI();
    document.getElementById('registerForm').reset();
    showToast('Account created successfully! Welcome to PolicySphere AI', 'success');
    
    if (landingPage && app && footer) {
      landingPage.style.display = 'none';
      app.style.display = 'block';
      app.classList.add('active');
      footer.style.display = 'none';
    }
    loadOverviewData();
    showDashboardSection('dashboard-home');
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = 'block';
  }
}

function handleLogout() {
  logout();
  updateAuthUI();
  savedScenarios = [];
  renderComparisonGrid();
  showToast('You have been logged out', 'info');
  
  const landingPage = document.getElementById('landing-page');
  const app = document.getElementById('app-section');
  const footer = document.getElementById('siteFooter');
  if (landingPage && app && footer) {
    app.classList.remove('active');
    app.style.display = 'none';
    landingPage.style.display = 'block';
    footer.style.display = 'flex';
  }
}

// ============================================
// AI INSIGHTS
// ============================================
function initAIInsights() {
  const slider = document.getElementById('aiMagnitude');
  const sliderValue = document.getElementById('aiMagnitudeValue');
  if (slider && sliderValue) {
    slider.addEventListener('input', () => { sliderValue.textContent = slider.value + '%'; });
  }

  document.getElementById('generateInsightsBtn')?.addEventListener('click', generateInsights);
}

async function generateInsights() {
  if (!Auth.isLoggedIn()) {
    openModal(document.getElementById('loginModal'));
    return;
  }

  const policyType = document.getElementById('aiPolicyType').value;
  const sector = document.getElementById('aiSector').value;
  const magnitude = parseInt(document.getElementById('aiMagnitude').value);

  const btn = document.getElementById('generateInsightsBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span> Generating...';
  btn.disabled = true;

  try {
    const insights = await getAIInsights(policyType, sector, magnitude, 'short');
    const output = document.getElementById('aiInsightsOutput');
    const content = document.getElementById('insightsContent');
    output.style.display = 'block';
    content.innerHTML = insights.map((insight, i) => `
      <div class="insight-item fade-in" style="animation-delay: ${i * 150}ms">
        <div class="insight-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        </div>
        <div class="insight-text">${insight}</div>
      </div>
    `).join('');
  } catch (err) {
    alert('Failed to generate insights: ' + err.message);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// ============================================
// DOCUMENT ANALYZER
// ============================================
function initDocumentAnalyzer() {
  const authMsg = document.getElementById('docAnalyzerAuthMsg');
  if (authMsg) {
    authMsg.style.display = Auth.isLoggedIn() ? 'none' : 'flex';
  }
  
  document.getElementById('docAnalyzerAuthLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(document.getElementById('loginModal'));
  });

  document.querySelectorAll('.doc-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.doc-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.doc-tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab === 'text' ? 'docTextTab' : 'docUrlTab').classList.add('active');
    });
  });

  document.getElementById('analyzeDocBtn')?.addEventListener('click', handleDocumentAnalysis);
  document.getElementById('askPolicyQuestionBtn')?.addEventListener('click', handlePolicyQuestion);
  document.getElementById('policyQuestionInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handlePolicyQuestion();
  });
}

let currentDocAnalysisId = null;

async function handleDocumentAnalysis() {
  if (!Auth.isLoggedIn()) {
    openModal(document.getElementById('loginModal'));
    return;
  }

  const activeTab = document.querySelector('.doc-tab-btn.active')?.dataset.tab || 'text';
  let result;

  const btn = document.getElementById('analyzeDocBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span> Analyzing...';
  btn.disabled = true;

  try {
    if (activeTab === 'text') {
      const content = document.getElementById('policyTextInput').value;
      if (!content.trim()) {
        alert('Please enter policy text content');
        return;
      }
      result = await analyzeDocument(content, 'text');
    } else {
      const url = document.getElementById('policyUrlInput').value;
      if (!url.trim()) {
        alert('Please enter a URL');
        return;
      }
      result = await analyzeURL(url);
    }

    currentDocAnalysisId = result.analysisId;
    renderDocumentAnalysis(result);
  } catch (err) {
    alert('Failed to analyze document: ' + err.message);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

function renderDocumentAnalysis(result) {
  const resultDiv = document.getElementById('docAnalysisResult');
  resultDiv.style.display = 'block';

  document.getElementById('docSummaryText').textContent = result.summary;

  const coversList = document.getElementById('docCoversList');
  coversList.innerHTML = result.coverage?.covers?.map(c => `<li>${c}</li>`).join('') || '<li>General policy aspects</li>';

  const notCoversList = document.getElementById('docNotCoversList');
  notCoversList.innerHTML = result.coverage?.doesNotCover?.map(c => `<li>${c}</li>`).join('') || '<li>Implementation details</li>';

  const impacts = result.impacts || {};
  const impactGrid = document.getElementById('docImpactGrid');
  impactGrid.innerHTML = `
    <div class="impact-item ${impacts.inflation > 0 ? 'negative' : 'positive'}">
      <div class="label">Inflation</div>
      <div class="value">${(impacts.inflation >= 0 ? '+' : '') + impacts.inflation?.toFixed(1) || '0'}%</div>
    </div>
    <div class="impact-item ${impacts.employment > 0 ? 'positive' : 'negative'}">
      <div class="label">Employment</div>
      <div class="value">${(impacts.employment >= 0 ? '+' : '') + impacts.employment?.toFixed(1) || '0'}%</div>
    </div>
    <div class="impact-item ${impacts.gdp > 0 ? 'positive' : 'negative'}">
      <div class="label">GDP</div>
      <div class="value">${(impacts.gdp >= 0 ? '+' : '') + impacts.gdp?.toFixed(1) || '0'}%</div>
    </div>
    <div class="impact-item ${impacts.fiscal > 0 ? 'negative' : 'positive'}">
      <div class="label">Fiscal</div>
      <div class="value">${(impacts.fiscal >= 0 ? '+' : '') + impacts.fiscal?.toFixed(1) || '0'}%</div>
    </div>
  `;

  const riskScore = result.riskScore || 50;
  const riskBadge = document.getElementById('docRiskBadge');
  let riskClass = 'moderate';
  let riskLabel = 'Moderate Risk';
  if (riskScore <= 35) { riskClass = 'low'; riskLabel = 'Low Risk'; }
  else if (riskScore >= 66) { riskClass = 'high'; riskLabel = 'High Risk'; }
  riskBadge.className = 'risk-badge ' + riskClass;
  riskBadge.textContent = `Risk Score: ${riskScore}/100 - ${riskLabel}`;

  document.getElementById('qaAnswers').innerHTML = '';
}

async function handlePolicyQuestion() {
  if (!Auth.isLoggedIn()) {
    openModal(document.getElementById('loginModal'));
    return;
  }

  const questionInput = document.getElementById('policyQuestionInput');
  const question = questionInput.value.trim();
  if (!question) return;

  const btn = document.getElementById('askPolicyQuestionBtn');
  const originalText = btn.textContent;
  btn.textContent = '...';
  btn.disabled = true;

  try {
    const result = await askQuestion(question, currentDocAnalysisId);
    
    const answersDiv = document.getElementById('qaAnswers');
    const answerHTML = `
      <div class="qa-item">
        <div class="question">Q: ${question}</div>
        <div class="answer">${result.answer}</div>
      </div>
    `;
    answersDiv.insertAdjacentHTML('afterbegin', answerHTML);
    questionInput.value = '';
  } catch (err) {
    alert('Failed to get answer: ' + err.message);
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// ============================================
// POLICY TEMPLATES
// ============================================
function initTemplates() {
  document.querySelectorAll('.template-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.template-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterTemplates(btn.dataset.category);
    });
  });

  document.getElementById('templateSearch')?.addEventListener('input', (e) => {
    searchTemplates(e.target.value);
  });

  document.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => showTemplateDetail(card.dataset.id));
  });

  document.getElementById('closeTemplateDetail')?.addEventListener('click', closeTemplateDetail);
  document.getElementById('templateDetailModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'templateDetailModal') closeTemplateDetail();
  });

  document.getElementById('runTemplateAnalysis')?.addEventListener('click', runTemplateAnalysis);
}

let selectedTemplateId = null;

function filterTemplates(category) {
  const cards = document.querySelectorAll('.template-card');
  cards.forEach(card => {
    if (!category) {
      card.style.display = 'block';
    } else {
      const tags = card.querySelectorAll('.template-tag');
      const hasMatch = Array.from(tags).some(t => t.textContent.includes(category));
      card.style.display = hasMatch ? 'block' : 'none';
    }
  });
}

function searchTemplates(query) {
  const q = query.toLowerCase();
  const cards = document.querySelectorAll('.template-card');
  cards.forEach(card => {
    const name = card.querySelector('.template-name').textContent.toLowerCase();
    const desc = card.querySelector('.template-desc').textContent.toLowerCase();
    card.style.display = (name.includes(q) || desc.includes(q)) ? 'block' : 'none';
  });
}

async function showTemplateDetail(id) {
  try {
    const template = await getTemplate(id);
    selectedTemplateId = id;

    document.getElementById('templateDetailIcon').textContent = template.icon;
    document.getElementById('templateDetailName').textContent = template.name;
    document.getElementById('templateDetailDesc').textContent = template.description;
    document.getElementById('templateDetailScenario').textContent = template.scenario?.description || template.description;

    const outcomes = template.scenario?.expectedOutcomes || [];
    document.getElementById('templateDetailOutcomes').innerHTML = outcomes.map(o => `<li>${o}</li>`).join('');

    const risks = template.scenario?.risks || [];
    document.getElementById('templateDetailRisks').innerHTML = risks.map(r => `<li>${r}</li>`).join('');

    document.getElementById('templateDetailModal').style.display = 'flex';
  } catch (err) {
    alert('Failed to load template: ' + err.message);
  }
}

function closeTemplateDetail() {
  document.getElementById('templateDetailModal').style.display = 'none';
  selectedTemplateId = null;
}

async function runTemplateAnalysis() {
  if (!selectedTemplateId) return;

  try {
    const template = await getTemplate(selectedTemplateId);

    document.getElementById('policyType').value = template.policyType;
    document.getElementById('sector').value = template.sector;
    document.getElementById('magnitude').value = template.magnitude;
    document.getElementById('magnitudeValue').textContent = template.magnitude + '%';

    setDuration(template.duration);

    closeTemplateDetail();

    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    document.querySelector('.sidebar-link[data-section="policy-simulator"]')?.classList.add('active');
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
    document.getElementById('policy-simulator')?.classList.add('active');
    document.querySelector('.topbar-title').textContent = 'Policy Simulation Engine';

    setTimeout(() => handleAnalysis(), 300);
  } catch (err) {
    alert('Failed to run analysis: ' + err.message);
  }
}

// ============================================
// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
  const landingPage = document.getElementById('landing-page');
  const app = document.getElementById('app-section');
  const footer = document.getElementById('siteFooter');
  const heroNav = document.querySelector('.hero-nav');

  // Sticky Header Scroll Logic
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      heroNav?.classList.add('scrolled');
    } else {
      heroNav?.classList.remove('scrolled');
    }
  });

  const switchToApp = () => {
    if (!Auth.isLoggedIn()) {
      openModal(document.getElementById('loginModal'));
      return;
    }
    landingPage.style.display = 'none';
    app.style.display = 'block';
    app.classList.add('active');
    footer.style.display = 'none';
    window.scrollTo(0, 0);
    loadOverviewData();
    showDashboardSection('dashboard-home');
  };

  const switchToHero = () => {
    app.classList.remove('active');
    app.style.display = 'none';
    landingPage.style.display = 'block';
    footer.style.display = 'flex';
    window.scrollTo(0, 0);
  };

  // Connected Footer Links
  const footerLinkIds = {
    'footerLinkDashboard': 'dashboard-home',
    'footerLinkSimulator': 'policy-simulator',
    'footerLinkAI': 'ai-insights',
    'footerLinkAnalyzer': 'document-analyzer'
  };

  Object.entries(footerLinkIds).forEach(([id, sectionId]) => {
    document.getElementById(id)?.addEventListener('click', (e) => {
      e.preventDefault();
      if (Auth.isLoggedIn()) {
        switchToApp();
        showDashboardSection(sectionId);
      } else {
        openModal(document.getElementById('loginModal'));
      }
    });
  });

  const showDashboardSection = (sectionId) => {
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`.sidebar-link[data-section="${sectionId}"]`)?.classList.add('active');
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
    
  const topbarTitle = document.querySelector('.topbar-title');
  if (topbarTitle) {
    const user = Auth.getUser();
    const titleMap = {
      'dashboard-home': user ? `Dashboard - ${user.username}` : 'Dashboard',
      'policy-simulator': 'New Analysis',
      'risk-reports': 'My Reports',
      'comparison': 'Compare',
      'document-analyzer': 'Document Analyzer',
      'policy-templates': 'Templates',
      'ai-insights': 'AI Insights',
      'settings': 'Settings'
    };
    topbarTitle.textContent = titleMap[sectionId] || 'PolicySphere AI';
  }
    
    window.scrollTo(0, 0);
  };

  document.getElementById('startSimulation')?.addEventListener('click', switchToApp);
  document.getElementById('heroStartSimBtn')?.addEventListener('click', (e) => { e.preventDefault(); switchToApp(); });
  document.getElementById('viewDemo')?.addEventListener('click', () => runDemo(switchToApp));
  document.getElementById('backToHero')?.addEventListener('click', switchToHero);

  const ctaStart = document.getElementById('ctaStart');
  if (ctaStart) ctaStart.addEventListener('click', switchToApp);
  const ctaDemo = document.getElementById('ctaDemo');
  if (ctaDemo) ctaDemo.addEventListener('click', () => runDemo(switchToApp));

  document.querySelectorAll('.sidebar-link, .action-btn, .view-all, .quick-link-card').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.dataset.section;
      if (!sectionId) return;

      showDashboardSection(sectionId);

      if (sectionId === 'ai-insights') {
        const authMsg = document.getElementById('authRequiredMsg');
        if (authMsg) authMsg.style.display = Auth.isLoggedIn() ? 'none' : 'flex';
      }

      if (sectionId === 'document-analyzer') {
        const authMsg = document.getElementById('docAnalyzerAuthMsg');
        if (authMsg) authMsg.style.display = Auth.isLoggedIn() ? 'none' : 'flex';
      }
      
      if (sectionId === 'risk-reports') loadReports();
    });
  });
}

function loadOverviewData() {
  if (!Auth.isLoggedIn()) return;
  
  const user = Auth.getUser();
  const welcomeEl = document.getElementById('welcomeUserName');
  if (welcomeEl && user) welcomeEl.textContent = user.username || 'Analyst';
  
  loadAnalyticsStats();
}

async function loadAnalyticsStats() {
  try {
    const { getAnalytics } = await import('./api.js');
    const stats = await getAnalytics();
    
    document.getElementById('statTotalAnalyses').textContent = stats.totalAnalyses || 0;
    document.getElementById('statLowRisk').textContent = stats.riskDistribution?.low || 0;
    document.getElementById('statMedRisk').textContent = stats.riskDistribution?.moderate || 0;
    document.getElementById('statHighRisk').textContent = stats.riskDistribution?.high || 0;
    
    const recentList = document.getElementById('recentActivityList');
    if (recentList && stats.recentTrend?.length > 0) {
      recentList.innerHTML = stats.recentTrend.slice(0, 5).map(a => `
        <div class="activity-item">
          <div class="activity-icon ${a.riskScore <= 35 ? 'success' : a.riskScore <= 65 ? 'warning' : 'danger'}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/></svg>
          </div>
          <div class="activity-content">
            <div class="activity-title">${a.title}</div>
            <div class="activity-meta">Risk: ${a.riskScore}/100</div>
          </div>
        </div>
      `).join('');
    } else if (recentList) {
      recentList.innerHTML = '<div class="empty-activity">No analyses yet. Start a new analysis!</div>';
    }
  } catch (err) {
    console.error('Failed to load analytics:', err);
    document.getElementById('statTotalAnalyses').textContent = '0';
    document.getElementById('statLowRisk').textContent = '0';
    document.getElementById('statMedRisk').textContent = '0';
    document.getElementById('statHighRisk').textContent = '0';
  }
}

// ============================================
// FORM CONTROLS
// ============================================
function initFormControls() {
  const slider = document.getElementById('magnitude');
  const sliderValue = document.getElementById('magnitudeValue');
  if (slider && sliderValue) {
    slider.addEventListener('input', () => { sliderValue.textContent = slider.value + '%'; });
  }

  document.getElementById('toggleShort')?.addEventListener('click', () => setDuration('short'));
  document.getElementById('toggleLong')?.addEventListener('click', () => setDuration('long'));

  document.getElementById('policyForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleAnalysis();
  });

  document.getElementById('saveScenarioBtn')?.addEventListener('click', saveCurrentScenario);
  document.getElementById('downloadReportBtn')?.addEventListener('click', () => downloadReport(currentResult));

  const docUploadBtn = document.getElementById('docUploadBtn');
  if (docUploadBtn) {
    docUploadBtn.addEventListener('click', () => {
      alert('Document upload feature coming soon! You can manually enter policy parameters using the form above.');
    });
  }
}

function setDuration(val) {
  currentDuration = val;
  document.getElementById('toggleShort')?.classList.toggle('active', val === 'short');
  document.getElementById('toggleLong')?.classList.toggle('active', val === 'long');
}

// ============================================
// ANALYSIS
// ============================================
async function handleAnalysis() {
  const policyType = document.getElementById('policyType').value;
  const sector = document.getElementById('sector').value;
  const magnitude = parseInt(document.getElementById('magnitude').value);

  if (!policyType || !sector) {
    shakeElement(document.getElementById('policyInputCard'));
    return;
  }

  const overlay = document.getElementById('analyzingOverlay');
  const analyzeBtn = document.getElementById('analyzeBtn');
  overlay.classList.add('visible');
  analyzeBtn?.classList.add('loading');

  try {
    const result = await analyzePolicy(policyType, sector, magnitude, currentDuration);
    currentResult = result;
    currentResult.policyType = policyType;
    currentResult.sector = sector;
    currentResult.magnitude = magnitude;
    currentResult.policyLabel = POLICY_LABELS[policyType];
    currentResult.sectorLabel = SECTOR_LABELS[sector];
    renderResults(result);
    showToast('Analysis complete! Risk score: ' + result.riskScore + '/100', result.riskScore <= 35 ? 'success' : result.riskScore <= 65 ? 'warning' : 'error');
  } catch (err) {
    console.error('Analysis failed:', err);
    showToast('Analysis failed. Please ensure the backend server is running.', 'error');
  } finally {
    overlay.classList.remove('visible');
    analyzeBtn?.classList.remove('loading');
  }
}

// ============================================
// RENDER RESULTS
// ============================================
function renderResults(result) {
  const { impacts, riskScore, decision } = result;

  const resultsSection = document.getElementById('results-section');
  resultsSection.classList.add('visible');
  resultsSection.style.display = 'block';

  drawRiskGauge(riskScore);

  const gaugeLabel = document.getElementById('gaugeLabel');
  gaugeLabel.className = 'gauge-label';
  if (riskScore <= 35) { gaugeLabel.classList.add('low'); gaugeLabel.textContent = 'Low Risk'; }
  else if (riskScore <= 65) { gaugeLabel.classList.add('moderate'); gaugeLabel.textContent = 'Moderate Risk'; }
  else { gaugeLabel.classList.add('high'); gaugeLabel.textContent = 'High Risk'; }

  const decisionIcon = document.getElementById('decisionIcon');
  decisionIcon.className = 'decision-icon ' + decision.verdict;
  if (decision.verdict === 'proceed') {
    decisionIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  } else if (decision.verdict === 'modify') {
    decisionIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  } else {
    decisionIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  }
  const verdictEl = document.getElementById('decisionVerdict');
  verdictEl.textContent = decision.label;
  verdictEl.className = 'decision-verdict ' + decision.verdict;
  document.getElementById('confidenceValue').textContent = decision.confidence + '%';
  document.getElementById('confidenceFill').style.width = decision.confidence + '%';
  document.getElementById('confidenceFill').style.background =
    decision.verdict === 'proceed' ? 'var(--success)' :
    decision.verdict === 'modify' ? 'var(--warning)' : 'var(--danger)';

  updateMetric(impacts.inflation, 'metricInflation', 'trendInflation', false);
  updateMetric(impacts.employment, 'metricEmployment', 'trendEmployment', true);
  updateMetric(impacts.gdp, 'metricGdp', 'trendGdp', true);
  updateMetric(impacts.fiscal, 'metricFiscal', 'trendFiscal', false);

  document.querySelectorAll('.metric-card').forEach((card, i) => {
    card.classList.remove('visible');
    setTimeout(() => card.classList.add('visible'), 150 * i);
  });

  typeExplanation(result.explanation);

  renderImpactChart(impacts);
  renderRadarChart(result);

  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 300);
}

function updateMetric(value, valueId, trendId, invertColor) {
  const valueEl = document.getElementById(valueId);
  const trendEl = document.getElementById(trendId);
  if (!valueEl || !trendEl) return;
  const absVal = Math.abs(value).toFixed(1);

  valueEl.textContent = (value >= 0 ? '+' : '-') + absVal + '%';

  if (invertColor) {
    valueEl.className = 'metric-value ' + (value > 0.5 ? 'positive' : value < -0.5 ? 'negative' : 'neutral');
    trendEl.className = 'metric-trend ' + (value > 0.5 ? 'down' : value < -0.5 ? 'up' : 'flat');
  } else {
    valueEl.className = 'metric-value ' + (value > 0.5 ? 'negative' : value < -0.5 ? 'positive' : 'neutral');
    trendEl.className = 'metric-trend ' + (value > 0.5 ? 'up' : value < -0.5 ? 'down' : 'flat');
  }

  const trendSvg = (dir) => {
    if (dir === 'up') return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>';
    if (dir === 'down') return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
    return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  };
  const trendDir = value > 0.5 ? 'up' : value < -0.5 ? 'down' : 'flat';
  const trendLabel = value > 0.5 ? 'Increasing' : value < -0.5 ? 'Decreasing' : 'Stable';
  trendEl.innerHTML = trendSvg(trendDir) + ' ' + trendLabel;
}

// ============================================
// TYPING ANIMATION
// ============================================
function typeExplanation(text) {
  const el = document.getElementById('explanationText');
  if (!el) return;
  el.innerHTML = '';
  let i = 0;
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';

  function type() {
    if (i < text.length) {
      el.textContent = text.substring(0, i + 1);
      el.appendChild(cursor);
      i++;
      setTimeout(type, 10 + Math.random() * 6);
    } else {
      setTimeout(() => cursor.remove(), 1500);
    }
  }
  type();
}

// ============================================
// SCENARIO COMPARISON
// ============================================
function saveCurrentScenario() {
  if (!currentResult) return;
  if (savedScenarios.length >= 2) savedScenarios.shift();
  savedScenarios.push({ ...currentResult });
  renderComparisonGrid();

  const btn = document.getElementById('saveScenarioBtn');
  if (!btn) return;
  const original = btn.innerHTML;
  btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Saved!';
  btn.style.borderColor = 'var(--success)';
  btn.style.color = 'var(--success)';
  setTimeout(() => { btn.innerHTML = original; btn.style.borderColor = ''; btn.style.color = ''; }, 1500);
}

function renderComparisonGrid() {
  const grid = document.getElementById('comparisonGrid');
  if (!grid || !savedScenarios.length) {
    if (grid) grid.innerHTML = `
      <div class="card empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        <p>No scenarios saved yet.<br>Run an analysis and click "Save Scenario".</p>
      </div>`;
    return;
  }

  const bestIdx = savedScenarios.length === 2 ?
    (savedScenarios[0].riskScore <= savedScenarios[1].riskScore ? 0 : 1) : -1;

  const getDecisionIcon = (verdict) => {
    if (verdict === 'proceed') return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
    if (verdict === 'modify') return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>';
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  };

  grid.innerHTML = savedScenarios.map((sc, i) => {
    const isBetter = i === bestIdx;
    const pLabel = sc.policyLabel || POLICY_LABELS[sc.policyType];
    const sLabel = sc.sectorLabel || SECTOR_LABELS[sc.sector];
    return `
      <div class="card scenario-card ${isBetter ? 'better' : ''}">
        ${isBetter ? '<div class="scenario-badge recommended">Recommended</div>' : ''}
        <div class="scenario-title">${pLabel} — ${sLabel} (${sc.magnitude}%)</div>
        <div class="scenario-stats">
          <div class="scenario-stat"><span class="scenario-stat-label">Risk Score</span><span class="scenario-stat-value" style="color:${sc.riskScore<=35?'var(--success)':sc.riskScore<=65?'var(--warning)':'var(--danger)'}">${sc.riskScore}/100</span></div>
          <div class="scenario-stat"><span class="scenario-stat-label">Decision</span><span class="scenario-stat-value decision-inline">${getDecisionIcon(sc.decision.verdict)} ${sc.decision.label}</span></div>
          <div class="scenario-stat"><span class="scenario-stat-label">Inflation</span><span class="scenario-stat-value">${sc.impacts.inflation>0?'+':''}${sc.impacts.inflation.toFixed(1)}%</span></div>
          <div class="scenario-stat"><span class="scenario-stat-label">Employment</span><span class="scenario-stat-value">${sc.impacts.employment>0?'+':''}${sc.impacts.employment.toFixed(1)}%</span></div>
          <div class="scenario-stat"><span class="scenario-stat-label">GDP Growth</span><span class="scenario-stat-value">${sc.impacts.gdp>0?'+':''}${sc.impacts.gdp.toFixed(1)}%</span></div>
          <div class="scenario-stat"><span class="scenario-stat-label">Fiscal Deficit</span><span class="scenario-stat-value">${sc.impacts.fiscal>0?'+':''}${sc.impacts.fiscal.toFixed(1)}%</span></div>
        </div>
      </div>`;
  }).join('');
}

// ============================================
// REPORTS
// ============================================
async function loadReports() {
  const reportsList = document.getElementById('reportsList');
  if (!reportsList) return;
  
  if (!Auth.isLoggedIn()) {
    reportsList.innerHTML = `
      <div class="card empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        <p>Sign in to save and view your analysis history.<br>Run your first analysis from the Dashboard.</p>
      </div>`;
    return;
  }
  
  initReportsFilters();
  await filterReports();
}

async function initReportsFilters() {
  document.getElementById('reportsSearch')?.addEventListener('input', debounce(filterReports, 300));
  document.getElementById('reportsPolicyFilter')?.addEventListener('change', filterReports);
  document.getElementById('reportsSectorFilter')?.addEventListener('change', filterReports);
}

async function filterReports() {
  const reportsList = document.getElementById('reportsList');
  if (!reportsList) return;

  const search = document.getElementById('reportsSearch')?.value || '';
  const policyType = document.getElementById('reportsPolicyFilter')?.value || '';
  const sector = document.getElementById('reportsSectorFilter')?.value || '';

  try {
    const { searchAnalyses } = await import('./api.js');
    const analyses = await searchAnalyses({ search, policyType, sector });
    
    if (!analyses.length) {
      reportsList.innerHTML = `
        <div class="card empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <p>No reports match your filters.<br>Try adjusting your search criteria.</p>
        </div>`;
      return;
    }
    
    reportsList.innerHTML = analyses.map(a => {
      const riskColor = a.riskScore <= 35 ? 'var(--success)' : a.riskScore <= 65 ? 'var(--warning)' : 'var(--danger)';
      const date = new Date(a.analyzedAt).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      });
      return `
        <div class="card report-card" data-id="${a.id}">
          <div class="report-header">
            <div class="report-title">${a.title}</div>
            <div class="report-risk" style="color: ${riskColor}">${a.riskScore}/100</div>
          </div>
          <div class="report-meta">
            <span>${a.policyLabel} - ${a.sectorLabel}</span>
            <span>${a.magnitude}% magnitude</span>
            <span>${date}</span>
          </div>
          <div class="report-actions">
            <button class="btn-sm" onclick="loadReport('${a.id}')">View</button>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    console.error('Failed to filter reports:', err);
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

window.loadReport = function(id) {
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.querySelector('.sidebar-link[data-section="dashboard-home"]')?.classList.add('active');
  document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
  document.getElementById('dashboard-home')?.classList.add('active');
  document.querySelector('.topbar-title').textContent = 'Policy Risk Dashboard';
};

// ============================================
// DEMO MODE
// ============================================
function runDemo(switchToApp) {
  const policyTypeEl = document.getElementById('policyType');
  const sectorEl = document.getElementById('sector');
  const magnitudeEl = document.getElementById('magnitude');
  const magnitudeValueEl = document.getElementById('magnitudeValue');
  
  if (policyTypeEl) policyTypeEl.value = 'subsidy';
  if (sectorEl) sectorEl.value = 'fuel';
  if (magnitudeEl) magnitudeEl.value = 10;
  if (magnitudeValueEl) magnitudeValueEl.textContent = '10%';
  setDuration('short');
  switchToApp();
  setTimeout(() => handleAnalysis(), 500);
}

// ============================================
// COOKIE BANNER
// ============================================
function initCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  const accepted = localStorage.getItem('policysphere_cookies');
  if (!accepted && banner) setTimeout(() => banner.classList.add('visible'), 2000);

  document.getElementById('cookieAccept')?.addEventListener('click', () => {
    localStorage.setItem('policysphere_cookies', 'accepted');
    banner?.classList.remove('visible');
  });
  document.getElementById('cookieDecline')?.addEventListener('click', () => {
    localStorage.setItem('policysphere_cookies', 'declined');
    banner?.classList.remove('visible');
  });
}

// ============================================
// SETTINGS
// ============================================
function initSettings() {
  initToggles();
  initExport();
  loadSettings();
}

function loadSettings() {
  const darkMode = localStorage.getItem('policysphere_darkMode') === 'true';
  const autoSave = localStorage.getItem('policysphere_autoSave') === 'true';
  const notifications = localStorage.getItem('policysphere_notifications') !== 'false';

  document.getElementById('darkModeToggle')?.classList.toggle('active', darkMode);
  document.getElementById('autoSaveToggle')?.classList.toggle('active', autoSave);
  document.getElementById('notificationsToggle')?.classList.toggle('active', notifications);

  if (darkMode) document.body.classList.add('dark-mode');
}

function initToggles() {
  document.querySelectorAll('.toggle-switch').forEach(toggle => {
    toggle.addEventListener('click', async () => {
      const setting = toggle.dataset.setting;
      toggle.classList.toggle('active');
      const isActive = toggle.classList.contains('active');
      
      localStorage.setItem(`policysphere_${setting}`, isActive.toString());
      
      if (setting === 'darkMode') {
        document.body.classList.toggle('dark-mode', isActive);
      }
      
      if (Auth.isLoggedIn() && setting) {
        const settings = {};
        settings[setting] = isActive;
        try {
          await updateSettings(settings);
        } catch (err) {
          console.error('Failed to sync settings:', err);
        }
      }
    });
  });
}

async function updateSettings(settings) {
  const response = await fetch('/api/auth/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Auth.getToken()}`
    },
    body: JSON.stringify({ settings })
  });
  if (!response.ok) throw new Error('Failed to update settings');
  return response.json();
}

function initExport() {
  document.getElementById('exportCsvBtn')?.addEventListener('click', () => exportAnalyses('csv'));
  document.getElementById('exportJsonBtn')?.addEventListener('click', () => exportAnalyses('json'));
}

async function exportAnalyses(format) {
  if (!Auth.isLoggedIn()) {
    openModal(document.getElementById('loginModal'));
    return;
  }

  try {
    const response = await fetch(`/api/analyses/export?format=${format}`, {
      headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
    });

    if (!response.ok) throw new Error('Export failed');

    if (format === 'csv') {
      const blob = await response.blob();
      downloadBlob(blob, 'policy-analyses.csv', 'text/csv');
    } else {
      const json = await response.json();
      downloadBlob(new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' }), 'policy-analyses.json', 'application/json');
    }
  } catch (err) {
    alert('Export failed: ' + err.message);
  }
}

function downloadBlob(blob, filename, mimeType) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// UTILITIES
// ============================================
function shakeElement(el) {
  if (!el) return;
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake 0.5s ease';
  el.style.border = '1px solid var(--danger)';
  setTimeout(() => { el.style.border = ''; el.style.animation = ''; }, 1500);
}

const s = document.createElement('style');
s.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`;
document.head.appendChild(s);
