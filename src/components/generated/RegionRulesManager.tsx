import React, { useState } from 'react';
import { Globe, Plus, Trash2, Edit2, Save, X, AlertTriangle, Shield, Search, Filter, Menu, HelpCircle, User, LayoutDashboard, FolderOpen, FileBarChart, FileText, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export interface RegionRulesManagerProps {
  onNavigate?: (route: 'moderate' | 'results' | 'reports' | 'history' | 'rules' | 'profile' | 'logout') => void;
}
type Region = 'US' | 'UK' | 'IN' | 'SA';
type RuleCategory = 'profanity' | 'sexual' | 'violence' | 'hate-speech' | 'gambling' | 'alcohol-drugs' | 'political' | 'misinformation' | 'minors' | 'adult-imagery' | 'gambling-visuals' | 'hate-symbols' | 'children-unsafe' | 'political-symbols' | 'brand-logos' | 'illegal-items';
interface Rule {
  id: string;
  category: RuleCategory;
  keyword: string;
  description: string;
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
  region: 'US',
  label: 'United States',
  flag: '🇺🇸',
  rules: [{
    id: 'us-1',
    category: 'alcohol-drugs',
    keyword: 'Alcohol with 21+ disclaimer',
    description: 'Alcohol allowed with 21+ disclaimer; no minors; no binge drinking; no implication of success/attraction/performance improvement',
    severity: 'medium',
    enabled: true
  }, {
    id: 'us-2',
    category: 'gambling',
    keyword: 'Gambling with 21+ and state legality',
    description: 'Gambling allowed with 21+ and state legality messaging, responsible play promoted, no guaranteed winnings',
    severity: 'medium',
    enabled: true
  }, {
    id: 'us-3',
    category: 'alcohol-drugs',
    keyword: 'Cannabis where legal',
    description: 'Cannabis allowed where legal; no minors; no promotional smoking scenes; no unverified medical claims',
    severity: 'medium',
    enabled: true
  }, {
    id: 'us-4',
    category: 'political',
    keyword: 'Political ads with funding disclosure',
    description: 'Political ads must include funding disclosure; no misinformation or voter suppression',
    severity: 'high',
    enabled: true
  }, {
    id: 'us-5',
    category: 'adult-imagery',
    keyword: 'Kissing: light & brief only',
    description: 'Kissing: light & brief only; no passionate/sexual; no minors',
    severity: 'medium',
    enabled: true
  }, {
    id: 'us-6',
    category: 'adult-imagery',
    keyword: 'Clothing: swimwear allowed',
    description: 'Clothing: swimwear and modern attire allowed; no explicit lingerie, transparent clothing, or sexual camera angles',
    severity: 'medium',
    enabled: true
  }],
  threshold: 3
}, {
  region: 'UK',
  label: 'United Kingdom',
  flag: '🇬🇧',
  rules: [{
    id: 'uk-1',
    category: 'alcohol-drugs',
    keyword: 'Alcohol without intoxication',
    description: 'Alcohol allowed but no intoxication or excessive consumption or success-related claims',
    severity: 'medium',
    enabled: true
  }, {
    id: 'uk-2',
    category: 'gambling',
    keyword: 'Gambling with BeGambleAware.org',
    description: 'Gambling requires BeGambleAware.org style messaging; no guaranteed winnings',
    severity: 'medium',
    enabled: true
  }, {
    id: 'uk-3',
    category: 'alcohol-drugs',
    keyword: 'CBD only if non-psychoactive',
    description: 'CBD allowed only if non-psychoactive; no recreational cannabis or smoking scenes',
    severity: 'medium',
    enabled: true
  }, {
    id: 'uk-4',
    category: 'misinformation',
    keyword: 'No guaranteed-profit crypto claims',
    description: 'No guaranteed-profit crypto or financial claims',
    severity: 'high',
    enabled: true
  }, {
    id: 'uk-5',
    category: 'adult-imagery',
    keyword: 'Kissing: short & natural',
    description: 'Kissing: short & natural; no minors; no erotic or prolonged scenes',
    severity: 'medium',
    enabled: true
  }, {
    id: 'uk-6',
    category: 'adult-imagery',
    keyword: 'Clothing: modern fashion',
    description: 'Clothing: modern fashion allowed; no hyper-sexual posing or see-through lingerie',
    severity: 'medium',
    enabled: true
  }],
  threshold: 3
}, {
  region: 'IN',
  label: 'India',
  flag: '🇮🇳',
  rules: [{
    id: 'in-1',
    category: 'alcohol-drugs',
    keyword: 'Alcohol & tobacco fully banned',
    description: 'Alcohol & tobacco advertising fully banned, including surrogate branding',
    severity: 'high',
    enabled: true
  }, {
    id: 'in-2',
    category: 'gambling',
    keyword: 'Gambling/fantasy sports restricted',
    description: 'Gambling/fantasy sports restricted; must follow regional legality; cannot promote income or minors involvement',
    severity: 'high',
    enabled: true
  }, {
    id: 'in-3',
    category: 'political',
    keyword: 'Religious/caste messaging banned',
    description: 'Religious or caste political messaging banned; no divisive or inflammatory content',
    severity: 'high',
    enabled: true
  }, {
    id: 'in-4',
    category: 'political-symbols',
    keyword: 'National symbols must be respected',
    description: 'National symbols must be respected; cannot be altered, damaged, or mocked',
    severity: 'high',
    enabled: true
  }, {
    id: 'in-5',
    category: 'adult-imagery',
    keyword: 'Kissing: minimal PG-13 only',
    description: 'Kissing: minimal PG-13 only; no passionate or long kissing; no minors',
    severity: 'medium',
    enabled: true
  }, {
    id: 'in-6',
    category: 'adult-imagery',
    keyword: 'Clothing: standard attire',
    description: 'Clothing: standard attire allowed; no lingerie modeling, transparent clothing, sexual posing, or cleavage emphasis',
    severity: 'medium',
    enabled: true
  }],
  threshold: 2
}, {
  region: 'SA',
  label: 'Saudi Arabia',
  flag: '🇸🇦',
  rules: [{
    id: 'sa-1',
    category: 'alcohol-drugs',
    keyword: 'Alcohol strictly prohibited',
    description: 'Alcohol, gambling, and pork strictly prohibited (visual or verbal)',
    severity: 'high',
    enabled: true
  }, {
    id: 'sa-2',
    category: 'gambling',
    keyword: 'Gambling strictly prohibited',
    description: 'Gambling strictly prohibited (visual or verbal)',
    severity: 'high',
    enabled: true
  }, {
    id: 'sa-3',
    category: 'political',
    keyword: 'Only Islamic-respectful religious ads',
    description: 'Only Islamic-respectful religious advertising allowed; advertising or positive display referring to other religions, scriptures, rituals, places of worship, or symbols is not permitted',
    severity: 'high',
    enabled: true
  }, {
    id: 'sa-4',
    category: 'adult-imagery',
    keyword: 'No romantic or sexual content',
    description: 'No romantic or sexual content: any romantic kissing prohibited (including cheek kissing); no hugging or intimate touching',
    severity: 'high',
    enabled: true
  }, {
    id: 'sa-5',
    category: 'adult-imagery',
    keyword: 'Modest clothing required',
    description: 'Clothing must be modest: shoulders, chest, midriff, and legs above knee must be covered; no tight/body-con clothing; no swimwear; men must not be shirtless',
    severity: 'high',
    enabled: true
  }, {
    id: 'sa-6',
    category: 'adult-imagery',
    keyword: 'No nightclub/bar/party scenes',
    description: 'No nightclub, bar, party, or sensual dance scenes',
    severity: 'high',
    enabled: true
  }, {
    id: 'sa-7',
    category: 'hate-speech',
    keyword: 'No LGBTQ+ messaging',
    description: 'No LGBTQ+ messaging or advocacy symbols',
    severity: 'high',
    enabled: true
  }],
  threshold: 1
}];
const categoryColors: Record<RuleCategory, string> = {
  profanity: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  sexual: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
  violence: 'bg-red-500/20 text-red-400 border-red-500/50',
  'hate-speech': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  gambling: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  'alcohol-drugs': 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  political: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  misinformation: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  minors: 'bg-red-500/20 text-red-400 border-red-500/50',
  'adult-imagery': 'bg-pink-500/20 text-pink-400 border-pink-500/50',
  'gambling-visuals': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  'hate-symbols': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  'children-unsafe': 'bg-red-500/20 text-red-400 border-red-500/50',
  'political-symbols': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  'brand-logos': 'bg-gray-500/20 text-gray-400 border-gray-500/50',
  'illegal-items': 'bg-red-500/20 text-red-400 border-red-500/50'
};
const severityColors = {
  low: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-red-500/20 text-red-400'
};

