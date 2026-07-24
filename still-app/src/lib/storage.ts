import { Session, ActiveSession, Project, Distraction } from './types';

export const storage = {
  // Sessions
  getSessions: (): Session[] => {
    const data = localStorage.getItem('still_sessions');
    return data ? JSON.parse(data) : [];
  },
  saveSession: (session: Session) => {
    const sessions = storage.getSessions();
    sessions.push(session);
    localStorage.setItem('still_sessions', JSON.stringify(sessions));
  },
  
  // Active Session
  getActiveSession: (): ActiveSession | null => {
    const data = localStorage.getItem('still_active');
    return data ? JSON.parse(data) : null;
  },
  setActiveSession: (session: ActiveSession | null) => {
    if (session) {
      localStorage.setItem('still_active', JSON.stringify(session));
    } else {
      localStorage.removeItem('still_active');
    }
  },

  // Projects
  getProjects: (): Project[] => {
    const data = localStorage.getItem('still_projects');
    return data ? JSON.parse(data) : [];
  },
  saveProject: (project: Project) => {
    const projects = storage.getProjects();
    projects.push(project);
    localStorage.setItem('still_projects', JSON.stringify(projects));
  },
  updateProjectTime: (id: string, additionalMinutes: number) => {
    const projects = storage.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index].totalMinutes += additionalMinutes;
      projects[index].lastSessionAt = Date.now();
      localStorage.setItem('still_projects', JSON.stringify(projects));
    }
  },

  // Distractions
  getDistractions: (): Distraction[] => {
    const data = localStorage.getItem('still_distractions');
    return data ? JSON.parse(data) : [];
  },
  saveDistraction: (distraction: Distraction) => {
    const distractions = storage.getDistractions();
    distractions.push(distraction);
    localStorage.setItem('still_distractions', JSON.stringify(distractions));
  }
};
