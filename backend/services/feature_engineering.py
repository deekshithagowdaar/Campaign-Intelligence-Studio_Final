"""
Campaign Intelligence Studio - Feature Engineering Service
Agent 4: Campaign Performance Prediction Agent
LTIMindtree GenAI Internship
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import List, Tuple, Dict, Any, Optional
from sklearn.preprocessing import OneHotEncoder

CATEGORICAL_COLS = [
    "channel",
    "creative_type",
    "message_theme",
    "industry",
    "target_audience",
    "seasonality",
    "brand_affinity",
    "competitor_activity"
]

class FeatureEngineer:
    """
    Constructs high-signal marketing features, domain-specific interaction terms,
    and handles consistent one-hot encoding for training and inference.
    """
    def __init__(self):
        self.encoder: Optional[OneHotEncoder] = None
        self.feature_names: List[str] = []

    def compute_interaction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Creates domain-specific mathematical interactions reflecting marketing physics.
        """
        engineered = pd.DataFrame(index=df.index)

        # Budget, Duration, Audience interactions
        budget = df["budget"].values.astype(float)
        duration = df["campaign_duration"].values.astype(float)
        audience = df["target_audience_size"].values.astype(float)

        # 1. Daily spend intensity
        engineered["budget_per_day"] = budget / np.maximum(duration, 1.0)
        engineered["log_budget_per_day"] = np.log1p(engineered["budget_per_day"])

        # 2. Log scales
        engineered["log_budget"] = np.log1p(budget)
        engineered["log_duration"] = np.log1p(duration)
        engineered["log_audience_size"] = np.log1p(audience)

        # 3. Spend to audience ratio (penetration potential)
        engineered["budget_audience_ratio"] = budget / np.maximum(audience, 1000.0)

        # 4. Audience Saturation Index (0 to 1)
        engineered["saturation_index"] = np.clip((budget * 60.0) / np.maximum(audience, 10000.0), 0.0, 1.0)

        # 5. Creative fatigue penalty indicator for long campaigns
        engineered["fatigue_indicator"] = np.where(duration > 25.0, (duration - 25.0) / 30.0, 0.0)

        # 6. High-impact Channel-Industry synergy flags
        channels = df["channel"].values
        industries = df["industry"].values
        creative_types = df["creative_type"].values

        engineered["is_b2b_linkedin"] = ((channels == "LinkedIn") & (industries == "SaaS/B2B")).astype(float)
        engineered["is_ecommerce_insta"] = ((channels == "Instagram") & np.isin(industries, ["E-commerce", "Retail"])).astype(float)
        engineered["is_video_format"] = np.isin(creative_types, ["Video", "Reel"]).astype(float)

        return engineered

    def fit_transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, List[str]]:
        """
        Fits categorical encoder, computes interactions, and returns combined feature matrix.
        """
        # 1. Interaction & numeric features
        numeric_df = self.compute_interaction_features(df)
        numeric_feature_names = list(numeric_df.columns)
        numeric_matrix = numeric_df.values

        # 2. Categorical encoding
        self.encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
        cat_matrix = self.encoder.fit_transform(df[CATEGORICAL_COLS])
        cat_feature_names = list(self.encoder.get_feature_names_out(CATEGORICAL_COLS))

        # 3. Combine
        X = np.hstack([numeric_matrix, cat_matrix])
        self.feature_names = numeric_feature_names + cat_feature_names

        return X, self.feature_names

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """
        Transforms new input data using the fitted preprocessor.
        """
        if self.encoder is None:
            raise RuntimeError("FeatureEngineer must be fitted or loaded before calling transform().")

        numeric_df = self.compute_interaction_features(df)
        numeric_matrix = numeric_df.values

        cat_matrix = self.encoder.transform(df[CATEGORICAL_COLS])
        X = np.hstack([numeric_matrix, cat_matrix])
        return X

    def save(self, filepath: str):
        """Saves fitted preprocessor and feature names."""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({
            "encoder": self.encoder,
            "feature_names": self.feature_names
        }, filepath)
        print(f"[FEATURE ENGINEER] Artifact saved to: {filepath}")

    @classmethod
    def load(cls, filepath: str) -> "FeatureEngineer":
        """Loads fitted preprocessor from disk."""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Preprocessor artifact not found at: {filepath}")
        data = joblib.load(filepath)
        instance = cls()
        instance.encoder = data["encoder"]
        instance.feature_names = data["feature_names"]
        return instance
