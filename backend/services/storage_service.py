"""
Campaign Intelligence Studio - SQLite Persistence Service
Agent 4: Campaign Performance Prediction Agent
LTIMindtree GenAI Internship
"""

import os
import json
import sqlite3
from typing import List, Dict, Any, Optional
from datetime import datetime
from config import settings
from schemas.campaign import CampaignPredictionResponse

class StorageService:
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = str(db_path or settings.SQLITE_DB_PATH)
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS campaign_history (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                channel TEXT NOT NULL,
                industry TEXT NOT NULL,
                budget REAL NOT NULL,
                predicted_reach INTEGER NOT NULL,
                predicted_ctr REAL NOT NULL,
                predicted_conversions INTEGER NOT NULL,
                risk_count INTEGER NOT NULL,
                max_risk_severity TEXT NOT NULL,
                created_at TEXT NOT NULL,
                payload_json TEXT NOT NULL
            );
            """)
            conn.commit()

    def save_campaign(self, response: CampaignPredictionResponse) -> str:
        # Determine highest risk severity
        severities = [r.severity for r in response.risks]
        if "High" in severities:
            max_severity = "High"
        elif "Medium" in severities:
            max_severity = "Medium"
        elif "Low" in severities:
            max_severity = "Low"
        else:
            max_severity = "None"

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT OR REPLACE INTO campaign_history (
                id, name, channel, industry, budget, predicted_reach, predicted_ctr,
                predicted_conversions, risk_count, max_risk_severity, created_at, payload_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                response.campaign_id,
                response.campaign_name,
                response.inputs.channel,
                response.inputs.industry,
                response.inputs.budget,
                int(response.predicted_reach.value),
                float(response.predicted_ctr.value),
                int(response.predicted_conversions.value),
                len(response.risks),
                max_severity,
                response.created_at,
                json.dumps(response.model_dump())
            ))
            conn.commit()
        return response.campaign_id

    def get_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT id, name, channel, industry, budget, predicted_reach, predicted_ctr,
                   predicted_conversions, risk_count, max_risk_severity, created_at
            FROM campaign_history
            ORDER BY created_at DESC
            LIMIT ?
            """, (limit,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def get_campaign(self, campaign_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT payload_json FROM campaign_history WHERE id = ?", (campaign_id,))
            row = cursor.fetchone()
            if row:
                return json.loads(row["payload_json"])
            return None

    def delete_campaign(self, campaign_id: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM campaign_history WHERE id = ?", (campaign_id,))
            conn.commit()
            return cursor.rowcount > 0

    def get_kpis(self) -> Dict[str, Any]:
        """Calculates true aggregate KPIs from stored campaign records."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT 
                COUNT(*) as total_campaigns,
                COALESCE(SUM(predicted_reach), 0) as total_reach,
                COALESCE(AVG(predicted_ctr), 0.0) as avg_ctr,
                COALESCE(SUM(predicted_conversions), 0) as total_conversions,
                COALESCE(SUM(budget), 0.0) as total_budget,
                SUM(CASE WHEN max_risk_severity = 'High' THEN 1 ELSE 0 END) as high_risk_count,
                SUM(CASE WHEN max_risk_severity = 'Medium' THEN 1 ELSE 0 END) as medium_risk_count,
                SUM(CASE WHEN max_risk_severity = 'Low' THEN 1 ELSE 0 END) as low_risk_count,
                SUM(CASE WHEN max_risk_severity = 'None' THEN 1 ELSE 0 END) as no_risk_count
            FROM campaign_history
            """)
            row = cursor.fetchone()
            
            # Channel breakdown
            cursor.execute("""
            SELECT channel, COUNT(*) as count, AVG(predicted_ctr) as avg_ctr, SUM(predicted_conversions) as total_conv
            FROM campaign_history
            GROUP BY channel
            """)
            channel_breakdown = [dict(r) for r in cursor.fetchall()]

            return {
                "total_campaigns": row["total_campaigns"],
                "total_predicted_reach": row["total_reach"],
                "average_predicted_ctr": round(row["avg_ctr"], 2),
                "total_predicted_conversions": row["total_conversions"],
                "total_allocated_budget": round(row["total_budget"], 2),
                "risk_distribution": {
                    "high": row["high_risk_count"] or 0,
                    "medium": row["medium_risk_count"] or 0,
                    "low": row["low_risk_count"] or 0,
                    "none": row["no_risk_count"] or 0
                },
                "channel_breakdown": channel_breakdown
            }
