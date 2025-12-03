import React from 'react';
import { Menu, X, HelpCircle, User, Search, Filter, Calendar, MapPin, CheckCircle, AlertTriangle, XCircle, Eye, Download, ChevronDown, LayoutDashboard, FolderOpen, FileBarChart, FileText, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
type ViolationStatus = 'safe' | 'warning' | 'violation';
type AdType = 'text' | 'image' | 'video';
type Region = 'india' | 'us' | 'uk' | 'global';
interface AdReport {
  id: string;
  title: string;
  type: AdType;
  region: Region;
  status: ViolationStatus;
  timestamp: string;
  thumbnail?: string;
  violationsCount: number;
}
export interface ReportsOverviewProps {
  onViewReport?: (id: string) => void;
  onDownloadReport?: (id: string) => void;
  onBack?: () => void;
  onNavigate?: (route: 'moderate' | 'results' | 'reports' | 'history' | 'rules' | 'profile' | 'logout') => void;
}
const mockReports: AdReport[] = [{
  id: 'ad-001',
  title: 'Summer Sale Campaign',
  type: 'text',
  region: 'india',
  status: 'warning',
  timestamp: '2025-01-02 14:32:00',
  violationsCount: 2
}, {
  id: 'ad-002',
  title: 'Product Launch Video',
  type: 'video',
  region: 'us',
  status: 'safe',
  timestamp: '2025-01-02 13:15:00',
  violationsCount: 0
}, {
  id: 'ad-003',
  title: 'Holiday Special Banner',
  type: 'image',
  region: 'uk',
  status: 'violation',
  timestamp: '2025-01-02 12:45:00',
  violationsCount: 3
}, {
  id: 'ad-004',
  title: 'Flash Sale Announcement',
  type: 'text',
  region: 'global',
  status: 'warning',
  timestamp: '2025-01-02 11:20:00',
  violationsCount: 1
}, {
  id: 'ad-005',
  title: 'Brand Awareness Campaign',
  type: 'video',
  region: 'india',
  status: 'safe',
  timestamp: '2025-01-02 10:00:00',
  violationsCount: 0
}, {
  id: 'ad-006',
  title: 'Limited Time Offer',
  type: 'text',
  region: 'us',
  status: 'violation',
  timestamp: '2025-01-01 18:30:00',
  violationsCount: 4
}, {
  id: 'ad-007',
  title: 'New Collection Preview',
  type: 'image',
  region: 'uk',
  status: 'safe',
  timestamp: '2025-01-01 16:15:00',
  violationsCount: 0
}, {
  id: 'ad-008',
  title: 'Seasonal Promotion',
  type: 'text',
  region: 'india',
  status: 'warning',
  timestamp: '2025-01-01 14:00:00',
  violationsCount: 1
}];
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
const typeIcons = {
  text: '📝',
  image: '🖼️',
  video: '🎬'
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
export const ReportsOverview = ({
  onViewReport,
  onDownloadReport,
  onBack,
  onNavigate
}: ReportsOverviewProps) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedRegion, setSelectedRegion] = React.useState<Region | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<ViolationStatus | 'all'>('all');
  const [selectedType, setSelectedType] = React.useState<AdType | 'all'>('all');
  const [showFilters, setShowFilters] = React.useState(false);
  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) || report.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || report.region === selectedRegion;
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    const matchesType = selectedType === 'all' || report.type === selectedType;
    return matchesSearch && matchesRegion && matchesStatus && matchesType;
  });
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
  const handleViewReport = (id: string) => {
    console.log('Viewing report:', id);
    onViewReport?.(id);
  };
  const handleDownload = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    console.log('Downloading report:', id);
    onDownloadReport?.(id);
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
              <span className="text-[#e5e5e5]">Reports</span>
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
              <h1 className="text-3xl font-bold mb-2">Reports Overview</h1>
              <p className="text-[#808080]">View and manage all moderated advertisements</p>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808080]" />
                  <input type="text" placeholder="Search by title or ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-2 text-[#e5e5e5] placeholder-[#555555] focus:outline-none focus:ring-2 focus:ring-[#e50914]" />
                </div>

                {/* Filter Toggle Button */}
                <button onClick={() => setShowFilters(!showFilters)} className="bg-[#2a2a2a] hover:bg-[#404040] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                  <Filter size={18} />
                  Filters
                  <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Filter Options */}
              <AnimatePresence>
                {showFilters && <motion.div initial={{
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
              }} className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t border-[#2a2a2a]">
                      {/* Region Filter */}
                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                          <MapPin size={16} />
                          Region
                        </label>
                        <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value as any)} className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#e50914]">
                          <option value="all">All Regions</option>
                          <option value="india">India</option>
                          <option value="us">United States</option>
                          <option value="uk">United Kingdom</option>
                          <option value="global">Global</option>
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Status</label>
                        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as any)} className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#e50914]">
                          <option value="all">All Status</option>
                          <option value="safe">Safe</option>
                          <option value="warning">Warning</option>
                          <option value="violation">Violation</option>
                        </select>
                      </div>

                      {/* Type Filter */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Type</label>
                        <select value={selectedType} onChange={e => setSelectedType(e.target.value as any)} className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#e50914]">
                          <option value="all">All Types</option>
                          <option value="text">Text</option>
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>}
              </AnimatePresence>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
                <p className="text-sm text-[#808080] mb-1">Total Reports</p>
                <p className="text-2xl font-bold">{mockReports.length}</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg border border-green-500/30 p-4">
                <p className="text-sm text-[#808080] mb-1">Safe</p>
                <p className="text-2xl font-bold text-green-500">
                  {mockReports.filter(r => r.status === 'safe').length}
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg border border-yellow-500/30 p-4">
                <p className="text-sm text-[#808080] mb-1">Warnings</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {mockReports.filter(r => r.status === 'warning').length}
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg border border-[#e50914]/30 p-4">
                <p className="text-sm text-[#808080] mb-1">Violations</p>
                <p className="text-2xl font-bold text-[#e50914]">
                  {mockReports.filter(r => r.status === 'violation').length}
                </p>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-[#808080]">
                Showing <span className="text-[#e5e5e5] font-medium">{filteredReports.length}</span> of{' '}
                <span className="text-[#e5e5e5] font-medium">{mockReports.length}</span> reports
              </p>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredReports.map(report => {
              const config = statusConfig[report.status];
              const StatusIcon = config.icon;
              return <motion.div key={report.id} layout initial={{
                opacity: 0,
                scale: 0.9
              }} animate={{
                opacity: 1,
                scale: 1
              }} exit={{
                opacity: 0,
                scale: 0.9
              }} whileHover={{
                y: -4
              }} onClick={() => handleViewReport(report.id)} className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden cursor-pointer hover:border-[#404040] transition-all group">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-[#0d0d0d] flex items-center justify-center text-5xl border-b border-[#2a2a2a]">
                      {typeIcons[report.type]}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Status Badge */}
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium mb-3 ${config.bg} ${config.color}`}>
                        <StatusIcon size={12} />
                        {config.label}
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-[#e5e5e5] mb-2 line-clamp-2 group-hover:text-white transition-colors">
                        {report.title}
                      </h3>

                      {/* Metadata */}
                      <div className="space-y-1 text-sm text-[#808080] mb-3">
                        <p className="flex items-center gap-1.5">
                          <MapPin size={14} />
                          {report.region.toUpperCase()}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {report.timestamp.split(' ')[0]}
                        </p>
                      </div>

                      {/* Violations Count */}
                      {report.violationsCount > 0 && <div className="text-xs text-[#808080] mb-3">
                          <span className="text-[#e50914] font-medium">{report.violationsCount}</span>{' '}
                          {report.violationsCount === 1 ? 'violation' : 'violations'} detected
                        </div>}

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-[#2a2a2a]">
                        <button onClick={() => handleViewReport(report.id)} className="flex-1 bg-[#2a2a2a] hover:bg-[#404040] text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2">
                          <Eye size={14} />
                          View
                        </button>
                        <button onClick={e => handleDownload(e, report.id)} className="bg-[#2a2a2a] hover:bg-[#404040] text-white px-3 py-2 rounded text-sm transition-colors">
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>;
            })}
            </div>

            {/* Empty State */}
            {filteredReports.length === 0 && <div className="text-center py-12">
                <p className="text-[#808080] text-lg">No reports found matching your criteria</p>
                <button onClick={() => {
              setSearchQuery('');
              setSelectedRegion('all');
              setSelectedStatus('all');
              setSelectedType('all');
            }} className="mt-4 text-[#e50914] hover:text-[#f40612] font-medium">
                  Clear Filters
                </button>
              </div>}
          </div>
        </main>
      </div>
    </div>;
};