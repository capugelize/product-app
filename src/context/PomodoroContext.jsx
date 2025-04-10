import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { message } from 'antd';
import { useAppContext } from './AppContext';

export const PomodoroContext = createContext();

export const PomodoroProvider = ({ children }) => {
  const { tasks, settings } = useAppContext();
  
  // Subscribers pour les mises à jour entre les composants
  const [subscribers, setSubscribers] = useState([]);
  
  // Souscrire aux changements de données
  const subscribe = useCallback((callback) => {
    setSubscribers(prev => [...prev, callback]);
    
    // Retourne la fonction pour se désabonner
    return () => {
      setSubscribers(prev => prev.filter(cb => cb !== callback));
    };
  }, []);
  
  // Notifier tous les abonnés d'un changement
  const notifySubscribers = useCallback((type, data) => {
    subscribers.forEach(callback => callback(type, data));
  }, [subscribers]);

  // Charger les données du localStorage au démarrage
  const [activeTask, setActiveTask] = useState(null);
  const [timerMode, setTimerMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(settings.workTime * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  
  const [taskTimeSpent, setTaskTimeSpent] = useState(() => {
    const saved = localStorage.getItem('taskTimeSpent');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [taskProgress, setTaskProgress] = useState(() => {
    const saved = localStorage.getItem('taskProgress');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [taskProductivity, setTaskProductivity] = useState(() => {
    const saved = localStorage.getItem('taskProductivity');
    return saved ? JSON.parse(saved) : {};
  });

  // Fonctions pour les sons
  const playStartSound = () => {
    message.success('Minuteur démarré !');
  };

  const playPauseSound = () => {
    message.info('Minuteur en pause');
  };

  const playCompleteSound = () => {
    message.success('Minuteur terminé !');
  };

  // Load saved data from localStorage
  useEffect(() => {
    const savedTimeSpent = localStorage.getItem('taskTimeSpent');
    const savedProgress = localStorage.getItem('taskProgress');
    const savedProductivity = localStorage.getItem('taskProductivity');
    if (savedTimeSpent) {
      setTaskTimeSpent(JSON.parse(savedTimeSpent));
    }
    if (savedProgress) {
      setTaskProgress(JSON.parse(savedProgress));
    }
    if (savedProductivity) {
      setTaskProductivity(JSON.parse(savedProductivity));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('taskTimeSpent', JSON.stringify(taskTimeSpent));
    localStorage.setItem('taskProgress', JSON.stringify(taskProgress));
    localStorage.setItem('taskProductivity', JSON.stringify(taskProductivity));
  }, [taskTimeSpent, taskProgress, taskProductivity]);

  // Timer effect
  useEffect(() => {
    let timer;
    
    if (timerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            playCompleteSound();
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerRunning, timeLeft]);

  // Sauvegarder les données de suivi dans localStorage
  useEffect(() => {
    localStorage.setItem('taskTimeSpent', JSON.stringify(taskTimeSpent));
    notifySubscribers('taskTimeSpent', taskTimeSpent);
  }, [taskTimeSpent, notifySubscribers]);
  
  useEffect(() => {
    localStorage.setItem('taskProgress', JSON.stringify(taskProgress));
    notifySubscribers('taskProgress', taskProgress);
  }, [taskProgress, notifySubscribers]);
  
  useEffect(() => {
    localStorage.setItem('taskProductivity', JSON.stringify(taskProductivity));
    notifySubscribers('taskProductivity', taskProductivity);
  }, [taskProductivity, notifySubscribers]);

  // Mettre à jour le temps restant lorsque les paramètres changent
  useEffect(() => {
    if (!timerRunning) {
      if (timerMode === 'work') {
        setTimeLeft(settings.workTime * 60);
      } else {
        setTimeLeft(settings.breakTime * 60);
      }
    }
  }, [settings.workTime, settings.breakTime, timerMode, timerRunning]);

  const startTimer = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setActiveTask(task);
      setTimerMode('work');
      setTimeLeft(settings.workTime * 60);
      setTimerRunning(true);
      playStartSound();
      notifySubscribers('timerStarted', { taskId, task });
    }
  }, [tasks, settings.workTime, notifySubscribers]);

  const startPomodoro = useCallback((task) => {
    if (task) {
      setActiveTask(task);
      setTimerMode('work');
      setTimeLeft(settings.workTime * 60);
      setTimerRunning(true);
      playStartSound();
      notifySubscribers('timerStarted', { taskId: task.id, task });
    }
  }, [settings.workTime, notifySubscribers]);

  const pauseTimer = useCallback(() => {
    setTimerRunning(false);
    playPauseSound();
    notifySubscribers('timerPaused', { taskId: activeTask?.id });
  }, [activeTask, notifySubscribers]);

  const resumeTimer = useCallback(() => {
    setTimerRunning(true);
    playStartSound();
    notifySubscribers('timerResumed', { taskId: activeTask?.id });
  }, [activeTask, notifySubscribers]);

  const resetTimer = useCallback(() => {
    const duration = timerMode === 'work' ? settings.workTime : settings.breakTime;
    setTimeLeft(duration * 60);
    setTimerRunning(false);
    notifySubscribers('timerReset', { taskId: activeTask?.id });
  }, [timerMode, settings, activeTask, notifySubscribers]);

  const skipTimer = useCallback(() => {
    handleTimerComplete();
    notifySubscribers('timerSkipped', { taskId: activeTask?.id });
  }, [activeTask, notifySubscribers]);

  const stopPomodoro = useCallback((progress, description) => {
    setTimerRunning(false);
    
    if (activeTask) {
      // Enregistrer la progression
      setTaskProgress(prev => {
        const sessionId = `session_${Date.now()}`;
        return {
          ...prev,
          [activeTask.id]: {
            ...(prev[activeTask.id] || {}),
            [sessionId]: progress
          }
        };
      });
      
      // Enregistrer le temps passé (temps réel)
      const elapsedTime = timerMode === 'work' 
        ? settings.workTime - Math.floor(timeLeft / 60) 
        : settings.breakTime - Math.floor(timeLeft / 60);
      
      setTaskTimeSpent(prev => {
        const taskData = prev[activeTask.id] || { total: 0, sessions: [] };
        const session = {
          date: new Date().toISOString(),
          duration: elapsedTime,
          description: description
        };
        
        return {
          ...prev,
          [activeTask.id]: {
            total: taskData.total + elapsedTime,
            sessions: [...taskData.sessions || [], session],
          }
        };
      });
      
      message.success(`Session enregistrée pour ${activeTask.name}`);
      notifySubscribers('timerStopped', { 
        taskId: activeTask.id,
        progress,
        description 
      });
    }
    
    // Réinitialiser le timer
    setActiveTask(null);
    setTimerMode('work');
    setTimeLeft(settings.workTime * 60);
  }, [activeTask, timerMode, timeLeft, settings, notifySubscribers]);

  const handleTimerComplete = useCallback(() => {
    setTimerRunning(false);
    
    if (timerMode === 'work') {
      // Si on termine un cycle de travail, comptabiliser le temps passé
      if (activeTask) {
        // Mettre à jour le temps passé sur la tâche
        setTaskTimeSpent(prev => {
          const taskData = prev[activeTask.id] || { total: 0, sessions: [] };
          const session = {
            date: new Date().toISOString(),
            duration: settings.workTime,
          };
          
          return {
            ...prev,
            [activeTask.id]: {
              total: taskData.total + settings.workTime,
              sessions: [...taskData.sessions || [], session],
            }
          };
        });
        
        // Calculer la progression (simulé pour l'exemple)
        const progressPercent = Math.min(100, Math.floor(Math.random() * 30) + 70); // Entre 70 et 100%
        
        setTaskProgress(prev => {
          const sessionId = `session_${Date.now()}`;
          return {
            ...prev,
            [activeTask.id]: {
              ...(prev[activeTask.id] || {}),
              [sessionId]: progressPercent
            }
          };
        });
        
        // Calculer la productivité (simulé pour l'exemple)
        const productivity = Math.min(100, Math.floor(Math.random() * 40) + 60); // Entre 60 et 100%
        
        setTaskProductivity(prev => {
          const taskData = prev[activeTask.id] || { sessions: [], average: 0 };
          const sessions = [...taskData.sessions || [], productivity];
          const average = Math.round(sessions.reduce((sum, val) => sum + val, 0) / sessions.length);
          
          return {
            ...prev,
            [activeTask.id]: {
              sessions,
              average
            }
          };
        });
      }
      
      // Passer au mode pause
      setTimerMode('break');
      setTimeLeft(settings.breakTime * 60);
      setSessionCount(prev => prev + 1);
      
      // Si notifications activées
      if (settings.notifications) {
        message.success(`Vous avez terminé une session de travail de ${settings.workTime} minutes!`);
      }
      
      // Redémarrer automatiquement le timer pour la pause
      setTimerRunning(true);
      notifySubscribers('workSessionCompleted', { 
        taskId: activeTask?.id, 
        duration: settings.workTime 
      });
    } else {
      // Fin de la pause, revenir au mode travail
      setTimerMode('work');
      setTimeLeft(settings.workTime * 60);
      
      // Si notifications activées
      if (settings.notifications) {
        message.info(`La pause de ${settings.breakTime} minutes est terminée!`);
      }
      
      // Le timer ne redémarre pas automatiquement après une pause
      setTimerRunning(false);
      notifySubscribers('breakSessionCompleted', { 
        taskId: activeTask?.id, 
        duration: settings.breakTime 
      });
    }
  }, [timerMode, activeTask, settings, notifySubscribers]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTaskTimeSpent = (taskId) => {
    return taskTimeSpent[taskId] || { total: 0 };
  };

  const getTaskProgress = (taskId) => {
    return taskProgress[taskId] || {};
  };

  const getTaskProductivity = (taskId) => {
    return taskProductivity[taskId] || { average: 0 };
  };

  const getTaskStepDescription = (taskId, stepNumber) => {
    if (!taskId || !stepNumber) return null;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    // Rechercher dans les sessions si une description existe
    const taskData = taskTimeSpent[taskId];
    if (taskData && taskData.sessions) {
      const sessionsWithDesc = taskData.sessions.filter(session => session.description);
      if (sessionsWithDesc.length > 0 && sessionsWithDesc[stepNumber - 1]) {
        return sessionsWithDesc[stepNumber - 1].description;
      }
    }
    return null;
  };

  const value = {
    activeTask,
    timerMode,
    timeLeft,
    timerRunning,
    sessionCount,
    taskTimeSpent,
    taskProgress,
    taskProductivity,
    startTimer,
    startPomodoro,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimer,
    stopPomodoro,
    pausePomodoro: pauseTimer,
    resumePomodoro: resumeTimer,
    nextStep: () => setSessionCount(prev => prev + 1),
    previousStep: () => setSessionCount(prev => Math.max(0, prev - 1)),
    subscribe,
    formatTime,
    getTaskTimeSpent,
    getTaskProgress,
    getTaskProductivity,
    getTaskStepDescription,
    currentStep: sessionCount + 1
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}; 