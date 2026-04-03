// ============================================
// PolicySphere AI — Environment & Config
// ============================================

export const config = {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // OpenAI (REQUIRED)
  openaiApiKey: process.env.OPENAI_API_KEY,
  
  // Email (Optional)
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT || 587,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
};

export function validateEnvironment() {
  const required = [];
  const missing = [];
  
  // Required for production
  if (!config.jwtSecret) {
    required.push('JWT_SECRET');
  }
  
  if (!config.openaiApiKey) {
    required.push('OPENAI_API_KEY');
  }
  
  if (!config.supabaseUrl) {
    required.push('SUPABASE_URL');
  }
  
  if (!config.supabaseAnonKey) {
    required.push('SUPABASE_ANON_KEY');
  }
  
  if (required.length > 0) {
    console.error('❌ Missing required environment variables:');
    required.forEach(v => console.error(`   - ${v}`));
    process.exit(1);
  }
  
  console.log('✅ All required environment variables configured');
}

export function isProduction() {
  return config.nodeEnv === 'production';
}

export function isDevelopment() {
  return config.nodeEnv === 'development';
}