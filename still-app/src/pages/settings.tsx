import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { getNotificationPermission, requestNotificationPermission, scheduleReminder } from '../lib/notifications';
import { isInstalled, isInstallable, promptInstall } from '../lib/pwa';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifPerm, setNotifPerm] = useState(getNotificationPermission());
  const [installed, setInstalled] = useState(false);
  const [installable, setInstallable] = useState(false);

  // Hydration safety for next-themes
  useEffect(() => {
    setMounted(true);
    setInstalled(isInstalled());
    setInstallable(isInstallable());
    
    // Hack to check installable after mount since it relies on event
    const timer = setTimeout(() => setInstallable(isInstallable()), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleExport = () => {
    const data = {
      sessions: JSON.parse(localStorage.getItem('still_sessions') || '[]'),
      projects: JSON.parse(localStorage.getItem('still_projects') || '[]'),
      distractions: JSON.parse(localStorage.getItem('still_distractions') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `still-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleClear = () => {
    if (confirm("Are you sure? This will delete all your sessions and projects. This cannot be undone.")) {
      localStorage.removeItem('still_sessions');
      localStorage.removeItem('still_projects');
      localStorage.removeItem('still_distractions');
      localStorage.removeItem('still_active');
      window.location.reload();
    }
  };

  const enableNotifications = async () => {
    await requestNotificationPermission();
    setNotifPerm(getNotificationPermission());
  };

  const handleInstall = async () => {
    await promptInstall();
    setInstallable(isInstallable());
    setInstalled(isInstalled());
  };

  if (!mounted) return null;

  return (
    <div className="pb-24">
      <header className="mb-8">
        <h1 className="still-h1">Settings</h1>
      </header>

      <div className="space-y-10">
        {/* Appearance */}
        <section>
          <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-4">Appearance</h2>
          <div className="still-card !p-1 flex bg-secondary/50">
            <button 
              onClick={() => setTheme('light')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${theme === 'light' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Light
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${theme === 'dark' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Dark
            </button>
            <button 
              onClick={() => setTheme('system')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${theme === 'system' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              System
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-4">Notifications</h2>
          <div className="still-card">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Permission Status</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                notifPerm === 'granted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                notifPerm === 'denied' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {notifPerm.charAt(0).toUpperCase() + notifPerm.slice(1)}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Reminders work even when the tab is in the background via service worker.
            </p>
            
            {notifPerm !== 'granted' && (
              <button onClick={enableNotifications} className="still-btn-outline w-full py-2 text-sm">
                Enable Notifications
              </button>
            )}
          </div>
        </section>

        {/* PWA / Install */}
        <section>
          <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-4">App Install</h2>
          <div className="still-card">
            {installed ? (
              <div className="flex items-center gap-3 text-green-600 dark:text-green-400 font-medium">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                STILL is installed on this device
              </div>
            ) : installable ? (
              <div className="space-y-3">
                <p className="text-sm">Install STILL to your home screen for the best experience.</p>
                <button onClick={handleInstall} className="still-btn-primary w-full py-2 text-sm">
                  Install STILL
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Open in Chrome on desktop or Android to install.</p>
                <p className="text-xs text-muted-foreground bg-secondary p-3 rounded-lg border">
                  <strong>On iPhone/iPad:</strong> tap the Share button in Safari, then 'Add to Home Screen'.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Data */}
        <section>
          <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-4">Data</h2>
          <div className="flex flex-col gap-3">
            <button onClick={handleExport} className="still-btn-outline text-left justify-start">
              Export my data
            </button>
            <button onClick={handleClear} className="still-btn-outline text-left justify-start text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-950/20">
              Clear all data
            </button>
          </div>
        </section>

        {/* About */}
        <section className="text-center pt-8 border-t border-border">
          <p className="font-bold text-lg mb-2">STILL</p>
          <p className="text-sm text-muted-foreground mb-6">Version 1.0.0</p>
          <p className="text-sm text-foreground italic max-w-sm mx-auto">
            "Most apps say 'do more.' STILL says 'be here.'"
          </p>
        </section>
      </div>
    </div>
  );
}
