#!/bin/bash

# TodoSmtnApp Deployment Script
echo "🚀 TodoSmtnApp Deployment Helper"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the todosmtnapp directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "�� Built files are in the 'build' directory"
    echo ""
    echo "🌐 Ready for deployment!"
else
    echo "❌ Build failed. Check the errors above."
    exit 1
fi

echo "🎉 Deployment preparation complete!"
