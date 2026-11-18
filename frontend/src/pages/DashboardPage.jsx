import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MousePointerClick, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  PlusCircle, 
  Download, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  DollarSign,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis 
} from 'recharts';
import { api } from '../services/api';

const RISK_COLORS = {
  High: '#EF4444',
  Medium: '#F59E0B',
  Low: '#10B981',
  None: '#6B7280'
};

const CHANNEL_COLORS = {
  Instagram: '#EA580C',
  Facebook: '#3B82F6',
  LinkedIn: '#8B5CF6'
};

export default function DashboardPage({ onNavigateToPrediction, onNavigateToWhatIf }) {
  const [kpis, setKpis] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    setError(null);
    try {
      const [kpiRes, histRes] = await Promise.all([
        api.getDashboardKPIs(),
        api.getCampaignHistory(15)
      ]);
      setKpis(kpiRes);
      setHistory(histRes);
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setError("Unable to connect to backend service. Please ensure the Python server is running.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this campaign analysis?")) {
      try {
        await api.deleteCampaign(id);
        loadDashboardData();
      } catch (err) {
        alert("Failed to delete record: " + err.message);
      }
    }
  }

  // Prepare chart data
  const performanceTrendData = history.slice(0, 8).reverse().map((item, idx) => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    reach: item.predicted_reach,
    conversions: item.predicted_conversions,
    budget: item.budget,
    ctr: item.predicted_ctr
  }));

  const riskPieData = kpis ? [
    { name: 'High Risk', value: kpis.risk_distribution.high, color: '#EF4444' },
    { name: 'Medium Risk', value: kpis.risk_distribution.medium, color: '#F59E0B' },
    { name: 'Low/None', value: (kpis.risk_distribution.low + kpis.risk_distribution.none), color: '#10B981' }
  ].filter(d => d.value > 0) : [];

  const scatterData = history.map(item => ({
    budget: item.budget,
    conversions: item.predicted_conversions,
    name: item.name,
    channel: item.channel
  }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-gray-600 animate-pulse">Loading Campaign Intelligence Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome / Actions Banner */}
      <div className="relative overflow-hidden rounded-3xl orange-gradient-bg p-8 text-white shadow-orange-glow">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white tracking-wide">
              <span>Agent 4 • LTIMindtree GenAI Internship</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Pre-Launch Campaign Performance Intelligence
            </h1>
            <p className="text-white/90 text-sm leading-relaxed">
              Predict reach, click-through rates, and conversions with calibrated 80% confidence intervals 
              before allocating marketing budget. Detect auction risks and optimize creative strategy.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToPrediction}
              className="px-6 py-3.5 bg-white text-[#EA580C] hover:bg-orange-50 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5 text-[#EA580C]" />
              <span>New Prediction</span>
            </button>
            <a
              href={api.getExportCSVUrl()}
              download
              className="px-4 py-3.5 bg-black/20 hover:bg-black/30 backdrop-blur-md text-white font-semibold rounded-2xl border border-white/20 transition-all flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>
        {/* Subtle decorative background circle */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadDashboardData} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold">
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Campaigns */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-premium hover:shadow-premium-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Campaigns Analysed
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FFF4EA] flex items-center justify-center text-[#EA580C]">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[#252525]">
              {kpis?.total_campaigns || 0}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Allocated Budget: <span className="font-semibold text-gray-800">${(kpis?.total_allocated_budget || 0).toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Predicted Reach */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-premium hover:shadow-premium-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Predicted Reach
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[#252525]">
              {(kpis?.total_predicted_reach || 0).toLocaleString()}
            </h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> XGBoost Regressor Model
            </p>
          </div>
        </div>

        {/* Average CTR */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-premium hover:shadow-premium-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Avg. Predicted CTR
            </span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#EA580C]">
              <MousePointerClick className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[#252525]">
              {kpis?.average_predicted_ctr || 0}%
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Calibrated 80% confidence interval
            </p>
          </div>
        </div>

        {/* Total Conversions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-premium hover:shadow-premium-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Expected Conversions
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[#252525]">
              {(kpis?.total_predicted_conversions || 0).toLocaleString()}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Pre-launch prospective actions
            </p>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Reach & Conversions Overview */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-premium">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#252525]">Campaign Performance Overview</h3>
              <p className="text-xs text-gray-500">Predicted Reach and Conversions across analyzed campaigns</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-[#FFF4EA] text-[#EA580C] rounded-lg">
              Recent Analyses
            </span>
          </div>
          
          {performanceTrendData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} angle={-15} textAnchor="end" />
                  <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#EA580C' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #EA580C30', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="reach" name="Predicted Reach" fill="#F97316" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="right" dataKey="conversions" name="Predicted Conversions" fill="#252525" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-gray-400 space-y-2">
              <Layers className="w-10 h-10 stroke-1" />
              <p className="text-sm">No campaign records yet. Run your first prediction above.</p>
            </div>
          )}
        </div>

        {/* Risk Distribution Donut */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-premium flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#252525]">Risk Severity Distribution</h3>
            <p className="text-xs text-gray-500">Audit of detected campaign vulnerabilities</p>
          </div>
          
          {riskPieData.length > 0 ? (
            <div className="h-60 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 flex flex-col items-center justify-center text-gray-400 space-y-2">
              <AlertTriangle className="w-8 h-8 stroke-1 text-emerald-500" />
              <p className="text-xs text-center text-gray-500">No high-risk vulnerabilities recorded</p>
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-red-50 rounded-xl">
              <span className="block font-bold text-red-700">{kpis?.risk_distribution.high || 0}</span>
              <span className="text-red-600 text-[10px]">High</span>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl">
              <span className="block font-bold text-amber-700">{kpis?.risk_distribution.medium || 0}</span>
              <span className="text-amber-600 text-[10px]">Medium</span>
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl">
              <span className="block font-bold text-emerald-700">{(kpis?.risk_distribution.low || 0) + (kpis?.risk_distribution.none || 0)}</span>
              <span className="text-emerald-600 text-[10px]">Low/Safe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Budget vs Conversions Scatter & Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scatter: Budget vs Conversions Efficiency */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-premium">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#252525]">Budget vs. Predicted Conversions</h3>
              <p className="text-xs text-gray-500">Evaluating return on investment and diminishing returns curve</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
              Efficiency Curve
            </span>
          </div>

          {scatterData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis type="number" dataKey="budget" name="Budget" unit="$" tick={{ fontSize: 11 }} />
                  <YAxis type="number" dataKey="conversions" name="Conversions" tick={{ fontSize: 11 }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '10px', fontSize: '12px' }} />
                  <Scatter name="Campaigns" data={scatterData} fill="#EA580C" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-xs">
              No campaign data points to plot yet.
            </div>
          )}
        </div>

        {/* Channel Breakdown Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-premium flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#252525] mb-1">Channel-Wise Performance</h3>
            <p className="text-xs text-gray-500 mb-4">Distribution across supported ad platforms</p>

            <div className="space-y-4">
              {kpis?.channel_breakdown && kpis.channel_breakdown.length > 0 ? (
                kpis.channel_breakdown.map((ch, idx) => (
                  <div key={idx} className="p-3.5 bg-[#F5F6F8] rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3.5 h-3.5 rounded-full" 
                        style={{ backgroundColor: CHANNEL_COLORS[ch.channel] || '#F97316' }}
                      />
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">{ch.channel}</h4>
                        <p className="text-[11px] text-gray-500">{ch.count} campaign(s)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#EA580C]">
                        {ch.avg_ctr ? ch.avg_ctr.toFixed(2) : 0}% CTR
                      </span>
                      <p className="text-[11px] font-semibold text-gray-700">
                        {(ch.total_conv || 0).toLocaleString()} conv.
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-8">
                  Run predictions across Instagram, Facebook, and LinkedIn to view comparative breakdowns.
                </p>
              )}
            </div>
          </div>

          <button 
            onClick={onNavigateToWhatIf}
            className="w-full mt-4 py-2.5 px-4 bg-[#FFF4EA] hover:bg-[#FFE4D2] text-[#EA580C] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Simulate Channel Reallocation</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Campaigns Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-premium overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#252525]">Recent Campaign Evaluations</h3>
            <p className="text-xs text-gray-500">Persistent SQLite history of pre-launch campaign forecasts</p>
          </div>
          <button
            onClick={onNavigateToPrediction}
            className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Prediction</span>
          </button>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F6F8] text-gray-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-6">Campaign Name</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Predicted Reach</th>
                  <th className="py-3 px-4">Predicted CTR</th>
                  <th className="py-3 px-4">Predicted Conv.</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Analyzed</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FFF4EA]/40 transition-colors group">
                    <td className="py-3.5 px-6 font-bold text-gray-900 truncate max-w-[200px]">
                      {c.name}
                      <span className="block text-[10px] font-normal text-gray-400">{c.industry}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-700">
                      <span className="inline-flex items-center gap-1.5">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: CHANNEL_COLORS[c.channel] || '#F97316' }}
                        />
                        {c.channel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      ${c.budget.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-800">
                      {c.predicted_reach.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#EA580C]">
                      {c.predicted_ctr.toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                      {c.predicted_conversions.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.max_risk_severity === 'High' ? 'bg-red-100 text-red-800' :
                        c.max_risk_severity === 'Medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {c.max_risk_severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onNavigateToWhatIf(c)}
                          title="Open in What-If Simulation"
                          className="p-1.5 text-[#EA580C] hover:bg-[#FFF4EA] rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(c.id, e)}
                          title="Delete Campaign"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#FFF4EA] text-[#EA580C] flex items-center justify-center mx-auto">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">No campaigns evaluated yet</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                Configure your marketing parameters and run the XGBoost ML inference to see full performance projections.
              </p>
            </div>
            <button
              onClick={onNavigateToPrediction}
              className="px-6 py-2.5 orange-gradient-bg text-white font-bold rounded-xl text-xs shadow-orange-glow hover:opacity-95 transition-all"
            >
              Generate First Prediction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
