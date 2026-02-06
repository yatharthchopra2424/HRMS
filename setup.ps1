# Initial Setup Commands - Windows

# ================================
# BACKEND SETUP
# ================================

Write-Host "Setting up Backend..." -ForegroundColor Green

# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env from example
Copy-Item .env.example .env

Write-Host "`n✅ Backend setup complete!" -ForegroundColor Green
Write-Host "📝 Remember to update backend/.env with your Supabase credentials" -ForegroundColor Yellow
Write-Host "`nTo start backend: cd backend; .\venv\Scripts\activate; uvicorn main:app --reload" -ForegroundColor Cyan

# Go back to root
cd ..

# ================================
# FRONTEND SETUP
# ================================

Write-Host "`nSetting up Frontend..." -ForegroundColor Green

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env.local from example
Copy-Item .env.example .env.local

Write-Host "`n✅ Frontend setup complete!" -ForegroundColor Green
Write-Host "📝 Remember to update frontend/.env.local with backend URL" -ForegroundColor Yellow
Write-Host "`nTo start frontend: cd frontend; npm run dev" -ForegroundColor Cyan

# Go back to root
cd ..

Write-Host "`n🎉 Setup complete! Next steps:" -ForegroundColor Green
Write-Host "1. Set up Supabase database (see database/README.md)" -ForegroundColor White
Write-Host "2. Update backend/.env with database credentials" -ForegroundColor White
Write-Host "3. Update frontend/.env.local with backend URL" -ForegroundColor White
Write-Host "4. Start backend: cd backend; .\venv\Scripts\activate; uvicorn main:app --reload" -ForegroundColor White
Write-Host "5. Start frontend (new terminal): cd frontend; npm run dev" -ForegroundColor White
Write-Host "6. Open http://localhost:3000" -ForegroundColor White
