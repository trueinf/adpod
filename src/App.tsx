import { useMemo, useState, useEffect } from 'react';
import { Container, Theme } from './settings/types';
import { ModPod } from './components/generated/ModPod';
import { ResultsScreen } from './components/generated/ResultsScreen';
import { ReportsOverview } from './components/generated/ReportsOverview';
import { DetailedReportView } from './components/generated/DetailedReportView';
import { UploadHistory } from './components/generated/UploadHistory';
import { RegionRulesManager } from './components/generated/RegionRulesManager';
import { ProfileSettings } from './components/generated/ProfileSettings';
import { LoginScreen } from './components/generated/LoginScreen';
import { supabase, signOut, getCurrentSession } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

let theme: Theme = 'dark';
// only use 'centered' container for standalone components, never for full page apps or websites.
let container: Container = 'none';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'moderate' | 'results' | 'reports' | 'detailed-report' | 'history' | 'rules' | 'profile'>('moderate');
  const [currentResultId, setCurrentResultId] = useState<string | null>(null);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);

  // Check for existing session on mount and listen for auth changes
  useEffect(() => {
    // Get initial session
    getCurrentSession().then((session) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    // Session will be updated automatically via onAuthStateChange
  };

  const handleLogout = async () => {
    await signOut();
    setSession(null);
    setCurrentView('moderate');
  };

  function setThemeClass(theme: Theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setThemeClass(theme);

  const handleNavigate = (route: 'moderate' | 'results' | 'reports' | 'history' | 'rules' | 'profile' | 'logout') => {
    switch (route) {
      case 'moderate':
        setCurrentView('moderate');
        setCurrentResultId(null);
        setCurrentReportId(null);
        break;
      case 'results':
        setCurrentView('reports'); // Show reports overview when clicking Results Dashboard
        break;
      case 'history':
        setCurrentView('history');
        break;
      case 'reports':
        setCurrentView('reports');
        break;
      case 'rules':
        setCurrentView('rules');
        break;
      case 'profile':
        setCurrentView('profile');
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  const handleNavigateToResults = (resultId: string) => {
    setCurrentResultId(resultId);
    setCurrentView('results');
  };

  const handleBackToModerate = () => {
    setCurrentView('moderate');
    setCurrentResultId(null);
    setCurrentReportId(null);
  };

  const handleNavigateToReports = () => {
    setCurrentView('reports');
  };

  const handleViewReport = (reportId: string) => {
    setCurrentReportId(reportId);
    setCurrentView('detailed-report');
  };

  const handleBackToReports = () => {
    setCurrentView('reports');
    setCurrentReportId(null);
  };

  const handleDownloadReport = (reportId: string) => {
    console.log('Downloading report:', reportId);
    // PDF download logic here
  };

  const handleNavigateToHistory = () => {
    setCurrentView('history');
  };

  const generatedComponent = useMemo(() => {
    // THIS IS WHERE THE TOP LEVEL GENRATED COMPONENT WILL BE RETURNED!
    if (currentView === 'results' && currentResultId) {
      return <ResultsScreen resultId={currentResultId} onBack={handleBackToModerate} onNavigate={handleNavigate} />;
    }
    if (currentView === 'reports') {
      return <ReportsOverview onViewReport={handleViewReport} onDownloadReport={handleDownloadReport} onBack={handleBackToModerate} onNavigate={handleNavigate} />;
    }
    if (currentView === 'detailed-report' && currentReportId) {
      return <DetailedReportView reportId={currentReportId} onBack={handleBackToReports} onDownloadPDF={handleDownloadReport} />;
    }
    if (currentView === 'history') {
      return <UploadHistory onViewReport={handleViewReport} onDownloadReport={handleDownloadReport} onNavigate={handleNavigate} />;
    }
    if (currentView === 'rules') {
      return <RegionRulesManager onNavigate={handleNavigate} />;
    }
    if (currentView === 'profile') {
      return <ProfileSettings onNavigate={handleNavigate} />;
    }
    return <ModPod onNavigateToResults={handleNavigateToResults} onNavigate={handleNavigate} />; // %EXPORT_STATEMENT%
  }, [currentView, currentResultId, currentReportId]);

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#808080] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!session) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (container === 'centered') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        {generatedComponent}
      </div>
    );
  } else {
    return generatedComponent;
  }
}

export default App;
