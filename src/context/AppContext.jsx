import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

const AppContextValue = createContext();

export const useAppContext = () => useContext(AppContextValue);

const initialSettings = {
  darkMode: false,
  language: 'fr',
  workTime: 25,
  breakTime: 5,
  notifications: true,
  categories: [
    { id: 'work', name: 'Work', icon: '💼', color: '#1890ff' },
    { id: 'personal', name: 'Personal', icon: '🏠', color: '#722ed1' },
    { id: 'study', name: 'Study', icon: '📚', color: '#52c41a' },
    { id: 'health', name: 'Health', icon: '💪', color: '#faad14' },
    { id: 'other', name: 'Other', icon: '📝', color: '#13c2c2' },
  ],
};

const AppContext = ({ children }) => {
  // Array to store subscription callbacks
  const [subscribers, setSubscribers] = useState([]);

  // Subscribe to data changes
  const subscribe = useCallback((callback) => {
    setSubscribers(prev => [...prev, callback]);
    
    // Return unsubscribe function
    return () => {
      setSubscribers(prev => prev.filter(cb => cb !== callback));
    };
  }, []);

  // Notify all subscribers about data change
  const notifySubscribers = useCallback((type, data) => {
    subscribers.forEach(callback => callback(type, data));
  }, [subscribers]);

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        return JSON.parse(savedTasks).map(task => ({
          ...task,
          deadline: task.deadline ? moment(task.deadline) : null,
          createdAt: task.createdAt ? moment(task.createdAt) : moment(),
          subtasks: task.subtasks || [],
        }));
      } catch (error) {
        console.error('Error parsing tasks from localStorage', error);
        return [];
      }
    }
    return [];
  });

  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      try {
        return { ...initialSettings, ...JSON.parse(savedSettings) };
      } catch (error) {
        console.error('Error parsing settings from localStorage', error);
        return initialSettings;
      }
    }
    return initialSettings;
  });

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks.map(task => ({
      ...task,
      deadline: task.deadline ? task.deadline.format() : null,
      createdAt: task.createdAt ? task.createdAt.format() : null,
      subtasks: task.subtasks || [],
    }))));
    
    // Notify subscribers when tasks change
    notifySubscribers('tasks', tasks);
  }, [tasks, notifySubscribers]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Notify subscribers when settings change
    notifySubscribers('settings', settings);
  }, [settings, notifySubscribers]);

  const addTask = useCallback((task) => {
    const newTask = {
      ...task,
      id: task.id || Date.now().toString(),
      completed: task.status === 'completed',
      status: task.status || 'not_started',
      createdAt: task.createdAt ? moment(task.createdAt) : moment(),
      deadline: task.deadline ? moment(task.deadline) : null,
      duration: task.duration || 25,
      subtasks: task.subtasks || [],
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    notifySubscribers('taskAdded', newTask);
    return newTask;
  }, [notifySubscribers]);

  const toggleTask = useCallback((taskId) => {
    setTasks(prevTasks => {
      const newTasks = prevTasks.map(task =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      );
      notifySubscribers('taskToggled', { taskId, tasks: newTasks });
      return newTasks;
    });
  }, [notifySubscribers]);

  const toggleSubtask = useCallback((taskId, subtaskId) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task =>
        task.id === taskId
          ? { 
              ...task, 
              subtasks: task.subtasks.map(subtask => 
                subtask.id === subtaskId 
                  ? { ...subtask, completed: !subtask.completed }
                  : subtask
              )
            }
          : task
      );

      // Vérifier si toutes les sous-tâches sont complétées pour mettre à jour l'état de la tâche principale
      const updatedTask = updatedTasks.find(task => task.id === taskId);
      if (updatedTask && updatedTask.subtasks && updatedTask.subtasks.length > 0) {
        const allSubtasksCompleted = updatedTask.subtasks.every(subtask => subtask.completed);
        // Mettre à jour à la fois 'completed' et 'status'
        if (allSubtasksCompleted) {
          updatedTask.completed = true;
          updatedTask.status = 'completed';
        } else {
          // Si au moins une sous-tâche est active, mettre le statut à 'in_progress'
          updatedTask.completed = false;
          updatedTask.status = 'in_progress';
        }
      }

      notifySubscribers('subtaskToggled', { 
        taskId, 
        subtaskId, 
        tasks: updatedTasks 
      });
      
      return updatedTasks;
    });
  }, [notifySubscribers]);

  const updateTaskStatus = useCallback((taskId, newStatus) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus }
          : task
      );
      notifySubscribers('taskStatusUpdated', { taskId, newStatus, tasks: updatedTasks });
      return updatedTasks;
    });
  }, [notifySubscribers]);

  const editTask = useCallback((taskId, updatedTask) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task =>
        task.id === taskId
          ? { 
              ...task, 
              ...updatedTask,
              completed: updatedTask.status === 'completed',
              deadline: updatedTask.deadline ? moment(updatedTask.deadline) : null,
              duration: updatedTask.duration || task.duration || 25,
              subtasks: updatedTask.subtasks || task.subtasks || [],
            }
          : task
      );
      notifySubscribers('taskEdited', { taskId, updatedTask, tasks: updatedTasks });
      return updatedTasks;
    });
  }, [notifySubscribers]);

  const deleteTask = useCallback((taskId) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.filter(task => task.id !== taskId);
      notifySubscribers('taskDeleted', { taskId, tasks: updatedTasks });
      return updatedTasks;
    });
  }, [notifySubscribers]);

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => {
      const updatedSettings = { ...prev, ...newSettings };
      notifySubscribers('settingsUpdated', updatedSettings);
      return updatedSettings;
    });
  }, [notifySubscribers]);

  const addSubtask = useCallback((taskId, subtask) => {
    const newSubtask = {
      ...subtask,
      id: Date.now().toString(),
      completed: false,
    };

    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task =>
        task.id === taskId
          ? { 
              ...task, 
              subtasks: [...(task.subtasks || []), newSubtask] 
            }
          : task
      );
      notifySubscribers('subtaskAdded', { taskId, subtask: newSubtask, tasks: updatedTasks });
      return updatedTasks;
    });

    return newSubtask;
  }, [notifySubscribers]);

  const contextValue = {
    tasks,
    addTask,
    toggleTask,
    updateTaskStatus,
    editTask,
    deleteTask,
    settings,
    updateSettings,
    addSubtask,
    toggleSubtask,
    subscribe
  };

  return (
    <AppContextValue.Provider value={contextValue}>
      {children}
    </AppContextValue.Provider>
  );
};

export const AppProvider = AppContext;
export default AppContext; 