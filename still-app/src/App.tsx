import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { ThemeProvider } from 'next-themes';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import Landing from './pages/landing';
import SessionPage from './pages/session';
import BreakPage from './pages/break';
import DonePage from './pages/done';
import TodayPage from './pages/today';
import WeekPage from './pages/week';
import BuildingPage from './pages/building';
import SettingsPage from './pages/settings';
import { storage } from './lib/storage';
import { AppShell } from './components/AppShell';

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">This page doesn't exist.</p>
    </div>
  );
}

function AppContent() {
  const [location, setLocation] = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const active = storage.getActiveSession();
    if (active && location === '/') {
      setLocation('/session');
    }
    setIsReady(true);
  }, [location, setLocation]);

  if (!isReady) return null;

  const isAppShellRoute = ['/today', '/week', '/building', '/settings'].includes(location);

  const switchContent = (
    <Switch location={location}>
      <Route path="/" component={Landing} />
      <Route path="/session" component={SessionPage} />
      <Route path="/break" component={BreakPage} />
      <Route path="/done" component={DonePage} />
      <Route path="/today" component={TodayPage} />
      <Route path="/week" component={WeekPage} />
      <Route path="/building" component={BuildingPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full"
      >
        {isAppShellRoute ? (
          <AppShell>{switchContent}</AppShell>
        ) : (
          switchContent
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AppContent />
        </WouterRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
