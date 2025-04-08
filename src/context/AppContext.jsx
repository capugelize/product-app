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
    { id: 'work', name: 'Travail', icon: '💻', color: '#1890ff' },
    { id: 'personal', name: 'Personnel', icon: '📖', color: '#722ed1' },
    { id: 'health', name: 'Santé', icon: '🏃‍♂️', color: '#52c41a' },
    { id: 'shopping', name: 'Courses', icon: '🛒', color: '#faad14' },
    { id: 'projects', name: 'Projets', icon: '📋', color: '#13c2c2' },
    { id: 'appointments', name: 'Rendez-vous', icon: '📅', color: '#eb2f96' },
    { id: 'leisure', name: 'Loisirs', icon: '🎮', color: '#fa8c16' },
  ],
};

const initialTasks = [
  {
    id: '1',
    name: 'Créer une interface utilisateur',
    description: 'Concevoir et implémenter une interface utilisateur pour l\'application',
    completed: false,
    status: 'to_follow',
    priority: 'high',
    category: 'work',
    deadline: moment().add(1, 'days'),
    createdAt: moment().subtract(2, 'days'),
  },
  {
    id: '2',
    name: 'Faire les courses',
    description: 'Acheter des fruits, légumes et produits d\'épicerie',
    completed: true,
    status: 'completed',
    priority: 'medium',
    category: 'shopping',
    deadline: moment().subtract(1, 'days'),
    createdAt: moment().subtract(3, 'days'),
  },
  {
    id: '3',
    name: 'Faire du sport',
    description: '30 minutes de course à pied',
    completed: false,
    status: 'in_progress',
    priority: 'low',
    category: 'health',
    deadline: moment().add(2, 'days'),
    createdAt: moment().subtract(1, 'days'),
  },
];

const AppContext = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        return JSON.parse(savedTasks).map(task => ({
          ...task,
          deadline: task.deadline ? moment(task.deadline) : null,
          createdAt: task.createdAt ? moment(task.createdAt) : moment(),
        }));
      } catch (error) {
        console.error('Error parsing tasks from localStorage', error);
        return initialTasks;
      }
    }
    return initialTasks;
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

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks.map(task => ({
      ...task,
      deadline: task.deadline ? task.deadline.format() : null,
      createdAt: task.createdAt ? task.createdAt.format() : null,
    }))));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const addTask = (task) => {
    const newTask = {
      ...task,
      id: Date.now().toString(),
      completed: task.status === 'completed',
      status: task.status || 'not_started',
      createdAt: moment(),
    };
    setTasks([...tasks, newTask]);
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, status: newStatus }
        : task
    ));
  };

  const editTask = (taskId, updatedTask) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { 
            ...task, 
            ...updatedTask,
            completed: updatedTask.status === 'completed'
          }
        : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const updateSettings = (newSettings) => {
    setSettings({ ...settings, ...newSettings });
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({
      ...prev,
      darkMode: !prev.darkMode
    }));
  };

  const resetApp = () => {
    setTasks(initialTasks);
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
  };

  return (
    <AppContextValue.Provider value={contextValue}>
      {children}
    </AppContextValue.Provider>
  );
};

export default AppContext; 