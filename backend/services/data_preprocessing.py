"""
Campaign Intelligence Studio - Data Preprocessing Service
Agent 4: Campaign Performance Prediction Agent
LTIMindtree GenAI Internship
"""

import os
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, Optional

REQUIRED_FEATURE_COLUMNS = [
    "creative_type",
    "message_theme",
    "industry",
    "target_audience",
    "channel",
    "budget",
    "campaign_duration",
    "seasonality",
    "target_audience_size",
    "brand_affinity",
    "competitor_activity"
]

TARGET_COLUMNS = ["reach", "ctr", "conversions"]

class DataPreprocessor:
    """
    Handles CSV dataset loading, schema verification, data validation,
    missing value handling, and split preparation.
    """
    def __init__(self, data_path: Optional[str] = None):
        self.data_path = data_path
        self.dataset_source_label = "UNINITIALIZED"

    def load_dataset(self, file_path: Optional[str] = None) -> pd.DataFrame:
        """
        Loads dataset from given CSV path or default path.
        Distinguishes real historical vs synthetic datasets.
        """
        target_path = file_path or self.data_path
        if not target_path or not os.path.exists(target_path):
            raise FileNotFoundError(f"Dataset file not found at: {target_path}")

        df = pd.read_csv(target_path)
        
        # Check if dataset contains source identifier
        if "dataset_source" in df.columns:
            self.dataset_source_label = df["dataset_source"].iloc[0]
        else:
            self.dataset_source_label = "REAL_HISTORICAL_CAMPAIGN_DATA"
            
        print(f"[DATA PREPROCESSOR] Loaded {len(df)} rows. Source: {self.dataset_source_label}")
        return df

    def validate_and_clean(self, df: pd.DataFrame, is_training: bool = True) -> pd.DataFrame:
        """
        Validates schema, checks ranges, and cleans data.
        """
        df_clean = df.copy()

        # Check required input columns
        for col in REQUIRED_FEATURE_COLUMNS:
            if col not in df_clean.columns:
                raise ValueError(f"Missing mandatory column: {col}")

        # Check targets if in training mode
        if is_training:
            for target in TARGET_COLUMNS:
                if target not in df_clean.columns:
                    raise ValueError(f"Missing mandatory training target: {target}")

        # Handle missing values
        # Numeric columns: impute with median
        numeric_cols = ["budget", "campaign_duration", "target_audience_size"]
        if is_training:
            numeric_cols.extend(TARGET_COLUMNS)

        for col in numeric_cols:
            if col in df_clean.columns:
                if df_clean[col].isnull().any():
                    median_val = df_clean[col].median()
                    df_clean[col] = df_clean[col].fillna(median_val)
                # Ensure positive values
                df_clean[col] = pd.to_numeric(df_clean[col], errors="coerce").fillna(1.0)
                df_clean[col] = df_clean[col].apply(lambda x: max(float(x), 0.01))

        # Categorical columns: fill missing with mode or default
        cat_defaults = {
            "creative_type": "Static Image",
            "message_theme": "Brand Awareness",
            "industry": "E-commerce",
            "target_audience": "General Public",
            "channel": "Facebook",
            "seasonality": "Q1 Normal",
            "brand_affinity": "Emerging",
            "competitor_activity": "Moderate"
        }

        for col, default_val in cat_defaults.items():
            if col in df_clean.columns:
                df_clean[col] = df_clean[col].fillna(default_val).astype(str)

        return df_clean

    def get_source_label(self) -> str:
        return self.dataset_source_label
