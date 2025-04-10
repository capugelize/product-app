import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Progress, Tag, Button, Modal, Form, Input, DatePicker, Select, Table, Popconfirm, Checkbox, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, RobotOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { usePomodoro } from '../context/PomodoroContext';
import NewTaskModal from './NewTaskModal';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

const Dashboard = () => {
  const { tasks, addTask, editTask, deleteTask, toggleTask, toggleSubtask } = useAppContext();
  const { taskTimeSpent, taskProgress, taskProductivity } = usePomodoro();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();
  const [aiSortedTasks, setAiSortedTasks] = useState([]);
  const [useSortedTasks, setUseSortedTasks] = useState(false);

  // Classifier l'ordre des tâches en utilisant l'IA
  useEffect(() => {
    if (tasks.length > 0) {
      classifyTasksWithAI();
    }
  }, [tasks, taskProgress, taskProductivity]);

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
      const progress = taskProgress[task.id];
      if (progress) {
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'work':
        return '💼';
      case 'personal':
        return '🏠';
      case 'study':
        return '📚';
      case 'health':
        return '💪';
      case 'other':
        return '📝';
      default:
        return '📝';
    }
  };

  const getTotalProductivity = () => {
    const tasks = Object.entries(taskProductivity);
    if (tasks.length === 0) return 0;
    
    const total = tasks.reduce((sum, [_, data]) => {
      return sum + (data.average || 0);
    }, 0);
    
    return Math.round(total / tasks.length);
  };

  const getTaskStats = () => {
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      notStarted: tasks.filter(t => t.status === 'not_started').length,
    };

    return {
      ...stats,
      completionRate: Math.round((stats.completed / stats.total) * 100) || 0,
    };
  };

  const getTimeStats = () => {
    const totalTime = Object.values(taskTimeSpent).reduce((sum, data) => sum + (data.total || 0), 0);
    const hours = Math.floor(totalTime / 60);
    const minutes = totalTime % 60;

    return {
      totalTime,
      formattedTime: `${hours}h ${minutes}m`,
      sessions: Object.keys(taskTimeSpent).length,
    };
  };

  const getRecentTasks = () => {
    return tasks
      .sort((a, b) => moment(b.deadline).valueOf() - moment(a.deadline).valueOf())
      .slice(0, 5);
  };

  const getPriorityStats = () => {
    return {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };
  };

  const showModal = (task = null) => {
    setEditingTask(task);
    form.resetFields();
    
    if (task) {
      form.setFieldsValue({
        ...task,
        deadline: task.deadline ? moment(task.deadline) : null,
      });
    }
    
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingTask(null);
  };

  const handleSave = (values) => {
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

    setIsModalVisible(false);
    setEditingTask(null);
  };

  const handleDelete = (taskId) => {
    deleteTask(taskId);
  };

  const toggleSortMode = () => {
    setUseSortedTasks(!useSortedTasks);
  };

  const handleToggleTask = (taskId) => {
    toggleTask(taskId);
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    toggleSubtask(taskId, subtaskId);
  };

  // Calculer le pourcentage de progression basé sur les sous-tâches complétées
  const calculateTaskProgress = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.completed ? 100 : 0;
    }
    
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  };

  // Calculer le nombre total de sous-tâches et de sous-tâches complétées
  const getSubtaskStats = () => {
    let total = 0;
    let completed = 0;

    tasks.forEach(task => {
      if (task.subtasks && task.subtasks.length > 0) {
        total += task.subtasks.length;
        completed += task.subtasks.filter(st => st.completed).length;
      }
    });

    return {
      total,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const renderTasksTable = () => {
    const data = (useSortedTasks ? aiSortedTasks : tasks).map(task => ({
      key: task.id,
      name: task.name,
      priority: task.priority,
      category: task.category,
      status: task.status,
      deadline: task.deadline,
      aiScore: task.aiScore,
      subtasks: task.subtasks || [],
      completed: task.completed
    }));

    const columns = [
      {
        title: 'Status',
        key: 'completed',
        width: 60,
        render: (_, record) => (
          <Checkbox
            checked={record.completed}
            onChange={() => handleToggleTask(record.key)}
          />
        ),
      },
      {
        title: 'Task',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <div>
            <div className={`font-medium ${record.completed ? 'line-through text-gray-400' : ''}`}>{text}</div>
            
            {/* Affichage des sous-tâches */}
            {record.subtasks && record.subtasks.length > 0 && (
              <div className="ml-4 mt-2 border-l-2 border-gray-200 pl-2">
                {record.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center py-1">
                    <Checkbox
                      checked={subtask.completed}
                      onChange={() => handleToggleSubtask(record.key, subtask.id)}
                      className="mr-2"
                    />
                    <span className={`text-sm ${subtask.completed ? 'line-through text-gray-400' : ''}`}>
                      {subtask.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ),
      },
      {
        title: 'Priority',
        dataIndex: 'priority',
        key: 'priority',
        render: (priority) => (
          <Tag color={
            priority === 'high' ? 'red' :
            priority === 'medium' ? 'orange' : 'green'
          }>
            {priority}
          </Tag>
        ),
      },
      {
        title: 'Category',
        dataIndex: 'category',
        key: 'category',
        render: (category) => {
          const icon = getCategoryIcon(category);
          return <Tag>{icon} {category}</Tag>;
        },
      },
      {
        title: 'Deadline',
        dataIndex: 'deadline',
        key: 'deadline',
        render: (deadline) => deadline ? moment(deadline).format('YYYY-MM-DD') : '-',
      },
      {
        title: 'Progress',
        key: 'progress',
        render: (_, record) => {
          // Utiliser la progression calculée à partir des sous-tâches s'il y en a
          if (record.subtasks && record.subtasks.length > 0) {
            const percent = calculateTaskProgress(record);
            return (
              <Progress 
                percent={percent} 
                size="small"
                status={percent === 100 ? 'success' : 'active'}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            );
          }
          
          // Sinon utiliser les données de progression du Pomodoro si disponibles
          return taskProgress[record.key] ? (
            <Progress
              percent={Math.round(Object.values(taskProgress[record.key]).reduce((a, b) => a + b, 0) / Object.keys(taskProgress[record.key]).length)}
              size="small"
            />
          ) : <Progress percent={0} size="small" />;
        },
      },
      ...(useSortedTasks ? [{
        title: 'AI Score',
        dataIndex: 'aiScore',
        key: 'aiScore',
        render: (score) => (
          <Tag color={score > 70 ? 'red' : score > 40 ? 'orange' : 'green'}>
            {score}
          </Tag>
        ),
      }] : []),
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space size="small">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => showModal(record)} 
            />
            <Popconfirm
              title="Are you sure you want to delete this task?"
              onConfirm={() => handleDelete(record.key)}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
              />
            </Popconfirm>
          </Space>
        ),
      },
    ];

    return (
      <Table
        dataSource={data}
        columns={columns}
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: record => (
            <div className="pl-4">
              {record.description && (
                <p>{record.description}</p>
              )}
              <Space direction="vertical" style={{ width: '100%' }}>
                {taskTimeSpent[record.key] && (
                  <div>
                    <Text type="secondary">Time spent: {taskTimeSpent[record.key].total} minutes</Text>
                  </div>
                )}
                {taskProgress[record.key] && (
                  <div>
                    <Text type="secondary">Average progress: {
                      Math.round(
                        Object.values(taskProgress[record.key]).reduce((sum, val) => sum + val, 0) / 
                        Object.keys(taskProgress[record.key]).length
                      )}%
                    </Text>
                  </div>
                )}
              </Space>
            </div>
          ),
        }}
      />
    );
  };

  const taskStats = getTaskStats();
  const timeStats = getTimeStats();
  const priorityStats = getPriorityStats();
  const recentTasks = getRecentTasks();
  const subtaskStats = getSubtaskStats();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-8">
        <Title level={2}>Dashboard</Title>
        <Space>
          <Button 
            icon={<RobotOutlined />}
            onClick={toggleSortMode}
            type={useSortedTasks ? "primary" : "default"}
            size="large"
            style={{ height: '44px' }}
          >
            {useSortedTasks ? "Tri AI activé" : "Tri standard"}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            size="large"
            style={{ height: '44px', padding: '0 24px' }}
          >
            Ajouter une tâche
          </Button>
        </Space>
      </div>

      <div style={{ marginBottom: '50px' }}></div>

      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card style={{ 
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)', 
            borderRadius: '12px',
            height: '100%'
          }}>
            <Title level={4}>Progression globale</Title>
            <Progress 
              type="circle" 
              percent={taskStats.completionRate} 
              format={percent => `${percent}%`} 
            />
            <div className="mt-4">
              <Text>Total: {taskStats.total} tâches</Text>
              <br />
              <Text>Terminées: {taskStats.completed}</Text>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card style={{ 
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)', 
            borderRadius: '12px',
            height: '100%'
          }}>
            <Title level={4}>Sous-tâches</Title>
            <Progress 
              type="circle" 
              percent={subtaskStats.completionRate}
              format={percent => `${percent}%`}
            />
            <div className="mt-4">
              <Text>Total: {subtaskStats.total} sous-tâches</Text>
              <br />
              <Text>Terminées: {subtaskStats.completed}</Text>
            </div>
          </Card>
        </Col>

        {/* Time Tracking */}
        <Col span={8}>
          <Card 
            title="Time Tracking" 
            style={{ 
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)', 
              borderRadius: '12px',
              height: '100%'
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Total Time Spent: </Text>
                <Text>{timeStats.formattedTime}</Text>
              </div>
              <div>
                <Text strong>Pomodoro Sessions: </Text>
                <Text>{timeStats.sessions}</Text>
              </div>
              <div>
                <Text strong>Overall Productivity: </Text>
                <Progress
                  percent={getTotalProductivity()}
                  status={getTotalProductivity() >= 70 ? 'success' : getTotalProductivity() >= 40 ? 'normal' : 'exception'}
                />
              </div>
            </Space>
          </Card>
        </Col>

        {/* Priority Overview */}
        <Col span={8}>
          <Card 
            title="Priority Overview" 
            style={{ 
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)', 
              borderRadius: '12px',
              height: '100%'
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>High Priority: </Text>
                <Tag color="red">{priorityStats.high}</Tag>
              </div>
              <div>
                <Text strong>Medium Priority: </Text>
                <Tag color="orange">{priorityStats.medium}</Tag>
              </div>
              <div>
                <Text strong>Low Priority: </Text>
                <Tag color="green">{priorityStats.low}</Tag>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card 
        title="Mes tâches" 
        className="mb-6" 
        style={{ 
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)', 
          borderRadius: '12px' 
        }}
      >
        {renderTasksTable()}
      </Card>

      {/* Recent Tasks */}
      <Col span={24}>
        <Card 
          title="Recent Tasks" 
          style={{ 
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)', 
            borderRadius: '12px' 
          }}
        >
          <Row gutter={[24, 24]}>
            {recentTasks.map(task => (
              <Col span={8} key={task.id}>
                <Card 
                  size="small"
                  style={{ 
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)', 
                    borderRadius: '8px',
                    height: '100%'
                  }}
                  actions={[
                    <EditOutlined key="edit" onClick={() => showModal(task)} />,
                    <Popconfirm
                      title="Are you sure you want to delete this task?"
                      onConfirm={() => handleDelete(task.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <DeleteOutlined key="delete" />
                    </Popconfirm>
                  ]}
                >
                  <Space direction="vertical">
                    <Text strong>{task.name}</Text>
                    <Space>
                      <Tag color={
                        task.priority === 'high' ? 'red' :
                        task.priority === 'medium' ? 'orange' : 'green'
                      }>
                        {task.priority}
                      </Tag>
                      <Tag color={
                        task.status === 'completed' ? 'success' :
                        task.status === 'in_progress' ? 'processing' : 'default'
                      }>
                        {task.status.replace('_', ' ')}
                      </Tag>
                      {task.category && (
                        <Tag>
                          {getCategoryIcon(task.category)} {task.category}
                        </Tag>
                      )}
                    </Space>
                    {task.deadline && (
                      <Text type="secondary">
                        Deadline: {moment(task.deadline).format('YYYY-MM-DD')}
                      </Text>
                    )}
                    {/* Afficher la progression basée sur les sous-tâches si présentes */}
                    {task.subtasks && task.subtasks.length > 0 ? (
                      <Progress
                        percent={calculateTaskProgress(task)}
                        size="small"
                        status={calculateTaskProgress(task) === 100 ? 'success' : 'active'}
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                      />
                    ) : taskProgress[task.id] && (
                      <Progress
                        percent={Object.values(taskProgress[task.id]).reduce((a, b) => a + b, 0) / Object.keys(taskProgress[task.id]).length}
                        size="small"
                      />
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Col>

      {/* Task Form Modal */}
      <NewTaskModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSave}
        initialValues={editingTask}
      />
    </div>
  );
};

export default Dashboard; 