# Arsonist-MCP Backend

**Backend API for Arsonist-MCP AI - Autonomous Cybersecurity Command Center**

A comprehensive backend service that powers the Arsonist-MCP AI platform with real AI integrations, security tool connections, and MCP (Model Context Protocol) support.

## 🚀 Features

- **RESTful API**: Complete REST API for agents, vulnerabilities, and MCP communication
- **Real AI Integration**: Google AI, OpenAI, HuggingFace, and Ollama support
- **Burp Suite Integration**: Full integration with Burp Suite REST API (no simulation mode)
- **Database**: Supabase PostgreSQL database with real-time capabilities
- **WebSocket**: Real-time agent logs and status updates
- **MCP Server**: Full Model Context Protocol implementation
- **Authentication**: JWT-based user authentication
- **Security**: Rate limiting, CORS, input validation, and security headers

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Socket.IO
- **AI Services**: Google AI, OpenAI, HuggingFace, Ollama
- **Security Tools**: Burp Suite API, OWASP ZAP API, Nmap
- **Validation**: Zod
- **Authentication**: JWT + bcrypt
- **Logging**: Winston-style custom logger

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project
- API keys for desired AI services

### Setup

1. **Clone and navigate to backend**
   ```bash
   cd arsonist-mcp/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   Create the following tables in your Supabase project:

   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     password TEXT NOT NULL,
     name TEXT NOT NULL,
     role TEXT DEFAULT 'user',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Agents table
   CREATE TABLE agents (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     type TEXT NOT NULL,
     description TEXT NOT NULL,
     target TEXT,
     status TEXT DEFAULT 'idle',
     progress INTEGER DEFAULT 0,
     findings INTEGER DEFAULT 0,
     requests_sent INTEGER DEFAULT 0,
     started_at TIMESTAMP WITH TIME ZONE,
     last_action TEXT,
     prompt_template TEXT,
     safety_mode TEXT DEFAULT 'cautious',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Vulnerabilities table
   CREATE TABLE vulnerabilities (
     id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     severity TEXT NOT NULL,
     category TEXT NOT NULL,
     target TEXT NOT NULL,
     endpoint TEXT,
     method TEXT,
     description TEXT NOT NULL,
     evidence TEXT,
     remediation TEXT,
     found_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     agent_name TEXT,
     confirmed BOOLEAN DEFAULT FALSE,
     cvss DECIMAL(3,1) DEFAULT 5.0
   );

   -- Agent logs table
   CREATE TABLE agent_logs (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     agent_id TEXT REFERENCES agents(id),
     type TEXT NOT NULL,
     content TEXT NOT NULL,
     timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Traffic entries table
   CREATE TABLE traffic_entries (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     method TEXT NOT NULL,
     url TEXT NOT NULL,
     status_code INTEGER,
     response_time INTEGER,
     size INTEGER,
     source TEXT,
     flagged BOOLEAN DEFAULT FALSE
   );

   -- MCP sessions table
   CREATE TABLE mcp_sessions (
     id TEXT PRIMARY KEY,
     client_info JSONB,
     capabilities JSONB,
     status TEXT DEFAULT 'active',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Scans table
   CREATE TABLE scans (
     id TEXT PRIMARY KEY,
     target TEXT NOT NULL,
     tools TEXT NOT NULL,
     status TEXT DEFAULT 'running',
     results JSONB,
     started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     completed_at TIMESTAMP WITH TIME ZONE,
     agent_id TEXT REFERENCES agents(id)
   );
   ```

5. **Start the server**
   ```bash
   npm run dev  # Development with hot reload
   # or
   npm run build && npm start  # Production
   ```

## 🔧 Configuration

### Required Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication
JWT_SECRET=your_jwt_secret_key
BCRYPT_ROUNDS=12

# AI Services (configure as needed)
GOOGLE_AI_API_KEY=your_google_ai_api_key
OPENAI_API_KEY=your_openai_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
OLLAMA_BASE_URL=http://localhost:11434

# Security Tools (configure as needed)
BURP_API_URL=http://localhost:8080
BURP_API_KEY=your_burp_api_key
ZAP_API_URL=http://localhost:8090
ZAP_API_KEY=your_zap_api_key

