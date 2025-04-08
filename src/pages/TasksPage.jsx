import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import TaskForm from '../components/common/TaskForm';
import '../styles/TasksPage.css';

const TasksPage = () => {
  const { tasks, addTask, updateTask } = useAppContext();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleTaskSubmit = (taskData) => {
    if (selectedTask) {
      updateTask(selectedTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setSelectedTask(null);
    setIsCreating(false);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsCreating(true);
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1>Gestion des tâches</h1>
        <button 
          className="create-task-btn"
          onClick={() => {
            setSelectedTask(null);
            setIsCreating(true);
          }}
        >
          Créer une nouvelle tâche
        </button>
      </div>

      {isCreating && (
        <div className="task-form-container">
          <TaskForm
            task={selectedTask}
            onSubmit={handleTaskSubmit}
            onCancel={() => {
              setSelectedTask(null);
              setIsCreating(false);
            }}
          />
        </div>
      )}

      <div className="tasks-list">
        {tasks.map((task) => (
          <div key={task.id} className="task-card">
            <div className="task-header">
              <h3>{task.name}</h3>
              <button 
                className="edit-task-btn"
                onClick={() => handleEditTask(task)}
              >
                Modifier
              </button>
            </div>
            <p className="task-description">{task.description}</p>
            <div className="task-details">
              <span className={`task-status ${task.status}`}>
                {task.status}
              </span>
              <span className={`task-priority ${task.priority}`}>
                {task.priority}
              </span>
              {task.deadline && (
                <span className="task-deadline">
                  Échéance: {new Date(task.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksPage; 