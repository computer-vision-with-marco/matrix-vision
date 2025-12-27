#!/bin/bash

# PixelMatrix Pro Startup Procedure
# This script sets up and starts the PixelMatrix Pro application

echo "🚀 Starting PixelMatrix Pro..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo "🌐 Starting development server..."
echo "📱 Open http://localhost:5173 in your browser"
echo ""

npm run dev