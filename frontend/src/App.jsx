import React, { useState } from 'react';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/DashboardPage';
import PredictionPage from './pages/PredictionPage';
import WhatIfPage from './pages/WhatIfPage';
import RiskAnalysisPage from './pages/RiskAnalysisPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ModelPerformancePage from './pages/ModelPerformancePage';
import AboutAgentPage from './pages/AboutAgentPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCampaignForWhatIf, setSelectedCampaignForWhatIf] = useState(null);
  const [appliedSuggestionForWhatIf, setAppliedSuggestionForWhatIf] = useState(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  function handleNavigateToWhatIf(campaign = null, suggestion = null) {
    if (campaign) setSelectedCampaignForWhatIf(campaign);
    if (suggestion) setAppliedSuggestionForWhatIf(suggestion);
    setActiveTab('what-if');
  }

  function handleNavigateToPrediction() {
    setActiveTab('prediction');
  }

  function handleCampaignSelect(campaignId) {
    setSelectedCampaignId(campaignId);
  }

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && (
        <DashboardPage 
          onNavigateToPrediction={handleNavigateToPrediction}
          onNavigateToWhatIf={handleNavigateToWhatIf}
        />
      )}
      {activeTab === 'prediction' && (
        <PredictionPage 
          onNavigateToWhatIf={handleNavigateToWhatIf}
        />
      )}
      {activeTab === 'what-if' && (
        <WhatIfPage 
          initialCampaign={selectedCampaignForWhatIf}
          appliedSuggestion={appliedSuggestionForWhatIf}
        />
      )}
      {activeTab === 'risks' && (
        <RiskAnalysisPage 
          onNavigateToPrediction={handleNavigateToPrediction}
          selectedCampaignId={selectedCampaignId}
          onCampaignSelect={handleCampaignSelect}
        />
      )}
      {activeTab === 'recommendations' && (
        <RecommendationsPage 
          onNavigateToWhatIf={handleNavigateToWhatIf}
          onNavigateToPrediction={handleNavigateToPrediction}
          selectedCampaignId={selectedCampaignId}
          onCampaignSelect={handleCampaignSelect}
        />
      )}
      {activeTab === 'model-performance' && (
        <ModelPerformancePage />
      )}
      {activeTab === 'about' && (
        <AboutAgentPage />
      )}
    </AppLayout>
  );
}
