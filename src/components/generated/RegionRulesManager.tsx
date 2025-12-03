import React, { useState } from 'react';
import { Globe, Plus, Trash2, Edit2, Save, X, AlertTriangle, Shield, Search, Filter, Menu, HelpCircle, User, LayoutDashboard, FolderOpen, FileBarChart, FileText, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export interface RegionRulesManagerProps {
  onNavigate?: (route: 'moderate' | 'results' | 'reports' | 'history' | 'rules' | 'profile' | 'logout') => void;
}
type Region = 'india' | 'us' | 'uk' | 'global';
type RuleCategory = 'profanity' | 'violence' | 'discrimination' | 'adult' | 'misinformation' | 'copyright';
interface Rule {
  id: string;
  category: RuleCategory;
  keyword: string;
  severity: 'low' | 'medium' | 'high';
  enabled: boolean;
}
interface RegionConfig {
  region: Region;
  label: string;
  flag: string;
  rules: Rule[];
  threshold: number;
}
const mockRegionConfigs: RegionConfig[] = [{
  region: 'india',
  label: 'India',
  flag: '🇮🇳',
  rules: [{
    id: '1',
    category: 'profanity',
    keyword: 'offensive term',
    severity: 'high',
    enabled: true
  }, {
    id: '2',
    category: 'violence',
    keyword: 'violent imagery',
    severity: 'high',
    enabled: true
  }, {
    id: '3',
    category: 'discrimination',
    keyword: 'hate speech',
    severity: 'high',
    enabled: true
  }, {
    id: '4',
    category: 'adult',
    keyword: 'explicit content',
    severity: 'medium',
    enabled: true
  }],
  threshold: 3
}, {
  region: 'us',
  label: 'United States',
  flag: '🇺🇸',
  rules: [{
    id: '5',
    category: 'profanity',
    keyword: 'profane language',
    severity: 'medium',
    enabled: true
  }, {
    id: '6',
    category: 'violence',
    keyword: 'graphic violence',
    severity: 'high',
    enabled: true
  }, {
    id: '7',
    category: 'misinformation',
    keyword: 'false claims',
    severity: 'high',
    enabled: true
  }, {
    id: '8',
    category: 'copyright',
    keyword: 'unauthorized use',
    severity: 'medium',
    enabled: true
  }],
  threshold: 2
}, {
  region: 'uk',
  label: 'United Kingdom',
  flag: '🇬🇧',
  rules: [{
    id: '9',
    category: 'profanity',
    keyword: 'offensive content',
    severity: 'high',
    enabled: true
  }, {
    id: '10',
    category: 'discrimination',
    keyword: 'discriminatory language',
    severity: 'high',
    enabled: true
  }, {
    id: '11',
    category: 'adult',
    keyword: 'adult content',
    severity: 'medium',
    enabled: true
  }, {
    id: '12',
    category: 'misinformation',
    keyword: 'misleading info',
    severity: 'medium',
    enabled: true
  }],
  threshold: 3
}, {
  region: 'global',
  label: 'Global',
  flag: '🌍',
  rules: [{
    id: '13',
    category: 'violence',
    keyword: 'extreme violence',
    severity: 'high',
    enabled: true
  }, {
    id: '14',
    category: 'discrimination',
    keyword: 'hate content',
    severity: 'high',
    enabled: true
  }, {
    id: '15',
    category: 'adult',
    keyword: 'nsfw content',
    severity: 'high',
    enabled: true
  }],
  threshold: 2
}];
const categoryColors: Record<RuleCategory, string> = {
  profanity: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  violence: 'bg-red-500/20 text-red-400 border-red-500/50',
  discrimination: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  adult: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
  misinformation: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  copyright: 'bg-blue-500/20 text-blue-400 border-blue-500/50'
};
const severityColors = {
  low: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-red-500/20 text-red-400'
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
  active: false
}, {
  icon: SettingsIcon,
  label: 'Region Rules',
  href: '/rules',
  active: true
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
export const RegionRulesManager = ({
  onNavigate
}: RegionRulesManagerProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<Region>('india');
  const [regionConfigs, setRegionConfigs] = useState(mockRegionConfigs);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [addingRule, setAddingRule] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<RuleCategory | 'all'>('all');
  const currentConfig = regionConfigs.find(c => c.region === selectedRegion)!;
  const filteredRules = currentConfig.rules.filter(rule => {
    const matchesSearch = rule.keyword.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || rule.category === filterCategory;
    return matchesSearch && matchesCategory;
  });
  const toggleRule = (ruleId: string) => {
    setRegionConfigs(prev => prev.map(config => {
      if (config.region === selectedRegion) {
        return {
          ...config,
          rules: config.rules.map(rule => rule.id === ruleId ? {
            ...rule,
            enabled: !rule.enabled
          } : rule)
        };
      }
      return config;
    }));
  };
  const deleteRule = (ruleId: string) => {
    setRegionConfigs(prev => prev.map(config => {
      if (config.region === selectedRegion) {
        return {
          ...config,
          rules: config.rules.filter(rule => rule.id !== ruleId)
        };
      }
      return config;
    }));
  };
  const updateThreshold = (value: number) => {
    setRegionConfigs(prev => prev.map(config => {
      if (config.region === selectedRegion) {
        return {
          ...config,
          threshold: value
        };
      }
      return config;
    }));
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
              <span>Home</span>
              <span>/</span>
              <span className="text-[#e5e5e5]">Region Rules</span>
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
          <div className="max-w-7xl mx-auto p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Region Rule Manager</h1>
              <p className="text-[#808080]">Configure moderation rules and thresholds for each region</p>
            </div>

            {/* Region Selector */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {regionConfigs.map(config => <motion.button key={config.region} whileHover={{
                scale: 1.02
              }} whileTap={{
                scale: 0.98
              }} onClick={() => setSelectedRegion(config.region)} className={`p-4 rounded-lg border-2 transition-all ${selectedRegion === config.region ? 'border-[#e50914] bg-[#e50914]/10' : 'border-[#2a2a2a] hover:border-[#404040]'}`}>
                    <div className="text-4xl mb-2">{config.flag}</div>
                    <div className="font-bold">{config.label}</div>
                    <div className="text-sm text-[#808080] mt-1">
                      {config.rules.filter(r => r.enabled).length} active rules
                    </div>
                  </motion.button>)}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Rules List */}
              <div className="lg:col-span-2 space-y-6">
                {/* Search & Filter */}
                <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808080]" />
                      <input type="text" placeholder="Search rules..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-2 text-[#e5e5e5] placeholder-[#555555] focus:outline-none focus:ring-2 focus:ring-[#e50914]" />
                    </div>
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value as RuleCategory | 'all')} className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-2 text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#e50914]">
                      <option value="all">All Categories</option>
                      <option value="profanity">Profanity</option>
                      <option value="violence">Violence</option>
                      <option value="discrimination">Discrimination</option>
                      <option value="adult">Adult Content</option>
                      <option value="misinformation">Misinformation</option>
                      <option value="copyright">Copyright</option>
                    </select>
                  </div>
                </div>

                {/* Rules List */}
                <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden">
                  <div className="p-4 border-b border-[#2a2a2a] flex justify-between items-center">
                    <h2 className="text-xl font-bold">Active Rules</h2>
                    <motion.button whileHover={{
                    scale: 1.05
                  }} whileTap={{
                    scale: 0.95
                  }} onClick={() => setAddingRule(true)} className="bg-[#e50914] hover:bg-[#f40612] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                      <Plus size={20} />
                      Add Rule
                    </motion.button>
                  </div>

                  <div className="divide-y divide-[#2a2a2a]">
                    <AnimatePresence mode="popLayout">
                      {filteredRules.map(rule => <motion.div key={rule.id} initial={{
                      opacity: 0,
                      height: 0
                    }} animate={{
                      opacity: 1,
                      height: 'auto'
                    }} exit={{
                      opacity: 0,
                      height: 0
                    }} className="p-4 hover:bg-[#2a2a2a]/30 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${categoryColors[rule.category]}`}>
                                  {rule.category}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${severityColors[rule.severity]}`}>
                                  {rule.severity}
                                </span>
                              </div>
                              <p className="font-medium mb-1">{rule.keyword}</p>
                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={rule.enabled} onChange={() => toggleRule(rule.id)} className="w-4 h-4 bg-[#0d0d0d] border-[#2a2a2a] rounded accent-[#e50914]" />
                                  <span className="text-sm text-[#808080]">
                                    {rule.enabled ? 'Enabled' : 'Disabled'}
                                  </span>
                                </label>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setEditingRule(rule.id)} className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors">
                                <Edit2 size={16} className="text-[#808080]" />
                              </button>
                              <button onClick={() => deleteRule(rule.id)} className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors">
                                <Trash2 size={16} className="text-[#e50914]" />
                              </button>
                            </div>
                          </div>
                        </motion.div>)}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Settings Sidebar */}
              <div className="space-y-6">
                {/* Threshold Settings */}
                <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={20} className="text-[#e50914]" />
                    <h3 className="text-lg font-bold">Violation Threshold</h3>
                  </div>
                  <p className="text-sm text-[#808080] mb-4">
                    Flag ad if more than this many high severity categories are triggered
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Current Threshold: <span className="text-[#e50914] font-bold">{currentConfig.threshold}</span>
                      </label>
                      <input type="range" min="1" max="5" value={currentConfig.threshold} onChange={e => updateThreshold(parseInt(e.target.value))} className="w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#e50914]" />
                      <div className="flex justify-between text-xs text-[#808080] mt-1">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Policy Summary */}
                <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield size={20} className="text-[#e50914]" />
                    <h3 className="text-lg font-bold">Policy Summary</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#808080]">Total Rules</span>
                      <span className="font-bold">{currentConfig.rules.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#808080]">Active Rules</span>
                      <span className="font-bold text-green-400">
                        {currentConfig.rules.filter(r => r.enabled).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#808080]">Disabled Rules</span>
                      <span className="font-bold text-[#808080]">
                        {currentConfig.rules.filter(r => !r.enabled).length}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-[#2a2a2a]">
                      <span className="text-sm text-[#808080]">High Severity</span>
                      <span className="font-bold text-red-400">
                        {currentConfig.rules.filter(r => r.severity === 'high').length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <motion.button whileHover={{
                scale: 1.02
              }} whileTap={{
                scale: 0.98
              }} className="w-full bg-[#e50914] hover:bg-[#f40612] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2">
                  <Save size={20} />
                  Save Policy Profile
                </motion.button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>;
};