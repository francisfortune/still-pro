import { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { storage } from '../lib/storage';
import { SessionShell } from '../components/SessionShell';
import { scheduleReminder, cancelReminder, requestNotificationPermission, getNotificationPermission, NotificationPermission } from '../lib/notifications';
import { isInstallable, promptInstall, onInstallabilityChange } from '../lib/pwa';

const PHRASES = [
  "Stay with it.",
  "You're still here.",
  "Keep going.",
  "One thing at a time."
];

function pad(num: number) {
  return num.toString().padStart(2, '0');
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export default function SessionPage() {
  const [, setLocation] = useLocation();
  const [activeSession, setActiveSession] = useState(storage.getActiveSession());
  const [elapsed, setElapsed] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    if (!activeSession) {
      setLocation('/');
      return;
    }

    const interval = setInterval(() => {
      if (!activeSession.isPaused) {
        const now = Date.now();
        setElapsed(now - activeSession.startedAt - activeSession.pausedDuration);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [activeSession, setLocation]);

  useEffect(() => {
    // Phrase rotation
    const phraseInterval = setInterval(() => {
      setPhraseIndex(i => (i + 1) % PHRASES.length);
    }, 15000);
    return () => clearInterval(phraseInterval);
  }, []);

  useEffect(() => {
    // Notifications banner
    if (getNotificationPermission() === 'default') {
      setShowNotificationBanner(true);
    }

    // PWA Install banner
    setShowInstallBanner(isInstallable());
    const unsub = onInstallabilityChange(setShowInstallBanner);
    return unsub;
  }, []);

  useEffect(() => {
    // Manage scheduled reminder
    if (activeSession && !activeSession.isPaused && getNotificationPermission() === 'granted') {
      scheduleReminder({
        id: 'session-check',
        delayMs: 10 * 60 * 1000,
        intention: activeSession.intention
      });
    } else {
      cancelReminder('session-check');
    }

    return () => {
      cancelReminder('session-check');
    };
  }, [activeSession?.isPaused]);

  if (!activeSession) return null;

  const handlePauseResume = () => {
    const session = { ...activeSession };
    const now = Date.now();
    
    if (session.isPaused) {
      // Resuming
      if (session.pausedAt) {
        session.pausedDuration += (now - session.pausedAt);
      }
      session.isPaused = false;
      session.pausedAt = null;
    } else {
      // Pausing
      session.isPaused = true;
      session.pausedAt = now;
    }
    
    storage.setActiveSession(session);
    setActiveSession(session);
  };

  const handleFinish = () => {
    setLocation('/done');
  };

  const enableNotifications = async () => {
    await requestNotificationPermission();
    setShowNotificationBanner(false);
    if (getNotificationPermission() === 'granted') {
      scheduleReminder({
        id: 'session-check',
        delayMs: 10 * 60 * 1000,
        intention: activeSession.intention
      });
    }
  };

  const handleInstall = async () => {
    await promptInstall();
  };

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <SessionShell>
      {showNotificationBanner && (
        <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="bg-white/10 text-white px-4 py-3 flex justify-between items-center text-sm backdrop-blur-md z-10 sticky top-0">
          <span>Enable reminders to stay on track</span>
          <div className="flex gap-3">
            <button onClick={() => setShowNotificationBanner(false)} className="text-white/70 hover:text-white" data-testid="btn-notif-later">Later</button>
            <button onClick={enableNotifications} className="text-blue-400 font-semibold hover:text-blue-300" data-testid="btn-notif-enable">Enable</button>
          </div>
        </motion.div>
      )}

      <div className="p-6 flex justify-between items-start">
        <div className="text-[#2563EB] font-bold tracking-widest text-sm">STILL</div>
        <div className="text-white/40 text-sm font-medium">{dateStr}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center -mt-12">
        <div className="text-white/40 text-xs font-bold tracking-[0.2em] mb-6 uppercase">What you're doing</div>
        <h1 className="text-white font-extrabold text-[clamp(36px,6vw,80px)] leading-tight max-w-4xl mx-auto break-words line-clamp-2 mb-12">
          {activeSession.intention}
        </h1>
        
        <div 
          className="font-mono text-[clamp(48px,8vw,96px)] text-[#2563EB] leading-none mb-12"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          <motion.span
            animate={{ opacity: activeSession.isPaused ? 0.5 : [0.85, 1, 0.85] }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            {formatTime(elapsed)}
          </motion.span>
        </div>

        <div className="h-8 mb-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={phraseIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.5 }}
              className="text-white/50 text-lg"
            >
              {PHRASES[phraseIndex]}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={handlePauseResume}
            className="still-btn-outline-dark min-w-[120px]"
            data-testid="btn-pause-resume"
          >
            {activeSession.isPaused ? 'Resume' : 'Pause'}
          </button>
          <button 
            onClick={handleFinish}
            className="still-btn-primary min-w-[120px]"
            data-testid="btn-finish"
          >
            Finish
          </button>
        </div>
        
        <Link href="/break" className="text-white/50 hover:text-white transition-colors text-sm" data-testid="link-break">
          Take a break
        </Link>
      </div>

      <AnimatePresence>
        {showInstallBanner && (
          <motion.div 
            initial={{ y: 100 }} 
            animate={{ y: 0 }} 
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-white/10 text-white px-4 py-4 flex justify-between items-center text-sm backdrop-blur-md pb-[calc(1rem+env(safe-area-inset-bottom))]"
          >
            <span>Install STILL for a better experience</span>
            <div className="flex gap-4">
              <button onClick={() => setShowInstallBanner(false)} className="text-white/70 hover:text-white" data-testid="btn-install-later">Not now</button>
              <button onClick={handleInstall} className="bg-[#2563EB] text-white px-4 py-1.5 rounded-full font-medium" data-testid="btn-install">Install</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SessionShell>
  );
}
