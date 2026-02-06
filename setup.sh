#!/bin/bash

# Initial Setup Commands - Mac/Linux

# ================================
# BACKEND SETUP
# ================================

echo "🚀 Setting up Backend..."

# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from example
cp .env.example .env

echo "✅ Backend setup complete!"
echo "📝 Remember to update backend/.env with your Supabase credentials"
echo "To start backend: cd backend; source venv/bin/activate; uvicorn main:app --reload"

# Go back to root
cd ..

# ================================
# FRONTEND SETUP
# ================================

echo ""
echo "🚀 Setting up Frontend..."

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env.local from example
cp .env.example .env.local

echo "✅ Frontend setup complete!"
echo "📝 Remember to update frontend/.env.local with backend URL"
echo "To start frontend: cd frontend; npm run dev"

# Go back to root
cd ..

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Set up Supabase database (see database/README.md)"
echo "2. Update backend/.env with database credentials"
echo "3. Update frontend/.env.local with backend URL"
echo "4. Start backend: cd backend; source venv/bin/activate; uvicorn main:app --reload"
echo "5. Start frontend (new terminal): cd frontend; npm run dev"
echo "6. Open http://localhost:3000"
