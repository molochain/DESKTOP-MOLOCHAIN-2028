#!/bin/bash

echo "===================================================="
echo "🧠  RAYANAVA SYSTEM DIAGNOSTIC TOOL v1.0"
echo "===================================================="

echo ""
echo "📌 Checking Node.js version..."
node -v || echo "❌ Node not found"

echo ""
echo "📌 Checking NPM version..."
npm -v || echo "❌ NPM not found"

echo ""
echo "📌 Checking package.json..."
if [ -f package.json ]; then
    echo "✔ package.json exists"
else
    echo "❌ package.json missing"
fi

echo ""
echo "📌 Checking backend server..."
if [ -f server/index.ts ] || [ -f server/index.js ]; then
    echo "✔ Backend entry file found"
else
    echo "❌ No backend entry file"
fi

echo ""
echo "📌 Checking frontend (client) directory..."
if [ -d client ]; then
    echo "✔ Client folder exists"
else
    echo "❌ Client directory missing"
fi

echo ""
echo "📌 Checking for .env file..."
if [ -f .env ]; then
    echo "✔ .env file exists"
else
    echo "⚠ .env missing — using defaults"
fi

echo ""
echo "📌 Checking running processes (node)..."
ps aux | grep node | grep -v grep || echo "⚠ No backend process running"

echo ""
echo "📌 Testing API connectivity..."

API_URL="http://localhost:5000/api/health"

# Curl → ذخیره بدنه + گرفتن status code
HTTP_STATUS=$(curl -s -o /tmp/rayanava_health.json -w "%{http_code}" "$API_URL" || echo "000")

if [ "$HTTP_STATUS" != "200" ]; then
  echo "❌ API health endpoint is down (HTTP $HTTP_STATUS)"
else
  BODY=$(cat /tmp/rayanava_health.json)

  if echo "$BODY" | grep -q '"status"[[:space:]]*:[[:space:]]*"healthy"'; then
    echo "✔ API health endpoint is UP"
  else
    echo "⚠ API responded but status is not 'healthy'"
    echo "   Response: $BODY"
  fi
fi

rm -f /tmp/rayanava_health.json


echo ""
echo "===================================================="
echo "🟩 SYSTEM CHECK COMPLETE"
echo "===================================================="


