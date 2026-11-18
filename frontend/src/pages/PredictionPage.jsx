import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  Target, 
  Users, 
  MousePointerClick, 
  ArrowRight, 
  SlidersHorizontal, 
  Printer, 
  Download, 
  RefreshCw,
  Zap,
  Info,
  Calendar,
  DollarSign,
  Clock,
  ShieldAlert,
  Lightbulb,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';

const CREATIVE_TYPES = ["Video", "Carousel", "Static Image", "Story", "Reel", "Text/Article"];
const MESSAGE_THEMES = ["Product Launch", "Discount/Promotion", "Brand Awareness", "Educational", "Social Proof", "Seasonal Offer"];
const INDUSTRIES = ["E-commerce", "SaaS/B2B", "Healthcare", "EdTech", "Finance/Fintech", "Retail"];
const TARGET_AUDIENCES = [
  "Young Adults 18-24", 
  "Working Professionals 25-34", 
  "Mid-Career / Parents 35-50", 
  "Senior Executives 40+", 
  "General Public"
];
const CHANNELS = [
  { id: "Instagram", label: "Instagram", desc: "Visual storytelling, Reels & lifestyle focus" },
  { id: "Facebook", label: "Facebook", desc: "Broad reach, demographic diversity & retargeting" },
  { id: "LinkedIn", label: "LinkedIn", desc: "High-value B2B decision-makers & professionals" }
];
const SEASONALITIES = [
  "Q1 Normal", 
  "Q2 Summer/Mid-Year", 
  "Q3 Back-to-School", 
  "Q4 Holiday/BFCM", 
  "Non-Holiday Off-Peak"
];

