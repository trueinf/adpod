import React from 'react';
import { Upload, FileText, Image as ImageIcon, Video, Globe, ChevronDown, Menu, X, HelpCircle, User, LayoutDashboard, FolderOpen, FileBarChart, Settings as SettingsIcon, LogOut, Search, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
type AdType = 'text' | 'image' | 'video';
type Region = 'india' | 'us' | 'uk' | 'global';

interface CheckResult {
  category: string;
  status: 'pass' | 'fail' | 'warning';
  reason?: string;
  timestamp?: string; // For visual checks
}

interface ModerationResult {
  status: 'pass' | 'fail' | 'warning';
  textChecks: CheckResult[];
  visualChecks: CheckResult[];
  summary: string;
}

export interface ModPodProps {
  onNavigateToResults?: (resultId: string) => void;
  onNavigate?: (route: 'moderate' | 'results' | 'reports' | 'history' | 'rules' | 'profile' | 'logout') => void;
}
const regions = [{
  value: 'india',
  label: 'India'
}, {
  value: 'us',
  label: 'United States'
}, {
  value: 'uk',
  label: 'United Kingdom'
}, {
  value: 'global',
  label: 'Global'
}] as any[];
const sidebarItems = [{
  icon: LayoutDashboard,
  label: 'Moderate Ad',
  href: '/moderate',
  active: true
}, {
  icon: FileBarChart,
  label: 'Results Dashboard',
  href: '/results'
}, {
  icon: FolderOpen,
  label: 'Upload History',
  href: '/history'
}, {
  icon: FileText,
  label: 'Detailed Reports',
  href: '/reports'
}, {
  icon: SettingsIcon,
  label: 'Region Rules',
  href: '/rules'
}, {
  icon: User,
  label: 'Profile',
  href: '/profile'
}, {
  icon: LogOut,
  label: 'Logout',
  href: '/logout'
}] as any[];

interface VideoFrame {
  url: string;
  timestamp: string;
}

const extractFramesFromVideo = async (file: File): Promise<VideoFrame[]> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: VideoFrame[] = [];
    const videoUrl = URL.createObjectURL(file);
    
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    
    video.onloadedmetadata = async () => {
      const duration = video.duration;
      const scale = 150 / video.videoHeight;
      canvas.width = video.videoWidth * scale;
      canvas.height = 150;
      
      let currentTime = 0;
      
      const processNextFrame = async () => {
        if (currentTime > duration) {
          URL.revokeObjectURL(videoUrl);
          resolve(frames);
          return;
        }

        video.currentTime = currentTime;
        await new Promise<void>((r) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            r();
          };
          video.addEventListener('seeked', onSeeked);
        });

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const minutes = Math.floor(currentTime / 60);
          const seconds = Math.floor(currentTime % 60);
          const timestamp = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          
          frames.push({
            url: canvas.toDataURL('image/jpeg', 0.6),
            timestamp
          });
        }
        
        // Strategy: 1 frame/sec up to 60s, then 1 frame/5sec
        const interval = currentTime < 60 ? 1 : 5;
        currentTime += interval;
        processNextFrame();
      };
      
      processNextFrame();
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      resolve([]);
    };
  });
};

const transcribeVideo = async (file: File, apiKey: string): Promise<string> => {
  if (file.size > 25 * 1024 * 1024) {
    return "Error: File size exceeds 25MB limit for transcription.";
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "whisper-1");

  try {
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Transcription failed");
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Transcription error:", error);
    return `Error: ${error instanceof Error ? error.message : "Failed to transcribe video"}`;
  }
};

