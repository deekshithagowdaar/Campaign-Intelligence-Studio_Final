import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  SlidersHorizontal,
  Zap,
  Target,
  RefreshCw,
  Layers,
  AlertTriangle,
  Info
} from 'lucide-react';
import { api } from '../services/api';

// Map suggestion parameters to What-If parameter labels
const PARAM_LABEL_MAP = {
  'budget': 'Budget Expenditure',
  'channel': 'Marketing Channel',
  'campaign_duration': 'Flight Duration',
  'creative_type': 'Creative Format',
  'target_audience_size': 'Audience Size',
  'seasonality': 'Seasonality Window',
  'message_theme': 'Messaging Theme'
};

export default function RecommendationsPage({ onNavigateToWhatIf, onNavigateToPrediction, selectedCampaignId, onCampaignSelect }) {
  const [campaigns, setCampaigns] = useState([]);
  const [activeCampaignId, setActiveCampaignId] = useState(selectedCampaignId || null);
  const [recommendations, setRecommendations] = useState([]);
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load campaign history on mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  // Sync external selectedCampaignId
  useEffect(() => {
    if (selectedCampaignId && selectedCampaignId !== activeCampaignId) {
      setActiveCampaignId(selectedCampaignId);
    }
  }, [selectedCampaignId]);

  // Load recommendations when campaign changes
  useEffect(() => {
    if (activeCampaignId) {
      loadCampaignRecommendations(activeCampaignId);
    }
  }, [activeCampaignId]);

  async function loadCampaigns() {
    setCampaignsLoading(true);
    try {
      const history = await api.getCampaignHistory(50);
      setCampaigns(history);
      if (!activeCampaignId && history.length > 0) {
        setActiveCampaignId(history[0].id);
      }
    } catch (err) {
      console.error("Failed to load campaign history:", err);
      setError("Unable to load campaign history. Ensure the backend is running.");
    } finally {
      setCampaignsLoading(false);
    }
  }

  async function loadCampaignRecommendations(campaignId) {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getCampaignRecommendations(campaignId);
      setRecommendations(result.recommendations || []);
      setCampaignData(result);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      setError(err.message || "Failed to generate recommendations for this campaign.");
      setRecommendations([]);
      setCampaignData(null);
    } finally {
      setLoading(false);
    }
  }

  function handleCampaignSelect(campaignId) {
    setActiveCampaignId(campaignId);
    if (onCampaignSelect) onCampaignSelect(campaignId);
  }

  function handleRefresh() {
    if (activeCampaignId) {
      loadCampaignRecommendations(activeCampaignId);
    }
  }

  function handleTestInWhatIf(suggestion) {
    if (!campaignData || !campaignData.inputs) return;
    // Pass the actual campaign inputs and the suggestion to What-If
    const campaignForWhatIf = {
      ...campaignData.inputs,
      campaign_name: campaignData.campaign_name || campaignData.inputs.campaign_name,
      _campaign_id: activeCampaignId,
      _predictions: {
        predicted_reach: campaignData.predicted_reach,
        predicted_ctr: campaignData.predicted_ctr,
        predicted_conversions: campaignData.predicted_conversions,
      }
    };
    onNavigateToWhatIf(campaignForWhatIf, suggestion);
  }

  const activeCampaignMeta = campaigns.find(c => c.id === activeCampaignId);

  // Empty state: no campaigns at all
  if (!campaignsLoading && campaigns.length === 0) {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF4EA] text-[#EA580C] rounded-full text-xs font-bold mb-2">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>AI Campaign Optimization Advisory</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#252525] tracking-tight">
              Actionable Optimization Recommendations
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              Prioritized strategic improvements derived from XGBoost model sensitivities, 
              channel benchmarking, and risk mitigation playbooks.
            </p>
          </div>
        </div>

        <div className="p-12 text-center space-y-4 bg-white rounded-3xl border border-gray-100 shadow-premium">
          <div className="w-16 h-16 rounded-3xl bg-[#FFF4EA] text-[#EA580C] flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900">No Campaigns Analysed Yet</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Run a campaign prediction first to generate optimization recommendations. 
              The advisory engine analyses your campaign configuration, model predictions, 
              and detected risks to provide targeted improvement suggestions.
            </p>
          </div>
          <button
            onClick={onNavigateToPrediction}
            className="px-6 py-2.5 orange-gradient-bg text-white font-bold rounded-xl text-xs shadow-orange-glow hover:opacity-95 transition-all"
          >
            Run First Campaign Prediction
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF4EA] text-[#EA580C] rounded-full text-xs font-bold mb-2">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>AI Campaign Optimization Advisory</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#252525] tracking-tight">
            Actionable Optimization Recommendations
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Prioritized strategic improvements derived from XGBoost model sensitivities, 
            channel benchmarking, and risk mitigation playbooks.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleRefresh}
            disabled={loading || !activeCampaignId}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Campaign Selector */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-premium space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Select Campaign for Optimization Advisory</h3>
          </div>
          <span className="text-xs text-gray-400 font-semibold">{campaigns.length} campaign(s) available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {campaigns.slice(0, 9).map((c) => (
            <button
              key={c.id}
              onClick={() => handleCampaignSelect(c.id)}
              className={`p-4 rounded-2xl text-left border-2 transition-all duration-200 ${
                activeCampaignId === c.id
                  ? 'border-[#EA580C] bg-[#FFF4EA]/60 shadow-orange-glow'
                  : 'border-gray-200 hover:border-orange-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm text-gray-900 truncate">{c.name}</h4>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                  c.max_risk_severity === 'High' ? 'bg-red-100 text-red-700' :
                  c.max_risk_severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {c.max_risk_severity}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-500">
                <span>{c.channel}</span>
                <span>•</span>
                <span>${Number(c.budget).toLocaleString()}</span>
                <span>•</span>
                <span>CTR: {Number(c.predicted_ctr).toFixed(2)}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-12 h-12 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-gray-600 animate-pulse">Generating Campaign-Specific Recommendations...</p>
        </div>
      )}

      {/* Recommendations Results */}
      {!loading && activeCampaignId && campaignData && (
        <>
          {/* Campaign Context */}
          {activeCampaignMeta && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-premium">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Optimizing Campaign</h3>
                </div>
                <span className="text-xs font-mono font-bold text-gray-400">{activeCampaignId}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                <div className="p-3 bg-[#F5F6F8] rounded-xl">
                  <span className="text-gray-400 block text-[10px]">Campaign</span>
                  <span className="font-bold text-gray-800 truncate block">{activeCampaignMeta.name}</span>
                </div>
                <div className="p-3 bg-[#F5F6F8] rounded-xl">
                  <span className="text-gray-400 block text-[10px]">Channel</span>
                  <span className="font-bold text-gray-800">{activeCampaignMeta.channel}</span>
                </div>
                <div className="p-3 bg-[#F5F6F8] rounded-xl">
                  <span className="text-gray-400 block text-[10px]">Budget</span>
                  <span className="font-bold text-gray-800">${Number(activeCampaignMeta.budget).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-[#F5F6F8] rounded-xl">
                  <span className="text-gray-400 block text-[10px]">Predicted Reach</span>
                  <span className="font-bold text-gray-800">{Number(activeCampaignMeta.predicted_reach).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-[#F5F6F8] rounded-xl">
                  <span className="text-gray-400 block text-[10px]">Predicted CTR</span>
                  <span className="font-bold text-gray-800">{Number(activeCampaignMeta.predicted_ctr).toFixed(2)}%</span>
                </div>
                <div className="p-3 bg-[#F5F6F8] rounded-xl">
                  <span className="text-gray-400 block text-[10px]">Conversions</span>
                  <span className="font-bold text-gray-800">{Number(activeCampaignMeta.predicted_conversions).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* No recommendations state */}
          {recommendations.length === 0 && (
            <div className="bg-white rounded-3xl p-8 border-2 border-emerald-200 shadow-premium text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-emerald-800">Campaign Is Well-Optimized</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto mt-2">
                  No targeted optimization recommendations were generated for this campaign configuration. 
                  The current parameter set appears well-calibrated for the selected channel and audience.
                </p>
              </div>
            </div>
          )}

          {/* Recommendations Cards */}
          {recommendations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((sugg, idx) => {
                const isWhatIfSupported = ['budget', 'channel', 'campaign_duration', 'creative_type', 'target_audience_size', 'seasonality'].includes(sugg.suggested_parameter);
                return (
                  <div
                    key={sugg.suggestion_id}
                    className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-premium hover:shadow-premium-hover transition-all flex flex-col justify-between space-y-6 group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md ${
                          sugg.priority === 'High' ? 'bg-red-100 text-red-700' : 
                          sugg.priority === 'Medium' ? 'bg-orange-100 text-[#EA580C]' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {sugg.priority} Priority
                        </span>
                        <span className="text-xs font-bold text-gray-400">
                          Optimization #{idx + 1}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-[#EA580C] transition-colors">
                        {sugg.title}
                      </h3>

                      <p className="text-xs text-gray-600 leading-relaxed">
                        {sugg.reason}
                      </p>

                      {/* Current vs Suggested */}
                      {sugg.suggested_parameter && (
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200/50 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-blue-700 font-bold">
                              Parameter: {PARAM_LABEL_MAP[sugg.suggested_parameter] || sugg.suggested_parameter}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-gray-600">
                              Current: <span className="font-bold text-gray-800">
                                {campaignData.inputs?.[sugg.suggested_parameter] !== undefined 
                                  ? (typeof campaignData.inputs[sugg.suggested_parameter] === 'number' 
                                    ? (sugg.suggested_parameter === 'budget' 
                                      ? `$${Number(campaignData.inputs[sugg.suggested_parameter]).toLocaleString()}`
                                      : Number(campaignData.inputs[sugg.suggested_parameter]).toLocaleString())
                                    : campaignData.inputs[sugg.suggested_parameter])
                                  : 'N/A'}
                              </span>
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-blue-800 font-bold">
                              Suggested: {typeof sugg.suggested_value === 'number' 
                                ? (sugg.suggested_parameter === 'budget' 
                                  ? `$${Number(sugg.suggested_value).toLocaleString()}`
                                  : Number(sugg.suggested_value).toLocaleString())
                                : sugg.suggested_value}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      {/* Expected Impact Box */}
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/70">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                          Benchmark-Based Estimate
                        </span>
                        <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 flex-shrink-0" />
                          <span>{sugg.expected_impact}</span>
                        </p>
                        <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Based on industry benchmarks, not an XGBoost prediction. Use What-If to get model-predicted values.
                        </p>
                      </div>

                      {/* Action Button */}
                      {isWhatIfSupported ? (
                        <button
                          onClick={() => handleTestInWhatIf(sugg)}
                          className="w-full py-3 px-4 bg-[#FFF4EA] hover:bg-[#FFE4D2] text-[#EA580C] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                          <span>Test in What-If Analysis ({PARAM_LABEL_MAP[sugg.suggested_parameter] || sugg.suggested_parameter})</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="w-full py-3 px-4 bg-gray-50 text-gray-500 font-bold rounded-xl text-xs text-center">
                          Manual configuration change recommended
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
