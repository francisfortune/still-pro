import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { storage } from '../lib/storage';
import { Session } from '../lib/types';
import { Plus } from 'lucide-react';

function formatDuration(ms: number) {
  const totalMins = Math.floor(ms / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function TodayPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  
  useEffect(() => {
    const allSessions = storage.getSessions();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySessions = allSessions.filter(s => s.startedAt >= today.getTime());
    // Sort descending by time
    todaySessions.sort((a, b) => b.startedAt - a.startedAt);
    setSessions(todaySessions);
  }, []);

  const totalMs = sessions.reduce((acc, s) => acc + s.durationMs, 0);
  const totalMins = Math.floor(totalMs / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  
  let summaryText = "";
  if (hours > 0 && mins > 0) summaryText = `${hours} hours ${mins} minutes`;
  else if (hours > 0) summaryText = `${hours} hours`;
  else summaryText = `${mins} minutes`;

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="pb-24">
      <header className="mb-8">
        <h1 className="still-h1 mb-2">Today</h1>
        <p className="text-muted-foreground">{dateStr}</p>
      </header>

      {sessions.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground text-xl mb-6">Nothing yet.</p>
          <Link href="/" className="still-btn-primary" data-testid="btn-first-session">
            Start your first session
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <div key={session.id} className="still-card flex flex-col gap-3" data-testid={`session-card-${session.id}`}>
              <div className="flex justify-between items-start gap-4">
                <div className="font-semibold text-lg leading-tight line-clamp-2">
                  {session.intention}
                </div>
                <div className="bg-blue-100 dark:bg-[#2563EB]/20 text-[#2563EB] dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold shrink-0">
                  {formatDuration(session.durationMs)}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {formatTime(session.startedAt)} – {formatTime(session.endedAt)}
              </div>
              
              {session.accomplishment && (
                <div className="text-sm text-secondary-foreground bg-secondary/50 p-3 rounded-lg mt-1">
                  {session.accomplishment}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {sessions.length > 0 && (
        <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom)+16px)] left-0 right-0 px-4 flex justify-center pointer-events-none z-30">
          <div className="bg-[#0f172a] text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg pointer-events-auto">
            <span className="text-blue-400 font-bold">{summaryText}</span> of focused time today
          </div>
        </div>
      )}

      <Link href="/" className="still-fab" data-testid="btn-fab-new">
        <Plus size={28} />
      </Link>
    </div>
  );
}
