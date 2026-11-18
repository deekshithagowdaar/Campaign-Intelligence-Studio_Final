"""
Campaign Intelligence Studio - Gemini Generative AI Service
Agent 4: Campaign Performance Prediction Agent
LTIMindtree GenAI Internship
"""

import os
import json
from typing import Dict, Any, List, Optional
from config import settings
from schemas.campaign import CampaignInput, PredictionInterval, RiskFlag, ImprovementSuggestion, GeminiInsights

class GeminiService:
    """
    Connects to the official Google Gemini API to synthesize natural language explanations
    of XGBoost model predictions, prediction intervals, detected risks, and tactical recommendations.
    Provides graceful offline fallback when no API key is provided or offline.
    """
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self.client = None
        self._init_client()

    def _init_client(self):
        if self.api_key and len(self.api_key.strip()) > 5:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key.strip())
                print("[GEMINI SERVICE] Google GenAI Client initialized successfully.")
            except Exception as e:
                print(f"[GEMINI SERVICE WARNING] Failed to initialize Google GenAI Client: {e}")
                self.client = None
        else:
            self.client = None

    def is_available(self) -> bool:
        return self.client is not None

    def generate_campaign_insights(
        self,
        campaign: CampaignInput,
        reach: PredictionInterval,
        ctr: PredictionInterval,
        conversions: PredictionInterval,
        risks: List[RiskFlag],
        suggestions: List[ImprovementSuggestion]
    ) -> GeminiInsights:
        """
        Calls Gemini API with structured outputs from ML model and risk service.
        Returns GeminiInsights object.
        """
        # If client is available, attempt Gemini call
        if self.client:
            try:
                prompt = self._build_prompt(campaign, reach, ctr, conversions, risks, suggestions)
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
                text = response.text.strip()
                # Parse JSON response
                parsed = self._extract_json(text)
                if parsed:
                    return GeminiInsights(
                        executive_summary=parsed.get("executive_summary", ""),
                        performance_interpretation=parsed.get("performance_interpretation", ""),
                        confidence_explanation=parsed.get("confidence_explanation", ""),
                        risk_advisory=parsed.get("risk_advisory", ""),
                        strategic_next_steps=parsed.get("strategic_next_steps", []),
                        is_fallback=False,
                        model_used=self.model_name
                    )
            except Exception as e:
                print(f"[GEMINI SERVICE ERROR] API call failed: {e}. Falling back to internal engine.")

        # Fallback Heuristic Generator (deterministic, professional, grounded in actual numbers)
        return self._generate_fallback_insights(campaign, reach, ctr, conversions, risks, suggestions)

    def generate_what_if_explanation(
        self,
        baseline_campaign: CampaignInput,
        modified_parameter: str,
        original_value: Any,
        new_value: Any,
        reach_delta: float,
        ctr_delta: float,
        conversions_delta: float,
        new_conversions: float
    ) -> str:
        """
        Generates natural language narrative explaining the trade-offs of a parameter change.
        """
        if self.client:
            try:
                prompt = f"""
                You are a senior marketing data scientist explaining a What-If simulation for a campaign.
                Baseline Parameter: {modified_parameter} was changed from {original_value} to {new_value}.
                Simulation Results from XGBoost:
                - Reach Delta: {reach_delta:+.1f}%
                - CTR Delta: {ctr_delta:+.2f}%
                - Conversions Delta: {conversions_delta:+.1f}% (New expected: {new_conversions:,.0f})
                
                Explain in 2-3 concise, analytical sentences:
                1. Why this parameter change created this specific effect (e.g. saturation, channel dynamics, budget intensity).
                2. Whether this change is recommended from a Cost-per-Acquisition (CPA) perspective.
                Keep it professional, executive-ready, and directly reference the percentage changes.
                """
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
                if response.text:
                    return response.text.strip()
            except Exception as e:
                print(f"[GEMINI WHAT-IF ERROR] {e}. Falling back to rule-based explanation.")

        # Fallback simulation narrative
        direction = "increase" if conversions_delta > 0 else "decrease" if conversions_delta < 0 else "plateau"
        return (
            f"Adjusting {modified_parameter.replace('_', ' ').title()} from {original_value} to {new_value} "
            f"results in a {abs(conversions_delta):.1f}% {direction} in predicted conversions (reaching {new_conversions:,.0f}). "
            f"The XGBoost model indicates that {modified_parameter} directly influences audience penetration rates and auction competitiveness. "
            f"{'This modification enhances overall budget efficiency and is recommended.' if conversions_delta > 5 else 'Carefully evaluate whether the marginal conversion gain justifies any additional expenditure.'}"
        )

    def _build_prompt(
        self,
        campaign: CampaignInput,
        reach: PredictionInterval,
        ctr: PredictionInterval,
        conversions: PredictionInterval,
        risks: List[RiskFlag],
        suggestions: List[ImprovementSuggestion]
    ) -> str:
        return f"""
        You are the AI Marketing Intelligence Engine for 'Campaign Intelligence Studio' (Agent 4 in LTIMindtree GenAI Internship).
        Analyze the proposed marketing campaign and the numerical predictions from our calibrated XGBoost model.
        
        CAMPAIGN BRIEF:
        - Name: {campaign.campaign_name}
        - Channel: {campaign.channel}
        - Industry: {campaign.industry}
        - Creative Format: {campaign.creative_type}
        - Message Theme: {campaign.message_theme}
        - Target Audience: {campaign.target_audience} (Size: {campaign.target_audience_size:,.0f})
        - Budget: ${campaign.budget:,.2f} USD
        - Duration: {campaign.campaign_duration} days (Daily Spend: ${campaign.budget/max(campaign.campaign_duration,1):.1f}/day)
        - Seasonality: {campaign.seasonality}
        - Competitor Pressure: {campaign.competitor_activity}
        
        NUMERICAL PREDICTIONS FROM TRAINED XGBOOST REGRESSORS:
        - Predicted Reach: {reach.value:,.0f} users (80% Confidence Interval: {reach.lower_bound:,.0f} to {reach.upper_bound:,.0f})
        - Predicted CTR: {ctr.value:.2f}% (80% Confidence Interval: {ctr.lower_bound:.2f}% to {ctr.upper_bound:.2f}%)
        - Predicted Conversions: {conversions.value:,.0f} actions (80% Confidence Interval: {conversions.lower_bound:,.0f} to {conversions.upper_bound:,.0f})
        
        DETECTED RISKS:
        {json.dumps([r.model_dump() for r in risks], indent=2)}
        
        RECOMMENDED SUGGESTIONS:
        {json.dumps([s.model_dump() for s in suggestions], indent=2)}
        
        CRITICAL INSTRUCTIONS:
        1. DO NOT invent or alter any numerical predictions. Reference the exact numbers above.
        2. Provide clear executive explanations for marketing managers.
        3. Respond ONLY with a valid JSON object matching the following structure:
        {{
            "executive_summary": "2-3 sentences summarizing the campaign trajectory and key forecast.",
            "performance_interpretation": "Detailed analysis of reach efficiency, engagement, and conversion likelihood.",
            "confidence_explanation": "Explanation of the 80% prediction interval and why uncertainty exists in this forecast.",
            "risk_advisory": "Evaluation of the detected risk flags and their potential financial or operational drag.",
            "strategic_next_steps": [
                "Action item 1",
                "Action item 2",
                "Action item 3"
            ]
        }}
        """

    def _extract_json(self, text: str) -> Optional[Dict[str, Any]]:
        try:
            # Strip markdown formatting
            clean_text = text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
        except Exception:
            return None

    def _generate_fallback_insights(
        self,
        campaign: CampaignInput,
        reach: PredictionInterval,
        ctr: PredictionInterval,
        conversions: PredictionInterval,
        risks: List[RiskFlag],
        suggestions: List[ImprovementSuggestion]
    ) -> GeminiInsights:
        """High-grade expert deterministic synthesis when API is offline."""
        daily_spend = campaign.budget / max(campaign.campaign_duration, 1)
        
        summary = (
            f"The proposed '{campaign.campaign_name}' campaign on {campaign.channel} is projected to generate "
            f"{reach.value:,.0f} unique users (reach) with a {ctr.value:.2f}% CTR, yielding an estimated {conversions.value:,.0f} conversions "
            f"at a daily spend pace of ${daily_spend:,.1f}. "
            f"{'However, critical auction and audience risks require mitigation before launch.' if risks else 'Expected performance is well-balanced across engagement benchmarks.'}"
        )

        interpretation = (
            f"On {campaign.channel}, your allocated budget of ${campaign.budget:,.0f} achieves an effective reach of "
            f"{reach.value:,.0f} within your addressable audience of {campaign.target_audience_size:,.0f} (a {min(100.0, (reach.value/max(campaign.target_audience_size,1))*100):.1f}% penetration rate). "
            f"The predicted CTR of {ctr.value:.2f}% reflects the engagement dynamics of the {campaign.creative_type} format within the {campaign.industry} sector."
        )

        confidence_explanation = (
            f"Based on empirical test calibration, the 80% prediction interval for reach spans from {reach.lower_bound:,.0f} to {reach.upper_bound:,.0f} users, "
            f"and conversions span from {conversions.lower_bound:,.0f} to {conversions.upper_bound:,.0f}. "
            f"This {reach.interval_width:,.0f}-user interval accounts for real-world auction volatility, competitor bid spikes, and ad fatigue variations."
        )

        risk_advisory = (
            f"Identified {len(risks)} operational risk flag(s). " +
            (" ".join([f"[{r.severity.upper()}] {r.risk_name}: {r.explanation}" for r in risks[:2]]) if risks else "No critical risk flags detected; campaign parameters align with platform delivery guidelines.")
        )

        next_steps = [
            f"Refine creative execution by focusing on {campaign.message_theme} value proposition hooks.",
            f"Monitor initial 72-hour delivery on {campaign.channel} to confirm real-world CPM matches the forecast interval.",
            f"Implement primary recommendation: {suggestions[0].title if suggestions else 'Deploy A/B testing on ad headlines'}."
        ]

        return GeminiInsights(
            executive_summary=summary,
            performance_interpretation=interpretation,
            confidence_explanation=confidence_explanation,
            risk_advisory=risk_advisory,
            strategic_next_steps=next_steps,
            is_fallback=True,
            model_used="Heuristic Expert Engine (Local Mode)"
        )
