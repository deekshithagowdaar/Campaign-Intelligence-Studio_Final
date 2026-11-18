"""
Campaign Intelligence Studio - Core Prediction Service
Agent 4: Campaign Performance Prediction Agent
LTIMindtree GenAI Internship
"""

import uuid
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, Optional
from models.model_loader import ModelLoader
from schemas.campaign import (
    CampaignInput,
    CampaignPredictionResponse,
    PredictionInterval
)
from services.confidence_interval_service import ConfidenceIntervalService
from services.risk_detection_service import RiskDetectionService
from services.suggestion_service import SuggestionService
from services.gemini_service import GeminiService
from services.storage_service import StorageService

class PredictionService:
    def __init__(self):
        self.model_loader = ModelLoader.get_instance()
        self.gemini_service = GeminiService()
        self.storage_service = StorageService()

    def predict(self, campaign: CampaignInput, persist: bool = True) -> CampaignPredictionResponse:
        """
        Executes end-to-end ML inference and intelligence synthesis.
        """
        if not self.model_loader.is_loaded:
            raise RuntimeError(f"Prediction models are not loaded: {self.model_loader.load_error}")

        # 1. Prepare single-row DataFrame matching training feature schema
        input_data = {
            "creative_type": [campaign.creative_type],
            "message_theme": [campaign.message_theme],
            "industry": [campaign.industry],
            "target_audience": [campaign.target_audience],
            "channel": [campaign.channel],
            "budget": [float(campaign.budget)],
            "campaign_duration": [int(campaign.campaign_duration)],
            "seasonality": [campaign.seasonality],
            "target_audience_size": [float(campaign.target_audience_size)],
            "brand_affinity": [campaign.brand_affinity],
            "competitor_activity": [campaign.competitor_activity]
        }
        df_input = pd.DataFrame(input_data)

        # 2. Transform through fitted FeatureEngineer
        X = self.model_loader.feature_engineer.transform(df_input)

        # 3. XGBoost Model Inference
        raw_reach = float(self.model_loader.models["reach"].predict(X)[0])
        raw_ctr = float(self.model_loader.models["ctr"].predict(X)[0])
        raw_conversions = float(self.model_loader.models["conversions"].predict(X)[0])

        # Clamping realistic constraints
        raw_reach = max(raw_reach, 100.0)
        raw_ctr = max(raw_ctr, 0.10)
        raw_conversions = max(raw_conversions, 1.0)

        # 4. Calibrated 80% Confidence Intervals
        calibration_factors = self.model_loader.metadata.get("calibration_factors", {})
        reach_interval = ConfidenceIntervalService.calculate_interval("reach", raw_reach, calibration_factors)
        ctr_interval = ConfidenceIntervalService.calculate_interval("ctr", raw_ctr, calibration_factors)
        conv_interval = ConfidenceIntervalService.calculate_interval("conversions", raw_conversions, calibration_factors)

        # 5. Risk Detection
        risks = RiskDetectionService.detect_risks(
            campaign=campaign,
            predicted_reach=reach_interval,
            predicted_ctr=ctr_interval,
            predicted_conversions=conv_interval
        )

        # 6. Improvement Suggestions
        suggestions = SuggestionService.generate_suggestions(
            campaign=campaign,
            predicted_reach=reach_interval,
            predicted_ctr=ctr_interval,
            predicted_conversions=conv_interval,
            risks=risks
        )

        # 7. Gemini AI Insights Generation
        gemini_insights = self.gemini_service.generate_campaign_insights(
            campaign=campaign,
            reach=reach_interval,
            ctr=ctr_interval,
            conversions=conv_interval,
            risks=risks,
            suggestions=suggestions
        )

        # 8. Assemble Full Response
        campaign_id = f"CAMP-{uuid.uuid4().hex[:8].upper()}"
        response = CampaignPredictionResponse(
            campaign_id=campaign_id,
            campaign_name=campaign.campaign_name or "Untitled Campaign",
            inputs=campaign,
            predicted_reach=reach_interval,
            predicted_ctr=ctr_interval,
            predicted_conversions=conv_interval,
            risks=risks,
            improvement_suggestions=suggestions,
            gemini_insights=gemini_insights,
            model_metadata={
                "algorithm": "XGBoost Regressor (Trained Multi-Target)",
                "dataset_source": self.model_loader.metadata.get("dataset_source", "SYNTHETIC_DEVELOPMENT_DATA"),
                "eval_mape": {
                    "reach": self.model_loader.metadata.get("evaluation_metrics", {}).get("reach", {}).get("mape"),
                    "ctr": self.model_loader.metadata.get("evaluation_metrics", {}).get("ctr", {}).get("mape"),
                    "conversions": self.model_loader.metadata.get("evaluation_metrics", {}).get("conversions", {}).get("mape")
                },
                "interval_coverage_target": "80%"
            },
            created_at=datetime.utcnow().isoformat()
        )

        # 9. Persistent Storage
        if persist:
            try:
                self.storage_service.save_campaign(response)
            except Exception as e:
                print(f"[STORAGE WARNING] Failed to persist campaign: {e}")

        return response
