from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title="OrienX API — Cambodian Education & Career Guidance Platform",
    description=(
        "Production REST API for OrienX: empowering Cambodian high school and university students "
        "to discover their direction through MBTI-inspired personality assessments, RIASEC career interests, "
        "verified university exploration, major directories, and explainable recommendations."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "platform": "OrienX",
        "version": "1.0.0",
        "tagline": "Discover Your Direction. Shape Your Future.",
        "api_v1_docs": "/docs"
    }

