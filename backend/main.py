"""
Main FastAPI Application
Crop Disease Detection Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from database import init_db
from routers import sync
from schemas import HealthResponse

# Create FastAPI app
app = FastAPI(
    title="Crop Disease Detection API",
    description="Backend API for syncing offline crop disease detection data",
    version="1.0.0"
)

# CORS middleware - allow all origins for development
# In production, restrict to specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sync.router)


@app.on_event("startup")
async def startup_event():
    """
    Initialize database on startup
    """
    print("Starting Crop Disease Detection API...")
    init_db()
    print("✓ API ready")


@app.get("/", tags=["root"])
async def root():
    """
    Root endpoint
    """
    return {
        "message": "Crop Disease Detection API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """
    Health check endpoint
    Used by sync service to check connectivity
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(),
        database="connected"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
