from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import uvicorn

from config import settings
from database.connection import db
from routes import employees, attendance, dashboard, analytics

# Lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting HRMS Lite API...")
    await db.connect()
    yield
    # Shutdown
    print("🛑 Shutting down HRMS Lite API...")
    await db.disconnect()

# Initialize FastAPI app
app = FastAPI(
    title="HRMS Lite API",
    description="Human Resource Management System - Lightweight API for employee and attendance management",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with detailed messages"""
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"])
        message = error["msg"]
        errors.append(f"{field}: {message}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "Validation Error",
            "detail": errors
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors"""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal Server Error",
            "detail": str(exc)
        }
    )

# Include routers
app.include_router(employees.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)

# Root endpoint
@app.get("/", tags=["root"])
async def root():
    """API health check and information"""
    return {
        "success": True,
        "message": "HRMS Lite API is running",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "employees": "/api/employees",
            "attendance": "/api/attendance",
            "dashboard": "/api/dashboard"
        }
    }

# Health check endpoint
@app.get("/health", tags=["root"])
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Test database connection
        await db.fetchval("SELECT 1")
        return {
            "success": True,
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "success": False,
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e)
            }
        )

# Run the application
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True  # Enable auto-reload for development
    )
