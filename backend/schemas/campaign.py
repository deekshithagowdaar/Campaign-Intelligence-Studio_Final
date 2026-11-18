"""
Campaign Intelligence Studio - Pydantic Schemas
Agent 4: Campaign Performance Prediction Agent
LTIMindtree GenAI Internship
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class CampaignInput(BaseModel):
    campaign_name: Optional[str] = Field("Summer Growth Initiative", description="Campaign identifier or name")
    creative_type: str = Field("Video", description="Format of the creative asset: Video, Carousel, Static Image, Story, Reel, Text/Article")
    message_theme: str = Field("Product Launch", description="Core messaging theme: Product Launch, Discount/Promotion, Brand Awareness, Educational, Social Proof, Seasonal Offer")
    industry: str = Field("E-commerce", description="Industry vertical: E-commerce, SaaS/B2B, Healthcare, EdTech, Finance/Fintech, Retail")
    target_audience: str = Field("Working Professionals 25-34", description="Primary demographic segment")
    channel: str = Field("Instagram", description="Paid channel: Facebook, Instagram, LinkedIn")
    budget: float = Field(5000.0, ge=100.0, le=1000000.0, description="Planned expenditure in USD")
    campaign_duration: int = Field(21, ge=1, le=365, description="Duration in days")
    launch_date: Optional[str] = Field("2025-06-15", description="Planned launch date (YYYY-MM-DD)")
    seasonality: str = Field("Q2 Summer/Mid-Year", description="Seasonality period: Q1 Normal, Q2 Summer/Mid-Year, Q3 Back-to-School, Q4 Holiday/BFCM, Non-Holiday Off-Peak")
    target_audience_size: float = Field(750000.0, ge=1000.0, description="Estimated total addressable audience size")
    brand_affinity: str = Field("Emerging", description="Brand maturity: New, Emerging, Established")
    competitor_activity: str = Field("Moderate", description="Competitive pressure: Low, Moderate, High, Intense Clash")

class PredictionInterval(BaseModel):
    value: float = Field(..., description="Point estimate prediction from trained XGBoost model")
    lower_bound: float = Field(..., description="Calibrated lower bound at 80% confidence")
    upper_bound: float = Field(..., description="Calibrated upper bound at 80% confidence")
    interval_width: float = Field(..., description="Absolute width of prediction range")
    confidence_level: float = Field(0.80, description="Calibrated empirical coverage target (80%)")
    unit: str = Field("count", description="Unit of measurement: count, percentage, users")

class RiskFlag(BaseModel):
    risk_id: str
    risk_name: str
    severity: str = Field(..., description="Low, Medium, or High")
    affected_parameter: str
    explanation: str
    corrective_action: str

class ImprovementSuggestion(BaseModel):
    suggestion_id: str
    title: str
    reason: str
    expected_impact: str
    priority: str = Field(..., description="High, Medium, or Low")
    suggested_parameter: Optional[str] = None
    suggested_value: Optional[Any] = None

class GeminiInsights(BaseModel):
    executive_summary: str
    performance_interpretation: str
    confidence_explanation: str
    risk_advisory: str
    strategic_next_steps: List[str]
    is_fallback: bool = False
    model_used: str = "gemini-2.5-flash"

class CampaignPredictionResponse(BaseModel):
    campaign_id: str
    campaign_name: str
    inputs: CampaignInput
    predicted_reach: PredictionInterval
    predicted_ctr: PredictionInterval
    predicted_conversions: PredictionInterval
    risks: List[RiskFlag]
    improvement_suggestions: List[ImprovementSuggestion]
    gemini_insights: GeminiInsights
    model_metadata: Dict[str, Any]
    created_at: str
