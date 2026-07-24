import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { storage } from '../lib/storage';
import { SessionShell } from '../components/SessionShell';
import { Project } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';

function formatDuration(ms: number) {
  const totalMins = Math.floor(ms / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins === 0) return `< 1m`;
  return `${mins}m`;
}

export default function DonePage() {
  const [, setLocation] = useLocation();
  const [activeSession, setActiveSession] = useState(() => storage.getActiveSession());
  const [accomplishment, setAccomplishment] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [newProjectName, setNewProjectName] = useState('');
  const projects = storage.getProjects();

  if (!activeSession) {
    setLocation('/');
    return null;
  }

  // Calculate final duration
  const now = Date.now();
  let finalPausedDuration = activeSession.pausedDuration;
  if (activeSession.isPaused && activeSession.pausedAt) {
    finalPausedDuration += (now - activeSession.pausedAt);
  }
  const durationMs = now - activeSession.startedAt - finalPausedDuration;

  const handleDone = () => {
    let projectId = selectedProjectId;

    // Create new project if requested
    if (selectedProjectId === 'new' && newProjectName.trim()) {
      const newProject: Project = {
        id: uuidv4(),
        name: newProjectName.trim(),
        startedAt: Date.now(),
        totalMinutes: 0
      };
      storage.saveProject(newProject);
      projectId = newProject.id;
    }

    // Save session
    const sessionToSave = {
      id: uuidv4(),
      intention: activeSession.intention,
      durationMs,
      startedAt: activeSession.startedAt,
      endedAt: now,
      accomplishment: accomplishment.trim(),
      projectId: projectId && projectId !== 'new' ? projectId : undefined
    };

    storage.saveSession(sessionToSave);

    // Update project time
    if (sessionToSave.projectId) {
      storage.updateProjectTime(sessionToSave.projectId, Math.floor(durationMs / 60000));
    }

    storage.setActiveSession(null);
    setLocation('/today');
  };

  return (
    <SessionShell>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-xl mx-auto"
      >
        <h1 className="text-white font-extrabold text-[clamp(40px,8vw,64px)] leading-tight text-center mb-4">
          You stayed<br/>with it.
        </h1>
        
        <div className="text-[#2563EB] font-mono text-3xl mb-8 font-semibold">
          {formatDuration(durationMs)}
        </div>

        <div className="text-white/50 text-lg mb-12 text-center max-w-md line-clamp-2">
          "{activeSession.intention}"
        </div>

        <div className="w-full space-y-6">
          <div>
            <label className="block text-white/50 text-sm font-medium mb-2">What did you accomplish? (optional)</label>
            <textarea
              className="still-input-dark min-h-[100px] resize-none"
              placeholder="Jotted down some thoughts..."
              value={accomplishment}
              onChange={(e) => setAccomplishment(e.target.value)}
              data-testid="input-accomplishment"
            />
          </div>

          <div>
            <label className="block text-white/50 text-sm font-medium mb-2">Add time to a project?</label>
            <select
              className="still-input-dark appearance-none"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              data-testid="select-project"
            >
              <option value="">No project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
              <option value="new">+ Create new project</option>
            </select>
          </div>

          <AnimatePresence>
            {selectedProjectId === 'new' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <input
                  type="text"
                  className="still-input-dark"
                  placeholder="Project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  autoFocus
                  data-testid="input-new-project"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={handleDone}
            className="still-btn-primary w-full mt-4"
            data-testid="btn-submit-done"
          >
            Done
          </button>
        </div>
      </motion.div>
    </SessionShell>
  );
}
