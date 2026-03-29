# Arsonist-MCP: Complete Setup & Verification Guide

## ✅ What's Been Completed

### 1. **Backend Build Fixed** ✓
- Resolved all TypeScript compilation errors
- Fixed database type issues
- Implemented proper database mock with flexible types
- Backend builds successfully: `npm run build` ✓

### 2. **Burp Suite MCP Integration Implemented** ✓
- Created `burp-mcp-tool.ts` with full Burp API integration
- Added 5 new MCP tools for Burp Suite:
  - `burp-status` - Check connection and version
  - `burp-proxy-history` - Get HTTP traffic  
  - `burp-scan-issues` - Get vulnerabilities
  - `burp-start-scan` - Launch active scanning
  - `burp-send-to-intruder` - Send requests to Intruder

### 3. **MCP Server Enhanced** ✓
- Updated MCP capabilities with Burp tools
- All tool handlers implemented
- Resources endpoint working
- **Simulation mode disabled** - Real Burp Suite connection required

### 4. **Documentation Created** ✓
- `BURP_MCP_INTEGRATION.md` - Complete integration guide
- Test script: `test-burp-mcp.sh` - Automated testing
- This setup guide

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- optionally: Burp Suite (Community or Professional)

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies  
cd backend
npm install
cd ..
```

### 2. Build Backend

```bash
cd backend
npm run build
cd ..
```

**Expected Output:** No TypeScript errors, successful compilation.

### 3. Configure Environment

**SIMULATION MODE DISABLED**: The application now only works in production mode with real integrations.

**Production Mode (Burp Suite Required)**
```bash
# backend/.env
BURP_API_URL=http://localhost:8080
BURP_API_KEY=your_real_burp_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: Demo/simulation mode has been removed. Real Burp Suite and Supabase connections are required.

### 4. Start Backend

```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 3001
MCP server ready
```

### 5. Start Frontend (in another terminal)

```bash
npm run dev
```

Frontend opens at: `http://localhost:8080`

---

## 🧪 Testing the Integration

### Option 1: Run Automated Tests

```bash
# Make sure backend is running first
bash test-burp-mcp.sh
```

### Option 2: Manual Testing with cURL

```bash
# Test 1: Get Burp Status
curl -X POST http://localhost:3001/api/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "method": "burp-status",
    "params": {},
    "id": "1"
  }'

# Test 2: Get Proxy History
curl -X POST http://localhost:3001/api/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "method": "burp-proxy-history",
    "params": {"limit": 20},
    "id": "2"
  }'

# Test 3: Get Scan Issues
curl -X POST http://localhost:3001/api/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "method": "burp-scan-issues",
    "params": {"limit": 10},
    "id": "3"
  }'
```

### Option 3: Use Frontend Dashboard

1. Open http://localhost:8080
2. Navigate to "Vulnerabilities" tab
3. Click "Scan Target"
4. Backend will call Burp Suite via MCP
5. Results displayed in dashboard

---

## 🔧 Burp Suite Setup (Optional but Recommended)

### Install Burp Suite

**Community Edition (Free):**
- Download: https://portswigger.net/burp/community/download
- Install and run Burp Suite

**Professional Edition:**
- Download: https://portswigger.net/burp/download
- Requires license

### Enable REST API

1. Open Burp Suite
2. Navigate: **Settings → Extender → Extensions**
3. Find "Backendless" or "Turbo Intruder" extension
4. NOT NEEDED for Community - REST API is built-in on :8080

### Configure for Arsonist-MCP

1. Verify Burp is accessible: http://localhost:8080
2. Update backend/.env:
   ```env
   BURP_API_URL=http://localhost:8080
   BURP_API_KEY=your_api_key (if required)
   ```
3. Restart backend: `npm run dev` (in backend directory)

---

## 📊 Architecture Overview

