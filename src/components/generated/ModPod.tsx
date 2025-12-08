import React from 'react';
import { Upload, FileText, Image as ImageIcon, Video, Globe, ChevronDown, Menu, X, HelpCircle, User, LayoutDashboard, FolderOpen, FileBarChart, Settings as SettingsIcon, LogOut, Search, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
type AdType = 'text' | 'image' | 'video';
type Region = 'US' | 'UK' | 'IN' | 'SA';

interface CheckResult {
  category: string;
  status: 'pass' | 'fail' | 'warning';
  reason?: string;
  timestamp?: string; // For visual checks
}

interface CountryEvaluation {
  country: 'US' | 'UK' | 'IN' | 'SA';
  status: 'pass' | 'fail' | 'warning';
  reason?: string;
}

interface ModerationResult {
  status: 'pass' | 'fail' | 'warning';
  textChecks: CheckResult[];
  visualChecks: CheckResult[];
  countryEvaluation: CountryEvaluation;
  summary: string;
}

export interface ModPodProps {
  onNavigateToResults?: (resultId: string) => void;
  onNavigate?: (route: 'moderate' | 'results' | 'reports' | 'history' | 'rules' | 'profile' | 'logout') => void;
}
const regions = [{
  value: 'US',
  label: 'United States'
}, {
  value: 'UK',
  label: 'United Kingdom'
}, {
  value: 'IN',
  label: 'India'
}, {
  value: 'SA',
  label: 'Saudi Arabia'
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
          const fractionalSeconds = Math.floor((currentTime % 1) * 10);
          const timestamp = `${minutes}:${seconds.toString().padStart(2, '0')}.${fractionalSeconds}`;
          
          frames.push({
            url: canvas.toDataURL('image/jpeg', 0.6),
            timestamp
          });
        }
        
        // Strategy: 1 frame/0.5sec up to 60s, then 1 frame/5sec
        const interval = currentTime < 60 ? 0.5 : 5;
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

const translateText = async (text: string, targetLang: string, apiKey: string): Promise<string> => {
  if (!text.trim() || !targetLang) {
    console.warn('Translation skipped: missing text or target language', { hasText: !!text.trim(), targetLang });
    return '';
  }

  if (!apiKey || !apiKey.trim()) {
    throw new Error('API key is required for translation');
  }

  console.log('Calling translation API...', { targetLang, textLength: text.length, apiKeyPrefix: apiKey.substring(0, 10) + '...' });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the following text to ${targetLang}. Only return the translated text, nothing else.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}: ${response.statusText}` } }));
      console.error('Translation API error:', errorData);
      throw new Error(errorData.error?.message || `Translation failed: HTTP ${response.status}`);
    }

    const data = await response.json();
    const translated = data.choices[0]?.message?.content || '';
    console.log('Translation successful:', { translatedLength: translated.length });
    return translated;
  } catch (error) {
    console.error("Translation error:", error);
    throw error; // Re-throw to let the caller handle it
  }
};

const moderateContent = async (transcript: string, frames: VideoFrame[], apiKey: string, country: Region): Promise<ModerationResult> => {
  // Sample 1 frame every 2.5 seconds (approx every 5th frame if 0.5sec intervals, or adjust logic based on extraction)
  // Assuming frames are extracted 1/0.5sec for first 60s, then 1/5sec.
  // We'll just take every 5th frame to be safe and reduce payload.
  const sampledFrames = frames.filter((_, i) => i % 5 === 0);
  
  const systemPrompt = `You are an expert Content Moderation AI.

Analyze the provided Video Transcript and Video Frames using the moderation checklist and apply the specific rules for the selected country.

The country value will always be one of the following: US, UK, IN, SA.



📝 Transcript Moderation Checklist



Check the transcript for:



Profanity & Offensive Language (swear words, slurs)



Sexual or Inappropriate Content (suggestive phrases, adult services)



Violent or Graphic Language (violence, threats, weapons, gore)



Hate Speech or Discrimination (racism, sexism, religion, caste, disability)



Gambling-Related Phrases (betting, casinos, fantasy sports, lotteries)



Alcohol, Tobacco, or Drug References (drinking, smoking, cannabis)



Political or Advocacy Messaging (candidates, parties, activism)



Misinformation / Misleading Claims (unverified claims, false promises)



Calls to Action to Minors (direct marketing to under 18)



🖼️ Frame (Image) Moderation Checklist



Check each frame for:



Adult / Sexual Imagery (nudity, lingerie, suggestive poses)



Violence or Graphic Imagery (blood, weapons, injuries)



Drugs, Alcohol, Smoking (bottles, cigarettes, vapes, cannabis)



Gambling Visuals (chips, casino tables, betting screens)



Hate Symbols (extremist flags, Nazi symbols)



Children in Unsafe Contexts (danger, adult products)



Political Symbols & Logos (campaign banners, flags, rallies)



Brand & Competitor Logos (OnlyFans, Hulu, Netflix, alcohol logos, etc.)



Illegal Items (firearms, counterfeit items, explosives)



🌍 Country-Specific Rules

🇺🇸 United States (US)



Alcohol allowed with 21+ disclaimer; no minors; no binge drinking; no implication of success/attraction/performance improvement



Gambling allowed with 21+ and state legality messaging, responsible play promoted, no guaranteed winnings



Cannabis allowed where legal; no minors; no promotional smoking scenes; no unverified medical claims



Political ads must include funding disclosure; no misinformation or voter suppression



Kissing: light & brief only; no passionate/sexual; no minors



Clothing: swimwear and modern attire allowed; no explicit lingerie, transparent clothing, or sexual camera angles



🇬🇧 United Kingdom (UK)



Alcohol allowed but no intoxication or excessive consumption or success-related claims



Gambling requires BeGambleAware.org style messaging; no guaranteed winnings



CBD allowed only if non-psychoactive; no recreational cannabis or smoking scenes



No guaranteed-profit crypto or financial claims



Kissing: short & natural; no minors; no erotic or prolonged scenes



Clothing: modern fashion allowed; no hyper-sexual posing or see-through lingerie



🇮🇳 India (IN)



Alcohol & tobacco advertising fully banned, including surrogate branding



Gambling/fantasy sports restricted; must follow regional legality; cannot promote income or minors involvement



Religious or caste political messaging banned; no divisive or inflammatory content



National symbols must be respected; cannot be altered, damaged, or mocked



Kissing: minimal PG-13 only; no passionate or long kissing; no minors



Clothing: standard attire allowed; no lingerie modeling, transparent clothing, sexual posing, or cleavage emphasis



🇸🇦 Saudi Arabia (SA)



Alcohol, gambling, and pork strictly prohibited (visual or verbal)



Only Islamic-respectful religious advertising allowed; advertising or positive display referring to other religions, scriptures, rituals, places of worship, or symbols is not permitted



No romantic or sexual content: any romantic kissing prohibited (including cheek kissing); no hugging or intimate touching



Clothing must be modest: shoulders, chest, midriff, and legs above knee must be covered; no tight/body-con clothing; no swimwear; men must not be shirtless



No nightclub, bar, party, or sensual dance scenes



No LGBTQ+ messaging or advocacy symbols



🧾 Required JSON Output Format

{

  "status": "pass | fail | warning",

  "textChecks": [

    { "category": "Profanity & Offensive Language", "status": "pass | fail | warning", "reason": "" },

    { "category": "Sexual or Inappropriate Content", "status": "pass | fail | warning", "reason": "" },

    { "category": "Violent or Graphic Language", "status": "pass | fail | warning", "reason": "" },

    { "category": "Hate Speech or Discrimination", "status": "pass | fail | warning", "reason": "" },

    { "category": "Gambling-Related Phrases", "status": "pass | fail | warning", "reason": "" },

    { "category": "Alcohol, Tobacco, or Drug References", "status": "pass | fail | warning", "reason": "" },

    { "category": "Political or Advocacy Messaging", "status": "pass | fail | warning", "reason": "" },

    { "category": "Misinformation / Misleading Claims", "status": "pass | fail | warning", "reason": "" },

    { "category": "Calls to Action to Minors", "status": "pass | fail | warning", "reason": "" }

  ],

  "visualChecks": [

    { "category": "Adult / Sexual Imagery", "status": "pass | fail | warning", "reason": "", "timestamp": "" },

    { "category": "Violence or Graphic Imagery", "status": "pass | fail | warning", "reason": "", "timestamp": "" },

    { "category": "Drugs, Alcohol, Smoking", "status": "pass | fail | warning", "reason": "", "timestamp": "" },

    { "category": "Gambling Visuals", "status": "pass | fail | warning", "reason": "", "timestamp": "" },

    { "category": "Hate Symbols", "status": "pass | fail | warning", "reason": "", "timestamp": "" },

    { "category": "Children in Unsafe Contexts", "status": "pass | fail | warning", "reason": "", "timestamp": "" },

    { "category": "Political Symbols & Logos", "status": "pass | fail | warning", "reason": "", "timestamp": "" },

    { "category": "Brand & Competitor Logos", "status": "pass | fail | warning", "reason": "", "timestamp": "" },

    { "category": "Illegal Items", "status": "pass | fail | warning", "reason": "", "timestamp": "" }

  ],

  "countryEvaluation": {

    "country": "US | UK | IN | SA",

    "status": "pass | fail | warning",

    "reason": ""

  },

  "summary": ""

}

The countryEvaluation must reflect whether the content violates any country-specific rules for the selected country: ${country}.`;

  const userContent: any[] = [
    { 
      type: "text", 
      text: `Analyze this content for country: ${country}\n\nTranscript: "${transcript || '(No transcript provided)'}"` 
    }
  ];

  // Only add frames if they exist
  if (sampledFrames.length > 0) {
    userContent.push(...sampledFrames.map((frame) => ({
      type: "image_url",
      image_url: {
        url: frame.url,
        detail: "low"
      }
    })));
  }

  const messages: any[] = [
    { role: "system", content: systemPrompt },
    { 
      role: "user", 
      content: userContent
    }
  ];

  try {
    // Validate API key
    if (!apiKey || !apiKey.trim()) {
      throw new Error("OpenAI API key is required. Please provide a valid API key.");
    }

    // Ensure we have at least transcript or frames
    if (!transcript.trim() && sampledFrames.length === 0) {
      throw new Error("No content to moderate. Please provide a transcript or video frames.");
    }

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
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error("Moderation API error:", errorMessage, errorData);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error("Invalid API response structure:", data);
      throw new Error("Invalid response from moderation API");
    }

    const content = data.choices[0].message.content;
    let result;
    
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content);
      throw new Error("Failed to parse moderation response as JSON");
    }

    // Validate that result has required structure
    if (!result.textChecks || !result.visualChecks || !result.countryEvaluation) {
      console.error("Invalid result structure:", result);
      throw new Error("Moderation response missing required fields");
    }

    return result as ModerationResult;
  } catch (error) {
    console.error("Moderation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return {
      status: 'warning',
      textChecks: [],
      visualChecks: [],
      countryEvaluation: {
        country: country,
        status: 'warning',
        reason: errorMessage
      },
      summary: `Error running moderation analysis: ${errorMessage}`
    };
  }
};

// @component: ModPod
export const ModPod = ({
  onNavigateToResults,
  onNavigate
}: ModPodProps) => {
  const [activeTab, setActiveTab] = React.useState<AdType>('video');
  const [selectedRegion, setSelectedRegion] = React.useState<Region>('US');
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [textContent, setTextContent] = React.useState('');
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [videoFrames, setVideoFrames] = React.useState<VideoFrame[]>([]);
  const [isProcessingFrames, setIsProcessingFrames] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [transcriptTab, setTranscriptTab] = React.useState<'transcript' | 'translate'>('transcript');
  const [translatedText, setTranslatedText] = React.useState('');
  const [targetLanguage, setTargetLanguage] = React.useState<string>('');
  const [isTranslating, setIsTranslating] = React.useState(false);
  const translatingRef = React.useRef(false);
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

  // Trigger transcription when API key is set after video is uploaded
  React.useEffect(() => {
    const transcribeIfNeeded = async () => {
      if (
        apiKey &&
        uploadedFile &&
        uploadedFile.type.startsWith('video/') &&
        !transcript &&
        !isTranscribing &&
        activeTab === 'video'
      ) {
        setIsTranscribing(true);
        try {
          const transcriptionText = await transcribeVideo(uploadedFile, apiKey);
          setTranscript(transcriptionText);
        } catch (error) {
          console.error("Transcription error:", error);
          setTranscript(`Error: ${error instanceof Error ? error.message : "Failed to transcribe video"}`);
        } finally {
          setIsTranscribing(false);
        }
      }
    };

    transcribeIfNeeded();
  }, [apiKey, uploadedFile, transcript, isTranscribing, activeTab]);

  // Handle translation when language is selected
  React.useEffect(() => {
    const handleTranslation = async () => {
      // Prevent concurrent translations
      if (translatingRef.current) {
        console.log('Translation already in progress, skipping...');
        return;
      }

      if (transcript && targetLanguage && transcriptTab === 'translate' && apiKey) {
        console.log('Translation conditions met:', { 
          hasTranscript: !!transcript, 
          targetLanguage, 
          transcriptTab, 
          hasApiKey: !!apiKey 
        });
        translatingRef.current = true;
        setIsTranslating(true);
        try {
          console.log('Starting translation...', { targetLanguage, transcriptLength: transcript.length });
          const translated = await translateText(transcript, targetLanguage, apiKey);
          console.log('Translation result:', translated);
          setTranslatedText(translated);
        } catch (error) {
          console.error("Translation error:", error);
          setTranslatedText(`Error: ${error instanceof Error ? error.message : "Failed to translate"}`);
        } finally {
          setIsTranslating(false);
          translatingRef.current = false;
        }
      } else if (!targetLanguage && transcriptTab === 'translate') {
        setTranslatedText('');
      }
    };

    // Only trigger if we're on translate tab and have all required data
    if (transcriptTab === 'translate') {
      if (transcript && targetLanguage && apiKey) {
        handleTranslation();
      } else {
        console.log('Translation not triggered:', { 
          hasTranscript: !!transcript, 
          hasTargetLanguage: !!targetLanguage, 
          hasApiKey: !!apiKey 
        });
      }
    }
  }, [transcript, targetLanguage, transcriptTab, apiKey]);

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
        try {
          const result = await moderateContent(transcript, videoFrames, apiKey, selectedRegion);
          setModerationResult(result);
        } catch (error) {
          console.error("Error in handleModerate:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
          setModerationResult({
            status: 'warning',
            textChecks: [],
            visualChecks: [],
            countryEvaluation: {
              country: selectedRegion,
              status: 'warning',
              reason: errorMessage
            },
            summary: `Error: ${errorMessage}`
          });
        } finally {
          setIsModerating(false);
        }
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
                                    <>
                                        {/* Tabs */}
                                        <div className="flex border-b border-[#2a2a2a] mb-3">
                                            <button
                                                onClick={() => setTranscriptTab('transcript')}
                                                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                                                    transcriptTab === 'transcript'
                                                        ? 'text-white'
                                                        : 'text-[#808080] hover:text-[#b3b3b3]'
                                                }`}
                                            >
                                                Audio Transcript
                                                {transcriptTab === 'transcript' && (
                                                    <motion.div
                                                        layoutId="transcriptTab"
                                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e50914]"
                                                        initial={false}
                                                        transition={{
                                                            type: 'spring',
                                                            stiffness: 500,
                                                            damping: 30
                                                        }}
                                                    />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setTranscriptTab('translate')}
                                                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                                                    transcriptTab === 'translate'
                                                        ? 'text-white'
                                                        : 'text-[#808080] hover:text-[#b3b3b3]'
                                                }`}
                                            >
                                                Translate
                                                {transcriptTab === 'translate' && (
                                                    <motion.div
                                                        layoutId="transcriptTab"
                                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e50914]"
                                                        initial={false}
                                                        transition={{
                                                            type: 'spring',
                                                            stiffness: 500,
                                                            damping: 30
                                                        }}
                                                    />
                                                )}
                                            </button>
                                        </div>

                                        {/* Tab Content */}
                                        {transcriptTab === 'transcript' ? (
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
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <label className="text-sm text-[#b3b3b3] whitespace-nowrap">Translate to:</label>
                                                    <select
                                                        value={targetLanguage}
                                                        onChange={(e) => setTargetLanguage(e.target.value)}
                                                        className="flex-1 bg-[#0d0d0d] border border-[#2a2a2a] rounded px-3 py-2 text-sm text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#e50914] focus:border-transparent"
                                                    >
                                                        <option value="">Select a language</option>
                                                        <option value="English">English</option>
                                                        <option value="French">French</option>
                                                        <option value="German">German</option>
                                                        <option value="Hindi">Hindi</option>
                                                    </select>
                                                </div>
                                                
                                                {isTranslating ? (
                                                    <div className="flex items-center justify-center py-8 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#e50914]"></div>
                                                        <span className="ml-3 text-sm text-[#808080]">Translating...</span>
                                                    </div>
                                                ) : translatedText ? (
                                                    <div className="bg-[#1a1a1a] rounded border border-[#2a2a2a] p-4 relative group">
                                                        <p className="text-sm text-[#b3b3b3] whitespace-pre-wrap max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent">
                                                            {translatedText}
                                                        </p>
                                                        <button 
                                                            onClick={() => navigator.clipboard.writeText(translatedText)}
                                                            className="absolute top-2 right-2 p-1.5 bg-[#2a2a2a] rounded text-[#808080] opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                                                            title="Copy to clipboard"
                                                        >
                                                            <FileText size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 text-[#808080] bg-[#1a1a1a] rounded border border-[#2a2a2a]">
                                                        <p className="text-sm">Select a language to translate</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
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

                                {/* Country Evaluation */}
                                {moderationResult.countryEvaluation && (
                                  <div className={`p-4 rounded-lg border mb-4 ${
                                    moderationResult.countryEvaluation.status === 'pass' ? 'bg-green-500/10 border-green-500/50' : 
                                    moderationResult.countryEvaluation.status === 'fail' ? 'bg-red-500/10 border-red-500/50' : 
                                    'bg-yellow-500/10 border-yellow-500/50'
                                  }`}>
                                    <div className="flex items-start gap-3">
                                      {moderationResult.countryEvaluation.status === 'pass' ? <CheckCircle className="text-green-500 shrink-0" /> : 
                                       moderationResult.countryEvaluation.status === 'fail' ? <AlertCircle className="text-red-500 shrink-0" /> : 
                                       <AlertTriangle className="text-yellow-500 shrink-0" />}
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h5 className="font-bold text-white">Country-Specific Evaluation</h5>
                                          <span className="text-xs px-2 py-0.5 bg-[#2a2a2a] rounded text-[#b3b3b3]">
                                            {moderationResult.countryEvaluation.country}
                                          </span>
                                        </div>
                                        <p className={`text-sm font-medium capitalize mb-1 ${
                                          moderationResult.countryEvaluation.status === 'pass' ? 'text-green-400' : 
                                          moderationResult.countryEvaluation.status === 'fail' ? 'text-red-400' : 
                                          'text-yellow-400'
                                        }`}>
                                          {moderationResult.countryEvaluation.status}
                                        </p>
                                        {moderationResult.countryEvaluation.reason && (
                                          <p className="text-sm text-[#b3b3b3]">{moderationResult.countryEvaluation.reason}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

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