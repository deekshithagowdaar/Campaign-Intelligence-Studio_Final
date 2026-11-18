"""
Campaign Intelligence Studio - Synthetic Dataset Generator
Agent 4: Campaign Performance Prediction Agent
LTIMindtree GenAI Internship

NOTE: This generator produces a synthetic development dataset simulating the 
expected output format from Agent 2 (Marketing Brief / Data Agent) for local 
development, model training, and testing. It uses realistic non-linear marketing
physics (saturation, diminishing returns, CPM variations, channel synergies).
DATASET TYPE: SYNTHETIC_DEVELOPMENT_DATA
"""

import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_campaign_dataset(num_samples: int = 5000, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)
    
    channels = ["Facebook", "Instagram", "LinkedIn"]
    creative_types = ["Video", "Carousel", "Static Image", "Story", "Reel", "Text/Article"]
    message_themes = ["Product Launch", "Discount/Promotion", "Brand Awareness", "Educational", "Social Proof", "Seasonal Offer"]
    industries = ["E-commerce", "SaaS/B2B", "Healthcare", "EdTech", "Finance/Fintech", "Retail"]
    target_audiences = ["Young Adults 18-24", "Working Professionals 25-34", "Mid-Career / Parents 35-50", "Senior Executives 40+", "General Public"]
    seasonalities = ["Q1 Normal", "Q2 Summer/Mid-Year", "Q3 Back-to-School", "Q4 Holiday/BFCM", "Non-Holiday Off-Peak"]
    brand_affinities = ["New", "Emerging", "Established"]
    competitor_activities = ["Low", "Moderate", "High", "Intense Clash"]

    data = []
    base_date = datetime(2025, 1, 1)

    for i in range(num_samples):
        channel = np.random.choice(channels, p=[0.40, 0.45, 0.15])
        creative_type = np.random.choice(creative_types)
        message_theme = np.random.choice(message_themes)
        industry = np.random.choice(industries)
        target_audience = np.random.choice(target_audiences)
        seasonality = np.random.choice(seasonalities, p=[0.20, 0.20, 0.20, 0.25, 0.15])
        brand_affinity = np.random.choice(brand_affinities, p=[0.30, 0.45, 0.25])
        competitor_activity = np.random.choice(competitor_activities, p=[0.25, 0.40, 0.25, 0.10])
        
        # Budget distribution: Log-normal distribution skewed between $500 and $80,000
        raw_budget = np.random.lognormal(mean=8.2, sigma=0.9)
        budget = float(np.clip(np.round(raw_budget / 50) * 50, 500, 100000))
        
        # Duration: between 3 and 90 days
        duration = int(np.random.choice([7, 14, 21, 30, 45, 60, 90], p=[0.25, 0.30, 0.15, 0.15, 0.08, 0.05, 0.02]))
        
        # Audience Size
        raw_audience = np.random.lognormal(mean=12.5, sigma=1.0)
        audience_size = int(np.clip(np.round(raw_audience / 1000) * 1000, 50000, 15000000))
        
        # Random launch date
        days_offset = np.random.randint(0, 365)
        launch_date = (base_date + timedelta(days=days_offset)).strftime("%Y-%m-%d")
        
        # --- MARKETING PHYSICS SIMULATION ---
        
        # 1. Base CPM (Cost per Thousand Impressions/Reach) by Channel
        # LinkedIn is B2B premium ($35-$55 CPM), Instagram ($12-$20 CPM), Facebook ($9-$16 CPM)
        base_cpm = {
            "Facebook": np.random.uniform(9.0, 15.0),
            "Instagram": np.random.uniform(12.0, 19.0),
            "LinkedIn": np.random.uniform(38.0, 58.0)
        }[channel]
        
        # Seasonality effect on CPM (Q4 is competitive, CPM rises 30-50%)
        seasonality_cpm_mult = {
            "Q1 Normal": 0.95,
            "Q2 Summer/Mid-Year": 1.0,
            "Q3 Back-to-School": 1.10,
            "Q4 Holiday/BFCM": 1.40,
            "Non-Holiday Off-Peak": 0.88
        }[seasonality]
        
        # Competitor activity increases ad auction bids
        comp_cpm_mult = {
            "Low": 0.92,
            "Moderate": 1.0,
            "High": 1.18,
            "Intense Clash": 1.35
        }[competitor_activity]
        
        effective_cpm = base_cpm * seasonality_cpm_mult * comp_cpm_mult
        
        # Theoretical max reach from budget at effective CPM
        raw_reach = (budget / effective_cpm) * 1000.0
        
        # Diminishing returns & audience saturation (cannot reach more people than audience size)
        saturation_ratio = raw_reach / max(audience_size, 10000)
        diminishing_factor = (1.0 - np.exp(-0.85 * saturation_ratio)) / (0.85 * max(saturation_ratio, 0.01))
        
        reach = int(np.clip(raw_reach * diminishing_factor * np.random.normal(1.0, 0.06), 200, audience_size * 0.92))
        reach = max(reach, 150)
        
        # 2. Predicted CTR (%) Calculation
        # Base CTR by channel & creative type
        channel_base_ctr = {
            "Facebook": 1.65,
            "Instagram": 2.10,
            "LinkedIn": 1.25
        }[channel]
        
        creative_ctr_mult = {
            "Video": 1.30,
            "Reel": 1.45,
            "Carousel": 1.25,
            "Static Image": 1.0,
            "Story": 1.15,
            "Text/Article": 0.75
        }[creative_type]
        
        # LinkedIn favors Text/Article or Carousel for B2B, Instagram favors Reel/Video
        if channel == "LinkedIn" and industry == "SaaS/B2B":
            creative_ctr_mult *= 1.20
        if channel == "Instagram" and industry in ["Retail", "E-commerce"]:
            creative_ctr_mult *= 1.15
            
        theme_ctr_mult = {
            "Discount/Promotion": 1.35,
            "Seasonal Offer": 1.25,
            "Product Launch": 1.20,
            "Social Proof": 1.10,
            "Educational": 0.95,
            "Brand Awareness": 0.85
        }[message_theme]
        
        brand_ctr_mult = {
            "New": 0.88,
            "Emerging": 1.0,
            "Established": 1.22
        }[brand_affinity]
        
        # Duration fatigue: ads run too long fatigue target audience
        fatigue_mult = 1.0 if duration <= 21 else (1.0 - min(0.30, (duration - 21) * 0.005))
        
        ctr = channel_base_ctr * creative_ctr_mult * theme_ctr_mult * brand_ctr_mult * fatigue_mult
        ctr = ctr * np.random.normal(1.0, 0.08)
        ctr = float(np.clip(np.round(ctr, 2), 0.35, 6.50))
        
        # 3. Predicted Conversions Calculation
        # Clicks = reach * (ctr / 100)
        clicks = reach * (ctr / 100.0)
        
        # Conversion Rate from Click to Action
        base_cvr = {
            "E-commerce": 0.038,
            "Retail": 0.035,
            "SaaS/B2B": 0.024,
            "EdTech": 0.028,
            "Healthcare": 0.022,
            "Finance/Fintech": 0.019
        }[industry]
        
        theme_cvr_mult = {
            "Discount/Promotion": 1.40,
            "Seasonal Offer": 1.30,
            "Product Launch": 1.10,
            "Social Proof": 1.15,
            "Educational": 0.80,
            "Brand Awareness": 0.60
        }[message_theme]
        
        seasonality_cvr_mult = {
            "Q1 Normal": 0.95,
            "Q2 Summer/Mid-Year": 1.0,
            "Q3 Back-to-School": 1.08,
            "Q4 Holiday/BFCM": 1.45,
            "Non-Holiday Off-Peak": 0.90
        }[seasonality]
        
        effective_cvr = base_cvr * theme_cvr_mult * seasonality_cvr_mult * (1.1 if brand_affinity == "Established" else 0.92)
        conversions = int(np.clip(np.round(clicks * effective_cvr * np.random.normal(1.0, 0.10)), 1, clicks * 0.40))
        
        data.append({
            "campaign_id": f"CAMP-DEV-{1000 + i}",
            "campaign_name": f"{brand_affinity} {industry} {message_theme} {channel}",
            "creative_type": creative_type,
            "message_theme": message_theme,
            "industry": industry,
            "target_audience": target_audience,
            "channel": channel,
            "budget": budget,
            "campaign_duration": duration,
            "launch_date": launch_date,
            "seasonality": seasonality,
            "target_audience_size": audience_size,
            "brand_affinity": brand_affinity,
            "competitor_activity": competitor_activity,
            # Target Variables
            "reach": reach,
            "ctr": ctr,
            "conversions": conversions,
            "dataset_source": "SYNTHETIC_DEVELOPMENT_DATA_AGENT2_MOCK"
        })
        
    df = pd.DataFrame(data)
    return df

if __name__ == "__main__":
    output_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "synthetic_campaign_data.csv")
    
    print(f"[INFO] Generating 5,000 synthetic campaign records...")
    df = generate_campaign_dataset(num_samples=5000, random_seed=42)
    df.to_csv(output_path, index=False)
    print(f"[SUCCESS] Synthetic dataset saved to {output_path}")
    print(f"Dataset shape: {df.shape}")
    print("Sample distribution:")
    print(df[["reach", "ctr", "conversions", "budget"]].describe().T[["mean", "std", "min", "50%", "max"]])
