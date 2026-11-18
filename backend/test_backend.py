"""
Campaign Intelligence Studio - Complete Backend Verification
Directly invokes all FastAPI endpoint functions and verifies data structures,
schemas, XGBoost inference, intervals, and SQLite database storage.
"""

import sys
import os

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from main import (
    health_check,
    get_model_status,
    get_model_metrics,
    generate_campaign_prediction,
    run_what_if_simulation,
    detect_campaign_risks,
    generate_recommendations,
    get_campaign_history,
    get_dashboard_kpis,
    export_campaigns_csv,
    agent5_evaluate_candidate,
    agent5_batch_evaluate
)
from schemas.campaign import CampaignInput
from schemas.what_if import WhatIfRequest, Agent5EvaluationCandidate, Agent5BatchEvaluationRequest

def run_all_tests():
    print("=" * 60)
    print("CAMPAIGN INTELLIGENCE STUDIO - FULL BACKEND TEST SUITE")
    print("=" * 60)

    # 1. Health
    print("[1] Health Check...")
    h = health_check()
    assert h["status"] == "healthy"
    assert h["model_loaded"] is True
    print("    -> Passed:", h["service"])

    # 2. Model Status
    print("[2] Model Status...")
    ms = get_model_status()
    assert ms["loaded"] is True
    assert set(ms["models"]) == {"reach", "ctr", "conversions"}
    print("    -> Passed: Models loaded =", ms["models"])

    # 3. Model Metrics
    print("[3] Model Metrics...")
    mm = get_model_metrics()
    assert "reach" in mm["evaluation_metrics"]
    assert "ctr" in mm["evaluation_metrics"]
    assert "conversions" in mm["evaluation_metrics"]
    reach_cov = mm["evaluation_metrics"]["reach"]["interval_coverage_80"]
    print(f"    -> Passed: Reach MAPE = {mm['evaluation_metrics']['reach']['mape']}%, 80% CI Coverage = {reach_cov}%")

    # 4. Predict
    print("[4] Generate Campaign Prediction...")
    camp = CampaignInput(
        campaign_name="Diwali Mega Sale 2025",
        creative_type="Video",
        message_theme="Discount/Promotion",
        industry="Retail",
        target_audience="Working Professionals 25-34",
        channel="Instagram",
        budget=6000.0,
        campaign_duration=14,
        launch_date="2025-10-15",
        seasonality="Q4 Holiday/BFCM",
        target_audience_size=1200000.0,
        brand_affinity="Established",
        competitor_activity="High"
    )
    pred = generate_campaign_prediction(camp)
    assert pred.campaign_id.startswith("CAMP-")
    assert pred.predicted_reach.value > 1000
    assert pred.predicted_ctr.value > 0.5
    assert pred.predicted_conversions.value > 10
    assert pred.predicted_reach.lower_bound <= pred.predicted_reach.value <= pred.predicted_reach.upper_bound
    assert pred.predicted_ctr.lower_bound <= pred.predicted_ctr.value <= pred.predicted_ctr.upper_bound
    assert pred.predicted_conversions.lower_bound <= pred.predicted_conversions.value <= pred.predicted_conversions.upper_bound
    print(f"    -> Passed: ID={pred.campaign_id} | Reach={pred.predicted_reach.value:,.0f} [{pred.predicted_reach.lower_bound:,.0f} - {pred.predicted_reach.upper_bound:,.0f}]")
    print(f"       CTR={pred.predicted_ctr.value:.2f}% [{pred.predicted_ctr.lower_bound:.2f}% - {pred.predicted_ctr.upper_bound:.2f}%]")
    print(f"       Conversions={pred.predicted_conversions.value:,.0f} [{pred.predicted_conversions.lower_bound:,.0f} - {pred.predicted_conversions.upper_bound:,.0f}]")
    print(f"       Risks detected: {len(pred.risks)} | Suggestions: {len(pred.improvement_suggestions)}")
    print(f"       Gemini Model: {pred.gemini_insights.model_used}")

    # 5. What-If Simulation
    print("[5] What-If Simulation (Sensitivity Analysis)...")
    wi_req = WhatIfRequest(
        baseline_campaign=camp,
        modified_parameter="budget",
        modified_value=12000.0
    )
    wi_res = run_what_if_simulation(wi_req)
    assert wi_res.simulation_id.startswith("SIM-")
    assert wi_res.parameter_changed == "budget"
    print(f"    -> Passed: Parameter={wi_res.parameter_changed} | Old=${wi_res.original_value} -> New=${wi_res.new_value}")
    print(f"       Reach Delta: {wi_res.reach_comparison.delta_percentage:+.1f}% | Conversions Delta: {wi_res.conversions_comparison.delta_percentage:+.1f}%")
    print(f"       Explanation: {wi_res.gemini_scenario_explanation[:100]}...")

    # 6. Risk Detection Standalone
    print("[6] Risk Detection Service...")
    risks = detect_campaign_risks(camp)
    print(f"    -> Passed: Found {len(risks)} risks")

    # 7. Recommendations Standalone
    print("[7] Suggestion Service...")
    suggs = generate_recommendations(camp)
    assert len(suggs) >= 1
    print(f"    -> Passed: Found {len(suggs)} suggestions: {suggs[0].title}")

    # 8. Agent 5 Integration Candidate Evaluation
    print("[8] Agent 5 Candidate Evaluation...")
    a5_cand = Agent5EvaluationCandidate(candidate_id="AGENT5-OPT-402", campaign=camp)
    a5_res = agent5_evaluate_candidate(a5_cand)
    assert a5_res.candidate_id == "AGENT5-OPT-402"
    assert a5_res.predicted_reach.value > 0
    print(f"    -> Passed: Agent 5 candidate {a5_res.candidate_id} evaluated with predicted conversions: {a5_res.predicted_conversions.value:,.0f}")

    # 9. Agent 5 Batch Evaluation
    print("[9] Agent 5 Batch Evaluation...")
    camp2 = camp.model_copy(update={"budget": 8000.0, "channel": "Facebook"})
    a5_batch = Agent5BatchEvaluationRequest(candidates=[
        Agent5EvaluationCandidate(candidate_id="BATCH-01", campaign=camp),
        Agent5EvaluationCandidate(candidate_id="BATCH-02", campaign=camp2)
    ])
    a5_batch_res = agent5_batch_evaluate(a5_batch)
    assert a5_batch_res.total_evaluated == 2
    assert a5_batch_res.optimal_candidate_id in ["BATCH-01", "BATCH-02"]
    print(f"    -> Passed: Batch evaluated 2 candidates. Optimal candidate = {a5_batch_res.optimal_candidate_id}")

    # 10. Dashboard History & KPIs
    print("[10] History & Executive Dashboard KPIs...")
    hist = get_campaign_history()
    assert len(hist) > 0
    kpis = get_dashboard_kpis()
    assert kpis["total_campaigns"] >= 1
    print(f"    -> Passed: Total stored campaigns: {kpis['total_campaigns']}, Total Reach: {kpis['total_predicted_reach']:,}")

    # 11. CSV Export
    print("[11] CSV Export...")
    csv_resp = export_campaigns_csv()
    assert len(csv_resp.body) > 50
    print("    -> Passed: CSV export generated successfully.")

    print("\n" + "=" * 60)
    print("ALL 11 BACKEND MODULES AND VERIFICATIONS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_all_tests()
