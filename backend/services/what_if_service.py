"""
Campaign Intelligence Studio - Interactive What-If Simulation Engine
Agent 4: Campaign Performance Prediction Agent
LTIMindtree GenAI Internship
"""

import uuid
from datetime import datetime
from typing import Dict, Any
from schemas.campaign import CampaignInput, PredictionInterval
from schemas.what_if import WhatIfRequest, WhatIfResponse, MetricComparison
from services.prediction_service import PredictionService
from services.gemini_service import GeminiService
from services.risk_detection_service import RiskDetectionService

class WhatIfService:
    def __init__(self):
        self.prediction_service = PredictionService()
        self.gemini_service = GeminiService()

    def simulate(self, request: WhatIfRequest) -> WhatIfResponse:
        baseline = request.baseline_campaign
        param = request.modified_parameter
        new_val = request.modified_value

        # 1. Run baseline prediction if not cached (do not persist what-if runs in main history)
        base_resp = self.prediction_service.predict(baseline, persist=False)

        # 2. Build modified campaign
        mod_dict = baseline.model_dump()
        orig_val = mod_dict.get(param)
        
        # Apply updated value with type casting
        if param in ["budget", "target_audience_size"]:
            mod_dict[param] = float(new_val)
        elif param in ["campaign_duration"]:
            mod_dict[param] = int(new_val)
        else:
            mod_dict[param] = str(new_val)

        modified_campaign = CampaignInput(**mod_dict)

        # 3. Re-run genuine XGBoost prediction pipeline on modified campaign
        sim_resp = self.prediction_service.predict(modified_campaign, persist=False)

        # 4. Compute Deltas
        def make_comparison(name: str, base_inv: PredictionInterval, sim_inv: PredictionInterval) -> MetricComparison:
            delta_abs = sim_inv.value - base_inv.value
            delta_pct = ((sim_inv.value - base_inv.value) / max(base_inv.value, 0.001)) * 100.0
            return MetricComparison(
                metric_name=name,
                baseline_value=base_inv.value,
                scenario_value=sim_inv.value,
                delta_absolute=round(delta_abs, 2),
                delta_percentage=round(delta_pct, 2),
                is_positive=delta_abs >= 0,
                baseline_interval=base_inv,
                scenario_interval=sim_inv
            )

        reach_comp = make_comparison("Reach", base_resp.predicted_reach, sim_resp.predicted_reach)
        ctr_comp = make_comparison("CTR", base_resp.predicted_ctr, sim_resp.predicted_ctr)
        conv_comp = make_comparison("Conversions", base_resp.predicted_conversions, sim_resp.predicted_conversions)

        # 5. Risk delta evaluation
        base_risk_ids = {r.risk_id for r in base_resp.risks}
        sim_risk_ids = {r.risk_id for r in sim_resp.risks}
        new_risks_count = len(sim_resp.risks)
        
        resolved_risks = base_risk_ids - sim_risk_ids
        new_risk_flags = sim_risk_ids - base_risk_ids
        unchanged_risks = base_risk_ids & sim_risk_ids
        
        risk_parts = []
        if new_risk_flags:
            risk_parts.append(f"+{len(new_risk_flags)} new risk(s) introduced")
        if resolved_risks:
            risk_parts.append(f"{len(resolved_risks)} risk(s) resolved")
        if unchanged_risks:
            risk_parts.append(f"{len(unchanged_risks)} risk(s) unchanged")
        
        if not risk_parts:
            if new_risks_count == 0:
                risk_summary = "All risk flags cleared — scenario passes all 6 risk rules."
            else:
                risk_summary = f"Risk level remains neutral ({new_risks_count} active flag(s))."
        else:
            risk_summary = "Risk assessment: " + ", ".join(risk_parts) + f". Total: {new_risks_count} active flag(s)."

        # 6. Gemini scenario explanation
        gemini_explanation = self.gemini_service.generate_what_if_explanation(
            baseline_campaign=baseline,
            modified_parameter=param,
            original_value=orig_val,
            new_value=new_val,
            reach_delta=reach_comp.delta_percentage,
            ctr_delta=ctr_comp.delta_percentage,
            conversions_delta=conv_comp.delta_percentage,
            new_conversions=sim_resp.predicted_conversions.value
        )

        return WhatIfResponse(
            simulation_id=f"SIM-{uuid.uuid4().hex[:8].upper()}",
            parameter_changed=param,
            original_value=orig_val,
            new_value=new_val,
            reach_comparison=reach_comp,
            ctr_comparison=ctr_comp,
            conversions_comparison=conv_comp,
            new_risks=sim_resp.risks,
            risk_summary_change=risk_summary,
            gemini_scenario_explanation=gemini_explanation,
            timestamp=datetime.utcnow().isoformat()
        )