const formatCategoryName = (category: RuleCategory): string => {
  const categoryMap: Record<RuleCategory, string> = {
    profanity: 'Profanity',
    sexual: 'Sexual Content',
    violence: 'Violence',
    'hate-speech': 'Hate Speech',
    gambling: 'Gambling',
    'alcohol-drugs': 'Alcohol/Drugs',
    political: 'Political',
    misinformation: 'Misinformation',
    minors: 'Minors',
    'adult-imagery': 'Adult Imagery',
    'gambling-visuals': 'Gambling Visuals',
    'hate-symbols': 'Hate Symbols',
    'children-unsafe': 'Children Unsafe',
    'political-symbols': 'Political Symbols',
    'brand-logos': 'Brand Logos',
    'illegal-items': 'Illegal Items'
  };
  return categoryMap[category] || category;
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
  const [selectedRegion, setSelectedRegion] = useState<Region>('US');
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
                      <option value="sexual">Sexual Content</option>
                      <option value="violence">Violence</option>
                      <option value="hate-speech">Hate Speech</option>
                      <option value="gambling">Gambling</option>
                      <option value="alcohol-drugs">Alcohol/Drugs</option>
                      <option value="political">Political</option>
                      <option value="misinformation">Misinformation</option>
                      <option value="minors">Minors</option>
                      <option value="adult-imagery">Adult Imagery</option>
                      <option value="gambling-visuals">Gambling Visuals</option>
                      <option value="hate-symbols">Hate Symbols</option>
                      <option value="children-unsafe">Children Unsafe</option>
                      <option value="political-symbols">Political Symbols</option>
                      <option value="brand-logos">Brand Logos</option>
                      <option value="illegal-items">Illegal Items</option>
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
                                  {formatCategoryName(rule.category)}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${severityColors[rule.severity]}`}>
                                  {rule.severity}
                                </span>
                              </div>
                              <p className="font-medium mb-1">{rule.keyword}</p>
                              {rule.description && (
                                <p className="text-sm text-[#808080] mt-1">{rule.description}</p>
                              )}
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