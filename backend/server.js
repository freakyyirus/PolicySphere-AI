import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import winston from 'winston';
import { validateEnvironment } from './config/index.js';
import { signUp, signIn, authMiddleware, supabase } from './middleware/auth.js';
import { generatePolicyAnalysis, analyzeDocumentWithAI, answerPolicyQuestion, generateAIInsights } from './services/openaiService.js';
import { POLICY_TEMPLATES } from './engine/policyTemplates.js';

// Validate environment on startup
validateEnvironment();

const isDemoMode = process.env.OPENAI_API_KEY?.includes('placeholder') || 
                   process.env.SUPABASE_URL?.includes('placeholder');

if (isDemoMode) {
  console.log('⚠️  PolicySphere AI running in DEMO MODE (Local Mock Data)');
}

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'policysphere-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      )
    })
  ]
});

logger.info('PolicySphere AI starting...');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
    }
  }
}));

app.use(cors({ 
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info(`${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${Date.now() - start}ms`
    });
  });
  next();
});

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

// Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PolicySphere AI API',
      version: '1.0.0',
      description: 'Production API for PolicySphere AI - AI-Powered Policy Risk Analysis',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: []
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    let authStatus = 'ready';
    if (!isDemoMode) {
      const { data: { user } } = await supabase.auth.getUser();
      authStatus = user ? 'connected' : 'ready';
    }
    
    res.json({
      status: 'ok',
      mode: isDemoMode ? 'demo' : 'production',
      service: 'PolicySphere AI',
      version: '1.1.0',
      uptime: process.uptime(),
      database: isDemoMode ? 'mock-sqlite' : 'supabase',
      auth: authStatus,
      ai: isDemoMode ? 'rule-engine-v1' : 'openai-gpt4'
    });
  } catch (err) {
    logger.error('Health check failed', { error: err.message });
    res.status(200).json({ 
      status: 'ok', 
      mode: 'demo-fallback',
      message: 'Service operational in fallback mode' 
    });
  }
});

// Options
app.get('/api/options', (req, res) => {
  const POLICY_LABELS = { tax: 'Tax Reform', subsidy: 'Subsidy', regulation: 'Regulation' };
  const SECTOR_LABELS = {
    fuel: 'Fuel & Energy', healthcare: 'Healthcare', education: 'Education',
    agriculture: 'Agriculture', technology: 'Technology', manufacturing: 'Manufacturing',
    finance: 'Finance', energy: 'Energy'
  };
  
  res.json({
    policyTypes: Object.entries(POLICY_LABELS).map(([value, label]) => ({ value, label })),
    sectors: Object.entries(SECTOR_LABELS).map(([value, label]) => ({ value, label })),
    magnitudeRange: { min: 1, max: 25 },
    durations: ['short', 'long']
  });
});

// Auth Routes
app.post('/api/auth/register',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('username').isLength({ min: 2, max: 30 }).withMessage('Username must be 2-30 characters')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { email, password, username } = req.body;
      
      if (isDemoMode) {
        return res.status(201).json({
          token: 'demo-jwt-token-session-123',
          user: { id: 'demo-user-id', email, username }
        });
      }

      const data = await signUp(email, password, username);
      res.status(201).json({
        token: data.session?.access_token,
        user: { id: data.user?.id, email, username }
      });
    } catch (err) {
      logger.error('Registration failed', { error: err.message });
      res.status(400).json({ error: err.message });
    }
  }
);

app.post('/api/auth/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const data = await signIn(email, password);
      
      logger.info('User logged in', { userId: data.user?.id });
      
      res.json({
        token: data.session?.access_token,
        user: { 
          id: data.user?.id, 
          email: data.user?.email,
          username: data.user?.user_metadata?.username
        }
      });
    } catch (err) {
      logger.error('Login failed', { error: err.message });
      res.status(401).json({ error: 'Invalid credentials' });
    }
  }
);