export default function PredictionPage({ onNavigateToWhatIf }) {
  const [formData, setFormData] = useState({
    campaign_name: "Q3 Omnichannel Growth Accelerator",
    creative_type: "Video",
    message_theme: "Product Launch",
    industry: "E-commerce",
    target_audience: "Working Professionals 25-34",
    channel: "Instagram",
    budget: 5000,
    campaign_duration: 21,
    launch_date: "2025-08-01",
    seasonality: "Q3 Back-to-School",
    target_audience_size: 750000,
    brand_affinity: "Emerging",
    competitor_activity: "Moderate"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeInsightTab, setActiveInsightTab] = useState('summary');

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  async function handlePredict(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.predictCampaign(formData);
      setResult(response);
      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('prediction-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error("Prediction failed:", err);
      setError(err.message || "Failed to generate prediction. Please verify Python backend is active.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF4EA] text-[#EA580C] rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agent 4 Predictive Inference Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#252525] tracking-tight">
            Campaign Performance Predictor
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Configure campaign brief, channel, and budget parameters to compute pre-launch Reach, CTR, 
            and Conversions with calibrated 80% prediction intervals.
          </p>
        </div>
        
        {result && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
            <button
              onClick={() => onNavigateToWhatIf(result)}
              className="px-5 py-2.5 orange-gradient-bg text-white font-bold rounded-xl text-xs shadow-orange-glow flex items-center gap-2 hover:opacity-95 transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Explore in What-If</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <span className="font-bold">Prediction Request Error:</span> {error}
          </div>
        </div>
      )}

      {/* Main Campaign Configuration Form */}
      <form onSubmit={handlePredict} className="space-y-8">
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-premium space-y-8">
          
          {/* SECTION A: Campaign Brief */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <span className="w-6 h-6 rounded-full bg-[#FFF4EA] text-[#EA580C] text-xs font-bold flex items-center justify-center">
                A
              </span>
              <h3 className="text-base font-bold text-[#252525]">Campaign Brief & Messaging</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Campaign Name */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Campaign Name / Identifier</label>
                <input
                  type="text"
                  value={formData.campaign_name}
                  onChange={(e) => handleChange('campaign_name', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F5F6F8] border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#EA580C] focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Industry */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Industry Vertical</label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F5F6F8] border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#EA580C] focus:bg-white transition-all"
                >
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              {/* Creative Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Creative Asset Format</label>
                <select
                  value={formData.creative_type}
                  onChange={(e) => handleChange('creative_type', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F5F6F8] border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#EA580C] focus:bg-white transition-all"
                >
                  {CREATIVE_TYPES.map(cr => (
                    <option key={cr} value={cr}>{cr}</option>
                  ))}
                </select>
              </div>

              {/* Message Theme */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Core Messaging Hook</label>
                <select
                  value={formData.message_theme}
                  onChange={(e) => handleChange('message_theme', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F5F6F8] border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#EA580C] focus:bg-white transition-all"
                >
                  {MESSAGE_THEMES.map(th => (
                    <option key={th} value={th}>{th}</option>
                  ))}
                </select>
              </div>

              {/* Target Demographic */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Target Demographic Segment</label>
                <select
                  value={formData.target_audience}
                  onChange={(e) => handleChange('target_audience', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F5F6F8] border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#EA580C] focus:bg-white transition-all"
                >
                  {TARGET_AUDIENCES.map(aud => (
                    <option key={aud} value={aud}>{aud}</option>
                  ))}
                </select>
              </div>

              {/* Addressable Audience Size */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Audience Pool Size</label>
                <input
                  type="number"
                  min="50000"
                  max="20000000"
                  step="50000"
                  value={formData.target_audience_size}
                  onChange={(e) => handleChange('target_audience_size', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#F5F6F8] border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#EA580C] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION B: Marketing Channel Selector */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <span className="w-6 h-6 rounded-full bg-[#FFF4EA] text-[#EA580C] text-xs font-bold flex items-center justify-center">
                B
              </span>
              <h3 className="text-base font-bold text-[#252525]">Primary Marketing Channel</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CHANNELS.map(ch => {
                const isSelected = formData.channel === ch.id;
                return (
                  <div
                    key={ch.id}
                    onClick={() => handleChange('channel', ch.id)}
                    className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 relative ${
                      isSelected
                        ? 'border-[#EA580C] bg-[#FFF4EA]/60 shadow-orange-glow'
                        : 'border-gray-200 hover:border-orange-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-base text-[#252525]">{ch.label}</h4>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-[#EA580C]" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-300" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{ch.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION C & D: Budget & Timing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Budget */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <span className="w-6 h-6 rounded-full bg-[#FFF4EA] text-[#EA580C] text-xs font-bold flex items-center justify-center">
                  C
                </span>
                <h3 className="text-base font-bold text-[#252525]">Planned Campaign Expenditure</h3>
              </div>

              <div className="bg-[#F5F6F8] p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-gray-500">Planned Budget</span>
                  <div className="text-2xl font-black text-[#EA580C]">
                    ${Number(formData.budget).toLocaleString()}
                  </div>
                </div>

                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={formData.budget}
                  onChange={(e) => handleChange('budget', Number(e.target.value))}
                  className="w-full accent-[#EA580C] cursor-pointer"
                />

                <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                  <span>$500 Min</span>
                  <span>Daily Spend: ${(formData.budget / Math.max(formData.campaign_duration, 1)).toFixed(1)}/day</span>
                  <span>$50,000+ Scale</span>
                </div>
              </div>
            </div>

            {/* Timing & Duration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <span className="w-6 h-6 rounded-full bg-[#FFF4EA] text-[#EA580C] text-xs font-bold flex items-center justify-center">
                  D
                </span>
                <h3 className="text-base font-bold text-[#252525]">Timing, Duration & Seasonality</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Flight Duration (Days)</label>
                  <input
                    type="number"
                    min="3"
                    max="90"
                    value={formData.campaign_duration}
                    onChange={(e) => handleChange('campaign_duration', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#F5F6F8] border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#EA580C] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Seasonality Window</label>
                  <select
                    value={formData.seasonality}
                    onChange={(e) => handleChange('seasonality', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F5F6F8] border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#EA580C] focus:bg-white"
                  >
                    {SEASONALITIES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Brand Maturity</label>
                  <select
                    value={formData.brand_affinity}
                    onChange={(e) => handleChange('brand_affinity', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F5F6F8] border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#EA580C] focus:bg-white"
                  >
                    <option value="New">New Market Entrant</option>
                    <option value="Emerging">Emerging Challenger</option>
                    <option value="Established">Established Category Leader</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Competitor Pressure</label>
                  <select
                    value={formData.competitor_activity}
                    onChange={(e) => handleChange('competitor_activity', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F5F6F8] border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#EA580C] focus:bg-white"
                  >
                    <option value="Low">Low / Uncontested</option>
                    <option value="Moderate">Moderate Market Activity</option>
                    <option value="High">High Promotional Saturation</option>
                    <option value="Intense Clash">Intense Peak Auction Clash</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-4 flex flex-col items-center justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`w-full max-w-md py-4 px-8 orange-gradient-bg text-white font-extrabold rounded-2xl text-base shadow-orange-glow hover:shadow-orange-glow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 ${
                loading ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Computing Multi-Target ML Projections...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-white" />
                  <span>GENERATE CAMPAIGN PREDICTION</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-[11px] text-gray-400 mt-2 font-medium">
              Executes 3x XGBoost Regressors with calibrated 80% confidence bounds & GenAI risk synthesis
            </p>
          </div>

        </div>
      </form>

      {/* RESULTS DISPLAY PANEL */}
      {result && (
        <div id="prediction-results" className="space-y-8 animate-fadeIn pt-4">
          
          {/* Header of results */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-premium">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  Prediction Complete
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {result.campaign_id}
                </span>
              </div>
              <h2 className="text-xl font-black text-[#252525] mt-1">
                {result.campaign_name}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 bg-[#FFF4EA] text-[#EA580C] rounded-xl border border-[#EA580C]/20">
                Model: {result.model_metadata.algorithm}
              </span>
            </div>
          </div>

          {/* 3 Primary Prediction Output Cards with 80% CI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Predicted Reach Card */}
            <div className="bg-white rounded-3xl p-6 border-2 border-[#EA580C]/20 shadow-premium relative overflow-hidden group hover:border-[#EA580C] transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Predicted Reach
                </span>
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#EA580C]">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="text-4xl font-black text-[#252525] tracking-tight">
                  {result.predicted_reach.value.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">Unique individuals reached</p>
              </div>

              {/* Calibrated 80% CI Box */}
              <div className="mt-5 p-3.5 bg-[#FFF4EA] rounded-2xl border border-[#EA580C]/20">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#EA580C]">
                  <span>80% Prediction Interval</span>
                  <span>±{Math.round(result.predicted_reach.interval_width / 2).toLocaleString()}</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between font-mono text-xs font-bold text-gray-800">
                  <span>{result.predicted_reach.lower_bound.toLocaleString()}</span>
                  <span className="text-gray-400 text-[10px]">to</span>
                  <span>{result.predicted_reach.upper_bound.toLocaleString()}</span>
                </div>
                <div className="w-full bg-orange-200/50 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#EA580C] h-full rounded-full w-4/5 mx-auto" />
                </div>
              </div>
            </div>

            {/* Predicted CTR Card */}
            <div className="bg-white rounded-3xl p-6 border-2 border-[#EA580C]/20 shadow-premium relative overflow-hidden group hover:border-[#EA580C] transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Predicted CTR
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <MousePointerClick className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="text-4xl font-black text-[#EA580C] tracking-tight">
                  {result.predicted_ctr.value.toFixed(2)}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Click-through engagement rate</p>
              </div>

              {/* Calibrated 80% CI Box */}
              <div className="mt-5 p-3.5 bg-blue-50 rounded-2xl border border-blue-200/60">
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-800">
                  <span>80% Prediction Interval</span>
                  <span>±{(result.predicted_ctr.interval_width / 2).toFixed(2)}%</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between font-mono text-xs font-bold text-gray-800">
                  <span>{result.predicted_ctr.lower_bound.toFixed(2)}%</span>
                  <span className="text-gray-400 text-[10px]">to</span>
                  <span>{result.predicted_ctr.upper_bound.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-blue-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full w-4/5 mx-auto" />
                </div>
              </div>
            </div>

            {/* Predicted Conversions Card */}
            <div className="bg-white rounded-3xl p-6 border-2 border-emerald-500/30 shadow-premium relative overflow-hidden group hover:border-emerald-500 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Expected Conversions
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Target className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="text-4xl font-black text-emerald-600 tracking-tight">
                  {result.predicted_conversions.value.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">Prospective customer actions</p>
              </div>

              {/* Calibrated 80% CI Box */}
              <div className="mt-5 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                  <span>80% Prediction Interval</span>
                  <span>±{Math.round(result.predicted_conversions.interval_width / 2).toLocaleString()}</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between font-mono text-xs font-bold text-gray-800">
                  <span>{result.predicted_conversions.lower_bound.toLocaleString()}</span>
                  <span className="text-gray-400 text-[10px]">to</span>
                  <span>{result.predicted_conversions.upper_bound.toLocaleString()}</span>
                </div>
                <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full w-4/5 mx-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* DETECTED RISKS SECTION */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-premium space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#EA580C]" />
                <h3 className="text-base font-bold text-[#252525]">Pre-Launch Campaign Risk Detection</h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                result.risks.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {result.risks.length} Risk Flag(s) Detected
              </span>
            </div>

            {result.risks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {result.risks.map((risk) => (
                  <div 
                    key={risk.risk_id}
                    className={`p-5 rounded-2xl border-l-4 space-y-2 bg-[#F5F6F8] ${
                      risk.severity === 'High' ? 'border-l-red-500' : 'border-l-amber-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-gray-900">{risk.risk_name}</h4>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        risk.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {risk.severity} Severity
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{risk.explanation}</p>
                    <div className="pt-2 text-xs font-medium text-gray-800 bg-white p-2.5 rounded-xl border border-gray-200/70">
                      <span className="font-bold text-[#EA580C]">Recommended Mitigation: </span>
                      {risk.corrective_action}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>No critical campaign configuration vulnerabilities detected. Parameters align with platform delivery guidelines.</span>
              </div>
            )}
          </div>

          {/* ACTIONABLE IMPROVEMENT SUGGESTIONS */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-premium space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-[#252525]">Concrete Campaign Optimization Suggestions</h3>
              </div>
              <span className="text-xs text-gray-400 font-semibold">1-3 Model-Backed Recommendations</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {result.improvement_suggestions.map((sugg) => (
                <div key={sugg.suggestion_id} className="p-5 bg-[#FFF4EA]/50 rounded-2xl border border-[#EA580C]/20 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        sugg.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-[#EA580C]'
                      }`}>
                        {sugg.priority} Priority
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 leading-snug">{sugg.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{sugg.reason}</p>
                  </div>

                  <div className="pt-3 border-t border-[#EA580C]/10 space-y-2">
                    <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                      <span className="font-bold">Estimated Lift: </span>{sugg.expected_impact}
                    </div>
                    <button
                      onClick={() => onNavigateToWhatIf(result, sugg)}
                      className="w-full py-2 bg-white hover:bg-orange-50 text-[#EA580C] border border-[#EA580C]/30 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Simulate in What-If</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GEMINI GENERATIVE AI SYNTHESIS */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-purple-200/80 shadow-premium space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#252525]">Gemini AI Strategic Interpretation</h3>
                  <p className="text-xs text-gray-500">Natural-language narrative synthesis grounded in XGBoost predictions</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg">
                  {result.gemini_insights.model_used}
                </span>
                {result.gemini_insights.is_fallback && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                    Deterministic Fallback
                  </span>
                )}
              </div>
            </div>

            {/* Insight Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-100 text-xs">
              {[
                { id: 'summary', label: 'Executive Summary' },
                { id: 'performance', label: 'Performance Deep Dive' },
                { id: 'confidence', label: 'Confidence & Uncertainty' },
                { id: 'advisory', label: 'Risk Advisory' },
                { id: 'steps', label: 'Strategic Next Steps' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveInsightTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    activeInsightTab === tab.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="text-sm text-gray-700 leading-relaxed bg-[#F5F6F8] p-6 rounded-2xl">
              {activeInsightTab === 'summary' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900 text-sm">Executive Overview</h4>
                  <p>{result.gemini_insights.executive_summary}</p>
                </div>
              )}
              {activeInsightTab === 'performance' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900 text-sm">Performance Dynamics</h4>
                  <p>{result.gemini_insights.performance_interpretation}</p>
                </div>
              )}
              {activeInsightTab === 'confidence' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900 text-sm">80% Interval Rationale</h4>
                  <p>{result.gemini_insights.confidence_explanation}</p>
                </div>
              )}
              {activeInsightTab === 'advisory' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900 text-sm">Risk Assessment</h4>
                  <p>{result.gemini_insights.risk_advisory}</p>
                </div>
              )}
              {activeInsightTab === 'steps' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 text-sm">Recommended Action Plan</h4>
                  <ul className="space-y-2">
                    {result.gemini_insights.strategic_next_steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
