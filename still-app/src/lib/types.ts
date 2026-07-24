export type ActiveSession = {
  intention: string;
  startedAt: number;
  pausedAt?: number | null;
  pausedDuration: number;
  isPaused: boolean;
};

export type Session = {
  id: string;
  intention: string;
  durationMs: number;
  startedAt: number;
  endedAt: number;
  accomplishment?: string;
  projectId?: string;
};

export type Project = {
  id: string;
  name: string;
  startedAt: number;
  totalMinutes: number;
  lastSessionAt?: number;
};

export type Distraction = {
  id: string;
  site: string;
  timestamp: number;
};
