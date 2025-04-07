import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [settings, setSettings] = useState({
    workTime: 25,
    breakTime: 5,
    notifications: true,
    darkMode: false,
    viewMode: 'day',
  });

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    const savedSettings = localStorage.getItem('settings');
    
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      // Apply dark mode immediately
      document.body.classList.toggle('dark-mode', parsedSettings.darkMode);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
    // Apply dark mode when it changes
    document.body.classList.toggle('dark-mode', settings.darkMode);
  }, [settings]);

  const addTask = (task) => {
    setTasks([...tasks, { ...task, id: Date.now() }]);
  };

  const updateTask = (updatedTask) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const updateSettings = (newSettings) => {
    setSettings({ ...settings, ...newSettings });
  };

  const resetApp = () => {
    setTasks([]);
    setSettings({
      workTime: 25,
      breakTime: 5,
      notifications: true,
      darkMode: false,
      viewMode: 'day',
    });
    localStorage.clear();
    document.body.classList.remove('dark-mode');
  };

  return (
    <AppContext.Provider value={{
      tasks,
      settings,
      addTask,
      updateTask,
      deleteTask,
      updateSettings,
      resetApp
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 