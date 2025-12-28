#!/bin/bash

# Production Page Testing Script
# Tests all pages across all Molochain subdomains

PRODUCTION_URL="https://molochain.com"
ADMIN_URL="https://admin.molochain.com"
AUTH_URL="https://auth.molochain.com"
MOLOLINK_URL="https://mololink.molochain.com"

PASSED=0
FAILED=0
TOTAL=0

# Results file
RESULTS_FILE="test-results/production-test-results.txt"
mkdir -p test-results
echo "Production Page Test Results - $(date)" > $RESULTS_FILE
echo "========================================" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

WARNINGS=0
REDIRECTS=0

test_page() {
    local url=$1
    local name=$2
    local priority=$3
    
    TOTAL=$((TOTAL + 1))
    
    response=$(curl -sL -o /dev/null -w "%{http_code}|%{url_effective}" --max-time 30 "$url")
    http_code=$(echo "$response" | cut -d'|' -f1)
    final_url=$(echo "$response" | cut -d'|' -f2)
    
    redirected_to_login=false
    if echo "$final_url" | grep -q "/login"; then
        redirected_to_login=true
    fi
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        if [ "$redirected_to_login" = true ]; then
            echo "↪️  [$priority] $name - $url -> login (requires auth)"
            echo "REDIRECT [$priority] $name - $url -> $final_url (requires auth)" >> $RESULTS_FILE
            REDIRECTS=$((REDIRECTS + 1))
        else
            echo "✅ [$priority] $name - $url (HTTP $http_code)"
            echo "PASS [$priority] $name - $url (HTTP $http_code)" >> $RESULTS_FILE
            PASSED=$((PASSED + 1))
        fi
    elif [ "$http_code" -ge 300 ] && [ "$http_code" -lt 400 ]; then
        echo "↪️  [$priority] $name - $url (HTTP $http_code - Redirect to $final_url)"
        echo "REDIRECT [$priority] $name - $url (HTTP $http_code) -> $final_url" >> $RESULTS_FILE
        REDIRECTS=$((REDIRECTS + 1))
    elif [ "$http_code" -ge 400 ] && [ "$http_code" -lt 500 ]; then
        echo "⚠️  [$priority] $name - $url (HTTP $http_code - Client Error)"
        echo "WARN [$priority] $name - $url (HTTP $http_code - Client Error)" >> $RESULTS_FILE
        WARNINGS=$((WARNINGS + 1))
    else
        echo "❌ [$priority] $name - $url (HTTP $http_code - Server Error)"
        echo "FAIL [$priority] $name - $url (HTTP $http_code)" >> $RESULTS_FILE
        FAILED=$((FAILED + 1))
    fi
}

echo ""
echo "🔍 Testing molochain.com - Public Pages"
echo "========================================"
echo "" >> $RESULTS_FILE
echo "molochain.com - Public Pages" >> $RESULTS_FILE
echo "----------------------------" >> $RESULTS_FILE

# CRITICAL Pages
test_page "$PRODUCTION_URL/" "Homepage" "CRITICAL"
test_page "$PRODUCTION_URL/services" "Services" "CRITICAL"

# HIGH Priority Pages
test_page "$PRODUCTION_URL/about" "About" "HIGH"
test_page "$PRODUCTION_URL/contact" "Contact" "HIGH"
test_page "$PRODUCTION_URL/quote" "Quote" "HIGH"
test_page "$PRODUCTION_URL/careers" "Careers" "HIGH"
test_page "$PRODUCTION_URL/partners" "Partners" "HIGH"
test_page "$PRODUCTION_URL/projects" "Projects" "HIGH"
test_page "$PRODUCTION_URL/commodities" "Commodities" "HIGH"
test_page "$PRODUCTION_URL/tracking" "Tracking" "HIGH"

# MEDIUM Priority Pages
test_page "$PRODUCTION_URL/blog" "Blog" "MEDIUM"
test_page "$PRODUCTION_URL/faq" "FAQ" "MEDIUM"
test_page "$PRODUCTION_URL/team" "Team" "MEDIUM"
test_page "$PRODUCTION_URL/terms" "Terms" "MEDIUM"
test_page "$PRODUCTION_URL/privacy" "Privacy" "MEDIUM"
test_page "$PRODUCTION_URL/guides" "Guides" "MEDIUM"
test_page "$PRODUCTION_URL/tracking-demo" "Tracking Demo" "MEDIUM"
test_page "$PRODUCTION_URL/shipment-tracking" "Shipment Tracking" "MEDIUM"
test_page "$PRODUCTION_URL/supply-chain-heatmap" "Supply Chain Heatmap" "MEDIUM"
test_page "$PRODUCTION_URL/carbon-footprint" "Carbon Footprint" "MEDIUM"
test_page "$PRODUCTION_URL/services-hub" "Services Hub" "MEDIUM"
test_page "$PRODUCTION_URL/service-recommender" "Service Recommender" "MEDIUM"

