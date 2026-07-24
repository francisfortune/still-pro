import { Link, useLocation } from 'wouter';
import { Calendar, BarChart2, Layers, Settings as SettingsIcon } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="still-app-container">
      <div className="still-app-shell">
        <div className="still-content-center">
          {children}
        </div>
      </div>
      
      <nav className="still-bottom-nav">
        <Link href="/today" className={`still-nav-item ${location === '/today' ? 'active' : ''}`} data-testid="nav-today">
          <Calendar size={24} strokeWidth={location === '/today' ? 2.5 : 2} />
          <span>Today</span>
        </Link>
        <Link href="/week" className={`still-nav-item ${location === '/week' ? 'active' : ''}`} data-testid="nav-week">
          <BarChart2 size={24} strokeWidth={location === '/week' ? 2.5 : 2} />
          <span>Week</span>
        </Link>
        <Link href="/building" className={`still-nav-item ${location === '/building' ? 'active' : ''}`} data-testid="nav-building">
          <Layers size={24} strokeWidth={location === '/building' ? 2.5 : 2} />
          <span>Building</span>
        </Link>
        <Link href="/settings" className={`still-nav-item ${location === '/settings' ? 'active' : ''}`} data-testid="nav-settings">
          <SettingsIcon size={24} strokeWidth={location === '/settings' ? 2.5 : 2} />
          <span>Settings</span>
        </Link>
      </nav>
    </div>
  );
}
