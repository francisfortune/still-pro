import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { Project } from '../lib/types';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

export default function BuildingPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    setProjects(storage.getProjects());
  }, []);

  const formatDays = (ms: number) => {
    const days = Math.floor((Date.now() - ms) / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const formatRelative = (ms?: number) => {
    if (!ms) return 'Never';
    const diff = Date.now() - ms;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const handleCreate = () => {
    if (!newProjectName.trim()) return;
    const proj: Project = {
      id: uuidv4(),
      name: newProjectName.trim(),
      startedAt: Date.now(),
      totalMinutes: 0
    };
    storage.saveProject(proj);
    setProjects(storage.getProjects());
    setNewProjectName('');
    setIsModalOpen(false);
  };

  return (
    <div className="pb-24">
      <header className="mb-8">
        <h1 className="still-h1 mb-2">Still Building</h1>
        <p className="text-muted-foreground">The things you keep coming back to.</p>
      </header>

      {projects.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground text-lg mb-6">Nothing being built yet.<br/>Add a project after your first session.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map(project => (
            <div key={project.id} className="still-card flex flex-col h-full hover:-translate-y-1 transition-transform cursor-default" data-testid={`project-${project.id}`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl line-clamp-2 leading-tight">{project.name}</h3>
                <div className="bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-md shrink-0">
                  Day {formatDays(project.startedAt)}
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-border flex justify-between items-end">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Total time</div>
                  <div className="font-semibold text-[#2563EB]">{formatTime(project.totalMinutes)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-0.5">Last worked</div>
                  <div className="text-sm font-medium">{formatRelative(project.lastSessionAt)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="still-fab" onClick={() => setIsModalOpen(true)} data-testid="btn-fab-project">
        <Plus size={28} />
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-surface border border-border w-full max-w-md rounded-2xl p-6 shadow-xl relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-2xl font-bold mb-6">New Project</h2>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium mb-2">Project name</label>
                  <input
                    type="text"
                    className="still-input"
                    placeholder="e.g. Write the novel"
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    autoFocus
                    data-testid="input-new-project-name"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="still-btn-outline flex-1">Cancel</button>
                <button onClick={handleCreate} className="still-btn-primary flex-1">Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
