import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { storage } from '../lib/storage';
import { SessionShell } from '../components/SessionShell';
import { scheduleReminder, cancelReminder } from '../lib/notifications';

function pad(num: number) {
  return num.toString().padStart(2, '0');
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${pad(minutes)}:${pad(seconds)}`;
}

export default function BreakPage() {
  const [, setLocation] = useLocation();
  const [activeSession, setActiveSession] = useState(() => storage.getActiveSession());
  const [breakTarget, setBreakTarget] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);

  useEffect(() => {
    if (!activeSession) {
      setLocation('/');
      return;
    }

    // Set paused state instantly
    if (!activeSession.isPaused) {
      const updated = { ...activeSession, isPaused: true, pausedAt: Date.now() };
      storage.setActiveSession(updated);
      setActiveSession(updated);
    }
  }, [activeSession, setLocation]);

  useEffect(() => {
    if (!breakTarget) return;

    const interval = setInterval(() => {
      const remaining = breakTarget - Date.now();
      if (remaining <= 0) {
        setRemainingMs(0);
        clearInterval(interval);
      } else {
        setRemainingMs(remaining);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [breakTarget]);

  const selectBreak = (minutes: number | null) => {
    if (minutes === null) {
      // Untimed break
      setBreakTarget(null);
    } else {
      const target = Date.now() + minutes * 60000;
      setBreakTarget(target);
      setRemainingMs(minutes * 60000);
      
      // Schedule reminder for break end
      scheduleReminder({
        id: 'break-end',
        delayMs: minutes * 60000,
        intention: activeSession?.intention || 'Focus'
      });
    }
  };

  const endBreak = () => {
    cancelReminder('break-end');
    
    // Unpause
    if (activeSession) {
      const now = Date.now();
      const updated = { ...activeSession };
      if (updated.pausedAt) {
        updated.pausedDuration += (now - updated.pausedAt);
      }
      updated.isPaused = false;
      updated.pausedAt = null;
      storage.setActiveSession(updated);
    }
    
    setLocation('/session');
  };

  if (!activeSession) return null;

  return (
    <SessionShell>
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto">
        {!breakTarget && remainingMs === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <h1 className="text-white font-bold text-[clamp(32px,6vw,48px)] text-center mb-12">
              You're taking a break.
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[5, 15, 30].map(mins => (
                <button
                  key={mins}
                  onClick={() => selectBreak(mins)}
                  className="still-btn-outline-dark h-24 text-xl hover:bg-[#2563EB] hover:border-[#2563EB]"
                  data-testid={`btn-break-${mins}m`}
                >
                  {mins} min
                </button>
              ))}
              <button
                onClick={() => selectBreak(null)}
                className="still-btn-outline-dark h-24 text-xl hover:bg-[#2563EB] hover:border-[#2563EB]"
                data-testid="btn-break-untimed"
              >
                Until I'm ready
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center"
          >
            <h1 className="text-white font-extrabold text-[clamp(48px,8vw,80px)] text-center mb-8">
              Enjoy it.
            </h1>
            
            {breakTarget !== null && (
              <div className="font-mono text-[clamp(40px,6vw,64px)] text-[#2563EB] mb-12 font-semibold">
                {formatCountdown(remainingMs)}
              </div>
            )}
            
            {breakTarget === null && (
              <div className="h-24"></div> // Spacer for layout balance
            )}

            <button
              onClick={endBreak}
              className="still-btn-primary min-w-[200px] text-lg mb-8"
              data-testid="btn-end-break"
            >
              I'm ready
            </button>
            
            <Link href="/done" className="text-white/40 hover:text-white text-sm transition-colors" data-testid="link-end-session">
              End session instead
            </Link>
          </motion.div>
        )}
      </div>
    </SessionShell>
  );
}
