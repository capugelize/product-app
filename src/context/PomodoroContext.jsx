import React, { createContext, useContext, useState, useEffect } from 'react';
import moment from 'moment';

export const PomodoroContext = createContext();

export const PomodoroProvider = ({ children }) => {
  const [activeTask, setActiveTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [taskTimeSpent, setTaskTimeSpent] = useState({});

  // Load saved task time spent from localStorage
  useEffect(() => {
    const savedTimeSpent = localStorage.getItem('taskTimeSpent');
    if (savedTimeSpent) {
      setTaskTimeSpent(JSON.parse(savedTimeSpent));
    }
  }, []);

  // Save task time spent to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('taskTimeSpent', JSON.stringify(taskTimeSpent));
  }, [taskTimeSpent]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handlePomodoroComplete();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const startPomodoro = (task) => {
    if (task) {
      setActiveTask(task);
      setTimeLeft(25 * 60);
      setIsRunning(true);
      setSessionStartTime(moment());
    }
  };

  const pausePomodoro = () => {
    setIsRunning(false);
  };

  const resumePomodoro = () => {
    setIsRunning(true);
  };

  const stopPomodoro = () => {
    if (activeTask && sessionStartTime) {
      const timeSpent = moment().diff(sessionStartTime, 'minutes');
      setTaskTimeSpent(prev => ({
        ...prev,
        [activeTask.id]: (prev[activeTask.id] || 0) + timeSpent
      }));
    }
    setActiveTask(null);
    setTimeLeft(25 * 60);
    setIsRunning(false);
    setSessionStartTime(null);
  };

  const handlePomodoroComplete = () => {
    if (activeTask) {
      const timeSpent = 25; // 25 minutes for a complete Pomodoro
      setTaskTimeSpent(prev => ({
        ...prev,
        [activeTask.id]: (prev[activeTask.id] || 0) + timeSpent
      }));
    }
    setActiveTask(null);
    setTimeLeft(25 * 60);
    setIsRunning(false);
    setSessionStartTime(null);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTaskTimeSpent = (taskId) => {
    return taskTimeSpent[taskId] || 0;
  };

  return (
    <PomodoroContext.Provider value={{
      activeTask,
      timeLeft,
      isRunning,
      taskTimeSpent,
      startPomodoro,
      pausePomodoro,
      resumePomodoro,
      stopPomodoro,
      formatTime,
      getTaskTimeSpent
    }}>
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