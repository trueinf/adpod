import React from 'react';
import { ArrowUpDown, Eye, Download, Filter, Search, FileText, Image as ImageIcon, Video, Menu, X, HelpCircle, User, LayoutDashboard, FolderOpen, FileBarChart, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export interface UploadHistoryProps {
  onViewReport?: (id: string) => void;
  onDownloadReport?: (id: string) => void;
  onNavigate?: (route: 'moderate' | 'results' | 'reports' | 'history' | 'rules' | 'profile' | 'logout') => void;
}
type HistoryItem = {
  id: string;
  fileName: string;
  submittedBy: string;
  type: 'text' | 'image' | 'video';
  region: string;
  status: 'pending' | 'completed' | 'flagged';
  timestamp: string;
};
const mockHistory: HistoryItem[] = [{
  id: 'ad-001',
  fileName: 'Summer Sale Campaign.txt',
  submittedBy: 'John Doe',
  type: 'text',
  region: 'United States',
  status: 'completed',
  timestamp: '2025-12-02 14:35'
}, {
  id: 'ad-002',
  fileName: 'Product Banner 2024.jpg',
  submittedBy: 'Sarah Smith',
  type: 'image',
  region: 'India',
  status: 'flagged',
  timestamp: '2025-12-02 13:22'
}, {
  id: 'ad-003',
  fileName: 'Holiday Video Ad.mp4',
  submittedBy: 'Mike Johnson',
  type: 'video',
  region: 'United Kingdom',
  status: 'completed',
  timestamp: '2025-12-02 12:10'
}, {
  id: 'ad-004',
  fileName: 'Black Friday Promo.txt',
  submittedBy: 'Emily Davis',
  type: 'text',
  region: 'Global',
  status: 'pending',
  timestamp: '2025-12-02 11:45'
}, {
  id: 'ad-005',
  fileName: 'Brand Campaign Image.png',
  submittedBy: 'John Doe',
  type: 'image',
  region: 'United States',
  status: 'completed',
  timestamp: '2025-12-02 10:30'
}, {
  id: 'ad-006',
  fileName: 'Testimonial Video.mp4',
  submittedBy: 'Sarah Smith',
  type: 'video',
  region: 'India',
  status: 'flagged',
  timestamp: '2025-12-02 09:15'
}, {
  id: 'ad-007',
  fileName: 'Clearance Sale Text.txt',
  submittedBy: 'Mike Johnson',
  type: 'text',
  region: 'United Kingdom',
  status: 'completed',
  timestamp: '2025-12-01 18:40'
}, {
  id: 'ad-008',
  fileName: 'Spring Collection Banner.jpg',
  submittedBy: 'Emily Davis',
  type: 'image',
  region: 'Global',
  status: 'completed',
  timestamp: '2025-12-01 16:20'
}];
const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10'
  },
  completed: {
    label: 'Completed',
    color: 'text-green-400',
    bg: 'bg-green-400/10'
  },
  flagged: {
    label: 'Flagged',
    color: 'text-[#e50914]',
    bg: 'bg-[#e50914]/10'
  }
};
const typeIcons = {
  text: FileText,
  image: ImageIcon,
  video: Video
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
  active: true
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

// @component: UploadHistory
export const UploadHistory = ({
  onViewReport,
  onDownloadReport,
  onNavigate
}: UploadHistoryProps) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<string>('all');
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const [sortField, setSortField] = React.useState<keyof HistoryItem>('timestamp');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');
  const handleSort = (field: keyof HistoryItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  const filteredHistory = mockHistory.filter(item => {
    const matchesSearch = item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || item.submittedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === 'asc' ? 1 : -1;
    return aValue > bValue ? direction : -direction;
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

  // @return
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
              <span>Home</span>
              <span>/</span>
              <span className="text-[#e5e5e5]">Upload History</span>
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

        {/* Main Content - Update to remove redundant header and use proper structure */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="p-8 border-b border-[#2a2a2a]">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold mb-2">Upload History</h1>
              <p className="text-[#808080]">View and manage all your moderated advertisements</p>
            </div>
          </div>

          {/* Filters */}
          <div className="p-8 border-b border-[#2a2a2a] bg-[#1a1a1a]">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#808080]" />
                  <input type="text" placeholder="Search by filename or user..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg pl-12 pr-4 py-3 text-[#e5e5e5] placeholder-[#555555] focus:outline-none focus:ring-2 focus:ring-[#e50914]" />
                </div>

                {/* Type Filter */}
                <div className="relative">
                  <Filter size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#808080]" />
                  <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg pl-12 pr-10 py-3 text-[#e5e5e5] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#e50914] min-w-[180px]">
                    <option value="all">All Types</option>
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#808080]" />
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg pl-12 pr-10 py-3 text-[#e5e5e5] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#e50914] min-w-[180px]">
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="flagged">Flagged</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 text-sm text-[#808080]">
                Showing {filteredHistory.length} of {mockHistory.length} results
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0d0d0d]">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-bold text-white">
                          <button onClick={() => handleSort('fileName')} className="flex items-center gap-2 hover:text-[#e50914] transition-colors">
                            File Name
                            <ArrowUpDown size={16} className={sortField === 'fileName' ? 'text-[#e50914]' : ''} />
                          </button>
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-bold text-white">
                          <button onClick={() => handleSort('submittedBy')} className="flex items-center gap-2 hover:text-[#e50914] transition-colors">
                            Submitted By
                            <ArrowUpDown size={16} className={sortField === 'submittedBy' ? 'text-[#e50914]' : ''} />
                          </button>
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-bold text-white">
                          <button onClick={() => handleSort('type')} className="flex items-center gap-2 hover:text-[#e50914] transition-colors">
                            Type
                            <ArrowUpDown size={16} className={sortField === 'type' ? 'text-[#e50914]' : ''} />
                          </button>
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-bold text-white">
                          <button onClick={() => handleSort('region')} className="flex items-center gap-2 hover:text-[#e50914] transition-colors">
                            Region
                            <ArrowUpDown size={16} className={sortField === 'region' ? 'text-[#e50914]' : ''} />
                          </button>
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-bold text-white">
                          <button onClick={() => handleSort('status')} className="flex items-center gap-2 hover:text-[#e50914] transition-colors">
                            Status
                            <ArrowUpDown size={16} className={sortField === 'status' ? 'text-[#e50914]' : ''} />
                          </button>
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-bold text-white">
                          <button onClick={() => handleSort('timestamp')} className="flex items-center gap-2 hover:text-[#e50914] transition-colors">
                            Timestamp
                            <ArrowUpDown size={16} className={sortField === 'timestamp' ? 'text-[#e50914]' : ''} />
                          </button>
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-bold text-white">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((item, index) => {
                      const Icon = typeIcons[item.type];
                      const statusStyle = statusConfig[item.status];
                      return <motion.tr key={item.id} initial={{
                        opacity: 0,
                        y: 10
                      }} animate={{
                        opacity: 1,
                        y: 0
                      }} transition={{
                        delay: index * 0.05
                      }} className="border-t border-[#2a2a2a] hover:bg-[#2a2a2a]/30 transition-colors">
                            <td className="px-6 py-4 text-[#e5e5e5]">{item.fileName}</td>
                            <td className="px-6 py-4 text-[#b3b3b3]">{item.submittedBy}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-[#b3b3b3]">
                                <Icon size={16} />
                                <span className="capitalize">{item.type}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[#b3b3b3]">{item.region}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.color}`}>
                                {statusStyle.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-[#b3b3b3]">{item.timestamp}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <motion.button whileHover={{
                              scale: 1.1
                            }} whileTap={{
                              scale: 0.9
                            }} onClick={() => onViewReport?.(item.id)} className="p-2 bg-[#2a2a2a] hover:bg-[#e50914] rounded-lg transition-colors" title="View Report">
                                  <Eye size={16} />
                                </motion.button>
                                <motion.button whileHover={{
                              scale: 1.1
                            }} whileTap={{
                              scale: 0.9
                            }} onClick={() => onDownloadReport?.(item.id)} className="p-2 bg-[#2a2a2a] hover:bg-[#e50914] rounded-lg transition-colors" title="Download Report">
                                  <Download size={16} />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>;
                    })}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredHistory.length === 0 && <motion.div initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} className="text-center py-16">
                  <p className="text-[#808080] text-lg">No results found</p>
                  <p className="text-[#555555] text-sm mt-2">Try adjusting your filters or search query</p>
                </motion.div>}
            </div>
          </div>
        </main>
      </div>
    </div>;
};