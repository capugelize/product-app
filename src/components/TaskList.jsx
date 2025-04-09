import React, { useState, useEffect } from 'react';
import { List, Card, Button, Modal, Form, Input, Select, DatePicker, Space, message, Collapse, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, ClockCircleOutlined, RobotOutlined } from '@ant-design/icons';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { usePomodoro } from '../context/PomodoroContext';
import './TaskItem.css';

const { Option } = Select;
const { Panel } = Collapse;
const { Text } = Typography;

const TaskList = () => {
  const { tasks, addTask, editTask, deleteTask, updateTaskStatus } = useAppContext();
  const { activeTask, startPomodoro, stopPomodoro, isRunning, getTaskTimeSpent, getTaskProgress, timeLeft, taskProductivity } = usePomodoro();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();
  const [aiSortedTasks, setAiSortedTasks] = useState([]);
  const [useSortedTasks, setUseSortedTasks] = useState(false);

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
    if (task) {
      form.setFieldsValue({
        name: task.name,
        priority: task.priority,
        category: task.category,
        status: task.status,
        deadline: task.deadline ? moment(task.deadline) : null,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      const taskData = {
        ...values,
        deadline: values.deadline ? values.deadline.format() : null,
        status: values.status || 'not_started',
      };

      if (editingTask) {
        editTask(editingTask.id, taskData);
        message.success('Task updated successfully');
      } else {
        addTask(taskData);
        message.success('Task added successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleDelete = (taskId) => {
    deleteTask(taskId);
    message.success('Task deleted successfully');
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
                  {progress[step] && (
                    <div style={{ marginLeft: 16, marginTop: 8 }}>
                      <strong>Progress:</strong> {progress[step]}
                    </div>
                  )}
                </div>
              ))}
          </Space>
        </Panel>
      </Collapse>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'processing';
      case 'not_started':
        return 'default';
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
        return 'default';
    }
  };

  const getCategoryEmoji = (category) => {
    return CATEGORIES.find(c => c.value === category)?.emoji || '📝';
  };

  const getStatusEmoji = (status) => {
    return STATUSES.find(s => s.value === status)?.emoji || '⏳';
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card
      title="Tasks"
      extra={
        <Space>
          <Button 
            type={useSortedTasks ? "primary" : "default"}
            icon={<RobotOutlined />}
            onClick={toggleSortMode}
          >
            {useSortedTasks ? "Using AI Sort" : "Use AI Sort"}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            Add Task
          </Button>
        </Space>
      }
    >
      {isRunning && activeTask && (
        <div className="timer-display active">
          <ClockCircleOutlined className="timer-icon" />
          <span className="timer-text">{formatTime(timeLeft)}</span>
          <span className="task-name">{activeTask.name}</span>
        </div>
      )}
      
      {useSortedTasks && (
        <div style={{ marginBottom: 16, backgroundColor: '#f6ffed', padding: 12, borderRadius: 4, border: '1px solid #b7eb8f' }}>
          <Text strong>AI-powered task ordering enabled. </Text>
          <Text>Tasks are sorted based on priority, deadlines, progress, and productivity patterns.</Text>
        </div>
      )}
      
      <AnimatePresence>
        <List
          dataSource={useSortedTasks ? aiSortedTasks : tasks}
          renderItem={task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className={`task-item ${activeTask?.id === task.id ? 'active-pomodoro' : ''}`}
            >
              <List.Item
                actions={[
                  <Button
                    type="text"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handleStartPomodoro(task)}
                    className={activeTask?.id === task.id && isRunning ? 'active-timer' : ''}
                  />,
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => showModal(task)}
                  />,
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(task.id)}
                  />,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      {task.name}
                      {useSortedTasks && task.aiScore && (
                        <Tag color={task.aiScore > 70 ? 'red' : task.aiScore > 40 ? 'orange' : 'green'}>
                          AI Score: {task.aiScore}
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Space>
                        <Tag color={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Tag>
                        <Tag color={getStatusColor(task.status)}>
                          {getStatusEmoji(task.status)} {STATUSES.find(s => s.value === task.status)?.label.split(' ')[1] || 'Unknown'}
                        </Tag>
                        <Tag>
                          {getCategoryEmoji(task.category)} {CATEGORIES.find(c => c.value === task.category)?.label.split(' ')[1] || 'Other'}
                        </Tag>
                      </Space>
                      {task.deadline && (
                        <div>Deadline: {moment(task.deadline).format('YYYY-MM-DD HH:mm')}</div>
                      )}
                      {renderTaskProgress(task)}
                    </Space>
                  }
                />
              </List.Item>
            </motion.div>
          )}
        />
      </AnimatePresence>

      <Modal
        title={editingTask ? "Edit Task" : "Add Task"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Task Name"
            rules={[{ required: true, message: 'Please enter task name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            initialValue="medium"
          >
            <Select>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            initialValue="work"
          >
            <Select>
              {CATEGORIES.map(category => (
                <Option key={category.value} value={category.value}>
                  {category.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            initialValue="not_started"
          >
            <Select>
              {STATUSES.map(status => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="deadline"
            label="Deadline"
          >
            <DatePicker showTime />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TaskList; 