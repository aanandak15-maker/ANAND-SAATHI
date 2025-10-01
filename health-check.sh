#!/bin/bash

# Quick Health Check for Anand Saathi
# Run this to verify all components are working

echo "🏥 ANAND SAATHI HEALTH CHECK"
echo "============================"
echo ""

# Check if files exist
echo "📁 Checking core files..."
files=("server.js" "package.json" "src/App.tsx" "src/components/AnandSaathiDashboard.tsx")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file exists"
    else
        echo "   ❌ $file missing"
    fi
done

echo ""

# Check package.json scripts
echo "📋 Checking npm scripts..."
scripts=("dev" "build" "test" "server")
for script in "${scripts[@]}"; do
    if grep -q "\"$script\":" package.json; then
        echo "   ✅ $script script configured"
    else
        echo "   ❌ $script script missing"
    fi
done

echo ""

# Check TypeScript compilation
echo "🔧 Testing TypeScript compilation..."
if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
    echo "   ✅ TypeScript compilation successful"
else
    echo "   ⚠️ TypeScript compilation has warnings/errors"
fi

echo ""

# Check dependencies
echo "📦 Checking key dependencies..."
deps=("express" "react" "vite" "supabase" "tailwindcss")
for dep in "${deps[@]}"; do
    if npm list "$dep" > /dev/null 2>&1; then
        echo "   ✅ $dep installed"
    else
        echo "   ❌ $dep missing"
    fi
done

echo ""

# Check Docker files
echo "🐳 Checking Docker configuration..."
docker_files=("Dockerfile" "Dockerfile.backend" "docker-compose.yml")
for file in "${docker_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file exists"
    else
        echo "   ❌ $file missing"
    fi
done

echo ""
echo "🎯 LOCAL TESTING INSTRUCTIONS"
echo "============================"
echo ""
echo "1️⃣  Start Backend Server:"
echo "   npm run server"
echo ""
echo "2️⃣  Start Frontend (new terminal):"
echo "   npm run dev"
echo ""
echo "3️⃣  Access Application:"
echo "   http://localhost:5173/anand-saathi/dashboard"
echo ""
echo "4️⃣  Test API Endpoints:"
echo "   curl http://localhost:3000/api/health"
echo ""
echo "5️⃣  Run Test Suite:"
echo "   npm run test"
echo ""

echo "🚀 READY FOR LOCAL TESTING!"
