import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  Filter, 
  ArrowRight,
  TrendingDown,
  Layers,
  ChevronRight,
  Sparkles,
  RefreshCw,
  ChevronDown,
  Search
} from 'lucide-react';
import { api } from '../services/api';

export default function RiskAnalysisPage({ onNavigateToPrediction, selectedCampaignId, onCampaignSelect }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [risks, setRisks] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [activeCampaignId, setActiveCampaignId] = useState(selectedCampaignId || null);
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load campaign history on mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  // When external selectedCampaignId changes, sync it
  useEffect(() => {
    if (selectedCampaignId && selectedCampaignId !== activeCampaignId) {
      setActiveCampaignId(selectedCampaignId);
    }
  }, [selectedCampaignId]);

  // Load risks when activeCampaignId changes
  useEffect(() => {
    if (activeCampaignId) {
      loadCampaignRisks(activeCampaignId);
    }
  }, [activeCampaignId]);

  async function loadCampaigns() {
    setCampaignsLoading(true);
    try {
      const history = await api.getCampaignHistory(50);
      setCampaigns(history);
      // Auto-select first campaign if none selected
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

  async function loadCampaignRisks(campaignId) {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getCampaignRisks(campaignId);
      setRisks(result.risks || []);
      setCampaignData(result);
    } catch (err) {
      console.error("Failed to load campaign risks:", err);
      setError(err.message || "Failed to load risk analysis for this campaign.");
      setRisks([]);
      setCampaignData(null);
    } finally {
      setLoading(false);
    }
  }

  function handleCampaignSelect(campaignId) {
    setActiveCampaignId(campaignId);
    setFilterSeverity('ALL');
    if (onCampaignSelect) onCampaignSelect(campaignId);
  }

  function handleRefresh() {
    if (activeCampaignId) {
      loadCampaignRisks(activeCampaignId);
    }
  }

  const filteredRisks = filterSeverity === 'ALL' 
    ? risks 
    : risks.filter(r => r.severity.toUpperCase() === filterSeverity);

  const highCount = risks.filter(r => r.severity === 'High').length;
  const mediumCount = risks.filter(r => r.severity === 'Medium').length;
  const lowCount = risks.filter(r => r.severity === 'Low').length;

  const activeCampaignMeta = campaigns.find(c => c.id === activeCampaignId);

  // Empty state: no campaigns at all
  if (!campaignsLoading && campaigns.length === 0) {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Pre-Launch Risk Audit Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#252525] tracking-tight">
              Campaign Risk Analysis & Mitigation
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              Audit proposed campaign parameters against marketing vulnerability rules to prevent 
              wasted budget, auction bidding congestion, and audience ad fatigue before launch.
            </p>
          </div>
          <button
            onClick={onNavigateToPrediction}
            className="px-5 py-2.5 orange-gradient-bg text-white font-bold rounded-xl text-xs shadow-orange-glow hover:opacity-95 transition-all self-start md:self-auto"
          >
            Audit New Campaign
          </button>
        </div>

        <div className="p-12 text-center space-y-4 bg-white rounded-3xl border border-gray-100 shadow-premium">
          <div className="w-16 h-16 rounded-3xl bg-[#FFF4EA] text-[#EA580C] flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900">No Campaigns Analysed Yet</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Run a campaign prediction first to generate risk analysis. The Risk Audit Engine evaluates 
              your campaign parameters against 6 conditional marketing vulnerability rules.
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Pre-Launch Risk Audit Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#252525] tracking-tight">
            Campaign Risk Analysis & Mitigation
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Audit proposed campaign parameters against marketing vulnerability rules to prevent 
            wasted budget, auction bidding congestion, and audience ad fatigue before launch.
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
          <button
            onClick={onNavigateToPrediction}
            className="px-5 py-2.5 orange-gradient-bg text-white font-bold rounded-xl text-xs shadow-orange-glow hover:opacity-95 transition-all"
          >
            Audit New Campaign
          </button>
        </div>
      </div>

      {/* Campaign Selector */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-premium space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Select Campaign to Audit</h3>
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
                <span>{c.risk_count} risk(s)</span>
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
          <p className="text-sm font-semibold text-gray-600 animate-pulse">Running Risk Detection Engine...</p>
        </div>
      )}

      {/* Results */}
      {!loading && activeCampaignId && campaignData && (
        <>
          {/* Campaign Context Banner */}
          {activeCampaignMeta && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-premium">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Auditing Campaign</h3>
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

          {/* Summary KPI Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-premium">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-gray-500">Critical Auction Risks</span>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-md">High</span>
              </div>
              <div className="mt-3 text-3xl font-black text-red-600">{highCount}</div>
              <p className="text-xs text-gray-400 mt-1">Requires corrective action prior to spending</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-premium">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-gray-500">Operational Inefficiencies</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">Medium</span>
              </div>
              <div className="mt-3 text-3xl font-black text-amber-600">{mediumCount}</div>
              <p className="text-xs text-gray-400 mt-1">Potential margin or conversion drag</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-premium">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-gray-500">Vulnerability Rule Base</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">Active</span>
              </div>
              <div className="mt-3 text-3xl font-black text-[#252525]">6 Rules</div>
              <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Calibrated ML & Rule Engine
              </p>
            </div>
          </div>

          {/* No risks state */}
          {risks.length === 0 && (
            <div className="bg-white rounded-3xl p-8 border-2 border-emerald-200 shadow-premium text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-emerald-800">Campaign Passes All Risk Checks</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto mt-2">
                  No vulnerability rules were triggered for this campaign configuration. All 6 risk detection 
                  rules evaluated — budget allocation, audience sizing, channel-audience alignment, creative 
                  fatigue, competitor timing, and engagement thresholds are within safe parameters.
                </p>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          {risks.length > 0 && (
            <>
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilterSeverity(f)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        filterSeverity === f
                          ? 'bg-[#252525] text-white shadow-xs'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {f === 'ALL' ? 'All Risks' : `${f} Severity`}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  Showing {filteredRisks.length} of {risks.length} triggered vulnerabilities
                </span>
              </div>

              {/* Risk Cards Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRisks.map((risk) => (
                  <div
                    key={risk.risk_id}
                    className={`bg-white rounded-3xl p-6 border-2 transition-all shadow-premium flex flex-col justify-between space-y-4 ${
                      risk.severity === 'High' ? 'border-red-100 hover:border-red-400' : 
                      risk.severity === 'Medium' ? 'border-amber-100 hover:border-amber-400' :
                      'border-emerald-100 hover:border-emerald-400'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md ${
                          risk.severity === 'High' ? 'bg-red-100 text-red-700' : 
                          risk.severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {risk.severity} Severity Risk
                        </span>
                        <span className="text-[11px] font-mono font-semibold text-gray-400">
                          {risk.affected_parameter}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900 leading-snug">
                        {risk.risk_name}
                      </h3>

                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                          Triggering Condition
                        </span>
                        <p className="text-xs text-gray-700 font-mono">
                          {risk.risk_id}
                        </p>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed">
                        {risk.explanation}
                      </p>
                    </div>

                    {/* Corrective Action Playbook */}
                    <div className="p-4 bg-[#F5F6F8] rounded-2xl border border-gray-200/80 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA580C] block">
                        Recommended Corrective Action
                      </span>
                      <p className="text-xs font-semibold text-gray-800 leading-relaxed">
                        {risk.corrective_action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
