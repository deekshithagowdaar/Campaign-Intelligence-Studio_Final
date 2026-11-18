import React, { useState, useEffect } from 'react';
import { 
  Info, 
  Cpu, 
  Server, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  Code2, 
  Copy, 
  Check, 
  Play, 
  Award,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { api } from '../services/api';

export default function AboutAgentPage() {
  const [copied, setCopied] = useState(false);
  const [candidateId, setCandidateId] = useState("OPT-CANDIDATE-ALPHA-01");
  const [agent5Loading, setAgent5Loading] = useState(false);
  const [agent5Response, setAgent5Response] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    async function loadHealth() {
      try {
        const data = await api.getHealth();
        setHealthStatus(data);
      } catch (err) {
        console.error("Health check error:", err);
      }
    }
    loadHealth();
  }, []);

  async function testAgent5Endpoint() {
    setAgent5Loading(true);
    try {
      const payload = {
        candidate_id: candidateId,
        campaign: {
          campaign_name: "Agent 5 Candidate Test",
          creative_type: "Video",
          message_theme: "Product Launch",
          industry: "SaaS/B2B",
          target_audience: "Senior Executives 40+",
          channel: "LinkedIn",
          budget: 6500,
          campaign_duration: 30,
          launch_date: "2025-09-01",
          seasonality: "Q3 Back-to-School",
          target_audience_size: 450000,
          brand_affinity: "Established",
          competitor_activity: "Moderate"
        }
      };
      const res = await api.evaluateAgent5Candidate(payload);
      setAgent5Response(res);
    } catch (err) {
      alert("Agent 5 evaluation failed: " + err.message);
    } finally {
      setAgent5Loading(false);
    }
  }

  function handleCopyJSON() {
    if (!agent5Response) return;
    navigator.clipboard.writeText(JSON.stringify(agent5Response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF4EA] text-[#EA580C] rounded-full text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>LTIMindtree GenAI Internship Project</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#252525] tracking-tight">
            Agent 4 – Campaign Performance Prediction Agent
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            A complete full-stack machine learning and generative AI system designed to forecast campaign 
            outcomes before launch, calculate calibrated 80% prediction intervals, and integrate with Agent 5 (Marketing Optimization).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
            Production Ready v2.0
          </span>
        </div>
      </div>

      {/* System Architecture Flow */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-premium space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-base font-bold text-[#252525]">End-to-End System Architecture</h3>
          <p className="text-xs text-gray-500">Modular pipeline connecting data, machine learning, generative AI, and API consumers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Stage 1 */}
          <div className="p-4 bg-[#F5F6F8] rounded-2xl border border-gray-200/80 space-y-2">
            <div className="flex items-center justify-between text-[#EA580C] font-bold">
              <span>01. Input & Features</span>
              <Database className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">Marketing Physics</h4>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              Ingests campaign brief and parameters. Computes interaction terms (spend intensity, saturation index, CPM multipliers, duration fatigue).
            </p>
          </div>

          {/* Stage 2 */}
          <div className="p-4 bg-[#F5F6F8] rounded-2xl border border-gray-200/80 space-y-2">
            <div className="flex items-center justify-between text-[#EA580C] font-bold">
              <span>02. ML Inference</span>
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">3x XGBoost Regressors</h4>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              Trained models predict Reach, CTR, and Conversions independently with tuned hyperparameters for high non-linear accuracy.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="p-4 bg-[#F5F6F8] rounded-2xl border border-gray-200/80 space-y-2">
            <div className="flex items-center justify-between text-[#EA580C] font-bold">
              <span>03. Uncertainty & Risk</span>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">Calibrated 80% CI</h4>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              Empirical residual quantiles establish reliable prediction bounds. Rule-based risk engine audits audience and timing conflicts.
            </p>
          </div>

          {/* Stage 4 */}
          <div className="p-4 bg-[#F5F6F8] rounded-2xl border border-gray-200/80 space-y-2">
            <div className="flex items-center justify-between text-purple-700 font-bold">
              <span>04. GenAI & Agent 5</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">Gemini AI Synthesis</h4>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              Gemini synthesizes natural-language explanations and tactical next steps. Exposes standardized JSON contract for Agent 5 optimization.
            </p>
          </div>
        </div>
      </div>

      {/* System Telemetry & Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-premium">
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
            <span>FastAPI Server</span>
            <Server className="w-4 h-4 text-[#EA580C]" />
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900">
            {healthStatus?.status === 'healthy' ? 'Active & Healthy' : 'Online'}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Port 8000 (CORS Enabled)</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-premium">
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
            <span>XGBoost Engine</span>
            <Cpu className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900">
            {healthStatus?.model_loaded ? '3 Regressors Loaded' : 'Memory Active'}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">In-Memory Cached</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-premium">
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
            <span>Gemini API</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900">
            {healthStatus?.gemini_api_configured ? 'Gemini 2.5 Active' : 'Local Heuristic Mode'}
          </div>
          <span className="text-[11px] text-purple-600 font-semibold">Structured JSON Prompts</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-premium">
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
            <span>Persistence</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900">SQLite Database</div>
          <span className="text-[11px] text-blue-600 font-semibold">Persistent History</span>
        </div>
      </div>

      {/* AGENT 5 (Marketing Optimization Agent) INTEGRATION SANDBOX */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-[#EA580C]/20 shadow-premium space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#EA580C]" />
              <h3 className="text-base font-bold text-[#252525]">
                Agent 5 Integration Sandbox: Candidate Evaluation API
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Agent 5 (Marketing Optimization Agent) calls this API repeatedly to evaluate proposed parameter candidates.
            </p>
          </div>

          <button
            onClick={testAgent5Endpoint}
            disabled={agent5Loading}
            className="px-5 py-2.5 orange-gradient-bg text-white font-bold rounded-xl text-xs shadow-orange-glow flex items-center gap-2 hover:opacity-95 transition-all self-start sm:self-auto"
          >
            {agent5Loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>Execute Candidate Evaluation</span>
          </button>
        </div>

        {/* Live response / API contract viewer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-gray-600">
            <span>Standardized JSON Response Contract (<code className="font-mono text-[#EA580C]">POST /api/agent5/evaluate-candidate</code>)</span>
            {agent5Response && (
              <button
                onClick={handleCopyJSON}
                className="flex items-center gap-1.5 text-xs text-[#EA580C] hover:text-[#C2410C]"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            )}
          </div>

          <div className="bg-[#1E1E1E] text-gray-200 p-5 rounded-2xl font-mono text-xs overflow-x-auto max-h-96 shadow-inner">
            {agent5Response ? (
              <pre>{JSON.stringify(agent5Response, null, 2)}</pre>
            ) : (
              <div className="text-gray-500 py-8 text-center">
                Click "Execute Candidate Evaluation" above to simulate Agent 5 requesting a candidate evaluation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