# CORS
FRONTEND_URL=http://localhost:8080
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Agents
- `GET /api/agents` - List all agents
- `GET /api/agents/:id` - Get agent by ID
- `POST /api/agents` - Create new agent
- `PATCH /api/agents/:id` - Update agent
- `POST /api/agents/:id/start` - Start agent
- `POST /api/agents/:id/stop` - Stop agent
- `DELETE /api/agents/:id` - Delete agent

### Vulnerabilities
- `GET /api/vulnerabilities` - List vulnerabilities (with filtering)
- `GET /api/vulnerabilities/:id` - Get vulnerability by ID
- `POST /api/vulnerabilities` - Create vulnerability
- `PATCH /api/vulnerabilities/:id` - Update vulnerability
- `POST /api/vulnerabilities/scan` - Start vulnerability scan
- `GET /api/vulnerabilities/scan/:scanId` - Get scan results
- `DELETE /api/vulnerabilities/:id` - Delete vulnerability

### MCP (Model Context Protocol)
- `POST /api/mcp/initialize` - Initialize MCP session
- `POST /api/mcp/tools/call` - Call MCP tools
- `POST /api/mcp/resources/read` - Read MCP resources
- `GET /api/mcp/status` - Get MCP server status

## 🔌 WebSocket Events

The server provides real-time updates via Socket.IO:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

// Join agent room for real-time logs
socket.emit('join-agent-room', 'agent-123');

// Listen for agent updates
socket.on('agent-update', (data) => {
  console.log('Agent update:', data);
});

// Listen for new vulnerabilities
socket.on('vulnerability-found', (data) => {
  console.log('New vulnerability:', data);
});
```

## 🤖 AI Integration

The backend supports multiple AI providers:

### Google AI (Gemini)
```javascript
import { generateText } from './config/ai.js';
const response = await generateText('Analyze this security log...', 'google', { model: 'gemini-pro' });
```

### OpenAI (GPT)
```javascript
const response = await generateText('What vulnerabilities exist here?', 'openai', { model: 'gpt-4' });
```

### HuggingFace
```javascript
const response = await generateText('Security analysis prompt', 'huggingface', { model: 'microsoft/DialoGPT-medium' });
```

### Ollama (Local)
```javascript
const response = await generateText('Local AI analysis', 'ollama', { model: 'llama2' });
```

## 🔒 Security Tools Integration

### Burp Suite (Fully Implemented)
- Proxy history retrieval
- Active scanning
- Intruder automation
- Real-time integration with Burp Suite REST API

### OWASP ZAP (Not Implemented)
- Placeholder for future ZAP integration
- Currently throws "not implemented" errors

### Nmap (Not Implemented)
- Placeholder for future Nmap integration
- Currently throws "not implemented" errors

## 🧪 Testing

```bash
npm test
```

## 📝 Logging

Logs are written to `logs/server.log` with configurable levels:
- `error` - Errors only
- `warn` - Warnings and errors
- `info` - General information (default)
- `debug` - Detailed debugging

## 🚀 Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Railway/Render

1. Connect your repository
2. Set environment variables
3. Set build command: `npm run build`
4. Set start command: `npm start`

## 🤝 MCP Protocol

The server implements the Model Context Protocol for AI agent orchestration:

### Tools Available:
- `arsonist-scan`: Perform vulnerability scanning
- `arsonist-agent`: Deploy AI security agents
- `arsonist-analyze`: AI-powered security analysis

### Resources Available:
- `vulnerabilities`: Access vulnerability database
- `agents`: Access active agents
- `traffic`: Access traffic monitoring data

## 📈 Monitoring

- Health check endpoint: `GET /health`
- Request logging with response times
- Error tracking and reporting
- Rate limiting monitoring

## 🔐 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes per IP)
- CORS protection
- Helmet security headers
- Input validation with Zod
- SQL injection prevention
- XSS protection

## 🐛 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check Supabase credentials
   - Verify database tables exist
   - Check network connectivity

2. **AI Services Not Working**
   - Verify API keys are set
   - Check service quotas
   - Test API endpoints manually

3. **Security Tools Not Connecting**
   - Ensure tools are running locally
   - Check API endpoints and keys
   - Verify network access

## 📞 Support

For issues and questions:
- Check the logs in `logs/server.log`
- Verify environment configuration
- Test API endpoints with tools like Postman
- Review the health check endpoint

---

**Built for ethical cybersecurity research and testing** ⚡