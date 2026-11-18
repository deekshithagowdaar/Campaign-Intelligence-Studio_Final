import React, { useState, useEffect, useRef } from 'react';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  Play, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  MousePointerClick, 
  Target, 
  Layers,
  ChevronRight,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { api } from '../services/api';

const DEFAULT_BASELINE = {
  campaign_name: "Summer Growth Initiative",
  creative_type: "Video",
  message_theme: "Product Launch",
  industry: "E-commerce",
  target_audience: "Working Professionals 25-34",
  channel: "Instagram",
  budget: 5000,
  campaign_duration: 21,
  launch_date: "2025-06-15",
  seasonality: "Q2 Summer/Mid-Year",
  target_audience_size: 750000,
  brand_affinity: "Emerging",
  competitor_activity: "Moderate"
};

// Fields that are part of CampaignInput and should be passed to baseline
const CAMPAIGN_INPUT_FIELDS = [
  'campaign_name', 'creative_type', 'message_theme', 'industry',
  'target_audience', 'channel', 'budget', 'campaign_duration',
  'launch_date', 'seasonality', 'target_audience_size',
  'brand_affinity', 'competitor_activity'
];

function extractCampaignInputs(data) {
  if (!data) return DEFAULT_BASELINE;
  // If the data has an 'inputs' subobject (from stored campaign), use that
  const src = data.inputs || data;
  const result = {};
  for (const field of CAMPAIGN_INPUT_FIELDS) {
    if (src[field] !== undefined) {
      result[field] = src[field];
    }
  }
  // Ensure all required fields exist by falling back to defaults
  for (const field of CAMPAIGN_INPUT_FIELDS) {
    if (result[field] === undefined) {
      result[field] = DEFAULT_BASELINE[field];
    }
  }
  return result;
}

