import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { Session, Distraction } from '../lib/types';

function formatDuration(ms: number) {
  const totalMins = Math.floor(ms / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function WeekPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [distractions, setDistractions] = useState<Distraction[]>([]);

  useEffect(() => {
    const allSessions = storage.getSessions();
    const allDistractions = storage.getDistractions();
    
    // Filter to last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    const msWeekAgo = weekAgo.getTime();
    
    setSessions(allSessions.filter(s => s.startedAt >= msWeekAgo));
    setDistractions(allDistractions.filter(d => d.timestamp >= msWeekAgo));
  }, []);

  const totalMs = sessions.reduce((acc, s) => acc + s.durationMs, 0);
  const avgMs = sessions.length > 0 ? totalMs / sessions.length : 0;

  // Aggregate intentions
  const intentionStats = sessions.reduce((acc, s) => {
    acc[s.intention] = (acc[s.intention] || 0) + s.durationMs;
    return acc;
  }, {} as Record<string, number>);

  const sortedIntentions = Object.entries(intentionStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxIntentionMs = sortedIntentions.length > 0 ? sortedIntentions[0][1] : 0;

  // Aggregate distractions
  const distractionStats = distractions.reduce((acc, d) => {
    acc[d.site] = (acc[d.site] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedDistractions = Object.entries(distractionStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="pb-24">
      <header className="mb-8">
        <h1 className="still-h1 mb-2">Your Week</h1>
        <p className="text-muted-foreground">Past 7 days</p>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        <div className="still-card !p-4 flex flex-col items-center justify-center text-center">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Time</div>
          <div className="text-xl font-bold text-[#2563EB]">{formatDuration(totalMs)}</div>
        </div>
        <div className="still-card !p-4 flex flex-col items-center justify-center text-center">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Sessions</div>
          <div className="text-xl font-bold">{sessions.length}</div>
        </div>
        <div className="still-card !p-4 flex flex-col items-center justify-center text-center">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Average</div>
          <div className="text-xl font-bold">{formatDuration(avgMs)}</div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No data yet this week.
        </div>
      ) : (
        <>
          {/* Intention Breakdown */}
          <div className="mb-12">
            <h2 className="still-h3 mb-6">What you worked on</h2>
            <div className="space-y-5">
              {sortedIntentions.map(([intention, ms]) => {
                const pct = Math.max(5, (ms / maxIntentionMs) * 100);
                return (
                  <div key={intention} className="relative">
                    <div className="flex justify-between text-sm mb-2 font-medium">
                      <span className="truncate pr-4">{intention}</span>
                      <span className="text-muted-foreground shrink-0">{formatDuration(ms)}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#2563EB] rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distractions */}
          {sortedDistractions.length > 0 && (
            <div className="mb-12">
              <h2 className="still-h3 mb-6">Where attention wandered</h2>
              <div className="still-card !bg-red-50/50 dark:!bg-red-950/10 !border-red-100 dark:!border-red-900/30">
                <div className="space-y-3">
                  {sortedDistractions.map(([site, count]) => (
                    <div key={site} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-foreground">{site}</span>
                      <span className="text-muted-foreground bg-background px-2 py-0.5 rounded-md border text-xs font-semibold">
                        {count} times
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="text-center pt-8 border-t border-border mt-8">
            <p className="text-muted-foreground italic text-sm px-4">
              "You didn't lose your week. You just didn't notice where some of it went."
            </p>
          </div>
        </>
      )}
    </div>
  );
}
