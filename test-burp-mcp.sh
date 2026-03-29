#!/bin/bash
# Test script for Arsonist-MCP Burp Suite Integration
# Usage: bash test-burp-mcp.sh

API_URL="http://localhost:3001/api/mcp"
echo "🧪 Testing Arsonist-MCP Burp Suite Integration"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print test result
test_endpoint() {
    local name=$1
    local method=$2
    local data=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s -X POST "$API_URL/tools/call" \
        -H "Content-Type: application/json" \
        -d "{\"method\":\"$method\",\"params\":$data,\"id\":\"test-1\"}")
    
    if echo "$response" | grep -q "error"; then
        echo -e "${RED}❌ FAILED${NC}"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    else
        echo -e "${GREEN}✅ SUCCESS${NC}"
        echo "$response" | jq '.result' 2>/dev/null || echo "$response"
    fi
    echo ""
}

# Test 1: Initialize MCP Connection
echo -e "${YELLOW}1. Testing MCP Initialization${NC}"
init_response=$(curl -s -X POST "$API_URL/initialize" \
    -H "Content-Type: application/json" \
    -d '{
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
    }')

if echo "$init_response" | grep -q "Arsonist-MCP"; then
    echo -e "${GREEN}✅ MCP initialized successfully${NC}"
else
    echo -e "${RED}❌ MCP initialization failed${NC}"
fi
echo ""

# Test 2: Burp Status
echo -e "${YELLOW}2. Testing Burp Suite Status${NC}"
test_endpoint "burp-status" "burp-status" "{}"

# Test 3: Burp Proxy History
echo -e "${YELLOW}3. Testing Burp Proxy History${NC}"
test_endpoint "burp-proxy-history" "burp-proxy-history" "{\"limit\": 10}"

# Test 4: Burp Scan Issues
echo -e "${YELLOW}4. Testing Burp Scan Issues${NC}"
test_endpoint "burp-scan-issues" "burp-scan-issues" "{\"limit\": 10}"

# Test 5: Start Burp Scan
echo -e "${YELLOW}5. Testing Start Burp Scan${NC}"
test_endpoint "burp-start-scan" "burp-start-scan" "{\"baseUrl\":\"https://example.com\",\"aggressiveness\":\"cautious\"}"

# Test 6: Send to Intruder
echo -e "${YELLOW}6. Testing Send to Intruder${NC}"
test_endpoint "burp-send-to-intruder" "burp-send-to-intruder" "{\"url\":\"https://example.com/api/login\",\"method\":\"POST\"}"

# Test 7: Return MCP Resources
echo -e "${YELLOW}7. Testing MCP Resource Read (Vulnerabilities)${NC}"
resources_response=$(curl -s -X POST "$API_URL/resources/read" \
    -H "Content-Type: application/json" \
    -d '{"uri": "vulnerabilities"}')

if echo "$resources_response" | grep -q "vulnerabilities"; then
    echo -e "${GREEN}✅ Vulnerability resources retrieved${NC}"
else
    echo -e "${RED}❌ Failed to retrieve vulnerability resources${NC}"
fi
echo ""

# Test 8: Get MCP Status
echo -e "${YELLOW}8. Testing MCP Server Status${NC}"
status_response=$(curl -s -X GET "$API_URL/status")

if echo "$status_response" | grep -q "active"; then
    echo -e "${GREEN}✅ MCP server is active${NC}"
else
    echo -e "${RED}❌ MCP server status check failed${NC}"
fi
echo ""

echo "=================================================="
echo -e "${GREEN}🎉 Burp Suite MCP Integration Tests Complete!${NC}"
echo ""
echo "📝 Notes:"
echo "- Simulation mode has been disabled - real Burp Suite connection required"
echo "- Ensure Burp Suite is running with REST API enabled on http://localhost:8080"
echo "- Ensure backend is running on http://localhost:3001"
echo "- Check backend logs at: backend/logs/server.log"
echo ""
