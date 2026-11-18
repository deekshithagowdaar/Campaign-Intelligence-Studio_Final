/**
 * Campaign Intelligence Studio - API Client
 * Connects frontend to FastAPI backend endpoints
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      let errorDetail = `HTTP Error ${res.status}`;
      try {
        const errorData = await res.json();
        errorDetail = errorData.detail || errorDetail;
      } catch {
        // Fallback to text
      }
      throw new Error(errorDetail);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on [${url}]:`, err);
    throw err;
  }
}

export const api = {
  // System & Health
  getHealth: () => request('/health'),
  getModelStatus: () => request('/api/model/status'),
  getModelMetrics: () => request('/api/model/metrics'),

  // Prediction & Intelligence
  predictCampaign: (campaignData) => request('/api/campaign/predict', {
    method: 'POST',
    body: JSON.stringify(campaignData),
  }),

  // What-If Simulation
  runWhatIf: (whatIfData) => request('/api/campaign/what-if', {
    method: 'POST',
    body: JSON.stringify(whatIfData),
  }),

  // Risk & Suggestions
  getRisks: (campaignData) => request('/api/campaign/risks', {
    method: 'POST',
    body: JSON.stringify(campaignData),
  }),
  getRecommendations: (campaignData) => request('/api/campaign/recommendations', {
    method: 'POST',
    body: JSON.stringify(campaignData),
  }),
  getCampaignRisks: (campaignId) => request(`/api/campaign/${campaignId}/risks`),
  getCampaignRecommendations: (campaignId) => request(`/api/campaign/${campaignId}/recommendations`),

  // History & Dashboard
  getCampaignHistory: (limit = 50) => request(`/api/campaign/history?limit=${limit}`),
  getDashboardKPIs: () => request('/api/campaign/kpis'),
  getCampaignDetails: (id) => request(`/api/campaign/${id}`),
  deleteCampaign: (id) => request(`/api/campaign/${id}`, { method: 'DELETE' }),

  // Agent 5 Integration
  evaluateAgent5Candidate: (candidateData) => request('/api/agent5/evaluate-candidate', {
    method: 'POST',
    body: JSON.stringify(candidateData),
  }),
  batchEvaluateAgent5: (batchData) => request('/api/agent5/batch-evaluate', {
    method: 'POST',
    body: JSON.stringify(batchData),
  }),

  // Export URLs
  getExportCSVUrl: () => `${API_BASE}/api/campaign/export/csv`,
};
