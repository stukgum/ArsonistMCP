# Burp Suite MCP Integration Guide

## Overview
The Arsonist-MCP application now has full integration with Burp Suite through the Model Context Protocol (MCP). This allows you to control Burp Suite and access its data programmatically through the MCP API.

## Configuration

### 1. Environment Variables
Add the following to your `backend/.env` file:

```env
# Burp Suite Configuration
BURP_API_URL=http://localhost:8080
BURP_API_KEY=your_burp_api_key_here
```

### 2. Burp Suite Setup
1. Start Burp Suite (Community or Professional edition)
2. Go to **Settings → Network → Listeners** to configure the REST API
3. Ensure the REST API is enabled and running on the configured port (default: 8080)

## Available MCP Tools

### 1. `burp-proxy-history`
Retrieves HTTP request/response history from Burp Suite proxy.

**Parameters:**
- `limit` (optional): Maximum number of items to retrieve (default: 100)

**Example:**
```json
{
  "method": "burp-proxy-history",
  "params": { "limit": 50 },
  "id": "1"
}
```

**Response:**
```json
{
  "proxyHistory": [
    {
      "id": "1",
      "messageId": 1,
      "method": "GET",
      "url": "https://example.com/api/users",
      "statusCode": 200,
      "statusMessage": "OK",
      "requestLength": 512,
      "responseLength": 2048
    }
  ]
}
```

### 2. `burp-scan-issues`
Retrieves vulnerability findings from Burp Suite active scans.

**Parameters:**
- `limit` (optional): Maximum number of issues to retrieve (default: 50)

**Example:**
```json
{
  "method": "burp-scan-issues",
  "params": { "limit": 25 },
  "id": "2"
}
```

**Response:**
```json
{
  "scanIssues": [
    {
      "id": "1",
      "name": "SQL Injection",
      "severity": "critical",
      "confidence": "certain",
      "host": "example.com",
      "url": "https://example.com/api/users"
    }
  ]
}
```

### 3. `burp-start-scan`
Starts an active scan on a target URL.

**Parameters:**
- `baseUrl` (required): Base URL to scan
- `aggressiveness` (optional): Scan aggressiveness level - "passive", "cautious", or "aggressive" (default: "cautious")

**Example:**
```json
{
  "method": "burp-start-scan",
  "params": {
    "baseUrl": "https://example.com",
    "aggressiveness": "cautious"
  },
  "id": "3"
}
```

**Response:**
```json
{
  "scanId": "scan-1234567890",
  "status": "started"
}
```

### 4. `burp-send-to-intruder`
Sends an HTTP request to Burp Suite Intruder for fuzzing/attack.

**Parameters:**
- `url` (required): Request URL
- `method` (optional): HTTP method (default: "GET")
- `headers` (optional): HTTP headers object
- `body` (optional): Request body

**Example:**
```json
{
  "method": "burp-send-to-intruder",
  "params": {
    "url": "https://example.com/api/login",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": "{\"username\":\"admin\",\"password\":\"test\"}"
  },
  "id": "4"
}
```

**Response:**
```json
{
  "intruderId": "intruder-1234567890",
  "status": "sent"
}
```

### 5. `burp-status`
Gets Burp Suite connection status and version information.

**Example:**
```json
{
  "method": "burp-status",
  "params": {},
  "id": "5"
}
```

**Response:**
```json
{
  "status": {
    "suiteVersion": "2024.1",
    "juceVersion": "2024.1",
    "portscannerVersion": "2024.1",
    "requirementsVersion": "2024.1"
  }
}
```

## API Endpoints

### MCP Initialize
**POST** `/api/mcp/initialize`

Initialize MCP connection with Burp Suite support.

**Request Body:**
```json
{
  "protocolVersion": "2024-11-05",
  "capabilities": {
    "sampling": {},
    "tools": {},
    "resources": {}
  },
  "clientInfo": {
    "name": "Arsonist-MCP",
    "version": "1.0.0"
  }
}
```

### Tool Call
**POST** `/api/mcp/tools/call`

Execute an MCP tool call (including Burp Suite tools).

**Request Body:**
```json
{
  "method": "burp-proxy-history",
  "params": { "limit": 100 },
  "id": "tool-call-1"
}
```

### Resource Read
**POST** `/api/mcp/resources/read`

Read MCP resources including Burp-related data.

**Request Body:**
```json
{
  "uri": "vulnerabilities"
}
```

### MCP Status
**GET** `/api/mcp/status`

