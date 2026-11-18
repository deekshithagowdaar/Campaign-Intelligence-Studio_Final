"""
Campaign Intelligence Studio - Model Evaluation & Residual Inspection
Agent 4: Campaign Performance Prediction Agent
LTIMindtree GenAI Internship
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

def load_evaluation_report():
    artifacts_dir = os.path.join(BACKEND_DIR, "artifacts")
    metadata_path = os.path.join(artifacts_dir, "model_metadata.json")
    
    if not os.path.exists(metadata_path):
        print(f"[ERROR] Metadata not found at {metadata_path}. Please run train_model.py first.")
        return None
        
    with open(metadata_path, "r") as f:
        meta = json.load(f)
        
    print("=" * 60)
    print("CAMPAIGN INTELLIGENCE STUDIO - MODEL PERFORMANCE SUMMARY")
    print("=" * 60)
    print(f"Dataset Source: {meta.get('dataset_source')}")
    print(f"Total Samples: {meta.get('total_records')} (Train: {meta.get('train_records')}, Val: {meta.get('validation_records')}, Test: {meta.get('test_records')})")
    print(f"Features: {meta.get('features_count')}")
    print("-" * 60)
    print(f"{'Target':<14} | {'MAPE':<8} | {'MAE':<10} | {'RMSE':<10} | {'R²':<8} | {'80% CI Coverage':<15}")
    print("-" * 60)
    for target, metrics in meta.get("evaluation_metrics", {}).items():
        print(f"{target.upper():<14} | {metrics['mape']}%{'':<3} | {metrics['mae']:<10} | {metrics['rmse']:<10} | {metrics['r2_score']:<8} | {metrics['interval_coverage_80']}%")
    print("=" * 60)
    return meta

if __name__ == "__main__":
    load_evaluation_report()
