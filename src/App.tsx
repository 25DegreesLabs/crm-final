import { useState } from 'react';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AnalyticsPage from './pages/AnalyticsPage';
import LeadsPage from './pages/LeadsPage';
import CampaignsPage from './pages/CampaignsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'leads' | 'campaigns' | 'analytics' | 'settings'>('home');

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigateToLeads={() => setActiveTab('leads')} />;
      case 'leads':
        return <LeadsPage />;
      case 'campaigns':
        return <CampaignsPage onNavigateToLeads={() => setActiveTab('leads')} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage onNavigateToLeads={() => setActiveTab('leads')} />;
    }
  };

  return (
    <div className="min-h-screen bg-apple-lightBg dark:bg-apple-darkBg transition-smooth">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
