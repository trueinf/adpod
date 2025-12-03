import React from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, Download, RefreshCw, Play, Pause, Volume2, VolumeX, Menu, X, HelpCircle, User, LayoutDashboard, FolderOpen, FileBarChart, FileText, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
type Severity = 'low' | 'medium' | 'high';
type ViolationStatus = 'safe' | 'warning' | 'violation';
interface Evidence {
  text?: string;
  timestamp?: string;
  confidence: number;
}
interface CategoryViolation {
  id: string;
  category: string;
  status: ViolationStatus;
  severity: Severity;
  evidence: Evidence[];
  policyReference: string;
  description: string;
}
interface ModerationResult {
  id: string;
  adTitle: string;
  adType: 'text' | 'image' | 'video';
  region: string;
  timestamp: string;
  overallStatus: ViolationStatus;
  content: string;
  violations: CategoryViolation[];
}
export interface ResultsScreenProps {
  resultId?: string;
  onBack?: () => void;
  onNavigate?: (route: 'moderate' | 'results' | 'reports' | 'history' | 'rules' | 'profile' | 'logout') => void;
}
const mockResult: ModerationResult = {
  id: 'ad-001',
  adTitle: 'Summer Sale Campaign',
  adType: 'text',
  region: 'India',
  timestamp: '2025-01-02 14:32:00',
  overallStatus: 'warning',
  content: 'Get amazing deals on luxury products! Up to 90% off. Limited time offer. Click now to claim your prize!',
  violations: [{
    id: 'v1',
    category: 'Misleading Claims',
    status: 'violation',
    severity: 'high',
    evidence: [{
      text: 'Up to 90% off',
      confidence: 0.92
    }, {
      text: 'claim your prize',
      confidence: 0.87
    }],
    policyReference: 'Violates advertising standard: Exaggerated discounts',
    description: 'The ad contains unrealistic discount claims that may mislead consumers.'
  }, {
    id: 'v2',
    category: 'Urgency Manipulation',
    status: 'warning',
    severity: 'medium',
    evidence: [{
      text: 'Limited time offer',
      confidence: 0.78
    }, {
      text: 'Click now',
      confidence: 0.81
    }],
    policyReference: 'Review guideline: Pressure tactics',
    description: 'Uses time-sensitive language that may pressure consumers into hasty decisions.'
  }, {
    id: 'v3',
    category: 'Content Safety',
    status: 'safe',
    severity: 'low',
    evidence: [],
    policyReference: 'Complies with content safety standards',
    description: 'No harmful or inappropriate content detected.'
  }, {
    id: 'v4',
    category: 'Brand Safety',
    status: 'safe',
    severity: 'low',
    evidence: [],
    policyReference: 'Complies with brand safety standards',
    description: 'Content is appropriate for brand association.'
  }, {
    id: 'v5',
    category: 'Legal Compliance',
    status: 'warning',
    severity: 'medium',
    evidence: [{
      text: 'No terms and conditions mentioned',
      confidence: 0.85
    }],
    policyReference: 'Regional law: Disclosure requirements',
    description: 'May require additional disclosures for promotional offers.'
  }]
};
const statusConfig = {
  safe: {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30'
  },
  violation: {
    icon: XCircle,
    color: 'text-[#e50914]',
    bg: 'bg-[#e50914]/10',
    border: 'border-[#e50914]/30'
  }
};
const severityConfig = {
  low: {
    label: 'Low',
    color: 'bg-blue-500/20 text-blue-400'
  },
  medium: {
    label: 'Medium',
    color: 'bg-yellow-500/20 text-yellow-400'
  },
  high: {
    label: 'High',
    color: 'bg-[#e50914]/20 text-[#e50914]'
  }
};
const sidebarItems = [{
  icon: LayoutDashboard,
  label: 'Moderate Ad',
  href: '/moderate',
  active: false
}, {
  icon: FileBarChart,
  label: 'Results Dashboard',
  href: '/results',
  active: true
}, {
  icon: FolderOpen,
  label: 'Upload History',
  href: '/history',
  active: false
}, {
  icon: FileText,
  label: 'Detailed Reports',
  href: '/reports',
  active: false
}, {
  icon: SettingsIcon,
  label: 'Region Rules',
  href: '/rules',
  active: false
}, {
  icon: User,
  label: 'Profile',
  href: '/profile',
  active: false
}, {
  icon: LogOut,
  label: 'Logout',
  href: '/logout',
  active: false
}] as any[];
export const ResultsScreen = ({
  resultId = 'ad-001',
  onBack,
  onNavigate
}: ResultsScreenProps) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set(['v1', 'v2']));
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const result = mockResult;
  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  const handleDownloadPDF = () => {
    console.log('Downloading PDF report for:', resultId);
  };
  const handleRerun = () => {
    console.log('Re-running moderation for:', resultId);
  };
  const handleMarkReviewed = (violationId: string) => {
    console.log('Marking as reviewed:', violationId);
  };
  const handleOverride = (violationId: string) => {
    console.log('Overriding decision:', violationId);
  };
  const getOverallStatusIcon = () => {
    const config = statusConfig[result.overallStatus];
    const Icon = config.icon;
    return <Icon className={config.color} size={32} />;
  };
  const handleSidebarNavigation = (href: string) => {
    if (!onNavigate) return;
    switch (href) {
      case '/moderate':
        onNavigate('moderate');
        break;
      case '/results':
        onNavigate('results');
        break;
      case '/history':
        onNavigate('history');
        break;
      case '/reports':
        onNavigate('reports');
        break;
      case '/rules':
        onNavigate('rules');
        break;
      case '/profile':
        onNavigate('profile');
        break;
      case '/logout':
        onNavigate('logout');
        break;
    }
  };
  return <div className="flex h-screen w-full bg-[#141414] text-[#e5e5e5] overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && <motion.aside initial={{
        x: -280
      }} animate={{
        x: 0
      }} exit={{
        x: -280
      }} transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }} className="w-70 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col">
            <div className="p-6 border-b border-[#2a2a2a]">
              <h1 className="text-2xl font-bold text-[#e50914]">ModPod</h1>
              <p className="text-sm text-[#808080] mt-1">Ad Moderation Platform</p>
            </div>

            <nav className="flex-1 py-4 overflow-y-auto">
              {sidebarItems.map(item => <button key={item.href} onClick={() => handleSidebarNavigation(item.href)} className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${item.active ? 'bg-[#e50914] text-white' : 'text-[#b3b3b3] hover:bg-[#2a2a2a] hover:text-white'}`}>
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>)}
            </nav>
          </motion.aside>}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[#e5e5e5] hover:text-white transition-colors">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2 text-sm text-[#808080]">
              <button onClick={onBack} className="hover:text-[#e5e5e5] transition-colors">
                Home
              </button>
              <span>/</span>
              <span className="text-[#e5e5e5]">Results</span>
              <span>/</span>
              <span className="text-[#e5e5e5]">{result.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-[#e5e5e5] hover:text-white transition-colors">
              <HelpCircle size={20} />
            </button>
            <button className="w-8 h-8 rounded-full bg-[#e50914] flex items-center justify-center text-white font-bold">
              U
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {getOverallStatusIcon()}
                  <div>
                    <h1 className="text-3xl font-bold">{result.adTitle}</h1>
                    <p className="text-[#808080] mt-1">
                      {result.region} • {result.adType} • Moderated on {result.timestamp}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <motion.button whileHover={{
                  scale: 1.05
                }} whileTap={{
                  scale: 0.95
                }} onClick={handleDownloadPDF} className="bg-[#2a2a2a] hover:bg-[#404040] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Download size={18} />
                    <span className="hidden sm:inline">Download PDF</span>
                  </motion.button>
                  <motion.button whileHover={{
                  scale: 1.05
                }} whileTap={{
                  scale: 0.95
                }} onClick={handleRerun} className="bg-[#e50914] hover:bg-[#f40612] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <RefreshCw size={18} />
                    <span className="hidden sm:inline">Re-run</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Ad Preview */}
              <div className="space-y-4">
                <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden">
                  <div className="p-4 border-b border-[#2a2a2a]">
                    <h2 className="text-xl font-bold">Ad Preview</h2>
                  </div>
                  
                  <div className="p-6">
                    {result.adType === 'text' && <div className="bg-[#0d0d0d] rounded-lg p-6 border border-[#2a2a2a]">
                        <p className="text-[#e5e5e5] leading-relaxed whitespace-pre-wrap">
                          {result.content}
                        </p>
                      </div>}
                    
                    {result.adType === 'image' && <div className="bg-[#0d0d0d] rounded-lg overflow-hidden border border-[#2a2a2a]">
                        <div className="aspect-video flex items-center justify-center text-[#808080]">
                          🖼️ Image Preview
                        </div>
                      </div>}
                    
                    {result.adType === 'video' && <div className="bg-[#0d0d0d] rounded-lg overflow-hidden border border-[#2a2a2a] relative">
                        <div className="aspect-video flex items-center justify-center text-[#808080]">
                          🎬 Video Preview
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                          <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-black transition-colors">
                            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                          </button>
                          <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                            <div className="h-full w-1/3 bg-[#e50914]" />
                          </div>
                          <button onClick={() => setIsMuted(!isMuted)} className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-black transition-colors">
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                          </button>
                        </div>
                      </div>}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6">
                  <h3 className="text-lg font-bold mb-4">Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {result.violations.filter(v => v.status === 'safe').length}
                      </div>
                      <div className="text-sm text-[#808080] mt-1">Safe</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">
                        {result.violations.filter(v => v.status === 'warning').length}
                      </div>
                      <div className="text-sm text-[#808080] mt-1">Warnings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#e50914]">
                        {result.violations.filter(v => v.status === 'violation').length}
                      </div>
                      <div className="text-sm text-[#808080] mt-1">Violations</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Category Violations */}
              <div className="space-y-4">
                <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                  <div className="p-4 border-b border-[#2a2a2a]">
                    <h2 className="text-xl font-bold">Category Analysis</h2>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {result.violations.map(violation => {
                    const config = statusConfig[violation.status];
                    const Icon = config.icon;
                    const isExpanded = expandedCategories.has(violation.id);
                    return <motion.div key={violation.id} layout className={`bg-[#0d0d0d] rounded-lg border ${config.border} overflow-hidden`}>
                          <button onClick={() => toggleCategory(violation.id)} className="w-full p-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors">
                            <div className="flex items-center gap-3">
                              <Icon className={config.color} size={20} />
                              <span className="font-bold">{violation.category}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${severityConfig[violation.severity].color}`}>
                                {severityConfig[violation.severity].label}
                              </span>
                            </div>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>
                          
                          <AnimatePresence>
                            {isExpanded && <motion.div initial={{
                          height: 0,
                          opacity: 0
                        }} animate={{
                          height: 'auto',
                          opacity: 1
                        }} exit={{
                          height: 0,
                          opacity: 0
                        }} transition={{
                          duration: 0.2
                        }} className="border-t border-[#2a2a2a]">
                                <div className="p-4 space-y-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-[#808080] mb-2">Description</h4>
                                    <p className="text-sm text-[#b3b3b3]">{violation.description}</p>
                                  </div>
                                  
                                  {violation.evidence.length > 0 && <div>
                                      <h4 className="text-sm font-medium text-[#808080] mb-2">Evidence</h4>
                                      <div className="space-y-2">
                                        {violation.evidence.map((evidence, idx) => <div key={idx} className="bg-[#1a1a1a] rounded p-3 border border-[#2a2a2a]">
                                            <div className="flex items-start justify-between mb-1">
                                              <p className="text-sm text-[#e5e5e5] font-medium">"{evidence.text}"</p>
                                              <span className="text-xs text-[#808080] ml-2">
                                                {(evidence.confidence * 100).toFixed(0)}%
                                              </span>
                                            </div>
                                            {evidence.timestamp && <p className="text-xs text-[#808080]">at {evidence.timestamp}</p>}
                                          </div>)}
                                      </div>
                                    </div>}
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-[#808080] mb-2">Policy Reference</h4>
                                    <p className="text-sm text-[#b3b3b3] italic">{violation.policyReference}</p>
                                  </div>
                                  
                                  <div className="flex gap-2 pt-2">
                                    <button onClick={() => handleMarkReviewed(violation.id)} className="flex-1 bg-[#2a2a2a] hover:bg-[#404040] text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                                      Mark as Reviewed
                                    </button>
                                    <button onClick={() => handleOverride(violation.id)} className="flex-1 bg-[#e50914]/20 hover:bg-[#e50914]/30 text-[#e50914] px-4 py-2 rounded text-sm font-medium transition-colors border border-[#e50914]/30">
                                      Override (Admin)
                                    </button>
                                  </div>
                                </div>
                              </motion.div>}
                          </AnimatePresence>
                        </motion.div>;
                  })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>;
};