export default function WhatIfPage({ initialCampaign, appliedSuggestion }) {
  const hasInitialized = useRef(false);

  const [baseline, setBaseline] = useState(() => {
    return extractCampaignInputs(initialCampaign);
  });

  const [activeParam, setActiveParam] = useState(() => {
    if (appliedSuggestion?.suggested_parameter) return appliedSuggestion.suggested_parameter;
    return 'budget';
  });

  const [paramValue, setParamValue] = useState(() => {
    if (appliedSuggestion?.suggested_value !== undefined) return appliedSuggestion.suggested_value;
    return 8000;
  });

  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [campaignSource, setCampaignSource] = useState(() => {
    if (initialCampaign?.campaign_name || initialCampaign?.inputs?.campaign_name) return 'selected';
    return 'default';
  });

  // Update when new props arrive (navigating from recommendations/prediction)
  useEffect(() => {
    if (hasInitialized.current) {
      const newBaseline = extractCampaignInputs(initialCampaign);
      setBaseline(newBaseline);
      setCampaignSource(initialCampaign?.campaign_name || initialCampaign?.inputs?.campaign_name ? 'selected' : 'default');
      
      if (appliedSuggestion?.suggested_parameter) {
        setActiveParam(appliedSuggestion.suggested_parameter);
        if (appliedSuggestion.suggested_value !== undefined) {
          setParamValue(appliedSuggestion.suggested_value);
          runSimulation(appliedSuggestion.suggested_parameter, appliedSuggestion.suggested_value, newBaseline);
        }
      } else {
        setActiveParam('budget');
        setParamValue(Math.round(newBaseline.budget * 1.5));
        runSimulation('budget', Math.round(newBaseline.budget * 1.5), newBaseline);
      }
    }
  }, [initialCampaign, appliedSuggestion]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      runSimulation(activeParam, paramValue, baseline);
    }
  }, []);

  async function runSimulation(param = activeParam, val = paramValue, base = baseline) {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        baseline_campaign: base,
        modified_parameter: param,
        modified_value: val
      };
      const res = await api.runWhatIf(payload);
      setSimulationResult(res);
    } catch (err) {
      console.error("Simulation error:", err);
      setError(err.message || "What-If simulation failed");
    } finally {
      setLoading(false);
    }
  }

  function handleParamSelect(param) {
    setActiveParam(param);
    let defaultVal = baseline[param];
    if (param === 'budget') defaultVal = Math.round(baseline.budget * 1.5);
    else if (param === 'channel') defaultVal = baseline.channel === 'Instagram' ? 'LinkedIn' : 'Instagram';
    else if (param === 'campaign_duration') defaultVal = Math.min(60, baseline.campaign_duration + 14);
    else if (param === 'target_audience_size') defaultVal = Math.round(baseline.target_audience_size * 2);
    else if (param === 'creative_type') defaultVal = baseline.creative_type === 'Video' ? 'Carousel' : 'Video';
    else if (param === 'seasonality') defaultVal = 'Q4 Holiday/BFCM';

    setParamValue(defaultVal);
    runSimulation(param, defaultVal);
  }

  function handleReset() {
    setActiveParam('budget');
    setParamValue(Math.round(baseline.budget * 1.5));
    runSimulation('budget', Math.round(baseline.budget * 1.5));
  }

  // Compute risk comparison data
  const baselineRiskIds = simulationResult ? new Set(
    // The original risks come from the baseline prediction done inside the What-If service
    // We compare new_risks (scenario) with the risk_summary_change
  ) : new Set();
  
  const scenarioRisks = simulationResult?.new_risks || [];

  // Chart comparison data
  const comparisonChartData = simulationResult ? [
    {
      metric: 'Reach (x1000)',
      Baseline: Math.round(simulationResult.reach_comparison.baseline_value / 1000),
      Scenario: Math.round(simulationResult.reach_comparison.scenario_value / 1000),
    },
    {
      metric: 'Conversions',
      Baseline: Math.round(simulationResult.conversions_comparison.baseline_value),
      Scenario: Math.round(simulationResult.conversions_comparison.scenario_value),
    }
  ] : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF4EA] text-[#EA580C] rounded-full text-xs font-bold mb-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Interactive Scenario Simulator</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#252525] tracking-tight">
            What-If Sensitivity Analysis
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Modify one parameter at a time to examine marginal effects, diminishing returns, and 
            trade-offs using the trained XGBoost model.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Baseline</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Baseline Overview Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-premium">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Active Baseline Reference</h3>
          </div>
          <div className="flex items-center gap-2">
            {campaignSource === 'selected' && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">
                From Campaign History
              </span>
            )}
            <span className="text-xs font-bold text-gray-700">{baseline.campaign_name}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 bg-[#F5F6F8] rounded-xl">
            <span className="text-gray-400 block text-[10px]">Budget</span>
            <span className="font-bold text-gray-800">${Number(baseline.budget).toLocaleString()}</span>
          </div>
          <div className="p-3 bg-[#F5F6F8] rounded-xl">
            <span className="text-gray-400 block text-[10px]">Channel</span>
            <span className="font-bold text-gray-800">{baseline.channel}</span>
          </div>
          <div className="p-3 bg-[#F5F6F8] rounded-xl">
            <span className="text-gray-400 block text-[10px]">Creative Format</span>
            <span className="font-bold text-gray-800">{baseline.creative_type}</span>
          </div>
          <div className="p-3 bg-[#F5F6F8] rounded-xl">
            <span className="text-gray-400 block text-[10px]">Duration</span>
            <span className="font-bold text-gray-800">{baseline.campaign_duration} Days</span>
          </div>
          <div className="p-3 bg-[#F5F6F8] rounded-xl">
            <span className="text-gray-400 block text-[10px]">Audience Size</span>
            <span className="font-bold text-gray-800">{(baseline.target_audience_size / 1000).toFixed(0)}k</span>
          </div>
          <div className="p-3 bg-[#F5F6F8] rounded-xl">
            <span className="text-gray-400 block text-[10px]">Seasonality</span>
            <span className="font-bold text-gray-800">{baseline.seasonality}</span>
          </div>
        </div>
      </div>

      {/* Parameter Selector & Interactive Controls */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-premium space-y-6">
        <div>
          <h3 className="text-base font-bold text-[#252525]">Select Parameter to Test</h3>
          <p className="text-xs text-gray-500">Isolate a single variable to evaluate marginal sensitivity</p>
        </div>

        {/* Parameter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'budget', label: 'Budget Expenditure' },
            { id: 'channel', label: 'Marketing Channel' },
            { id: 'campaign_duration', label: 'Flight Duration' },
            { id: 'creative_type', label: 'Creative Format' },
            { id: 'target_audience_size', label: 'Audience Size' },
            { id: 'seasonality', label: 'Seasonality Window' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => handleParamSelect(p.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeParam === p.id
                  ? 'orange-gradient-bg text-white shadow-orange-glow'
                  : 'bg-[#F5F6F8] text-gray-600 hover:bg-[#FFF4EA] hover:text-[#EA580C]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Parameter Modifier Interactive Widget */}
        <div className="p-6 bg-[#FFF4EA]/40 rounded-2xl border border-[#EA580C]/20 space-y-5">
          {/* Budget Control */}
          {activeParam === 'budget' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Adjust Planned Budget</h4>
                  <p className="text-xs text-gray-500">Baseline: ${Number(baseline.budget).toLocaleString()}</p>
                </div>
                <div className="text-2xl font-black text-[#EA580C]">
                  ${Number(paramValue).toLocaleString()}
                </div>
              </div>

              <input
                type="range"
                min="500"
                max="60000"
                step="500"
                value={paramValue}
                onChange={(e) => {
                  setParamValue(Number(e.target.value));
                  runSimulation('budget', Number(e.target.value));
                }}
                className="w-full accent-[#EA580C] cursor-pointer"
              />

              <div className="flex flex-wrap gap-2 pt-2">
                {[-25, -10, 10, 25, 50, 100].map(pct => {
                  const targetSpend = Math.round(baseline.budget * (1 + pct / 100));
                  return (
                    <button
                      key={pct}
                      onClick={() => {
                        setParamValue(targetSpend);
                        runSimulation('budget', targetSpend);
                      }}
                      className="px-3 py-1 bg-white hover:bg-orange-50 text-gray-700 hover:text-[#EA580C] border border-gray-200 rounded-lg text-xs font-bold transition-colors"
                    >
                      {pct > 0 ? `+${pct}%` : `${pct}%`} (${targetSpend.toLocaleString()})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Channel Control */}
          {activeParam === 'channel' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-800">Switch Target Channel</h4>
              <div className="grid grid-cols-3 gap-3">
                {["Instagram", "Facebook", "LinkedIn"].map(ch => (
                  <button
                    key={ch}
                    onClick={() => {
                      setParamValue(ch);
                      runSimulation('channel', ch);
                    }}
                    className={`p-4 rounded-xl font-bold text-xs border-2 transition-all ${
                      paramValue === ch
                        ? 'border-[#EA580C] bg-white text-[#EA580C] shadow-xs'
                        : 'border-gray-200 bg-white/60 text-gray-700 hover:border-orange-200'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Duration Control */}
          {activeParam === 'campaign_duration' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Adjust Flight Duration</h4>
                  <p className="text-xs text-gray-500">Baseline: {baseline.campaign_duration} Days</p>
                </div>
                <div className="text-2xl font-black text-[#EA580C]">
                  {paramValue} Days
                </div>
              </div>

              <input
                type="range"
                min="3"
                max="90"
                step="1"
                value={paramValue}
                onChange={(e) => {
                  setParamValue(Number(e.target.value));
                  runSimulation('campaign_duration', Number(e.target.value));
                }}
                className="w-full accent-[#EA580C] cursor-pointer"
              />
            </div>
          )}

          {/* Creative Type Control */}
          {activeParam === 'creative_type' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-800">Select Alternative Creative Format</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["Video", "Carousel", "Static Image", "Story", "Reel", "Text/Article"].map(cr => (
                  <button
                    key={cr}
                    onClick={() => {
                      setParamValue(cr);
                      runSimulation('creative_type', cr);
                    }}
                    className={`p-3 rounded-xl font-bold text-xs border-2 transition-all ${
                      paramValue === cr
                        ? 'border-[#EA580C] bg-white text-[#EA580C] shadow-xs'
                        : 'border-gray-200 bg-white/60 text-gray-700 hover:border-orange-200'
                    }`}
                  >
                    {cr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target Audience Size */}
          {activeParam === 'target_audience_size' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Expand or Narrow Audience Scale</h4>
                  <p className="text-xs text-gray-500">Baseline: {(baseline.target_audience_size).toLocaleString()}</p>
                </div>
                <div className="text-2xl font-black text-[#EA580C]">
                  {Number(paramValue).toLocaleString()}
                </div>
              </div>

              <input
                type="range"
                min="50000"
                max="10000000"
                step="50000"
                value={paramValue}
                onChange={(e) => {
                  setParamValue(Number(e.target.value));
                  runSimulation('target_audience_size', Number(e.target.value));
                }}
                className="w-full accent-[#EA580C] cursor-pointer"
              />
            </div>
          )}

          {/* Seasonality */}
          {activeParam === 'seasonality' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-800">Simulate Alternate Seasonal Timing</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["Q1 Normal", "Q2 Summer/Mid-Year", "Q3 Back-to-School", "Q4 Holiday/BFCM", "Non-Holiday Off-Peak"].map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setParamValue(s);
                      runSimulation('seasonality', s);
                    }}
                    className={`p-3 rounded-xl font-bold text-xs border-2 transition-all ${
                      paramValue === s
                        ? 'border-[#EA580C] bg-white text-[#EA580C] shadow-xs'
                        : 'border-gray-200 bg-white/60 text-gray-700 hover:border-orange-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-gray-600 animate-pulse">Running XGBoost simulation...</p>
        </div>
      )}

      {/* SIMULATION RESULTS COMPARISON */}
      {simulationResult && !loading && (
        <div className="space-y-8 animate-fadeIn">
          {/* Side by side metric delta cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Reach Comparison */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-premium space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Reach Comparison</span>
                <Users className="w-5 h-5 text-gray-400" />
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-400 block">Baseline</span>
                  <span className="text-lg font-bold text-gray-700">
                    {Math.round(simulationResult.reach_comparison.baseline_value).toLocaleString()}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
                <div className="text-right">
                  <span className="text-xs text-[#EA580C] block font-bold">Scenario</span>
                  <span className="text-2xl font-black text-[#252525]">
                    {Math.round(simulationResult.reach_comparison.scenario_value).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className={`p-3 rounded-xl flex items-center justify-between text-xs font-bold ${
                simulationResult.reach_comparison.delta_percentage >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                <div className="flex items-center gap-1.5">
                  {simulationResult.reach_comparison.delta_percentage >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span>{simulationResult.reach_comparison.delta_percentage >= 0 ? '+' : ''}{simulationResult.reach_comparison.delta_percentage.toFixed(1)}%</span>
                </div>
                <span>({simulationResult.reach_comparison.delta_absolute >= 0 ? '+' : ''}{Math.round(simulationResult.reach_comparison.delta_absolute).toLocaleString()})</span>
              </div>
            </div>

            {/* CTR Comparison */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-premium space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">CTR Comparison</span>
                <MousePointerClick className="w-5 h-5 text-gray-400" />
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-400 block">Baseline</span>
                  <span className="text-lg font-bold text-gray-700">
                    {simulationResult.ctr_comparison.baseline_value.toFixed(2)}%
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
                <div className="text-right">
                  <span className="text-xs text-[#EA580C] block font-bold">Scenario</span>
                  <span className="text-2xl font-black text-[#EA580C]">
                    {simulationResult.ctr_comparison.scenario_value.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className={`p-3 rounded-xl flex items-center justify-between text-xs font-bold ${
                simulationResult.ctr_comparison.delta_percentage >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                <div className="flex items-center gap-1.5">
                  {simulationResult.ctr_comparison.delta_percentage >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span>{simulationResult.ctr_comparison.delta_percentage >= 0 ? '+' : ''}{simulationResult.ctr_comparison.delta_percentage.toFixed(2)}%</span>
                </div>
                <span>({simulationResult.ctr_comparison.delta_absolute >= 0 ? '+' : ''}{simulationResult.ctr_comparison.delta_absolute.toFixed(2)}% pts)</span>
              </div>
            </div>

            {/* Conversions Comparison */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-premium space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Conversions Comparison</span>
                <Target className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-400 block">Baseline</span>
                  <span className="text-lg font-bold text-gray-700">
                    {Math.round(simulationResult.conversions_comparison.baseline_value).toLocaleString()}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
                <div className="text-right">
                  <span className="text-xs text-emerald-600 block font-bold">Scenario</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {Math.round(simulationResult.conversions_comparison.scenario_value).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className={`p-3 rounded-xl flex items-center justify-between text-xs font-bold ${
                simulationResult.conversions_comparison.delta_percentage >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                <div className="flex items-center gap-1.5">
                  {simulationResult.conversions_comparison.delta_percentage >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span>{simulationResult.conversions_comparison.delta_percentage >= 0 ? '+' : ''}{simulationResult.conversions_comparison.delta_percentage.toFixed(1)}%</span>
                </div>
                <span>({simulationResult.conversions_comparison.delta_absolute >= 0 ? '+' : ''}{Math.round(simulationResult.conversions_comparison.delta_absolute).toLocaleString()})</span>
              </div>
            </div>

          </div>

          {/* Visual Recharts Comparison & Gemini Narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-premium">
              <div className="mb-4">
                <h4 className="font-bold text-base text-[#252525]">Baseline vs. Scenario Comparison</h4>
                <p className="text-xs text-gray-500">Visualizing the real XGBoost prediction variance</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="metric" tick={{ fontSize: 12, fill: '#4B5563' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #EA580C30' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Baseline" fill="#9CA3AF" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Scenario" fill="#EA580C" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gemini Scenario Trade-off Narrative */}
            <div className="bg-white rounded-3xl p-6 border border-purple-200/80 shadow-premium flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-purple-700">
                  <Sparkles className="w-5 h-5" />
                  <h4 className="font-bold text-base text-[#252525]">AI Trade-off Explanation</h4>
                </div>

                <div className="p-4 bg-[#F5F6F8] rounded-2xl text-xs text-gray-700 leading-relaxed space-y-2">
                  <p>{simulationResult.gemini_scenario_explanation}</p>
                </div>
              </div>

              <div className="p-4 bg-[#FFF4EA] rounded-2xl border border-[#EA580C]/20 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#EA580C] block">Risk Impact</span>
                  <span className="text-gray-600">{simulationResult.risk_summary_change}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-white text-[#EA580C] rounded-md border border-[#EA580C]/20">
                  {simulationResult.new_risks.length} Flags
                </span>
              </div>
            </div>
          </div>

          {/* Scenario Risk Details */}
          {scenarioRisks.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-premium space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#EA580C]" />
                  <h3 className="text-base font-bold text-[#252525]">Scenario Risk Assessment</h3>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  scenarioRisks.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {scenarioRisks.length} Risk Flag(s) in Modified Scenario
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenarioRisks.map((risk) => (
                  <div 
                    key={risk.risk_id}
                    className={`p-4 rounded-2xl border-l-4 space-y-2 bg-[#F5F6F8] ${
                      risk.severity === 'High' ? 'border-l-red-500' : 
                      risk.severity === 'Medium' ? 'border-l-amber-500' :
                      'border-l-emerald-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-gray-900">{risk.risk_name}</h4>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        risk.severity === 'High' ? 'bg-red-100 text-red-700' : 
                        risk.severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {risk.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{risk.explanation}</p>
                    <div className="text-xs font-medium text-gray-800 bg-white p-2 rounded-xl border border-gray-200/70">
                      <span className="font-bold text-[#EA580C]">Mitigation: </span>
                      {risk.corrective_action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Risks in Scenario */}
          {scenarioRisks.length === 0 && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Modified scenario passes all 6 risk detection rules. No vulnerability flags triggered.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