# LOW Priority Pages
test_page "$PRODUCTION_URL/collaboration-demo" "Collaboration Demo" "LOW"
test_page "$PRODUCTION_URL/document-processing" "Document Processing" "LOW"
test_page "$PRODUCTION_URL/latest-projects" "Latest Projects" "LOW"
test_page "$PRODUCTION_URL/tools" "Tools" "LOW"
test_page "$PRODUCTION_URL/commodity-tags" "Commodity Tags" "LOW"
test_page "$PRODUCTION_URL/success" "Success" "LOW"
test_page "$PRODUCTION_URL/smart-dashboard" "Smart Dashboard" "LOW"
test_page "$PRODUCTION_URL/developer-help" "Developer Help" "LOW"
test_page "$PRODUCTION_URL/sdk-libraries" "SDK Libraries" "LOW"
test_page "$PRODUCTION_URL/websocket-guide" "WebSocket Guide" "LOW"
test_page "$PRODUCTION_URL/api-documentation" "API Documentation" "LOW"
test_page "$PRODUCTION_URL/guide-integration" "Guide Integration" "LOW"
test_page "$PRODUCTION_URL/ai-assistant" "AI Assistant" "LOW"
test_page "$PRODUCTION_URL/ai" "AI Hub" "LOW"
test_page "$PRODUCTION_URL/ai/rayanava" "Rayanava AI" "LOW"
test_page "$PRODUCTION_URL/ai/rayanava-enhanced" "Rayanava Enhanced" "LOW"
test_page "$PRODUCTION_URL/authentication-guide" "Authentication Guide" "LOW"
test_page "$PRODUCTION_URL/mololink" "Mololink Main" "LOW"
test_page "$PRODUCTION_URL/mololink/companies" "Mololink Companies" "LOW"
test_page "$PRODUCTION_URL/mololink/jobs" "Mololink Jobs" "LOW"
test_page "$PRODUCTION_URL/mololink/search" "Mololink Search" "LOW"

# Brandbook Pages
test_page "$PRODUCTION_URL/brandbook" "Brandbook Home" "LOW"
test_page "$PRODUCTION_URL/brandbook/colors" "Brand Colors" "LOW"
test_page "$PRODUCTION_URL/brandbook/typography" "Brand Typography" "LOW"
test_page "$PRODUCTION_URL/brandbook/logos" "Brand Logos" "LOW"
test_page "$PRODUCTION_URL/brandbook/components" "Brand Components" "LOW"
test_page "$PRODUCTION_URL/brandbook/tokens" "Design Tokens" "LOW"
test_page "$PRODUCTION_URL/brandbook/guidelines" "Brand Guidelines" "LOW"

echo ""
echo "🔍 Testing auth.molochain.com - Auth Pages"
echo "=========================================="
echo "" >> $RESULTS_FILE
echo "auth.molochain.com - Auth Pages" >> $RESULTS_FILE
echo "--------------------------------" >> $RESULTS_FILE

test_page "$AUTH_URL/login" "Login" "CRITICAL"
test_page "$AUTH_URL/register" "Register" "CRITICAL"
test_page "$AUTH_URL/forgot-password" "Forgot Password" "MEDIUM"

echo ""
echo "🔍 Testing admin.molochain.com - Admin Pages"
echo "============================================="
echo "" >> $RESULTS_FILE
echo "admin.molochain.com - Admin Pages" >> $RESULTS_FILE
echo "----------------------------------" >> $RESULTS_FILE

test_page "$ADMIN_URL/" "Admin Landing" "CRITICAL"

echo ""
echo "🔍 Testing mololink.molochain.com - Mololink Pages"
echo "==================================================="
echo "" >> $RESULTS_FILE
echo "mololink.molochain.com - Mololink Pages" >> $RESULTS_FILE
echo "----------------------------------------" >> $RESULTS_FILE

test_page "$MOLOLINK_URL/" "Mololink Home" "CRITICAL"
test_page "$MOLOLINK_URL/solutions" "Solutions" "CRITICAL"
test_page "$MOLOLINK_URL/resources" "Resources" "HIGH"
test_page "$MOLOLINK_URL/pricing" "Pricing" "HIGH"

echo ""
echo "🔍 Testing Service Detail Pages (46 services)"
echo "=============================================="
echo "" >> $RESULTS_FILE
echo "Service Detail Pages" >> $RESULTS_FILE
echo "--------------------" >> $RESULTS_FILE

services=(
    "container" "trucking" "airfreight" "rail" "warehousing" "bulk"
    "special-transport" "customs" "drop-shipping" "port-services"
    "supply-chain" "groupage" "finance" "documentation" "consultation"
    "online-shopping" "transit" "cross-staffing" "agency" "tranship"
    "post" "third-party" "auction" "blockchain" "business" "certificates"
    "chartering" "companies" "cooperation" "distribution" "ecosystem"
    "education" "events" "export" "growth" "help-develop" "investing"
    "knowledge" "logistics-market" "modernization" "network" "organizations"
    "partnership" "project" "shopping" "trading"
)

for service in "${services[@]}"; do
    test_page "$PRODUCTION_URL/services/$service" "Service: $service" "MEDIUM"
done

echo ""
echo "========================================"
echo "📊 TEST SUMMARY"
echo "========================================"
echo "Total Pages Tested: $TOTAL"
echo "Passed (2xx direct): $PASSED"
echo "Redirects (to login): $REDIRECTS"
echo "Warnings (4xx): $WARNINGS"
echo "Failed (5xx): $FAILED"
echo ""
echo "" >> $RESULTS_FILE
echo "======================================" >> $RESULTS_FILE
echo "SUMMARY" >> $RESULTS_FILE
echo "Total: $TOTAL | Passed: $PASSED | Redirects: $REDIRECTS | Warnings: $WARNINGS | Failed: $FAILED" >> $RESULTS_FILE
echo "Test completed at $(date)" >> $RESULTS_FILE

if [ $FAILED -gt 0 ]; then
    echo "❌ Some tests failed with 5xx errors!"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "⚠️  All pages accessible but $WARNINGS returned 4xx client errors"
    exit 0
else
    echo "✅ All tests passed!"
    exit 0
fi
