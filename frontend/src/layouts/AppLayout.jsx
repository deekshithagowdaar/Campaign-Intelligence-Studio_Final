import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  SlidersHorizontal, 
  AlertTriangle, 
  Lightbulb, 
  Activity, 
  Info, 
  Menu, 
  X, 
  Zap, 
  Server, 
  BrainCircuit, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { api } from '../services/api';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'prediction', label: 'Campaign Prediction', icon: Sparkles, badge: 'Core' },
  { id: 'what-if', label: 'What-If Analysis', icon: SlidersHorizontal },
  { id: 'risks', label: 'Risk Analysis', icon: AlertTriangle },
  { id: 'recommendations', label: 'AI Recommendations', icon: Lightbulb },
  { id: 'model-performance', label: 'Model Performance', icon: Activity },
  { id: 'about', label: 'About the Agent', icon: Info },
];

export default function AppLayout({ activeTab, setActiveTab, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [systemHealth, setSystemHealth] = useState({
    api: 'checking',
    model: false,
    gemini: false,
    timestamp: null
  });

  useEffect(() => {
    async function checkStatus() {
      try {
        const health = await api.getHealth();
        setSystemHealth({
          api: 'online',
          model: health.model_loaded,
          gemini: health.gemini_api_configured,
          timestamp: health.timestamp
        });
      } catch (err) {
        setSystemHealth({
          api: 'offline',
          model: false,
          gemini: false,
          timestamp: null
        });
      }
    }
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex bg-[#F5F6F8] text-[#252525]">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-[#EA580C]/15 transition-transform duration-300 ease-in-out flex flex-col shadow-sm ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20 lg:w-72'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#EA580C]/10 flex items-center justify-between bg-gradient-to-r from-white via-[#FFF4EA] to-white">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-11 h-11 rounded-xl orange-gradient-bg flex items-center justify-center text-white shadow-orange-glow flex-shrink-0">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0 md:hidden lg:block">
              <h1 className="font-extrabold text-base tracking-tight text-[#252525] truncate leading-tight">
                CAMPAIGN <span className="text-[#EA580C]">INTELLIGENCE</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#EA580C]/80 truncate">
                Studio • Agent 4
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-800 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tagline / Subtitle Banner */}
        <div className="px-6 py-3 bg-[#FFF4EA] border-b border-[#EA580C]/10 md:hidden lg:block">
          <p className="text-xs font-semibold text-[#EA580C] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-[#EA580C]" />
            Predict. Analyse. Optimise.
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5 truncate">
            LTIMindtree GenAI Internship
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? 'orange-gradient-bg text-white shadow-orange-glow'
                    : 'text-gray-700 hover:bg-[#FFF4EA] hover:text-[#EA580C]'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-[#EA580C]'
                }`} />
                <span className="ml-3.5 truncate md:hidden lg:inline text-left flex-1">
                  {item.label}
                </span>
                {item.badge && (
                  <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full md:hidden lg:inline ${
                    isActive ? 'bg-white/25 text-white' : 'bg-[#FFF4EA] text-[#EA580C] border border-[#EA580C]/20'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <div className="absolute right-2 w-1.5 h-6 bg-white/80 rounded-full md:block lg:hidden" />
                )}
              </button>
            );
          })}
        </nav>

        {/* System Health / Footer Card */}
        <div className="p-4 m-3 bg-[#F5F6F8] rounded-2xl border border-gray-200/80 md:hidden lg:block">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              System Telemetry
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
              systemHealth.api === 'online' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                systemHealth.api === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`} />
              {systemHealth.api === 'online' ? 'Connected' : 'Offline'}
            </span>
          </div>
          
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-500">
                <BrainCircuit className="w-3.5 h-3.5 text-[#EA580C]" /> XGBoost ML:
              </span>
              <span className="font-semibold text-emerald-600">3x Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-500">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" /> GenAI Engine:
              </span>
              <span className="font-semibold text-gray-800 truncate max-w-[100px]">
                {systemHealth.gemini ? 'Gemini 2.5' : 'Local Heuristic'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-20 lg:pl-72 min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-[#EA580C]/15 px-4 md:px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-gray-700 hover:text-[#EA580C] p-2 rounded-lg hover:bg-orange-50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
                  Studio Module
                </span>
                <span className="text-gray-300">/</span>
                <h2 className="text-sm md:text-base font-bold text-[#252525]">
                  {navItems.find(n => n.id === activeTab)?.label}
                </h2>
              </div>
            </div>
          </div>

          {/* Right Status Indicators */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* LTIMindtree Internship Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#FFF4EA] text-[#EA580C] border border-[#EA580C]/25 rounded-full text-xs font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>LTIMindtree GenAI</span>
            </div>

            {/* Model Ready Badge */}
            <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden md:inline">ML Engine:</span> XGBoost v2
            </div>

            {/* GenAI Badge */}
            <div className="hidden lg:flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini AI</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
