import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  CheckCircle2, 
  BarChart2, 
  TrendingUp, 
  Layers, 
  Award, 
  RefreshCw,
  Cpu,
  Target,
  Users,
  MousePointerClick
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { api } from '../services/api';

export default function ModelPerformancePage() {
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState('reach');

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getModelMetrics();
      setMetricsData(data);
    } catch (err) {
      console.error("Error loading model metrics:", err);
      setError(err.message || "Failed to load model evaluation metrics");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-gray-500">Loading model evaluation telemetry...</p>
      </div>
    );
  }

  if (error || !metricsData) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center space-y-3">
        <p className="text-sm font-bold text-red-800">Failed to load model metrics</p>
        <p className="text-xs text-red-600">{error}</p>
        <button onClick={loadMetrics} className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs">
          Retry
        </button>
      </div>
    );
  }

  const evalMetrics = metricsData.evaluation_metrics || {};
  const featureImportances = metricsData.feature_importances || {};
  const testSamples = metricsData.test_eval_samples || [];

  // Chart data for actual vs predicted
  const actualVsPredData = testSamples.slice(0, 30).map(s => ({
    sample: `#${s.sample_index}`,
    Actual: selectedTarget === 'reach' ? s.reach_actual : selectedTarget === 'ctr' ? s.ctr_actual : s.conversions_actual,
    Predicted: selectedTarget === 'reach' ? s.reach_pred : selectedTarget === 'ctr' ? s.ctr_pred : s.conversions_pred,
    LowerBound: selectedTarget === 'reach' ? s.reach_lower : selectedTarget === 'ctr' ? s.ctr_lower : s.conversions_lower,
    UpperBound: selectedTarget === 'reach' ? s.reach_upper : selectedTarget === 'ctr' ? s.ctr_upper : s.conversions_upper,
  }));

  const activeTopFeatures = featureImportances[selectedTarget] || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Empirical Test-Set Validation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#252525] tracking-tight">
            XGBoost Model Performance & Calibration
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Real evaluation metrics calculated on a held-out test split (15% test, 15% validation, 70% train) 
            including MAPE, R², RMSE, and empirical 80% prediction interval coverage.
          </p>
        </div>

        <button
          onClick={loadMetrics}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Dataset & Split Provenance Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-premium flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF4EA] text-[#EA580C] flex items-center justify-center flex-shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dataset Provenance:</span>
              <span className="text-xs font-bold px-2.5 py-0.5 bg-orange-100 text-[#EA580C] rounded-md font-mono">
                {metricsData.dataset_source}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Configurable dataset architecture supporting Agent 2 synthetic data and real historical CSVs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-gray-700 divide-x divide-gray-200">
          <div className="text-right">
            <span className="text-gray-400 block text-[10px] uppercase">Total Records</span>
            <span>{metricsData.total_records?.toLocaleString()}</span>
          </div>
          <div className="pl-4 text-right">
            <span className="text-gray-400 block text-[10px] uppercase">Train / Val / Test</span>
            <span>{metricsData.train_records} / {metricsData.validation_records} / {metricsData.test_records}</span>
          </div>
        </div>
      </div>

      {/* Core Evaluation Metrics Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-premium overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#252525]">Regression & Calibration Metrics</h3>
          <p className="text-xs text-gray-500">Evaluated on 750 unseen test campaign records</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F6F8] text-gray-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-6">Target Metric</th>
                <th className="py-3.5 px-4">Algorithm</th>
                <th className="py-3.5 px-4 text-[#EA580C]">MAPE (%)</th>
                <th className="py-3.5 px-4 text-emerald-700">80% CI Coverage</th>
                <th className="py-3.5 px-4">R² Score</th>
                <th className="py-3.5 px-4">MAE</th>
                <th className="py-3.5 px-4">RMSE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-800">
              {['reach', 'ctr', 'conversions'].map(target => {
                const m = evalMetrics[target] || {};
                return (
                  <tr key={target} className="hover:bg-[#FFF4EA]/30 transition-colors">
                    <td className="py-4 px-6 font-extrabold uppercase text-[#252525]">
                      {target}
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-gray-500">
                      XGBRegressor
                    </td>
                    <td className="py-4 px-4 font-black text-sm text-[#EA580C]">
                      {m.mape}%
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {m.interval_coverage_80}%
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-900">
                      {m.r2_score}
                    </td>
                    <td className="py-4 px-4 text-gray-600 font-mono">
                      {m.mae}
                    </td>
                    <td className="py-4 px-4 text-gray-600 font-mono">
                      {m.rmse}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target Selector Tabs for Interactive Charts */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <span className="text-xs font-bold text-gray-400 mr-2 uppercase">Inspect Model:</span>
        {[
          { id: 'reach', label: 'Reach Regressor', icon: Users },
          { id: 'ctr', label: 'CTR Regressor', icon: MousePointerClick },
          { id: 'conversions', label: 'Conversions Regressor', icon: Target },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTarget(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedTarget === t.id
                  ? 'orange-gradient-bg text-white shadow-orange-glow'
                  : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Actual vs Predicted & Feature Importances Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Actual vs Predicted Line Plot */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-premium">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#252525]">
                Actual vs. Predicted Evaluation Curve ({selectedTarget.toUpperCase()})
              </h3>
              <p className="text-xs text-gray-500">First 30 samples from held-out validation test split</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-[#FFF4EA] text-[#EA580C] rounded-lg">
              Test Set Tracking
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={actualVsPredData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="sample" tick={{ fontSize: 10, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #EA580C30' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="Actual" stroke="#252525" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Predicted" stroke="#EA580C" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Importances Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-premium flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#252525] mb-1">
              Top Feature Importances
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              XGBoost gain importance weights for {selectedTarget}
            </p>

            <div className="space-y-3">
              {activeTopFeatures.slice(0, 6).map((f, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700 truncate max-w-[180px]">{f.feature}</span>
                    <span className="font-mono text-[11px] font-bold text-[#EA580C]">
                      {(f.importance * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="orange-gradient-bg h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, f.importance * 250)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
            Computed from XGBoost <code className="text-gray-700 font-mono">feature_importances_</code> attribute.
          </div>
        </div>

      </div>
    </div>
  );
}
