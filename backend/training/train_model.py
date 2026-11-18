"""
Campaign Intelligence Studio - XGBoost Training & Calibration Engine
Agent 4: Campaign Performance Prediction Agent
LTIMindtree GenAI Internship
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

# Add parent directory to path to enable imports
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from services.data_preprocessing import DataPreprocessor, REQUIRED_FEATURE_COLUMNS, TARGET_COLUMNS
from services.feature_engineering import FeatureEngineer
from training.generate_synthetic_data import generate_campaign_dataset

def mean_absolute_percentage_error(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Computes MAPE in percentage (0-100%)."""
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    non_zero_mask = y_true > 0
    if not np.any(non_zero_mask):
        return 0.0
    return float(np.mean(np.abs((y_true[non_zero_mask] - y_pred[non_zero_mask]) / y_true[non_zero_mask])) * 100.0)

def train_and_evaluate(
    data_path: str = None,
    artifacts_dir: str = None,
    random_state: int = 42
) -> Dict[str, Any]:
    """
    Main training pipeline:
    1. Loads or generates campaign dataset.
    2. Validates and preprocesses data.
    3. Fits FeatureEngineer.
    4. Splits into Train (70%), Validation (15%), Test (15%).
    5. Trains 3 XGBoost regressors (Reach, CTR, Conversions).
    6. Calibrates 80% prediction intervals on Validation set.
    7. Evaluates MAPE, RMSE, MAE, R², and empirical coverage on Test set.
    8. Exports models, preprocessor, and metrics artifacts.
    """
    if artifacts_dir is None:
        artifacts_dir = os.path.join(BACKEND_DIR, "artifacts")
    os.makedirs(artifacts_dir, exist_ok=True)

    data_dir = os.path.join(BACKEND_DIR, "data")
    os.makedirs(data_dir, exist_ok=True)

    if data_path is None or not os.path.exists(data_path):
        default_csv = os.path.join(data_dir, "synthetic_campaign_data.csv")
        if not os.path.exists(default_csv):
            print("[TRAIN] Synthetic CSV not found. Generating fresh dataset...")
            df_gen = generate_campaign_dataset(num_samples=5000, random_seed=random_state)
            df_gen.to_csv(default_csv, index=False)
        data_path = default_csv

    # 1. Load and clean data
    preprocessor = DataPreprocessor(data_path)
    raw_df = preprocessor.load_dataset()
    df = preprocessor.validate_and_clean(raw_df, is_training=True)
    dataset_source = preprocessor.get_source_label()

    print(f"[TRAIN] Total dataset records: {len(df)} | Source: {dataset_source}")

    # 2. Fit Feature Engineering
    fe = FeatureEngineer()
    X, feature_names = fe.fit_transform(df)
    fe_save_path = os.path.join(artifacts_dir, "feature_engineer.joblib")
    fe.save(fe_save_path)

    # 3. Train/Val/Test Split (70% / 15% / 15%)
    indices = np.arange(len(df))
    train_idx, temp_idx = train_test_split(indices, test_size=0.30, random_state=random_state)
    val_idx, test_idx = train_test_split(temp_idx, test_size=0.50, random_state=random_state)

    X_train, X_val, X_test = X[train_idx], X[val_idx], X[test_idx]

    targets = {
        "reach": df["reach"].values,
        "ctr": df["ctr"].values,
        "conversions": df["conversions"].values
    }

    trained_models = {}
    calibration_factors = {}
    evaluation_metrics = {}
    feature_importances = {}
    test_eval_samples = []

    # Model Hyperparameters tuned for marketing regression targets
    model_configs = {
        "reach": {
            "n_estimators": 160,
            "max_depth": 5,
            "learning_rate": 0.08,
            "subsample": 0.85,
            "colsample_bytree": 0.85,
            "random_state": random_state
        },
        "ctr": {
            "n_estimators": 140,
            "max_depth": 4,
            "learning_rate": 0.07,
            "subsample": 0.85,
            "colsample_bytree": 0.85,
            "random_state": random_state
        },
        "conversions": {
            "n_estimators": 160,
            "max_depth": 5,
            "learning_rate": 0.08,
            "subsample": 0.85,
            "colsample_bytree": 0.85,
            "random_state": random_state
        }
    }

    print("\n[TRAIN] Training XGBoost regressors and calibrating 80% prediction intervals...")

    # For saving actual vs predicted test samples
    y_test_dict = {}
    y_pred_test_dict = {}
    intervals_test_dict = {}

    for target_name in TARGET_COLUMNS:
        y_all = targets[target_name]
        y_train, y_val, y_test = y_all[train_idx], y_all[val_idx], y_all[test_idx]
        y_test_dict[target_name] = y_test

        # A. Fit XGBoost Regressor
        model = XGBRegressor(**model_configs[target_name])
        model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
        trained_models[target_name] = model

        # Save model artifact
        model_save_path = os.path.join(artifacts_dir, f"xgboost_{target_name}.joblib")
        joblib.dump(model, model_save_path)

        # B. Calibrate 80% Prediction Interval on Validation Set
        # Relative error: r = (y - y_hat) / y_hat
        y_val_pred = model.predict(X_val)
        y_val_pred = np.maximum(y_val_pred, 0.01)
        rel_residuals = (y_val - y_val_pred) / y_val_pred

        # 80% coverage corresponds to 10th and 90th percentiles
        q_lower = float(np.percentile(rel_residuals, 10))
        q_upper = float(np.percentile(rel_residuals, 90))

        calibration_factors[target_name] = {
            "q_lower": q_lower,
            "q_upper": q_upper,
            "confidence_level": 0.80
        }

        # C. Evaluate on Held-out Test Set
        y_test_pred = model.predict(X_test)
        if target_name in ["reach", "conversions"]:
            y_test_pred = np.maximum(y_test_pred, 1.0)
        else:
            y_test_pred = np.clip(y_test_pred, 0.1, 15.0)
        y_pred_test_dict[target_name] = y_test_pred

        # Test prediction intervals
        lower_bounds = y_test_pred * (1.0 + q_lower)
        upper_bounds = y_test_pred * (1.0 + q_upper)
        if target_name in ["reach", "conversions"]:
            lower_bounds = np.maximum(lower_bounds, 0.0)
        else:
            lower_bounds = np.maximum(lower_bounds, 0.01)

        intervals_test_dict[target_name] = {
            "lower": lower_bounds,
            "upper": upper_bounds
        }

        # Empirical coverage on test set
        in_interval = (y_test >= lower_bounds) & (y_test <= upper_bounds)
        empirical_coverage = float(np.mean(in_interval) * 100.0)

        # Standard regression metrics
        mape = mean_absolute_percentage_error(y_test, y_test_pred)
        mae = float(mean_absolute_error(y_test, y_test_pred))
        rmse = float(np.sqrt(mean_squared_error(y_test, y_test_pred)))
        r2 = float(r2_score(y_test, y_test_pred))

        evaluation_metrics[target_name] = {
            "target": target_name,
            "mape": round(mape, 2),
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "r2_score": round(r2, 4),
            "interval_coverage_80": round(empirical_coverage, 2),
            "test_sample_count": len(y_test),
            "calibration_q_lower": round(q_lower, 4),
            "calibration_q_upper": round(q_upper, 4)
        }

        # Feature importances
        importances = model.feature_importances_
        sorted_idx = np.argsort(importances)[::-1][:10]
        top_features = [
            {"feature": feature_names[idx], "importance": round(float(importances[idx]), 4)}
            for idx in sorted_idx
        ]
        feature_importances[target_name] = top_features

        print(f"[{target_name.upper()}] MAPE: {mape:.2f}% | R²: {r2:.4f} | 80% Interval Coverage: {empirical_coverage:.2f}%")

    # D. Prepare test evaluation samples (first 60 samples) for frontend plotting
    for i in range(min(60, len(test_idx))):
        test_eval_samples.append({
            "sample_index": i + 1,
            "budget": float(df.iloc[test_idx[i]]["budget"]),
            "channel": str(df.iloc[test_idx[i]]["channel"]),
            "reach_actual": int(y_test_dict["reach"][i]),
            "reach_pred": int(round(y_pred_test_dict["reach"][i])),
            "reach_lower": int(round(intervals_test_dict["reach"]["lower"][i])),
            "reach_upper": int(round(intervals_test_dict["reach"]["upper"][i])),
            "ctr_actual": float(round(y_test_dict["ctr"][i], 2)),
            "ctr_pred": float(round(y_pred_test_dict["ctr"][i], 2)),
            "ctr_lower": float(round(intervals_test_dict["ctr"]["lower"][i], 2)),
            "ctr_upper": float(round(intervals_test_dict["ctr"]["upper"][i], 2)),
            "conversions_actual": int(y_test_dict["conversions"][i]),
            "conversions_pred": int(round(y_pred_test_dict["conversions"][i])),
            "conversions_lower": int(round(intervals_test_dict["conversions"]["lower"][i])),
            "conversions_upper": int(round(intervals_test_dict["conversions"]["upper"][i]))
        })

    # Save metadata & calibration artifact
    metadata = {
        "dataset_source": dataset_source,
        "total_records": len(df),
        "train_records": len(train_idx),
        "validation_records": len(val_idx),
        "test_records": len(test_idx),
        "features_count": len(feature_names),
        "feature_names": feature_names,
        "calibration_factors": calibration_factors,
        "evaluation_metrics": evaluation_metrics,
        "feature_importances": feature_importances,
        "test_eval_samples": test_eval_samples,
        "trained_timestamp": pd.Timestamp.utcnow().isoformat()
    }

    metadata_path = os.path.join(artifacts_dir, "model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n[SUCCESS] Model training complete! Artifacts saved to: {artifacts_dir}")
    print(f"Metadata file: {metadata_path}")
    return metadata

if __name__ == "__main__":
    train_and_evaluate()
