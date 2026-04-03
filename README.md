# PolicySphere AI 🌍

> **Autonomous Decision Engine for Policy Risk Analysis**

An intelligent platform that simulates economic impacts, evaluates risks, and provides data-driven recommendations for policy decisions using AI-powered analysis.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Core Capabilities
- **Policy Simulation Engine** - Model tax reforms, subsidies, and regulations across 8 economic sectors
- **Risk Assessment** - Calculate risk scores (0-100) with confidence levels
- **Economic Impact Analysis** - Project impacts on Inflation, Employment, GDP, and Fiscal Deficit

### Document Intelligence (NEW!)
- **Document Analysis** - Paste policy text or upload documents for AI analysis
- **URL Analysis** - Enter any policy URL for instant analysis
- **Simple Descriptions** - Get plain-language summaries of complex policies
- **Coverage Analysis** - See what the policy covers and what it doesn't
- **Q&A Feature** - Ask questions about any analyzed policy

### Additional Features
- **Scenario Comparison** - Compare up to 2 policy scenarios side-by-side
- **AI Insights** - Get AI-powered recommendations and risk alerts
- **Report History** - Save and export analysis reports (JSON/CSV)
- **User Authentication** - Secure JWT-based auth system
- **Dark Mode** - Toggle between light and dark themes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/PolicySphere-AI.git
cd PolicySphere-AI

# Backend setup
cd backend
npm install
npx prisma generate

# Frontend setup (new terminal)
cd ../frontend
npm install
```

### Running the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Server runs on http://localhost:3001

# Terminal 2 - Frontend
cd frontend
npm run dev
# App opens at http://localhost:5173
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access at http://localhost
```

## 📁 Project Structure

```
PolicySphere AI/
├── backend/
│   ├── __tests__/         # Test files
│   ├── engine/            # Policy analysis engine
│   │   ├── policyEngine.js       # Core analysis logic
│   │   └── documentAnalyzer.js   # Document/URL analysis
│   ├── prisma/            # Database schema
│   ├── server.js          # Express API server
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api.js         # API client
│   │   ├── main.js        # Main app logic
│   │   ├── charts.js      # Chart rendering
│   │   ├── gauge.js       # Risk gauge
│   │   └── report.js      # Report generation
│   ├── index.html         # Main HTML
│   ├── style.css         # Styles
│   └── package.json
├── docker-compose.yml
├── .github/workflows/ci.yml
└── README.md
```

## 🔌 API Endpoints

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/settings` | PUT | Update settings |

### Policy Analysis
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Run policy simulation |
| `/api/analyses` | GET | Get user's analyses |
| `/api/analyses/:id` | GET | Get specific analysis |
| `/api/analyses/export` | GET | Export analyses (CSV/JSON) |

### Document Intelligence (NEW!)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze/document` | POST | Analyze text or URL |
| `/api/analyze/ask` | POST | Ask question about policy |

### Utilities
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/options` | GET | Get policy types & sectors |
| `/api/ai-insights` | POST | Get AI insights |

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run with coverage
npm run test:coverage
```

## 🔐 Environment Variables

```env
# Backend (.env)
PORT=3001
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=info
```

## 🐳 Docker

```yaml
# docker-compose.yml includes:
- Backend (Node.js + Prisma + SQLite)
- Frontend (Nginx)
```

## 📊 Tech Stack

| Component | Technology |
|-----------|-------------|
| Backend | Node.js, Express.js |
| Database | SQLite + Prisma ORM |
| Auth | JWT, bcrypt |
| Frontend | Vanilla JS, Vite |
| Charts | Chart.js |
| Security | Helmet, express-rate-limit |
| Testing | Jest, Supertest |
| Container | Docker |

## 📈 Roadmap

- [ ] Email notifications (password reset, reports)
- [ ] Advanced policy rules engine
- [ ] Real-time collaboration
- [ ] Export to PDF
- [ ] Mobile app

## 📄 License

MIT License - feel free to use this project.

---

**Built with ❤️ for better policy decisions**