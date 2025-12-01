import { Camera, Moon, Sun, LogOut, Home, BarChart3, Users, Folder, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeaderProps {
  activeTab: 'home' | 'leads' | 'campaigns' | 'analytics' | 'settings';
  onTabChange: (tab: 'home' | 'leads' | 'campaigns' | 'analytics' | 'settings') => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'leads' as const, label: 'Leads', icon: Users },
    { id: 'campaigns' as const, label: 'Campaigns', icon: Folder },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <header className="glass dark:glass-dark sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-apple-blue p-2.5 rounded-2xl shadow-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Lead System</h1>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2" role="navigation" aria-label="Main navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative px-3 sm:px-5 py-2.5 rounded-xl font-semibold transition-smooth focus:outline-none focus:ring-2 focus:ring-apple-blue flex items-center gap-2 ${
                    isActive
                      ? 'text-apple-blue'
                      : 'text-gray-600 dark:text-gray-400 hover:text-apple-blue dark:hover:text-apple-blue hover:bg-apple-blue/5'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline text-sm">{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-apple-blue rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl glass dark:glass-dark hover:scale-105 transition-smooth shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-gray-900 dark:text-white" />
              ) : (
                <Moon className="w-5 h-5 text-gray-900" />
              )}
            </button>
            <button
              onClick={() => alert('Logout clicked')}
              className="p-2.5 rounded-xl glass dark:glass-dark hover:scale-105 transition-smooth shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