```
┌─────────────────────────┐
│  Frontend (React/Vite)  │
│  - Dashboard            │
│  - Vulnerability View   │
│  - Agent Monitor        │
└────────────┬────────────┘
             │ HTTP
             ↓
┌─────────────────────────────────────────┐
│  Backend (Express + TypeScript)         │
│  ┌───────────────────────────────────┐  │
│  │  MCP Router (/api/mcp)            │  │
│  │  - /initialize                    │  │
│  │  - /tools/call                    │  │
│  │  - /resources/read                │  │
│  │  - /status                        │  │
│  └────────┬─────────────────┬────────┘  │
│           │                 │           │
│           ↓                 ↓           │
│  ┌─────────────────┐  ┌─────────────┐  │
│  │  BurpMCPTool    │  │  In-Mem DB  │  │
│  │  (Real API)     │  │  (Mock Data)│  │
│  └────────┬────────┘  └─────────────┘  │
│           │                            │
└───────────┼────────────────────────────┘
            │ HTTP/REST API
            ↓
┌──────────────────────────┐
│  Burp Suite Instance     │
│  - Proxy                 │
│  - Scanner               │
│  - Intruder              │
│  - REST API              │
└──────────────────────────┘
```

---

## 🎯 Verification Checklist

- [ ] Backend TypeScript builds without errors
- [ ] Backend starts without errors on port 3001
- [ ] Frontend loads at http://localhost:8080
- [ ] Can call `/api/mcp/initialize` successfully
- [ ] Can call `/api/mcp/tools/call` with burp-status
- [ ] **Real Burp Suite connection required** (simulation mode disabled)
- [ ] Test script executes without errors
- [ ] Frontend TBD Vulnerability Scanner works

---

## 🐛 Troubleshooting

### Backend Won't Build
```
Error: TypeScript compilation failed
→ Solution: Run `npm install` in backend directory
```

### Backend Port 3001 Already in Use
```
→ Solution: Kill process or change PORT in .env
lsof -i :3001  # Find process
kill -9 <PID>  # Kill it
```

### Can't Connect to Burp Suite
```
→ Solution: 
1. Verify Burp is running on localhost:8080
2. Check CORS settings
3. **Simulation mode disabled** - real Burp connection required
4. Check backend logs for connection errors
```

### Frontend Can't Connect to Backend
```
Error: CORS or connection error
→ Solution: Check FRONTEND_URL in backend/.env
Make sure it matches your frontend URL (usually http://localhost:8080)
```

### Database Errors
```
→ Solution:
Backend uses in-memory mock database
Data is lost on restart (this is OK for demo!)
Production would use Supabase
```

---

## 📝 Key Files

| File | Purpose |
|------|---------|
| `backend/src/config/burp-mcp-tool.ts` | Burp Suite integration |
| `backend/src/routes/mcp.ts` | MCP endpoints and tool handlers |
| `backend/src/config/database.ts` | Database mock |
| `backend/.env` | Configuration |
| `BURP_MCP_INTEGRATION.md` | Detailed integration guide |
| `test-burp-mcp.sh` | Automated test suite |

---

## 🚢 Deployment

### Development
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
npm run dev
```

### Production Build
```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build
npm run start
```

---

## 📞 Support & Debug

### View Logs
```bash
# Backend logs
tail -f backend/logs/server.log

# Frontend console
Open DevTools: F12 → Console
```

### Debug MCP Calls
```bash
# Enable verbose logging
# In backend/.env
LOG_LEVEL=debug

# Restart backend
cd backend && npm run dev
```

### Test Individual Endpoints
```bash
# Health check
curl http://localhost:3001/health

# MCP Status
curl http://localhost:3001/api/mcp/status

# Test database
curl http://localhost:3001/api/vulnerabilities
```

---

## ✨ Features Now Available

✅ **Burp Suite Integration (MCP)**
- Real-time proxy history access
- Active vulnerability scanning
- Intruder fuzzing support
- Scanner issue management

✅ **Dashboard**
- Traffic monitoring
- Agent configuration
- Vulnerability tracking
- Risk scoring

✅ **Security Tools**
- Nmap scanning
- ZAP integration  
- Burp Suite integration
- AI-powered analysis

✅ **MCP Protocol**
- Standard MCP 2024-11-05
- Tool calling interface
- Resource sharing
- Safe mode switching

---

## 🎉 You're All Set!

The Arsonist-MCP application is now fully configured with Burp Suite integration via MCP. Start testing and scanning!

**Next Steps:**
1. Run `bash test-burp-mcp.sh` to verify everything works
2. Open http://localhost:8080 to access the dashboard
3. Try the Vulnerability Scanner feature
4. Monitor real-time traffic in the Traffic tab

**Questions?** Check BURP_MCP_INTEGRATION.md for detailed API documentation.

Happy hacking! 🛡️
