import React, { useState, useEffect } from 'react';
import { List, Card, Button, Modal, Form, Input, Select, DatePicker, Space, message, Collapse, Tag, Typography, Segmented, Progress, Checkbox, Popconfirm } from 'antd';
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
const { Text, Title } = Typography;

const TaskList = () => {
  const { tasks, addTask, editTask, deleteTask, updateTaskStatus, toggleSubtask } = useAppContext();
  const { 
    activeTask, 
    startTimer, 
    pauseTimer, 
    resumeTimer,
    timeLeft, 
    timerRunning,
    taskTimeSpent,
    taskProgress,
    taskProductivity,
    formatTime,
    getTaskTimeSpent,
    getTaskProgress,
    subscribe
  } = usePomodoro();
  const [isNewTaskModalVisible, setIsNewTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();
  const [aiSortedTasks, setAiSortedTasks] = useState([]);
  const [useSortedTasks, setUseSortedTasks] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [localTasks, setLocalTasks] = useState([]);

  const CATEGORIES = [
    { value: 'work', label: '💼 Travail', emoji: '💼' },
    { value: 'personal', label: '🏠 Personnel', emoji: '🏠' },
    { value: 'study', label: '📚 Études', emoji: '📚' },
    { value: 'health', label: '💪 Santé', emoji: '💪' },
    { value: 'other', label: '📝 Autre', emoji: '📝' }
  ];

  const STATUSES = [
    { value: 'not_started', label: '⏳ À faire', emoji: '⏳' },
    { value: 'in_progress', label: '🔧 En cours', emoji: '🔧' },
    { value: 'completed', label: '✅ Terminé', emoji: '✅' }
  ];

  // Subscribe to Pomodoro context updates
  useEffect(() => {
    setLocalTasks(tasks);
    
    const unsubscribe = subscribe(() => {
      setLocalTasks([...tasks]);
    });
    
    // Clean up subscription when component unmounts
    return () => unsubscribe();
  }, [tasks, subscribe]);

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
    // Préparation des données de la tâche
    const taskData = {
      ...values,
      deadline: values.deadline ? values.deadline.format() : null,
      status: values.status || 'not_started',
    };

    if (editingTask) {
      // Conserver les propriétés existantes si elles ne sont pas dans les valeurs soumises
      const updatedTask = {
        ...editingTask,
        ...taskData,
        // S'assurer que les sous-tâches ne sont pas perdues
        subtasks: taskData.subtasks || editingTask.subtasks || []
      };
      
      editTask(editingTask.id, updatedTask);
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
      if (timerRunning) {
        pauseTimer();
      } else {
        resumeTimer();
      }
    } else {
      startTimer(task.id);
    }
  };

  const renderTaskProgress = (task) => {
    const timeSpent = getTaskTimeSpent(task.id);
    const progress = getTaskProgress(task.id);
    
    if (!timeSpent.total) return null;

    return (
      <Collapse>
        <Panel header="Suivi du temps et progression" key="1">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <strong>Temps total passé :</strong> {timeSpent.total} minutes
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
                <strong>Progression :</strong>
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

  // Calculer le pourcentage de progression basé sur les sous-tâches complétées
  const calculateProgress = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.completed ? 100 : 0;
    }
    
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
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
              <List.Item
                style={{ 
                  padding: '12px',
                  backgroundColor: activeTask && activeTask.id === task.id ? '#f0f5ff' : 'transparent',
                  borderRadius: '4px'
                }}
                actions={[
                  <Button 
                    icon={<PlayCircleOutlined />} 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleStartPomodoro(task);
                    }}
                    disabled={activeTask && activeTask.id === task.id}
                    type={activeTask && activeTask.id === task.id ? 'default' : 'primary'}
                  >
                    {activeTask && activeTask.id === task.id && timerRunning 
                      ? `${formatTime(timeLeft)} restant` 
                      : "Démarrer"}
                  </Button>,
                  <Button 
                    icon={<EditOutlined />} 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      showModal(task);
                    }}
                  />,
                  <Popconfirm
                    title="Êtes-vous sûr de vouloir supprimer cette tâche ?"
                    onConfirm={() => handleDelete(task.id)}
                    okText="Oui"
                    cancelText="Non"
                  >
                    <Button 
                      danger 
                      icon={<DeleteOutlined />} 
                    />
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                      <Checkbox
                        checked={task.status === 'completed'}
                        onChange={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          const newStatus = e.target.checked ? 'completed' : 'in_progress';
                          updateTaskStatus(task.id, newStatus);
                        }}
                        style={{ marginRight: '8px' }}
                      />
                      <span style={{ fontSize: '18px', fontWeight: 500 }}>{task.name}</span>
                      <Space size={12} style={{ marginLeft: 'auto' }}>
                        <Tag color={getStatusColor(task.status)}>{getStatusEmoji(task.status)} {task.status.replace('_', ' ')}</Tag>
                        <Tag color={getPriorityColor(task.priority)}>
                          Priorité: {task.priority === 'high' ? '🔴 Haute' : task.priority === 'medium' ? '🟠 Moyenne' : '🟢 Basse'}
                        </Tag>
                      </Space>
                    </div>
                  }
                  description={
                    <>
                      <div style={{ marginBottom: '20px' }}>
                        <p>{task.description}</p>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                          <div>
                            <ClockCircleOutlined style={{ marginRight: '8px' }} />
                            {task.deadline ? moment(task.deadline).format('DD/MM/YYYY') : 'Pas de date limite'}
                          </div>
                          <div>
                            <Tag>{getCategoryEmoji(task.category)} {task.category.replace('_', ' ')}</Tag>
                          </div>
                        </div>
                        
                        {/* Barre de progression des sous-tâches */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <Text strong>Progression:</Text>
                              <Text>{calculateProgress(task)}%</Text>
                            </div>
                            <Progress 
                              percent={calculateProgress(task)} 
                              status={calculateProgress(task) === 100 ? 'success' : 'active'} 
                              size="default"
                              strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                              }}
                            />
                            <div style={{ marginTop: '12px' }}>
                              {task.subtasks.map(subtask => (
                                <div key={subtask.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                  <Checkbox 
                                    checked={subtask.completed} 
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      toggleSubtask(task.id, subtask.id);
                                    }}
                                    style={{ marginRight: '8px' }}
                                  />
                                  <span className={subtask.completed ? 'text-gray-400 line-through' : ''}>
                                    {subtask.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {renderTaskProgress(task)}
                      </div>
                    </>
                  }
                />
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
            Nouvelle Tâche
          </Button>
          <Button
            onClick={toggleSortMode}
            icon={<RobotOutlined />}
            type={useSortedTasks ? "primary" : "default"}
            size="large"
            style={{ height: '44px' }}
          >
            {useSortedTasks ? "Priorité IA activée" : "Utiliser priorité IA"}
          </Button>
        </div>
        
        <Segmented
          options={[
            {
              value: 'list',
              icon: <UnorderedListOutlined />,
              label: 'Liste',
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