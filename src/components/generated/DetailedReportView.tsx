import React from 'react';
import { Menu, X, HelpCircle, User, ChevronDown, AlertTriangle, CheckCircle, XCircle, Download, Printer, Share2, Clock, MapPin, FileText, Calendar, Tag, LayoutDashboard, FolderOpen, FileBarChart, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
type Severity = 'low' | 'medium' | 'high';
type ViolationStatus = 'safe' | 'warning' | 'violation';
interface Evidence {
  text?: string;
  timestamp?: string;
  confidence: number;
}
interface CategoryAnalysis {
  id: string;
  category: string;
  status: ViolationStatus;
  severity: Severity;
  evidence: Evidence[];
  policyReference: string;
  description: string;
  recommendation?: string;
}
interface TimelineEvent {
  timestamp: string;
  category: string;
  status: ViolationStatus;
  description: string;
}
interface ReportDetail {
  id: string;
  title: string;
  type: 'text' | 'image' | 'video';
  region: string;
  submittedBy: string;
  moderatedAt: string;
  duration?: string;
  fileSize?: string;
  language: string;
  overallStatus: ViolationStatus;
  finalVerdict: string;
  flaggedCategories: number;
  content: string;
  categories: CategoryAnalysis[];
  timeline?: TimelineEvent[];
  tags: string[];
}
export interface DetailedReportViewProps {
  reportId?: string;
  onBack?: () => void;
  onDownloadPDF?: (id: string) => void;
}
const mockReport: ReportDetail = {
  id: 'ad-001',
  title: 'Summer Sale Campaign',
  type: 'text',
  region: 'India',
  submittedBy: 'marketing@company.com',
  moderatedAt: '2025-01-02 14:32:00',
  language: 'English',
  overallStatus: 'warning',
  finalVerdict: 'Requires modifications before approval. Contains misleading claims that need revision.',
  flaggedCategories: 3,
  content: 'Get amazing deals on luxury products! Up to 90% off. Limited time offer. Click now to claim your prize!',
  categories: [{
    id: 'c1',
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
    policyReference: 'Advertising Standards Authority (ASA) - Section 3.1: Misleading Advertising',
    description: 'The ad contains unrealistic discount claims (90% off) without proper substantiation. Prize claims may be considered misleading without clear eligibility criteria.',
    recommendation: 'Revise discount percentage to realistic figures and provide clear terms for any prize claims.'
  }, {
    id: 'c2',
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
    policyReference: 'Consumer Protection Guidelines - Pressure Tactics',
    description: 'Uses time-sensitive language that may pressure consumers into hasty purchasing decisions without adequate consideration.',
    recommendation: 'Consider softening urgent language or providing clear timeframes.'
  }, {
    id: 'c3',
    category: 'Content Safety',
    status: 'safe',
    severity: 'low',
    evidence: [],
    policyReference: 'Content Safety Standards - All Clear',
    description: 'No harmful, offensive, or inappropriate content detected. Content is suitable for general audiences.',
    recommendation: 'No action required.'
  }, {
    id: 'c4',
    category: 'Brand Safety',
    status: 'safe',
    severity: 'low',
    evidence: [],
    policyReference: 'Brand Safety Framework - Compliant',
    description: 'Content is appropriate for brand association and does not contain controversial or sensitive material.',
    recommendation: 'No action required.'
  }, {
    id: 'c5',
    category: 'Legal Compliance',
    status: 'warning',
    severity: 'medium',
    evidence: [{
      text: 'No terms and conditions mentioned',
      confidence: 0.85
    }],
    policyReference: 'Indian Advertising Code - Disclosure Requirements',
    description: 'Promotional offers require adequate disclosure of terms and conditions as per regional advertising laws.',
    recommendation: 'Add clear terms and conditions link or statement.'
  }],
  tags: ['promotional', 'e-commerce', 'time-sensitive', 'discount']
};
const statusConfig = {
  safe: {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    label: 'Safe'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    label: 'Warning'
  },
  violation: {
    icon: XCircle,
    color: 'text-[#e50914]',
    bg: 'bg-[#e50914]/10',
    border: 'border-[#e50914]/30',
    label: 'Violation'
  }
};
const severityConfig = {
  low: {
    label: 'Low',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  medium: {
    label: 'Medium',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  },
  high: {
    label: 'High',
    color: 'bg-[#e50914]/20 text-[#e50914] border-[#e50914]/30'
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
  active: false
}, {
  icon: FolderOpen,
  label: 'Upload History',
  href: '/history',
  active: false
}, {
  icon: FileText,
  label: 'Detailed Reports',
  href: '/reports',
  active: true
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
export const DetailedReportView = ({
  reportId = 'ad-001',
  onBack,
  onDownloadPDF
}: DetailedReportViewProps) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [printFriendly, setPrintFriendly] = React.useState(false);
  const report = mockReport;
  const handleDownloadPDF = () => {
    console.log('Downloading PDF report for:', reportId);
    onDownloadPDF?.(reportId);
  };
  const handlePrint = () => {
    setPrintFriendly(true);
    setTimeout(() => {
      window.print();
      setPrintFriendly(false);
    }, 100);
  };
  const handleShare = () => {
    console.log('Sharing report:', reportId);
    // Copy link to clipboard
    navigator.clipboard.writeText(window.location.href);
  };
  const handleSidebarNavigation = (href: string) => {
    // Navigation logic here - would typically use onNavigate prop
    console.log('Navigating to:', href);
    if (href === '/reports') {
      onBack?.();
    }
  };
  const getStatusIcon = () => {
    const config = statusConfig[report.overallStatus];
    const Icon = config.icon;
    return <Icon className={config.color} size={32} />;
  };
  return <div className="flex h-screen w-full bg-[#141414] text-[#e5e5e5] overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && <>
            <motion.aside initial={{
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
            </motion.aside>
          </>}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className={`h-16 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between px-6 flex-shrink-0 ${printFriendly ? 'print:hidden' : ''}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[#e5e5e5] hover:text-white transition-colors lg:hidden">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2 text-sm text-[#808080]">
              <button onClick={onBack} className="hover:text-[#e5e5e5] transition-colors">
                Home
              </button>
              <span>/</span>
              <button onClick={onBack} className="hover:text-[#e5e5e5] transition-colors">
                Reports
              </button>
              <span>/</span>
              <span className="text-[#e5e5e5]">{report.id}</span>
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
          <div className="max-w-6xl mx-auto p-6 lg:p-8">
            {/* Action Bar */}
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 ${printFriendly ? 'print:hidden' : ''}`}>
              <div>
                <h1 className="text-3xl font-bold mb-2">Detailed Report</h1>
                <p className="text-[#808080]">Complete moderation analysis and findings</p>
              </div>
              <div className="flex gap-3">
                <motion.button whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} onClick={handleShare} className="bg-[#2a2a2a] hover:bg-[#404040] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                  <Share2 size={18} />
                  <span className="hidden sm:inline">Share</span>
                </motion.button>
                <motion.button whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} onClick={handlePrint} className="bg-[#2a2a2a] hover:bg-[#404040] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                  <Printer size={18} />
                  <span className="hidden sm:inline">Print</span>
                </motion.button>
                <motion.button whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} onClick={handleDownloadPDF} className="bg-[#e50914] hover:bg-[#f40612] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                  <Download size={18} />
                  <span className="hidden sm:inline">Export PDF</span>
                </motion.button>
              </div>
            </div>

            {/* Print-Friendly Toggle */}
            <div className={`mb-6 ${printFriendly ? 'print:hidden' : ''}`}>
              <label className="flex items-center gap-2 cursor-pointer inline-flex">
                <input type="checkbox" checked={printFriendly} onChange={e => setPrintFriendly(e.target.checked)} className="w-4 h-4 bg-[#0d0d0d] border-[#2a2a2a] rounded accent-[#e50914]" />
                <span className="text-sm text-[#b3b3b3]">Print-friendly view</span>
              </label>
            </div>

            {/* Top Summary Card */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Status Icon & Title */}
                <div className="flex items-start gap-4">
                  {getStatusIcon()}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{report.title}</h2>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[report.overallStatus].bg} ${statusConfig[report.overallStatus].color}`}>
                      {statusConfig[report.overallStatus].label}
                    </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#808080] mb-1 flex items-center gap-1.5">
                      <FileText size={14} />
                      Report ID
                    </p>
                    <p className="text-[#e5e5e5] font-medium">{report.id}</p>
                  </div>
                  <div>
                    <p className="text-[#808080] mb-1 flex items-center gap-1.5">
                      <MapPin size={14} />
                      Region
                    </p>
                    <p className="text-[#e5e5e5] font-medium">{report.region}</p>
                  </div>
                  <div>
                    <p className="text-[#808080] mb-1 flex items-center gap-1.5">
                      <Calendar size={14} />
                      Moderated At
                    </p>
                    <p className="text-[#e5e5e5] font-medium">{report.moderatedAt}</p>
                  </div>
                  <div>
                    <p className="text-[#808080] mb-1 flex items-center gap-1.5">
                      <User size={14} />
                      Submitted By
                    </p>
                    <p className="text-[#e5e5e5] font-medium">{report.submittedBy}</p>
                  </div>
                </div>
              </div>

              {/* Final Verdict */}
              <div className="mt-6 pt-6 border-t border-[#2a2a2a]">
                <h3 className="text-sm font-medium text-[#808080] mb-2">Final Verdict</h3>
                <p className="text-[#e5e5e5] leading-relaxed">{report.finalVerdict}</p>
              </div>

              {/* Summary Stats */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#2a2a2a]">
                  <p className="text-xs text-[#808080] mb-1">Categories Flagged</p>
                  <p className="text-2xl font-bold text-[#e50914]">{report.flaggedCategories}</p>
                </div>
                <div className="bg-[#0d0d0d] rounded-lg p-4 border border-green-500/30">
                  <p className="text-xs text-[#808080] mb-1">Safe</p>
                  <p className="text-2xl font-bold text-green-500">
                    {report.categories.filter(c => c.status === 'safe').length}
                  </p>
                </div>
                <div className="bg-[#0d0d0d] rounded-lg p-4 border border-yellow-500/30">
                  <p className="text-xs text-[#808080] mb-1">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {report.categories.filter(c => c.status === 'warning').length}
                  </p>
                </div>
                <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#e50914]/30">
                  <p className="text-xs text-[#808080] mb-1">Violations</p>
                  <p className="text-2xl font-bold text-[#e50914]">
                    {report.categories.filter(c => c.status === 'violation').length}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-6 pt-6 border-t border-[#2a2a2a]">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={16} className="text-[#808080]" />
                  {report.tags.map(tag => <span key={tag} className="px-3 py-1 bg-[#2a2a2a] text-[#b3b3b3] rounded-full text-xs font-medium">
                      {tag}
                    </span>)}
                </div>
              </div>
            </div>

            {/* Ad Content Section */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Ad Content</h2>
              <div className="bg-[#0d0d0d] rounded-lg p-6 border border-[#2a2a2a]">
                <p className="text-[#e5e5e5] leading-relaxed whitespace-pre-wrap">
                  {report.content}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-[#808080]">
                <span>Type: <span className="text-[#e5e5e5]">{report.type}</span></span>
                <span>•</span>
                <span>Language: <span className="text-[#e5e5e5]">{report.language}</span></span>
              </div>
            </div>

            {/* Full Category Analysis */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Category-Level Analysis</h2>
              <div className="space-y-4">
                {report.categories.map((category, index) => {
                const config = statusConfig[category.status];
                const Icon = config.icon;
                return <div key={category.id} className={`bg-[#0d0d0d] rounded-lg border ${config.border} p-6`}>
                      {/* Category Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Icon className={config.color} size={24} />
                          <div>
                            <h3 className="text-lg font-bold">{category.category}</h3>
                            <p className="text-sm text-[#808080] mt-0.5">{category.policyReference}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${severityConfig[category.severity].color}`}>
                          {severityConfig[category.severity].label} Severity
                        </span>
                      </div>

                      {/* Description */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-[#808080] mb-2">Analysis</h4>
                        <p className="text-sm text-[#b3b3b3] leading-relaxed">{category.description}</p>
                      </div>

                      {/* Evidence */}
                      {category.evidence.length > 0 && <div className="mb-4">
                          <h4 className="text-sm font-medium text-[#808080] mb-2">Evidence Found</h4>
                          <div className="space-y-2">
                            {category.evidence.map((evidence, idx) => <div key={idx} className="bg-[#1a1a1a] rounded p-3 border border-[#2a2a2a]">
                                <div className="flex items-start justify-between">
                                  <p className="text-sm text-[#e5e5e5] font-medium flex-1">
                                    "{evidence.text}"
                                  </p>
                                  <span className="text-xs text-[#808080] ml-3 shrink-0">
                                    {(evidence.confidence * 100).toFixed(0)}% confidence
                                  </span>
                                </div>
                                {evidence.timestamp && <p className="text-xs text-[#808080] mt-1 flex items-center gap-1">
                                    <Clock size={12} />
                                    {evidence.timestamp}
                                  </p>}
                              </div>)}
                          </div>
                        </div>}

                      {/* Recommendation */}
                      {category.recommendation && <div className="pt-4 border-t border-[#2a2a2a]">
                          <h4 className="text-sm font-medium text-[#808080] mb-2">Recommendation</h4>
                          <p className="text-sm text-[#b3b3b3]">{category.recommendation}</p>
                        </div>}
                    </div>;
              })}
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center text-sm text-[#808080] py-6">
              <p>This report was generated by ModPod AI Moderation System</p>
              <p className="mt-1">For questions or concerns, contact support@modpod.ai</p>
            </div>
          </div>
        </main>
      </div>
    </div>;
};