app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  try {
    await supabase.auth.signOut();
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

app.put('/api/auth/settings', authMiddleware, async (req, res) => {
  try {
    const { settings } = req.body;
    await supabase
      .from('profiles')
      .update({ settings, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);
    
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Policy Analysis with AI
app.post('/api/analyze', authMiddleware, async (req, res) => {
  try {
    const { policyType, sector, magnitude, duration, title } = req.body;
    
    if (!policyType || !sector || magnitude == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Use OpenAI for analysis
    const aiResult = await generatePolicyAnalysis(policyType, sector, magnitude, duration || 'short');
    
    // Save to database
    const { data: analysis, error } = await supabase
      .from('analyses')
      .insert({
        user_id: req.user.id,
        title: title || `${policyType} - ${sector}`,
        policy_type: policyType,
        sector,
        magnitude,
        duration: duration || 'short',
        impacts: aiResult.impacts,
        risk_score: aiResult.riskScore,
        decision: aiResult.decision,
        explanation: aiResult.summary,
        policy_label: aiResult.decision?.label || policyType,
        sector_label: sector
      })
      .select()
      .single();
    
    if (error) throw error;
    
    logger.info('Analysis complete', { userId: req.user.id, riskScore: aiResult.riskScore });
    
    res.json({ 
      success: true, 
      data: { 
        ...analysis, 
        impacts: aiResult.impacts, 
        decision: aiResult.decision,
        keyFactors: aiResult.keyFactors
      } 
    });
  } catch (err) {
    logger.error('Analysis failed', { error: err.message });
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

// Document Analysis with AI
app.post('/api/analyze/document', authMiddleware, async (req, res) => {
  try {
    const { content, url } = req.body;
    
    if (!content && !url) {
      return res.status(400).json({ error: 'Content or URL required' });
    }
    
    let documentContent = content;
    if (url) {
      const { fetchURLContent } = await import('./engine/documentAnalyzer.js');
      documentContent = await fetchURLContent(url);
    }
    
    const aiResult = await analyzeDocumentWithAI(documentContent);
    
    // Run policy analysis
    const analysisResult = await generatePolicyAnalysis(
      aiResult.detectedPolicyType,
      aiResult.detectedSector,
      aiResult.estimatedMagnitude,
      'short'
    );
    
    const { data: analysis } = await supabase
      .from('analyses')
      .insert({
        user_id: req.user.id,
        title: `Document Analysis - ${new Date().toLocaleDateString()}`,
        policy_type: aiResult.detectedPolicyType,
        sector: aiResult.detectedSector,
        magnitude: aiResult.estimatedMagnitude,
        duration: 'short',
        impacts: analysisResult.impacts,
        risk_score: analysisResult.riskScore,
        decision: analysisResult.decision,
        explanation: aiResult.summary
      })
      .select()
      .single();
    
    res.json({
      success: true,
      data: {
        analysisId: analysis.id,
        ...aiResult,
        riskScore: analysisResult.riskScore,
        decision: analysisResult.decision,
        impacts: analysisResult.impacts
      }
    });
  } catch (err) {
    logger.error('Document analysis failed', { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// Q&A with AI
app.post('/api/analyze/ask', authMiddleware, async (req, res) => {
  try {
    const { question, analysisId } = req.body;
    
    if (!question || question.length < 3) {
      return res.status(400).json({ error: 'Question too short' });
    }
    
    let policyContext = '';
    let analysisData = null;
    
    if (analysisId) {
      const { data: analysis } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', analysisId)
        .eq('user_id', req.user.id)
        .single();
      
      if (analysis) {
        policyContext = `${analysis.policy_type} policy for ${analysis.sector} sector at ${analysis.magnitude}% magnitude`;
        analysisData = {
          riskScore: analysis.risk_score,
          policyType: analysis.policy_type,
          sector: analysis.sector,
          impacts: analysis.impacts
        };
      }
    }
    
    const answer = await answerPolicyQuestion(question, policyContext, analysisData);
    
    res.json({
      success: true,
      data: { question, answer }
    });
  } catch (err) {
    logger.error('Q&A failed', { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// AI Insights
app.post('/api/ai-insights', authMiddleware, async (req, res) => {
  try {
    const { policyType, sector, magnitude, duration } = req.body;
    
    const analysisResult = await generatePolicyAnalysis(policyType, sector, magnitude, duration || 'short');
    const insights = await generateAIInsights(policyType, sector, magnitude, analysisResult.impacts, analysisResult.riskScore);
    
    res.json({ insights });
  } catch (err) {
    logger.error('Insights failed', { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// Templates
app.get('/api/templates', (req, res) => {
  const { category, search } = req.query;
  let templates = POLICY_TEMPLATES;
  
  if (category) {
    templates = templates.filter(t => t.tags.includes(category));
  }
  if (search) {
    const q = search.toLowerCase();
    templates = templates.filter(t => 
      t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }
  
  res.json({ success: true, data: templates, count: templates.length });
});

app.get('/api/templates/:id', (req, res) => {
  const template = POLICY_TEMPLATES.find(t => t.id === req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  res.json({ success: true, data: template });
});

// User Analyses
app.get('/api/analyses', authMiddleware, async (req, res) => {
  try {
    const { search, policyType, sector, sort } = req.query;
    
    let query = supabase
      .from('analyses')
      .select('*')
      .eq('user_id', req.user.id);
    
    if (search) query = query.ilike('title', `%${search}%`);
    if (policyType) query = query.eq('policy_type', policyType);
    if (sector) query = query.eq('sector', sector);
    
    query = query.order(sort || 'analyzed_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json({ success: true, data: data || [], count: data?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

app.get('/api/analyses/:id', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();
  
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true, data });
});

app.delete('/api/analyses/:id', authMiddleware, async (req, res) => {
  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);
  
  if (error) return res.status(500).json({ error: 'Delete failed' });
  res.json({ success: true, message: 'Deleted' });
});

// Analytics
app.get('/api/analytics', authMiddleware, async (req, res) => {
  try {
    const { data: analyses } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', req.user.id);
    
    const riskDistribution = { low: 0, moderate: 0, high: 0 };
    const sectorBreakdown = {};
    let totalRisk = 0;
    
    for (const a of analyses || []) {
      if (a.risk_score <= 35) riskDistribution.low++;
      else if (a.risk_score <= 65) riskDistribution.moderate++;
      else riskDistribution.high++;
      sectorBreakdown[a.sector] = (sectorBreakdown[a.sector] || 0) + 1;
      totalRisk += a.risk_score;
    }
    
    res.json({
      success: true,
      data: {
        totalAnalyses: analyses?.length || 0,
        riskDistribution,
        sectorBreakdown,
        avgRiskScore: analyses?.length ? Math.round(totalRisk / analyses.length) : 0,
        recentTrend: (analyses || []).slice(0, 10)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Analytics failed' });
  }
});

// Export
app.get('/api/analyses/export', authMiddleware, async (req, res) => {
  const { data: analyses } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', req.user.id)
    .order('analyzed_at', { ascending: false });
  
  const format = req.query.format || 'json';
  
  if (format === 'csv') {
    const headers = ['Title', 'Type', 'Sector', 'Magnitude', 'Risk', 'Date'];
    const rows = (analyses || []).map(a => [
      `"${a.title}"`, a.policy_type, a.sector, a.magnitude, a.risk_score, new Date(a.analyzed_at).toISOString()
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=analyses.csv');
    return res.send(csv);
  }
  
  res.json({ success: true, data: analyses || [], count: analyses?.length || 0 });
});

// Start Server
const server = app.listen(PORT, () => {
  logger.info(`
╔═══════════════════════════════════════════════════╗
║     PolicySphere AI - Production                 ║
╠═══════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                 ║
║  API Docs: http://localhost:${PORT}/api-docs      ║
║  Auth: Supabase                                 ║
║  AI: OpenAI GPT-4                               ║
╚═══════════════════════════════════════════════════╝
  `);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down...');
  server.close(() => process.exit(0));
});

export default app;