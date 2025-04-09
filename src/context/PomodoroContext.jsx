import React, { createContext, useContext, useState, useEffect } from 'react';
import moment from 'moment';

export const PomodoroContext = createContext();

export const PomodoroProvider = ({ children }) => {
  const [activeTask, setActiveTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [taskTimeSpent, setTaskTimeSpent] = useState({});
  const [taskProgress, setTaskProgress] = useState({});
  const [taskProductivity, setTaskProductivity] = useState({});
  const [taskStepDescriptions, setTaskStepDescriptions] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [timerInterval, setTimerInterval] = useState(null);

  // Load saved data from localStorage
  useEffect(() => {
    const savedTimeSpent = localStorage.getItem('taskTimeSpent');
    const savedProgress = localStorage.getItem('taskProgress');
    const savedProductivity = localStorage.getItem('taskProductivity');
    const savedStepDescriptions = localStorage.getItem('taskStepDescriptions');
    if (savedTimeSpent) {
      setTaskTimeSpent(JSON.parse(savedTimeSpent));
    }
    if (savedProgress) {
      setTaskProgress(JSON.parse(savedProgress));
    }
    if (savedProductivity) {
      setTaskProductivity(JSON.parse(savedProductivity));
    }
    if (savedStepDescriptions) {
      setTaskStepDescriptions(JSON.parse(savedStepDescriptions));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('taskTimeSpent', JSON.stringify(taskTimeSpent));
    localStorage.setItem('taskProgress', JSON.stringify(taskProgress));
    localStorage.setItem('taskProductivity', JSON.stringify(taskProductivity));
    localStorage.setItem('taskStepDescriptions', JSON.stringify(taskStepDescriptions));
  }, [taskTimeSpent, taskProgress, taskProductivity, taskStepDescriptions]);

  // Timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handlePomodoroComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerInterval(interval);
    } else if (!isRunning && timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isRunning, timeLeft]);

  const startPomodoro = (task) => {
    if (task) {
      setActiveTask(task);
      setTimeLeft(25 * 60);
      setIsRunning(true);
      setSessionStartTime(moment());
      setCurrentStep(1);
    }
  };

  const pausePomodoro = () => {
    setIsRunning(false);
  };

  const resumePomodoro = () => {
    setIsRunning(true);
  };

  const stopPomodoro = (progress, description) => {
    if (activeTask && sessionStartTime) {
      const timeSpent = moment().diff(sessionStartTime, 'minutes');
      const taskId = activeTask.id;
      
      // Update time spent
      setTaskTimeSpent(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          [`step${currentStep}`]: (prev[taskId]?.[`step${currentStep}`] || 0) + timeSpent,
          total: (prev[taskId]?.total || 0) + timeSpent
        }
      }));

      // Update progress and description
      const progressValue = progress || 50;
      setTaskProgress(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          [`step${currentStep}`]: progressValue
        }
      }));

      // Save step description
      setTaskStepDescriptions(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          [`step${currentStep}`]: description || ''
        }
      }));

      // Calculate productivity score
      const productivityScore = calculateProductivityScore(timeSpent, progressValue);
      setTaskProductivity(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          [`step${currentStep}`]: productivityScore,
          average: calculateAverageProductivity(prev[taskId], productivityScore)
        }
      }));
    }
    resetPomodoro();
  };

  const calculateProductivityScore = (timeSpent, progress) => {
    // Simple productivity calculation based on time spent and progress
    const baseScore = 100;
    const timeFactor = Math.min(1, 25 / timeSpent); // 25 minutes is ideal
    const progressFactor = progress / 100; // Convert progress to 0-1 scale
    return Math.round(baseScore * timeFactor * progressFactor);
  };

  const calculateAverageProductivity = (taskProductivity, newScore) => {
    if (!taskProductivity) return newScore;
    const scores = Object.values(taskProductivity)
      .filter(score => typeof score === 'number')
      .concat(newScore);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const resetPomodoro = () => {
    setActiveTask(null);
    setTimeLeft(25 * 60);
    setIsRunning(false);
    setSessionStartTime(null);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const handlePomodoroComplete = () => {
    if (activeTask) {
      const timeSpent = 25; // 25 minutes for a complete Pomodoro
      const taskId = activeTask.id;
      
      setTaskTimeSpent(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          [`step${currentStep}`]: (prev[taskId]?.[`step${currentStep}`] || 0) + timeSpent,
          total: (prev[taskId]?.total || 0) + timeSpent
        }
      }));

      // Calculate productivity for completed Pomodoro
      const progressValue = 100; // Assume 100% progress for completed Pomodoro
      const description = "Completed Pomodoro session"; // Default description for completed sessions
      const productivityScore = calculateProductivityScore(timeSpent, progressValue);
      
      setTaskProgress(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          [`step${currentStep}`]: progressValue
        }
      }));

      setTaskStepDescriptions(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          [`step${currentStep}`]: description
        }
      }));

      setTaskProductivity(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          [`step${currentStep}`]: productivityScore,
          average: calculateAverageProductivity(prev[taskId], productivityScore)
        }
      }));
    }
    resetPomodoro();
  };

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

  const getTaskStepDescription = (taskId, step) => {
    return taskStepDescriptions[taskId]?.[`step${step}`] || '';
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const previousStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  return (
    <PomodoroContext.Provider value={{
      activeTask,
      timeLeft,
      isRunning,
      currentStep,
      taskTimeSpent,
      taskProgress,
      taskProductivity,
      taskStepDescriptions,
      startPomodoro,
      pausePomodoro,
      resumePomodoro,
      stopPomodoro,
      formatTime,
      getTaskTimeSpent,
      getTaskProgress,
      getTaskProductivity,
      getTaskStepDescription,
      nextStep,
      previousStep
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