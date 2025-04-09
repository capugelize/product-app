import React, { createContext, useContext, useState, useEffect } from 'react';
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
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const addTask = (task) => {
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
    return newTask;
  };

  const toggleTask = (taskId) => {
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === taskId
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(prevTasks => prevTasks.map(task =>
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
    ));

    // Vérifier si toutes les sous-tâches sont complétées pour mettre à jour l'état de la tâche principale
    const updatedTask = tasks.find(task => task.id === taskId);
    if (updatedTask && updatedTask.subtasks.length > 0) {
      const allSubtasksCompleted = updatedTask.subtasks.every(subtask => subtask.completed);
      if (allSubtasksCompleted && !updatedTask.completed) {
        toggleTask(taskId);
      }
    }
  };

  const addSubtask = (taskId, subtask) => {
    const newSubtask = {
      ...subtask,
      id: Date.now().toString(),
      completed: false,
    };

    setTasks(prevTasks => prevTasks.map(task =>
      task.id === taskId
        ? { 
            ...task, 
            subtasks: [...(task.subtasks || []), newSubtask] 
          }
        : task
    ));

    return newSubtask;
  };

  const updateSubtask = (taskId, subtaskId, updatedSubtask) => {
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === taskId
        ? { 
            ...task, 
            subtasks: task.subtasks.map(subtask => 
              subtask.id === subtaskId 
                ? { ...subtask, ...updatedSubtask }
                : subtask
            )
          }
        : task
    ));
  };

  const deleteSubtask = (taskId, subtaskId) => {
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === taskId
        ? { 
            ...task, 
            subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId)
          }
        : task
    ));
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === taskId
        ? { ...task, status: newStatus }
        : task
    ));
  };

  const editTask = (taskId, updatedTask) => {
    setTasks(prevTasks => prevTasks.map(task =>
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
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({
      ...prev,
      darkMode: !prev.darkMode
    }));
  };

  const resetApp = () => {
    setTasks([]);
    setSettings(initialSettings);
    localStorage.removeItem('tasks');
    localStorage.removeItem('settings');
  };

  const contextValue = {
    tasks,
    addTask,
    toggleTask,
    updateTaskStatus,
    editTask,
    deleteTask,
    settings,
    updateSettings,
    toggleDarkMode,
    resetApp,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtask,
  };

  return (
    <AppContextValue.Provider value={contextValue}>
      {children}
    </AppContextValue.Provider>
  );
};

export const AppProvider = AppContext;
export default AppContext; 