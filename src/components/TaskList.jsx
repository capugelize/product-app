import React, { useState, useEffect } from 'react';
import { List, Card, Button, Modal, Form, Input, Select, DatePicker, Space, message, Collapse, Tag, Typography, Segmented } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, ClockCircleOutlined, RobotOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { usePomodoro } from '../context/PomodoroContext';
import NewTaskModal from './NewTaskModal';
import TaskCard from './TaskCard';
import KanbanView from './KanbanView';
import './TaskItem.css';

const { Option } = Select;
const { Panel } = Collapse;
const { Text } = Typography;

const TaskList = () => {
  const { tasks, addTask, editTask, deleteTask, updateTaskStatus } = useAppContext();
  const { activeTask, startPomodoro, stopPomodoro, isRunning, getTaskTimeSpent, getTaskProgress, timeLeft, taskProductivity } = usePomodoro();
  const [isNewTaskModalVisible, setIsNewTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();
  const [aiSortedTasks, setAiSortedTasks] = useState([]);
  const [useSortedTasks, setUseSortedTasks] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'

  const CATEGORIES = [
    { value: 'work', label: '💼 Work', emoji: '💼' },
    { value: 'personal', label: '🏠 Personal', emoji: '🏠' },
    { value: 'study', label: '📚 Study', emoji: '📚' },
    { value: 'health', label: '💪 Health', emoji: '💪' },
    { value: 'other', label: '📝 Other', emoji: '📝' }
  ];

  const STATUSES = [
    { value: 'not_started', label: '⏳ Not Started', emoji: '⏳' },
    { value: 'in_progress', label: '🔧 In Progress', emoji: '🔧' },
    { value: 'completed', label: '✅ Completed', emoji: '✅' }
  ];

  // Classifier l'ordre des tâches en utilisant l'IA
  useEffect(() => {
    if (tasks.length > 0) {
      classifyTasksWithAI();
    }
  }, [tasks, taskProductivity, getTaskProgress]);

  const classifyTasksWithAI = () => {
    // Créer une copie des tâches pour le classement
    const tasksCopy = [...tasks];
    
    // Calculer un score pour chaque tâche basé sur plusieurs facteurs
    const tasksWithScores = tasksCopy.map(task => {
      let score = 0;
      
      // 1. Facteur de priorité (impact élevé)
      if (task.priority === 'high') score += 50;
      else if (task.priority === 'medium') score += 30;
      else score += 10;
      
      // 2. Facteur d'échéance
      if (task.deadline) {
        const daysUntilDeadline = moment(task.deadline).diff(moment(), 'days');
        
        if (daysUntilDeadline < 0) {
          // Tâche en retard
          score += 40;
        } else if (daysUntilDeadline === 0) {
          // Échéance aujourd'hui
          score += 35;
        } else if (daysUntilDeadline <= 1) {
          // Échéance demain
          score += 30;
        } else if (daysUntilDeadline <= 3) {
          // Échéance dans les 3 jours
          score += 25;
        } else if (daysUntilDeadline <= 7) {
          // Échéance dans la semaine
          score += 20;
        } else {
          // Échéance lointaine
          score += 10;
        }
      }
      
      // 3. Facteur de statut
      if (task.status === 'in_progress') {
        score += 15; // Favoriser les tâches déjà en cours
      } else if (task.status === 'completed') {
        score -= 30; // Déprioriser les tâches terminées
      }
      
      // 4. Facteur de productivité (si disponible)
      const productivity = taskProductivity[task.id]?.average || 0;
      if (productivity > 0) {
        if (productivity < 40) {
          // Tâches à faible productivité peuvent nécessiter plus d'attention
          score += 10;
        } else if (productivity >= 70) {
          // Tâches à haute productivité - l'utilisateur est efficace dessus
          score += 5;
        }
      }
      
      // 5. Facteur de progression
      const progress = getTaskProgress(task.id);
      if (progress && Object.keys(progress).length > 0) {
        const avgProgress = Object.values(progress).reduce((a, b) => a + b, 0) / Object.keys(progress).length;
        
        if (avgProgress > 75) {
          // Presque terminé - donner une priorité pour finir
          score += 15;
        } else if (avgProgress > 25) {
          // Déjà bien avancé
          score += 10;
        }
      }
      
      // Retourner la tâche avec son score AI
      return {
        ...task,
        aiScore: score
      };
    });
    
    // Trier les tâches par score (décroissant)
    tasksWithScores.sort((a, b) => b.aiScore - a.aiScore);
    
    // Mettre à jour l'état
    setAiSortedTasks(tasksWithScores);
  };

  const toggleSortMode = () => {
    setUseSortedTasks(!useSortedTasks);
  };

  const showModal = (task = null) => {
    setEditingTask(task);
    setIsNewTaskModalVisible(true);
  };

  const handleOk = (values) => {
    const taskData = {
      ...values,
      deadline: values.deadline ? values.deadline.format() : null,
      status: values.status || 'not_started',
    };

    if (editingTask) {
      editTask(editingTask.id, taskData);
      message.success('Tâche mise à jour avec succès');
    } else {
      addTask(taskData);
      message.success('Tâche ajoutée avec succès');
    }

    setIsNewTaskModalVisible(false);
    setEditingTask(null);
  };

  const handleDelete = (taskId) => {
    deleteTask(taskId);
    message.success('Tâche supprimée avec succès');
  };

  const handleStartPomodoro = (task) => {
    if (activeTask && activeTask.id === task.id) {
      stopPomodoro(0, "Timer stopped");
    } else {
      startPomodoro(task);
    }
  };

  const renderTaskProgress = (task) => {
    const timeSpent = getTaskTimeSpent(task.id);
    const progress = getTaskProgress(task.id);
    
    if (!timeSpent.total) return null;

    return (
      <Collapse>
        <Panel header="Time Tracking & Progress" key="1">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <strong>Total Time Spent:</strong> {timeSpent.total} minutes
            </div>
            {Object.entries(timeSpent)
              .filter(([key]) => key.startsWith('step'))
              .map(([step, minutes]) => (
                <div key={step}>
                  <strong>{step}:</strong> {minutes} minutes
                </div>
              ))}
            
            {Object.entries(progress).length > 0 && (
              <div>
                <strong>Progress:</strong>
                {Object.entries(progress).map(([pomodoro, value]) => (
                  <Tag key={pomodoro} color={value > 70 ? 'green' : value > 40 ? 'blue' : 'orange'}>
                    {pomodoro}: {value}%
                  </Tag>
                ))}
              </div>
            )}
          </Space>
        </Panel>
      </Collapse>
    );
  };

  // Fonctions utilitaires
  const getStatusColor = (status) => {
    switch (status) {
      case 'not_started':
        return 'default';
      case 'in_progress':
        return 'processing';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'blue';
    }
  };

  const getCategoryEmoji = (category) => {
    return CATEGORIES.find(c => c.value === category)?.emoji || '📝';
  };

  const getStatusEmoji = (status) => {
    return STATUSES.find(s => s.value === status)?.emoji || '⏳';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Rendu de la liste des tâches ou de la vue Kanban en fonction du mode sélectionné
  const renderTasksView = () => {
    if (viewMode === 'kanban') {
      return <KanbanView tasks={useSortedTasks ? aiSortedTasks : tasks} />;
    }

    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <List
          grid={{
            gutter: 32,
            xs: 1,
            sm: 1,
            md: 1,
            lg: 1,
            xl: 1,
            xxl: 1,
          }}
          dataSource={useSortedTasks ? aiSortedTasks : tasks}
          renderItem={(task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <List.Item>
                <Card 
                  style={{ 
                    width: '100%',
                    marginBottom: '24px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                    borderRadius: '12px'
                  }}
                  extra={
                    <Space size="middle">
                      <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => showModal(task)}
                        style={{ height: '40px', width: '40px' }}
                      />
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDelete(task.id)}
                        style={{ height: '40px', width: '40px' }}
                      />
                      <Button
                        type={activeTask && activeTask.id === task.id ? "primary" : "default"}
                        icon={<PlayCircleOutlined />}
                        onClick={() => handleStartPomodoro(task)}
                        style={{ height: '40px', width: 'auto', padding: '0 16px' }}
                      >
                        {activeTask && activeTask.id === task.id && isRunning 
                          ? `${formatTime(timeLeft)} left` 
                          : "Start"}
                      </Button>
                    </Space>
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                      <span style={{ fontSize: '18px', fontWeight: 500 }}>{task.title}</span>
                      <Space size={12} style={{ marginLeft: 'auto' }}>
                        <Tag color={getStatusColor(task.status)}>{getStatusEmoji(task.status)} {task.status.replace('_', ' ')}</Tag>
                        <Tag color={getPriorityColor(task.priority)}>Priority: {task.priority}</Tag>
                      </Space>
                    </div>
                  }
                >
                  <div style={{ padding: '8px 0', fontSize: '15px' }}>
                    <p style={{ marginBottom: '20px' }}>{task.description}</p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <ClockCircleOutlined style={{ marginRight: '8px' }} />
                        {task.deadline ? moment(task.deadline).format('MMM Do, YYYY') : 'No deadline'}
                      </div>
                      <div>
                        <Tag>{getCategoryEmoji(task.category)} {task.category.replace('_', ' ')}</Tag>
                      </div>
                    </div>
                    
                    {renderTaskProgress(task)}
                  </div>
                </Card>
              </List.Item>
            </motion.div>
          )}
        />
      </div>
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        gap: '24px'
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
            size="large"
            style={{ height: '44px', padding: '0 24px' }}
          >
            New Task
          </Button>
          <Button
            onClick={toggleSortMode}
            icon={<RobotOutlined />}
            type={useSortedTasks ? "primary" : "default"}
            size="large"
            style={{ height: '44px' }}
          >
            {useSortedTasks ? "Using AI Priority" : "Use AI Priority"}
          </Button>
        </div>
        
        <Segmented
          options={[
            {
              value: 'list',
              icon: <UnorderedListOutlined />,
              label: 'List',
            },
            {
              value: 'kanban',
              icon: <AppstoreOutlined />,
              label: 'Kanban',
            },
          ]}
          value={viewMode}
          onChange={setViewMode}
          size="large"
          style={{ background: '#fff', padding: '8px' }}
        />
      </div>
      
      {renderTasksView()}
      
      <NewTaskModal
        visible={isNewTaskModalVisible}
        onCancel={() => {
          setIsNewTaskModalVisible(false);
          setEditingTask(null);
        }}
        onOk={handleOk}
        editingTask={editingTask}
      />
    </div>
  );
};

export default TaskList; 