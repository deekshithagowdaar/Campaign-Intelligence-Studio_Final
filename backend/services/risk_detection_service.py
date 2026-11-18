"""
Campaign Intelligence Studio - Modular Risk Detection Engine
Agent 4: Campaign Performance Prediction Agent
LTIMindtree GenAI Internship
"""

from typing import List, Dict, Any, Optional
from schemas.campaign import CampaignInput, RiskFlag, PredictionInterval

class RiskDetectionService:
    """
    Evaluates campaign parameters and model predictions against quantitative marketing rules
    to detect risks prior to campaign launch.
    """
    @staticmethod
    def detect_risks(
        campaign: CampaignInput,
        predicted_reach: Optional[PredictionInterval] = None,
        predicted_ctr: Optional[PredictionInterval] = None,
        predicted_conversions: Optional[PredictionInterval] = None
    ) -> List[RiskFlag]:
        risks: List[RiskFlag] = []

        budget = float(campaign.budget)
        duration = int(campaign.campaign_duration)
        audience_size = float(campaign.target_audience_size)
        daily_budget = budget / max(duration, 1)

        # 1. RISK: Narrow Audience Saturation
        if audience_size < 150000 and budget >= 3500:
            risks.append(RiskFlag(
                risk_id="RISK-01-NARROW-AUDIENCE",
                risk_name="Audience Saturation Risk",
                severity="High" if (budget / audience_size) > 0.04 else "Medium",
                affected_parameter="target_audience_size",
                explanation=f"A budget of ${budget:,.0f} allocated to a narrow audience of only {audience_size:,.0f} individuals risks severe ad fatigue, repetitive impressions, and escalating CPM.",
                corrective_action="Broaden demographic filters, include secondary lookalike audiences, or scale back budget to match audience scale."
            ))

        # 2. RISK: Competitor Clash & Timing Congestion
        if campaign.competitor_activity in ["Intense Clash", "High"]:
            if campaign.seasonality == "Q4 Holiday/BFCM":
                risks.append(RiskFlag(
                    risk_id="RISK-02-TIMING-COMPETITOR-CLASH",
                    risk_name="High Competitor Clash During Peak Season",
                    severity="High",
                    affected_parameter="timing & seasonality",
                    explanation=f"Launching during {campaign.seasonality} under '{campaign.competitor_activity}' competitor pressure leads to bidding wars, inflated auction prices, and suppressed impression share.",
                    corrective_action="Shift flight dates to off-peak weeks or leverage niche differentiation and high-intent long-tail keywords."
                ))
            else:
                risks.append(RiskFlag(
                    risk_id="RISK-02B-COMPETITOR-PRESSURE",
                    risk_name="Elevated Competitor Activity",
                    severity="Medium",
                    affected_parameter="competitor_activity",
                    explanation=f"Competitor activity is rated '{campaign.competitor_activity}', which historically depresses organic engagement and elevates customer acquisition costs.",
                    corrective_action="Strengthen unique value proposition (UVP), emphasize social proof, or introduce stronger promotional incentives."
                ))

        # 3. RISK: Budget Starvation on LinkedIn
        if campaign.channel == "LinkedIn" and (budget < 2000 or daily_budget < 50):
            risks.append(RiskFlag(
                risk_id="RISK-03-LINKEDIN-UNDERFUNDED",
                risk_name="LinkedIn B2B Budget Starvation",
                severity="High",
                affected_parameter="budget",
                explanation=f"LinkedIn B2B ad inventory commands premium CPMs ($35-$55). A daily budget of ${daily_budget:,.1f} is insufficient for the ad delivery algorithm to exit learning phase.",
                corrective_action="Increase daily budget to at least $75/day ($2,500+ total) or shift campaign to Facebook/Instagram with B2B behavioral targeting."
            ))

        # 4. RISK: Creative Fatigue on Long Durations
        if duration > 30 and campaign.creative_type in ["Static Image", "Text/Article"]:
            risks.append(RiskFlag(
                risk_id="RISK-04-CREATIVE-FATIGUE",
                risk_name="Long Duration Creative Fatigue",
                severity="Medium",
                affected_parameter="campaign_duration",
                explanation=f"Campaign duration of {duration} days with static '{campaign.creative_type}' assets typically experiences a 35-45% CTR decay after day 21.",
                corrective_action="Schedule creative refresh intervals every 14 days or introduce Dynamic Creative Optimization (DCO) with Video/Carousel assets."
            ))

        # 5. RISK: Channel-Audience Alignment Mismatch
        if campaign.channel == "LinkedIn" and campaign.target_audience == "Young Adults 18-24" and campaign.industry in ["Retail", "E-commerce"]:
            risks.append(RiskFlag(
                risk_id="RISK-05-CHANNEL-MISMATCH",
                risk_name="Channel-Audience Inefficiency",
                severity="Medium",
                affected_parameter="channel",
                explanation="LinkedIn is primarily optimized for professional career and B2B engagement. Running retail/e-commerce targeting 18-24 produces high cost-per-click without proportionate purchase intent.",
                corrective_action="Reallocate budget to Instagram Reels or TikTok where demographic density and impulsive conversion affinity are 3x higher."
            ))

        # 6. RISK: Predicted CTR or Conversion Warning
        if predicted_ctr and predicted_ctr.value < 1.10:
            risks.append(RiskFlag(
                risk_id="RISK-06-LOW-ENGAGEMENT-ESTIMATE",
                risk_name="Sub-Par Predicted CTR",
                severity="Medium",
                affected_parameter="creative_type",
                explanation=f"Model predicts a below-benchmark CTR of {predicted_ctr.value:.2f}% (80% CI: {predicted_ctr.lower_bound:.2f}% - {predicted_ctr.upper_bound:.2f}%).",
                corrective_action="Upgrade to dynamic Video or Carousel creative format and test compelling discount or social proof hooks."
            ))

        return risks