Get overall MCP server status and session information.

## Integration Workflow

1. **Initialize MCP Connection**
   ```
   POST /api/mcp/initialize
   ```

2. **Check Burp Status**
   ```
   POST /api/mcp/tools/call with method: "burp-status"
   ```

3. **Retrieve Proxy History** (for analyzing traffic)
   ```
   POST /api/mcp/tools/call with method: "burp-proxy-history"
   ```

4. **Start Active Scan** (for vulnerability scanning)
   ```
   POST /api/mcp/tools/call with method: "burp-start-scan"
   ```

5. **Get Scan Results** (after scan completes)
   ```
   POST /api/mcp/tools/call with method: "burp-scan-issues"
   ```

6. **Send to Intruder** (for targeted attacks)
   ```
   POST /api/mcp/tools/call with method: "burp-send-to-intruder"
   ```

## Error Handling

**SIMULATION MODE DISABLED**: The application no longer falls back to simulated data. All Burp Suite operations require a live connection. In production:

- Ensure Burp Suite is running and the REST API is enabled
- Configure proper `BURP_API_URL` and `BURP_API_KEY`
- Monitor logs for connection errors: `./logs/server.log`
- The server will start but Burp features will be unavailable if connection fails

## Testing

### Using cURL

```bash
# Test Burp proxy history
curl -X POST http://localhost:3001/api/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "method": "burp-proxy-history",
    "params": { "limit": 50 },
    "id": "1"
  }'

# Test Burp scan issues
curl -X POST http://localhost:3001/api/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "method": "burp-scan-issues",
    "params": { "limit": 25 },
    "id": "2"
  }'
```

### Using the Web Interface

The frontend dashboard includes:
- **Vulnerability Scanner**: Uses Burp Suite when available
- **Traffic Monitor**: Displays data from Burp proxy history
- **Agents**: Can trigger Burp scans automatically

## Architecture

```
┌─────────────────────────────────────────┐
│   Arsonist-MCP Frontend (React)        │
└────────────┬────────────────────────────┘
             │ HTTP/REST
             ↓
┌─────────────────────────────────────────┐
│  Express Backend with MCP Router        │
│  ┌───────────────────────────────────┐  │
│  │  MCP Tool Handlers                │  │
│  │  - burp-proxy-history             │  │
│  │  - burp-scan-issues               │  │
│  │  - burp-start-scan                │  │
│  │  - burp-send-to-intruder          │  │
│  │  - burp-status                    │  │
│  └────────┬────────────────────────┬─┘  │
│           │                        │     │
│           ↓                        ↓     │
│  ┌────────────────┐     ┌──────────────┐
│  │ BurpMCPTool    │     │ Supabase DB  │
│  │ (HTTP Client)  │     │ (Production) │
│  └────────┬───────┘     └──────────────┘
│           │
└───────────┼───────────────────────────────┘
            │ HTTP/REST API
            ↓
┌─────────────────────────────────────────┐
│   Burp Suite Instance                   │
│   - Proxy                               │
│   - Scanner                             │
│   - Intruder                            │
│   - REST API (Extender)                 │
└─────────────────────────────────────────┘
```

## Troubleshooting

### Burp Suite Not Connecting
1. Verify Burp Suite is running on the configured port
2. Check REST API is enabled in Burp settings
3. Review logs: `backend/logs/server.log`
4. **Note**: Simulation mode has been disabled - real Burp Suite connection is required

### Plugin Issues
1. Ensure Burp Suite Professional or Community edition is installed
2. Verify the REST API extension is installed and enabled
3. Check network connectivity between backend and Burp Suite

### Performance Issues
1. Limit the number of items retrieved (use `limit` parameter)
2. Reduce scan aggressiveness for large targets
3. Monitor backend memory usage for large proxy histories

## Security Considerations

1. **API Key**: Keep `BURP_API_KEY` secure and never commit to version control
2. **Network**: Ensure Burp Suite runs on a secure network (not exposed to the internet)
3. **Authentication**: Implement proper authentication for the MCP endpoints
4. **CORS**: Configure CORS restrictions in `FRONTEND_URL` environment variable
5. **Rate Limiting**: The API includes rate limiting configured via environment variables

## Support

For issues or questions about the Burp Suite integration:
- Check the logs: `backend/logs/server.log`
- Verify Burp Suite configuration and REST API settings
- Review this documentation for proper parameter usage
- Test individual endpoints using cURL or Postman
