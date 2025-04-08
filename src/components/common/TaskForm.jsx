import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useAppContext } from '../../context/AppContext';
import TaskStatus from './TaskStatus';

const TaskForm = ({ task, onClose }) => {
  const { tasks, setTasks, settings } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'not_started',
    priority: 'medium',
    category: 'work',
    deadline: moment().add(1, 'day'),
  });

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority,
        category: task.category,
        deadline: task.deadline,
      });
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTask = {
      id: task ? task.id : Date.now().toString(),
      ...formData,
      createdAt: task ? task.createdAt : moment(),
    };

    if (task) {
      setTasks(tasks.map(t => t.id === task.id ? newTask : t));
    } else {
      setTasks([...tasks, newTask]);
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="form-group">
        <label htmlFor="name">Nom de la tâche</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Statut</label>
        <TaskStatus
          status={formData.status}
          onChange={(status) => setFormData({ ...formData, status })}
        />
      </div>

      <div className="form-group">
        <label htmlFor="priority">Priorité</label>
        <select
          id="priority"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
        >
          <option value="low">Basse</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="category">Catégorie</label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          {settings.categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="deadline">Date limite</label>
        <input
          type="date"
          id="deadline"
          value={moment(formData.deadline).format('YYYY-MM-DD')}
          onChange={(e) => setFormData({ ...formData, deadline: moment(e.target.value) })}
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onClose}>Annuler</button>
        <button type="submit">{task ? 'Modifier' : 'Créer'}</button>
      </div>
    </form>
  );
};

export default TaskForm; 