const moderateContent = async (transcript: string, frames: VideoFrame[], apiKey: string): Promise<ModerationResult> => {
  // Sample 1 frame every 5 seconds (approx every 5th frame if 1fps, or adjust logic based on extraction)
  // Assuming frames are extracted 1/sec for first 60s, then 1/5sec.
  // We'll just take every 5th frame to be safe and reduce payload.
  const sampledFrames = frames.filter((_, i) => i % 5 === 0);
  
  const systemPrompt = `
    You are an expert Content Moderation AI. Analyze the provided Video Transcript and Video Frames against the following strict policy checklists.
    
    📝 Transcript Moderation Checklist:
    1. Profanity & Offensive Language (swear words, slurs)
    2. Sexual or Inappropriate Content (suggestive phrases, adult services)
    3. Violent or Graphic Language (violence, weapons, gore)
    4. Hate Speech or Discrimination (racist, sexist, derogatory)
    5. Gambling-Related Phrases (betting, casinos, lotteries)
    6. Alcohol, Tobacco, or Drug References (drinking, smoking, substances)
    7. Political or Advocacy Messaging (parties, candidates, debates)
    8. Misinformation / Misleading Claims (unrealistic promises, fake endorsements)
    9. Calls to Action to Minors (addressing kids, "buy this toy")

    🖼️ Frame (Image) Moderation Checklist:
    1. Adult / Sexual Imagery (nudity, suggestive poses)
    2. Violence or Graphic Imagery (blood, weapons, gore)
    3. Drugs, Alcohol, Smoking (bottles, cigarettes, paraphernalia)
    4. Gambling Visuals (chips, cards, betting interfaces)
    5. Hate Symbols (Nazi, extremist signs)
    6. Children in Unsafe Context (holding adult products, risky scenarios)
    7. Political Symbols and Logos (campaign banners, flags)
    8. Brand and Competitor Logos (Hulu, Prime Video, OnlyFans, etc.)
    9. Illegal Items (firearms, counterfeits, explosives)

    Output a JSON object with this exact structure:
    {
      "status": "pass" | "fail" | "warning",
      "textChecks": [
        { "category": "Profanity & Offensive Language", "status": "pass" },
        { "category": "Sexual or Inappropriate Content", "status": "fail", "reason": "Found suggestive phrase..." }
        ... (one object for EACH of the 9 categories)
      ],
      "visualChecks": [
        { "category": "Adult / Sexual Imagery", "status": "pass" },
        { "category": "Violence or Graphic Imagery", "status": "warning", "reason": "Potential weapon...", "timestamp": "0:15" }
         ... (one object for EACH of the 9 categories)
      ],
      "summary": "Brief explanation..."
    }

    IMPORTANT: You MUST return a check result for ALL 9 text categories and ALL 9 visual categories, even if they pass. If a category passes, reason is optional.
  `;

  const messages: any[] = [
    { role: "system", content: systemPrompt },
    { 
      role: "user", 
      content: [
        { type: "text", text: `Transcript: "${transcript}"` },
        ...sampledFrames.map((frame, index) => ({
          type: "image_url",
          image_url: {
            url: frame.url,
            detail: "low"
          }
        }))
      ]
    }
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        response_format: { type: "json_object" },
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error("Moderation API request failed");
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return result as ModerationResult;
  } catch (error) {
    console.error("Moderation error:", error);
    return {
      status: 'warning',
      textChecks: [],
      visualChecks: [],
      summary: "Error running moderation analysis."
    };
  }
};

