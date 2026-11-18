"""
Campaign Intelligence Studio - FastAPI Application Entry Point
Agent 4: Campaign Performance Prediction Agent
LTIMindtree GenAI Internship
"""

import os
import sys
import io
import csv
from datetime import datetime
from typing import List, Dict, Any

from fastapi import FastAPI, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure backend root is on sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from config import settings
from models.model_loader import ModelLoader
from schemas.campaign import (
    CampaignInput,
    CampaignPredictionResponse,
    PredictionInterval,
    RiskFlag,
    ImprovementSuggestion
)
from schemas.what_if import (
    WhatIfRequest,
    WhatIfResponse,
    Agent5EvaluationCandidate,
    Agent5EvaluationResult,
    Agent5BatchEvaluationRequest,
    Agent5BatchEvaluationResponse
)
from services.prediction_service import PredictionService
from services.what_if_service import WhatIfService
from services.risk_detection_service import RiskDetectionService
from services.suggestion_service import SuggestionService
from services.storage_service import StorageService
from services.gemini_service import GeminiService

app = FastAPI(
    title=f"{settings.PROJECT_NAME} API",
    description=(
        "Production-grade REST API for Agent 4: Campaign Performance Prediction Agent. "
        "Provides XGBoost-driven Reach, CTR, and Conversion forecasts with 80% prediction intervals, "
        "automated risk detection, actionable recommendations, Gemini AI insights, and Agent 5 optimization integration."
    ),
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
model_loader = ModelLoader.get_instance()
prediction_service = PredictionService()
what_if_service = WhatIfService()
storage_service = StorageService()
gemini_service = GeminiService()

@app.get("/health", tags=["System"])
def health_check():
    """Returns health status of API, ML model, and Gemini service."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "module": settings.PROJECT_MODULE,
        "internship": settings.INTERNSHIP_LABEL,
        "model_loaded": model_loader.is_loaded,
        "gemini_api_configured": gemini_service.is_available(),
        "database": "sqlite_active",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/model/status", tags=["Model"])
def get_model_status():
    """Returns the memory load status and readiness of trained XGBoost models."""
    return model_loader.get_status()

@app.get("/api/model/metrics", tags=["Model"])
def get_model_metrics():
    """Returns genuine empirical test-set evaluation metrics (MAPE, R2, RMSE, 80% CI Coverage)."""
    metrics = model_loader.get_metrics()
    if "error" in metrics:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=metrics["error"])
    return metrics

@app.post("/api/campaign/predict", response_model=CampaignPredictionResponse, tags=["Prediction"])
def generate_campaign_prediction(campaign: CampaignInput):
    """
    Executes full pre-launch campaign prediction:
    1. Feature engineering
    2. XGBoost Multi-Target inference (Reach, CTR, Conversions)
    3. Calibrated 80% prediction intervals
    4. Campaign risk detection
    5. Improvement suggestions
    6. Gemini AI narrative synthesis
    7. Persistent SQLite storage
    """
    try:
        return prediction_service.predict(campaign, persist=True)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )

@app.post("/api/campaign/what-if", response_model=WhatIfResponse, tags=["Simulation"])
def run_what_if_simulation(request: WhatIfRequest):
    """
    Executes What-If sensitivity simulation by re-running the trained XGBoost model
    with a modified parameter to quantify deltas in Reach, CTR, and Conversions.
    """
    try:
        return what_if_service.simulate(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"What-if simulation error: {str(e)}"
        )

@app.post("/api/campaign/risks", response_model=List[RiskFlag], tags=["Risk Analysis"])
def detect_campaign_risks(campaign: CampaignInput):
    """Evaluates rule-based and predictive marketing risks for proposed campaign parameters."""
    try:
        # Run prediction internally to get estimates for risk evaluation
        pred = prediction_service.predict(campaign, persist=False)
        return RiskDetectionService.detect_risks(
            campaign=campaign,
            predicted_reach=pred.predicted_reach,
            predicted_ctr=pred.predicted_ctr,
            predicted_conversions=pred.predicted_conversions
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Risk detection error: {str(e)}"
        )

@app.post("/api/campaign/recommendations", response_model=List[ImprovementSuggestion], tags=["Recommendations"])
def generate_recommendations(campaign: CampaignInput):
    """Generates 1 to 3 concrete optimization recommendations based on campaign features."""
    try:
        pred = prediction_service.predict(campaign, persist=False)
        return SuggestionService.generate_suggestions(
            campaign=campaign,
            predicted_reach=pred.predicted_reach,
            predicted_ctr=pred.predicted_ctr,
            predicted_conversions=pred.predicted_conversions,
            risks=pred.risks
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation generation error: {str(e)}"
        )

@app.get("/api/campaign/{campaign_id}/risks", tags=["Risk Analysis"])
def get_campaign_risks(campaign_id: str):
    """Retrieves risks for a previously analysed campaign by re-running the risk detection engine on its stored inputs and predictions."""
    campaign_data = storage_service.get_campaign(campaign_id)
    if not campaign_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign record not found")
    try:
        campaign_input = CampaignInput(**campaign_data["inputs"])
        predicted_reach = PredictionInterval(**campaign_data["predicted_reach"])
        predicted_ctr = PredictionInterval(**campaign_data["predicted_ctr"])
        predicted_conversions = PredictionInterval(**campaign_data["predicted_conversions"])
        risks = RiskDetectionService.detect_risks(
            campaign=campaign_input,
            predicted_reach=predicted_reach,
            predicted_ctr=predicted_ctr,
            predicted_conversions=predicted_conversions
        )
        return {
            "campaign_id": campaign_id,
            "campaign_name": campaign_data.get("campaign_name", "Untitled"),
            "inputs": campaign_data["inputs"],
            "predicted_reach": campaign_data["predicted_reach"],
            "predicted_ctr": campaign_data["predicted_ctr"],
            "predicted_conversions": campaign_data["predicted_conversions"],
            "risks": [r.model_dump() for r in risks]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Risk analysis error: {str(e)}"
        )

@app.get("/api/campaign/{campaign_id}/recommendations", tags=["Recommendations"])
def get_campaign_recommendations(campaign_id: str):
    """Generates campaign-specific recommendations for a previously analysed campaign."""
    campaign_data = storage_service.get_campaign(campaign_id)
    if not campaign_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign record not found")
    try:
        campaign_input = CampaignInput(**campaign_data["inputs"])
        predicted_reach = PredictionInterval(**campaign_data["predicted_reach"])
        predicted_ctr = PredictionInterval(**campaign_data["predicted_ctr"])
        predicted_conversions = PredictionInterval(**campaign_data["predicted_conversions"])
        risks = RiskDetectionService.detect_risks(
            campaign=campaign_input,
            predicted_reach=predicted_reach,
            predicted_ctr=predicted_ctr,
            predicted_conversions=predicted_conversions
        )
        suggestions = SuggestionService.generate_suggestions(
            campaign=campaign_input,
            predicted_reach=predicted_reach,
            predicted_ctr=predicted_ctr,
            predicted_conversions=predicted_conversions,
            risks=risks
        )
        return {
            "campaign_id": campaign_id,
            "campaign_name": campaign_data.get("campaign_name", "Untitled"),
            "inputs": campaign_data["inputs"],
            "predicted_reach": campaign_data["predicted_reach"],
            "predicted_ctr": campaign_data["predicted_ctr"],
            "predicted_conversions": campaign_data["predicted_conversions"],
            "risks": [r.model_dump() for r in risks],
            "recommendations": [s.model_dump() for s in suggestions]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation generation error: {str(e)}"
        )

@app.get("/api/campaign/history", tags=["History & Dashboard"])
def get_campaign_history(limit: int = 50):
    """Returns stored history of previous campaign evaluations."""
    return storage_service.get_history(limit=limit)

@app.get("/api/campaign/kpis", tags=["History & Dashboard"])
def get_dashboard_kpis():
    """Returns aggregate executive KPIs computed from stored campaigns."""
    return storage_service.get_kpis()

@app.get("/api/campaign/{campaign_id}", tags=["History & Dashboard"])
def get_campaign_details(campaign_id: str):
    """Retrieves full prediction payload for a specific past campaign."""
    campaign = storage_service.get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign record not found")
    return campaign

@app.delete("/api/campaign/{campaign_id}", tags=["History & Dashboard"])
def delete_campaign_record(campaign_id: str):
    """Deletes a past campaign record."""
    success = storage_service.delete_campaign(campaign_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return {"deleted": True, "campaign_id": campaign_id}

@app.get("/api/campaign/export/csv", tags=["Export"])
def export_campaigns_csv():
    """Exports all stored campaign forecasts into a downloadable CSV file."""
    history = storage_service.get_history(limit=500)
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow([
        "Campaign ID", "Campaign Name", "Channel", "Industry", "Budget (USD)",
        "Predicted Reach", "Predicted CTR (%)", "Predicted Conversions",
        "Risk Flags Count", "Max Risk Severity", "Analysis Date"
    ])
    
    for row in history:
        writer.writerow([
            row["id"], row["name"], row["channel"], row["industry"], row["budget"],
            row["predicted_reach"], row["predicted_ctr"], row["predicted_conversions"],
            row["risk_count"], row["max_risk_severity"], row["created_at"]
        ])
        
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=campaign_predictions_export.csv"}
    )

# ----------------- AGENT 5 (Marketing Optimization Agent) INTEGRATION -----------------

@app.post("/api/agent5/evaluate-candidate", response_model=Agent5EvaluationResult, tags=["Agent 5 Integration"])
def agent5_evaluate_candidate(candidate: Agent5EvaluationCandidate):
    """
    Dedicated endpoint for Agent 5 (Marketing Optimization Agent).
    Evaluates an optimization candidate parameter set and returns standardized prediction contract.
    """
    try:
        pred = prediction_service.predict(candidate.campaign, persist=False)
        return Agent5EvaluationResult(
            candidate_id=candidate.candidate_id,
            campaign_input_summary=candidate.campaign.model_dump(),
            predicted_reach=pred.predicted_reach,
            predicted_ctr=pred.predicted_ctr,
            predicted_conversions=pred.predicted_conversions,
            risk_flags=pred.risks,
            improvement_suggestions=pred.improvement_suggestions,
            model_metadata=pred.model_metadata,
            prediction_timestamp=pred.created_at
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent 5 candidate evaluation error: {str(e)}"
        )

@app.post("/api/agent5/batch-evaluate", response_model=Agent5BatchEvaluationResponse, tags=["Agent 5 Integration"])
def agent5_batch_evaluate(batch_req: Agent5BatchEvaluationRequest):
    """
    Evaluates a batch of candidate campaign configurations generated by Agent 5's genetic
    algorithm or Bayesian optimizer, ranking candidates by predicted conversions.
    """
    results: List[Agent5EvaluationResult] = []
    best_candidate_id = None
    max_conversions = -1.0

    for candidate in batch_req.candidates:
        try:
            pred = prediction_service.predict(candidate.campaign, persist=False)
            res = Agent5EvaluationResult(
                candidate_id=candidate.candidate_id,
                campaign_input_summary=candidate.campaign.model_dump(),
                predicted_reach=pred.predicted_reach,
                predicted_ctr=pred.predicted_ctr,
                predicted_conversions=pred.predicted_conversions,
                risk_flags=pred.risks,
                improvement_suggestions=pred.improvement_suggestions,
                model_metadata=pred.model_metadata,
                prediction_timestamp=pred.created_at
            )
            results.append(res)
            if pred.predicted_conversions.value > max_conversions:
                max_conversions = pred.predicted_conversions.value
                best_candidate_id = candidate.candidate_id
        except Exception as e:
            print(f"[AGENT 5 BATCH EVAL ERROR] Candidate {candidate.candidate_id} failed: {e}")

    return Agent5BatchEvaluationResponse(
        results=results,
        total_evaluated=len(results),
        optimal_candidate_id=best_candidate_id
    )

from fastapi.staticfiles import StaticFiles

# If frontend production build exists, mount it to serve at root
FRONTEND_DIST = os.path.abspath(os.path.join(CURRENT_DIR, "..", "frontend", "dist"))
if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
