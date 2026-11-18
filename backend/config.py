"""
Campaign Intelligence Studio - Global Backend Configuration
Agent 4: Campaign Performance Prediction Agent
LTIMindtree GenAI Internship
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root or backend dir
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(BACKEND_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "Campaign Intelligence Studio"
    PROJECT_TAGLINE: str = "Predict. Analyse. Optimise."
    PROJECT_MODULE: str = "Agent 4 - Campaign Performance Prediction Agent"
    INTERNSHIP_LABEL: str = "LTIMindtree GenAI Internship"
    VERSION: str = "2.0.0"
    
    # Paths
    BASE_DIR: Path = BACKEND_DIR
    DATA_DIR: Path = BACKEND_DIR / "data"
    ARTIFACTS_DIR: Path = BACKEND_DIR / "artifacts"
    SQLITE_DB_PATH: Path = BACKEND_DIR / "data" / "campaign_intelligence.db"
    
    # Model Artifact Paths
    FEATURE_ENGINEER_PATH: Path = ARTIFACTS_DIR / "feature_engineer.joblib"
    MODEL_REACH_PATH: Path = ARTIFACTS_DIR / "xgboost_reach.joblib"
    MODEL_CTR_PATH: Path = ARTIFACTS_DIR / "xgboost_ctr.joblib"
    MODEL_CONVERSIONS_PATH: Path = ARTIFACTS_DIR / "xgboost_conversions.joblib"
    METADATA_PATH: Path = ARTIFACTS_DIR / "model_metadata.json"
    
    # Gemini Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    # Server Settings
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
