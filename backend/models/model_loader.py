"""
Campaign Intelligence Studio - Model Loader & Memory Cache
Agent 4: Campaign Performance Prediction Agent
LTIMindtree GenAI Internship
"""

import os
import json
import joblib
from typing import Dict, Any, Optional
from config import settings
from services.feature_engineering import FeatureEngineer

class ModelLoader:
    _instance: Optional["ModelLoader"] = None

    def __init__(self):
        self.is_loaded: bool = False
        self.feature_engineer: Optional[FeatureEngineer] = None
        self.models: Dict[str, Any] = {}
        self.metadata: Dict[str, Any] = {}
        self.load_error: Optional[str] = None
        self._load_artifacts()

    @classmethod
    def get_instance(cls) -> "ModelLoader":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_artifacts(self):
        """Loads all artifacts into memory."""
        try:
            if not os.path.exists(settings.FEATURE_ENGINEER_PATH):
                raise FileNotFoundError(f"Feature engineer artifact missing: {settings.FEATURE_ENGINEER_PATH}")
            if not os.path.exists(settings.MODEL_REACH_PATH):
                raise FileNotFoundError(f"Reach model missing: {settings.MODEL_REACH_PATH}")
            if not os.path.exists(settings.MODEL_CTR_PATH):
                raise FileNotFoundError(f"CTR model missing: {settings.MODEL_CTR_PATH}")
            if not os.path.exists(settings.MODEL_CONVERSIONS_PATH):
                raise FileNotFoundError(f"Conversions model missing: {settings.MODEL_CONVERSIONS_PATH}")
            if not os.path.exists(settings.METADATA_PATH):
                raise FileNotFoundError(f"Metadata file missing: {settings.METADATA_PATH}")

            # 1. Load Feature Engineer
            self.feature_engineer = FeatureEngineer.load(str(settings.FEATURE_ENGINEER_PATH))

            # 2. Load XGBoost models
            self.models["reach"] = joblib.load(str(settings.MODEL_REACH_PATH))
            self.models["ctr"] = joblib.load(str(settings.MODEL_CTR_PATH))
            self.models["conversions"] = joblib.load(str(settings.MODEL_CONVERSIONS_PATH))

            # 3. Load Metadata & Calibration factors
            with open(settings.METADATA_PATH, "r") as f:
                self.metadata = json.load(f)

            self.is_loaded = True
            self.load_error = None
            print("[MODEL LOADER] All 3 XGBoost models and FeatureEngineer loaded successfully into memory.")
        except Exception as e:
            self.is_loaded = False
            self.load_error = str(e)
            print(f"[MODEL LOADER ERROR] Failed to load artifacts: {e}")

    def get_status(self) -> Dict[str, Any]:
        return {
            "loaded": self.is_loaded,
            "models": list(self.models.keys()) if self.is_loaded else [],
            "dataset_source": self.metadata.get("dataset_source", "UNKNOWN"),
            "features_count": self.metadata.get("features_count", 0),
            "trained_timestamp": self.metadata.get("trained_timestamp", "N/A"),
            "load_error": self.load_error
        }

    def get_metrics(self) -> Dict[str, Any]:
        if not self.is_loaded:
            return {"error": "Models not loaded"}
        return {
            "dataset_source": self.metadata.get("dataset_source"),
            "total_records": self.metadata.get("total_records"),
            "train_records": self.metadata.get("train_records"),
            "validation_records": self.metadata.get("validation_records"),
            "test_records": self.metadata.get("test_records"),
            "evaluation_metrics": self.metadata.get("evaluation_metrics", {}),
            "feature_importances": self.metadata.get("feature_importances", {}),
            "test_eval_samples": self.metadata.get("test_eval_samples", [])
        }
