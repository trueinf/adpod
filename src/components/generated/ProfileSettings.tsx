import React from 'react';
import { User, Mail, Globe, Languages, Trash2, Key, Save, Menu, X, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
export interface ProfileSettingsProps {
  onNavigate?: (route: 'moderate' | 'results' | 'reports' | 'history' | 'rules' | 'profile' | 'logout') => void;
}

// @component: ProfileSettings
export const ProfileSettings = ({
  onNavigate
}: ProfileSettingsProps) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: 'John Doe',
    email: 'john.doe@modpod.com',
    role: 'Moderator',
    defaultRegion: 'india',
    language: 'en'
  });
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSave = () => {
    console.log('Saving profile:', formData);
    // Save logic here
  };
  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your moderation history?')) {
      console.log('Clearing history...');
    }
  };
  const handleRequestAPIKey = () => {
    console.log('Requesting API key...');
    alert('API Key generated: mpk_1234567890abcdef');
  };

  // @return
  return <div className="flex h-screen w-full bg-[#141414] text-[#e5e5e5] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[#e5e5e5] hover:text-white transition-colors">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2 text-sm text-[#808080]">
              <span>Home</span>
              <span>/</span>
              <span className="text-[#e5e5e5]">Profile & Settings</span>
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
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Profile & Settings</h2>
              <p className="text-[#808080]">Manage your account settings and preferences</p>
            </div>

            <div className="space-y-6">
              {/* Profile Information */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-[#e50914] flex items-center justify-center text-white text-3xl font-bold">
                    {formData.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{formData.name}</h3>
                    <p className="text-[#808080]">{formData.role}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <User size={16} />
                      Full Name
                    </label>
                    <input type="text" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#e50914]" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Mail size={16} />
                      Email Address
                    </label>
                    <input type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#e50914]" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Role
                    </label>
                    <input type="text" value={formData.role} disabled className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#808080] cursor-not-allowed" />
                    <p className="text-xs text-[#808080] mt-1">Contact admin to change your role</p>
                  </div>
                </div>
              </motion.div>

              {/* Preferences */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.1
            }} className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6">
                <h3 className="text-xl font-bold mb-4">Preferences</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Globe size={16} />
                      Default Region
                    </label>
                    <select value={formData.defaultRegion} onChange={e => handleInputChange('defaultRegion', e.target.value)} className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#e5e5e5] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#e50914]">
                      <option value="india">India</option>
                      <option value="us">United States</option>
                      <option value="uk">United Kingdom</option>
                      <option value="global">Global</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Languages size={16} />
                      Language Preference
                    </label>
                    <select value={formData.language} onChange={e => handleInputChange('language', e.target.value)} className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#e5e5e5] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#e50914]">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Developer Section */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.2
            }} className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6">
                <h3 className="text-xl font-bold mb-4">Developer Access</h3>
                
                <div className="space-y-4">
                  <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">API Key</span>
                      <Key size={16} className="text-[#808080]" />
                    </div>
                    <p className="text-xs text-[#808080] mb-3">
                      Use API keys to integrate ModPod with your applications
                    </p>
                    <button onClick={handleRequestAPIKey} className="w-full bg-[#2a2a2a] hover:bg-[#404040] text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Request New API Key
                    </button>
                  </div>

                  <div className="text-xs text-[#808080]">
                    <p>API Documentation: <a href="#" className="text-[#e50914] hover:underline">docs.modpod.com/api</a></p>
                  </div>
                </div>
              </motion.div>

              {/* Danger Zone */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.3
            }} className="bg-[#1a1a1a] rounded-lg border border-[#e50914]/30 p-6">
                <h3 className="text-xl font-bold mb-4 text-[#e50914]">Danger Zone</h3>
                
                <div className="space-y-3">
                  <button onClick={handleClearHistory} className="w-full bg-[#2a2a2a] hover:bg-[#404040] text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <Trash2 size={18} />
                    Clear Moderation History
                  </button>

                  <p className="text-xs text-[#808080]">
                    This action will permanently delete all your moderation history and cannot be undone.
                  </p>
                </div>
              </motion.div>

              {/* Save Button */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.4
            }} className="flex justify-end gap-4">
                <button onClick={() => onNavigate?.('moderate')} className="bg-[#2a2a2a] hover:bg-[#404040] text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} className="bg-[#e50914] hover:bg-[#f40612] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
                  <Save size={18} />
                  Save Changes
                </button>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>;
};