// @component: ModPod
export const ModPod = ({
  onNavigateToResults,
  onNavigate
}: ModPodProps) => {
  const [activeTab, setActiveTab] = React.useState<AdType>('video');
  const [selectedRegion, setSelectedRegion] = React.useState<Region>('india');
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [textContent, setTextContent] = React.useState('');
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [videoFrames, setVideoFrames] = React.useState<VideoFrame[]>([]);
  const [isProcessingFrames, setIsProcessingFrames] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [apiKey, setApiKey] = React.useState(import.meta.env.VITE_OPENAI_API_KEY || ''); // Allow setting via env or UI
  const [moderationResult, setModerationResult] = React.useState<ModerationResult | null>(null);
  const [isModerating, setIsModerating] = React.useState(false);

  const previewUrl = React.useMemo(() => {
    if (!uploadedFile) return '';
    return URL.createObjectURL(uploadedFile);
  }, [uploadedFile]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      if (file.type.startsWith('video/')) {
        setIsProcessingFrames(true);
        setVideoFrames([]);
        setTranscript('');
        
        // Parallel processing
        const framesPromise = extractFramesFromVideo(file);
        
        let transcriptionPromise = Promise.resolve('');
        if (apiKey) {
            setIsTranscribing(true);
            transcriptionPromise = transcribeVideo(file, apiKey);
        }

        const [frames, transcriptionText] = await Promise.all([framesPromise, transcriptionPromise]);
        
        setVideoFrames(frames);
        setIsProcessingFrames(false);
        
        if (apiKey) {
            setTranscript(transcriptionText);
            setIsTranscribing(false);
        }
      } else {
        setVideoFrames([]);
        setTranscript('');
      }
    }
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      if (file.type.startsWith('video/')) {
        setIsProcessingFrames(true);
        setVideoFrames([]);
        setTranscript('');

        // Parallel processing
        const framesPromise = extractFramesFromVideo(file);
        
        let transcriptionPromise = Promise.resolve('');
        if (apiKey) {
            setIsTranscribing(true);
            transcriptionPromise = transcribeVideo(file, apiKey);
        }

        const [frames, transcriptionText] = await Promise.all([framesPromise, transcriptionPromise]);

        setVideoFrames(frames);
        setIsProcessingFrames(false);
        
        if (apiKey) {
            setTranscript(transcriptionText);
            setIsTranscribing(false);
        }
      } else {
        setVideoFrames([]);
        setTranscript('');
      }
    }
  };
  const handleModerate = async () => {
    console.log('Moderating:', {
      activeTab,
      selectedRegion,
      textContent,
      uploadedFile
    });
    
    if (activeTab === 'video' && uploadedFile && apiKey) {
        setIsModerating(true);
        const result = await moderateContent(transcript, videoFrames, apiKey);
        setModerationResult(result);
        setIsModerating(false);
    }

    // Simulate moderation and navigate to results (original logic preserved for other tabs)
    if (activeTab !== 'video' && onNavigateToResults) {
      onNavigateToResults('ad-001');
    }
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

  // @return
  return <div className="flex h-screen w-full bg-[#141414] text-[#e5e5e5] overflow-hidden">
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
        <header className="h-16 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[#e5e5e5] hover:text-white transition-colors">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2 text-sm text-[#808080]">
              <span>Home</span>
              <span>/</span>
              <span className="text-[#e5e5e5]">Moderate Ad</span>
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

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Moderate Advertisement</h2>
              <p className="text-[#808080]">Upload or paste your ad content for AI-powered moderation analysis</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden">
                  <div className="flex border-b border-[#2a2a2a]">
                    {[{
                    type: 'video' as AdType,
                    icon: Video,
                    label: 'Video'
                  }, {
                    type: 'text' as AdType,
                    icon: FileText,
                    label: 'Text'
                  }, {
                    type: 'image' as AdType,
                    icon: ImageIcon,
                    label: 'Image'
                  }].map(tab => <button key={tab.type} onClick={() => setActiveTab(tab.type)} className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold transition-colors relative ${activeTab === tab.type ? 'text-white' : 'text-[#808080] hover:text-[#b3b3b3]'}`}>
                        <tab.icon size={20} />
                        <span>{tab.label}</span>
                        {activeTab === tab.type && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#e50914]" initial={false} transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30
                    }} />}
                      </button>)}
                  </div>

                  <div className="p-6">
                    <AnimatePresence mode="wait">
                      <motion.div key={activeTab} initial={{
                      opacity: 0,
                      y: 10
                    }} animate={{
                      opacity: 1,
                      y: 0
                    }} exit={{
                      opacity: 0,
                      y: -10
                    }} transition={{
                      duration: 0.2
                    }}>
                        {activeTab === 'text' ? <div>
                            <label className="block text-sm font-medium mb-2">
                              Ad Text Content
                            </label>
                            <textarea value={textContent} onChange={e => setTextContent(e.target.value)} placeholder="Paste your ad text here..." className="w-full h-64 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg p-4 text-[#e5e5e5] placeholder-[#555555] focus:outline-none focus:ring-2 focus:ring-[#e50914] resize-none" />
                          </div> : <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive ? 'border-[#e50914] bg-[#e50914]/10' : 'border-[#2a2a2a] hover:border-[#404040]'}`}>
                            <input ref={fileInputRef} type="file" onChange={handleFileChange} accept={activeTab === 'image' ? 'image/*' : 'video/*'} className="hidden" />
                            <Upload size={48} className="mx-auto mb-4 text-[#808080]" />
                            {uploadedFile ? <div>
                                <p className="text-[#e5e5e5] font-medium mb-2">
                                  {uploadedFile.name}
                                </p>
                                <p className="text-sm text-[#808080] mb-4">
                                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <button onClick={() => fileInputRef.current?.click()} className="text-[#e50914] hover:text-[#f40612] font-medium">
                                  Change File
                                </button>
                              </div> : <div>
                                <p className="text-[#e5e5e5] mb-2">
                                  Drag and drop your {activeTab} here
                                </p>
                                <p className="text-sm text-[#808080] mb-4">or</p>
                                <button onClick={() => fileInputRef.current?.click()} className="bg-[#2a2a2a] hover:bg-[#404040] text-white px-6 py-2 rounded-lg font-medium transition-colors">
                                  Browse Files
                                </button>
                              </div>}
                          </div>}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {(textContent || uploadedFile) && <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6">
                    <h3 className="text-lg font-bold mb-4">Preview</h3>
                    <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#2a2a2a]">
                      {activeTab === 'text' ? (
                        <p className="text-[#b3b3b3] whitespace-pre-wrap">{textContent}</p>
                      ) : uploadedFile ? (
                        activeTab === 'video' ? (
                          <div className="space-y-4">
                            <video 
                              src={previewUrl} 
                              controls 
                              className="w-full max-h-96 rounded-lg bg-black"
                            />
                            {isProcessingFrames ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e50914]"></div>
                                <span className="ml-3 text-[#808080]">Extracting frames...</span>
                              </div>
                            ) : videoFrames.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm text-[#808080]">Video Frames</p>
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent">
                                  {videoFrames.map((frame, idx) => (
                                    <motion.div 
                                      key={idx}
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className="flex-shrink-0 relative group"
                                    >
                                      <img 
                                        src={frame.url} 
                                        alt={`Frame at ${frame.timestamp}`}
                                        className="h-24 rounded border border-[#2a2a2a]"
                                      />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                                        <span className="text-xs font-bold text-white">{frame.timestamp}</span>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Transcript Section */}
                            <div className="pt-4 border-t border-[#2a2a2a]">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-medium text-[#e5e5e5]">Audio Transcript</h4>
                                    {!apiKey && <span className="text-xs text-[#e50914]">API Key Required</span>}
                                </div>
                                
                                {!apiKey ? (
                                    <div className="bg-[#1a1a1a] rounded p-4 border border-[#2a2a2a]">
                                        <p className="text-sm text-[#808080] mb-2">Enter your OpenAI API Key to enable transcription:</p>
                                        <input 
                                            type="password" 
                                            placeholder="sk-..." 
                                            className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded px-3 py-2 text-sm text-[#e5e5e5]"
                                            onChange={(e) => setApiKey(e.target.value)}
                                        />
                                    </div>
                                ) : isTranscribing ? (
                                    <div className="flex items-center justify-center py-8 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#e50914]"></div>
                                        <span className="ml-3 text-sm text-[#808080]">Transcribing audio...</span>
                                    </div>
                                ) : transcript ? (
                                    <div className="bg-[#1a1a1a] rounded border border-[#2a2a2a] p-4 relative group">
                                        <p className="text-sm text-[#b3b3b3] whitespace-pre-wrap max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent">
                                            {transcript}
                                        </p>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(transcript)}
                                            className="absolute top-2 right-2 p-1.5 bg-[#2a2a2a] rounded text-[#808080] opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                                            title="Copy to clipboard"
                                        >
                                            <FileText size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-[#808080] bg-[#1a1a1a] rounded border border-[#2a2a2a]">
                                        <p className="text-sm">No transcript available</p>
                                    </div>
                                )}
                            </div>

                            {/* Moderation Results Section */}
                            {moderationResult && (
                              <div className="pt-4 border-t border-[#2a2a2a] animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h4 className="text-sm font-medium text-[#e5e5e5] mb-3">Moderation Analysis</h4>
                                
                                <div className={`p-4 rounded-lg border mb-4 ${
                                  moderationResult.status === 'pass' ? 'bg-green-500/10 border-green-500/50' : 
                                  moderationResult.status === 'fail' ? 'bg-red-500/10 border-red-500/50' : 
                                  'bg-yellow-500/10 border-yellow-500/50'
                                }`}>
                                  <div className="flex items-start gap-3">
                                    {moderationResult.status === 'pass' ? <CheckCircle className="text-green-500 shrink-0" /> : 
                                     moderationResult.status === 'fail' ? <AlertCircle className="text-red-500 shrink-0" /> : 
                                     <AlertTriangle className="text-yellow-500 shrink-0" />}
                                    <div>
                                      <h5 className="font-bold text-white capitalize mb-1">{moderationResult.status}</h5>
                                      <p className="text-sm text-[#b3b3b3]">{moderationResult.summary}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Text Checks */}
                                  <div className="space-y-3">
                                    <h5 className="text-xs font-bold text-[#808080] uppercase tracking-wider mb-2">Transcript Checks</h5>
                                    {moderationResult.textChecks.map((check, i) => (
                                      <div key={i} className={`p-3 rounded border flex items-start gap-3 ${
                                        check.status === 'pass' ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 
                                        check.status === 'fail' ? 'bg-red-500/10 border-red-500/30' : 
                                        'bg-yellow-500/10 border-yellow-500/30'
                                      }`}>
                                        <div className="mt-0.5">
                                          {check.status === 'pass' ? <CheckCircle size={16} className="text-green-500" /> : 
                                           check.status === 'fail' ? <AlertCircle size={16} className="text-red-500" /> : 
                                           <AlertTriangle size={16} className="text-yellow-500" />}
                                        </div>
                                        <div>
                                          <p className={`text-sm font-medium ${check.status === 'pass' ? 'text-[#e5e5e5]' : 'text-white'}`}>
                                            {check.category}
                                          </p>
                                          {check.reason && (
                                            <p className="text-xs text-[#b3b3b3] mt-1">{check.reason}</p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Visual Checks */}
                                  <div className="space-y-3">
                                    <h5 className="text-xs font-bold text-[#808080] uppercase tracking-wider mb-2">Visual Checks</h5>
                                    {moderationResult.visualChecks.map((check, i) => (
                                      <div key={i} className={`p-3 rounded border flex items-start gap-3 ${
                                        check.status === 'pass' ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 
                                        check.status === 'fail' ? 'bg-red-500/10 border-red-500/30' : 
                                        'bg-yellow-500/10 border-yellow-500/30'
                                      }`}>
                                        <div className="mt-0.5">
                                          {check.status === 'pass' ? <CheckCircle size={16} className="text-green-500" /> : 
                                           check.status === 'fail' ? <AlertCircle size={16} className="text-red-500" /> : 
                                           <AlertTriangle size={16} className="text-yellow-500" />}
                                        </div>
                                        <div>
                                          <p className={`text-sm font-medium ${check.status === 'pass' ? 'text-[#e5e5e5]' : 'text-white'}`}>
                                            {check.category}
                                          </p>
                                          {(check.reason || check.timestamp) && (
                                            <div className="mt-1 space-y-0.5">
                                              {check.reason && <p className="text-xs text-[#b3b3b3]">{check.reason}</p>}
                                              {check.timestamp && <p className="text-xs font-mono text-[#808080]">Frame: {check.timestamp}</p>}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center">
                             <img src={previewUrl} alt="Preview" className="max-h-96 mx-auto rounded-lg object-contain" />
                             <p className="mt-2 text-[#808080]">
                               {uploadedFile.name}
                             </p>
                          </div>
                        )
                      ) : null}
                    </div>
                  </motion.div>}
              </div>

              <div className="space-y-6">
                <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6">
                  <h3 className="text-lg font-bold mb-4">Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Globe size={16} />
                        Target Region
                      </label>
                      <div className="relative">
                        <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value as Region)} className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#e5e5e5] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#e50914]">
                          {regions.map(region => <option key={region.value} value={region.value}>
                              {region.label}
                            </option>)}
                        </select>
                        <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#808080] pointer-events-none" />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#2a2a2a]">
                      <h4 className="text-sm font-medium mb-3">Policy Profile</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="w-4 h-4 bg-[#0d0d0d] border-[#2a2a2a] rounded accent-[#e50914]" />
                          <span className="text-sm text-[#b3b3b3]">Content Safety</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="w-4 h-4 bg-[#0d0d0d] border-[#2a2a2a] rounded accent-[#e50914]" />
                          <span className="text-sm text-[#b3b3b3]">Brand Safety</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="w-4 h-4 bg-[#0d0d0d] border-[#2a2a2a] rounded accent-[#e50914]" />
                          <span className="text-sm text-[#b3b3b3]">Compliance</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <motion.button whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} onClick={handleModerate} disabled={(!textContent && !uploadedFile) || isModerating} className="fixed bottom-8 right-8 bg-[#e50914] hover:bg-[#f40612] disabled:bg-[#555555] disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-bold text-lg shadow-2xl flex items-center gap-3 transition-colors">
          {isModerating ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Search size={24} />}
          {isModerating ? 'Analyzing...' : 'Moderate Now'}
        </motion.button>
      </div>
    </div>;
};