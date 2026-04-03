# Supabase Configuration for PolicySphere AI

## Setup Instructions

### 1. Create Supabase Project
1. Go to https://supabase.com and create a new project
2. Note your `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### 2. Environment Variables
Create `.env` in backend folder:
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# JWT (keep existing)
JWT_SECRET=your_jwt_secret
```

### 3. Database Schema
Run this in Supabase SQL Editor:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policy analyses
CREATE TABLE public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  policy_type TEXT NOT NULL,
  sector TEXT NOT NULL,
  magnitude INTEGER NOT NULL,
  duration TEXT NOT NULL,
  impacts JSONB NOT NULL,
  risk_score INTEGER NOT NULL,
  decision JSONB NOT NULL,
  explanation TEXT,
  policy_label TEXT,
  sector_label TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profiles" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own analyses" ON public.analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON public.analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON public.analyses
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Storage (Optional)
Create a bucket for storing policy documents:
- Go to Storage in Supabase dashboard
- Create new bucket called `policy-docs`
- Add policies for authenticated users

---

## Supabase Client Usage

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Auth
const { user, session } = await supabase.auth.signUp({ email, password })
const { user, session } = await supabase.auth.signInWithPassword({ email, password })
await supabase.auth.signOut()

// Database
const { data } = await supabase.from('analyses').select('*')
```

---

## Environment Setup Complete ✅