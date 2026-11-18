"""
Campaign Intelligence Studio - Confidence Interval Engine
Agent 4: Campaign Performance Prediction Agent
LTIMindtree GenAI Internship
"""

import numpy as np
from typing import Dict, Any
from schemas.campaign import PredictionInterval

class ConfidenceIntervalService:
    """
    Computes calibrated 80% prediction intervals based on the empirical
    residual distribution evaluated during validation.
    """
    @staticmethod
    def calculate_interval(
        target_name: str,
        predicted_value: float,
        calibration_factors: Dict[str, Any]
    ) -> PredictionInterval:
        factors = calibration_factors.get(target_name, {"q_lower": -0.15, "q_upper": 0.15, "confidence_level": 0.80})
        q_lower = factors.get("q_lower", -0.15)
        q_upper = factors.get("q_upper", 0.15)
        conf_level = factors.get("confidence_level", 0.80)

        # Apply empirical bounds
        raw_lower = predicted_value * (1.0 + q_lower)
        raw_upper = predicted_value * (1.0 + q_upper)

        if target_name == "reach":
            val = round(predicted_value)
            lower = max(0, round(raw_lower))
            upper = max(lower, round(raw_upper))
            unit = "users"
        elif target_name == "ctr":
            val = round(predicted_value, 2)
            lower = max(0.05, round(raw_lower, 2))
            upper = max(lower, round(raw_upper, 2))
            unit = "%"
        elif target_name == "conversions":
            val = round(predicted_value)
            lower = max(0, round(raw_lower))
            upper = max(lower, round(raw_upper))
            unit = "conversions"
        else:
            val = round(predicted_value, 2)
            lower = round(raw_lower, 2)
            upper = round(raw_upper, 2)
            unit = "units"

        width = round(upper - lower, 2)

        return PredictionInterval(
            value=val,
            lower_bound=lower,
            upper_bound=upper,
            interval_width=width,
            confidence_level=conf_level,
            unit=unit
        )
