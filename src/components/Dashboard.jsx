import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Progress, Tag, Button, Modal, Form, Input, DatePicker, Select, Table, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, RobotOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { usePomodoro } from '../context/PomodoroContext';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

const Dashboard = () => {
  const { tasks, addTask, updateTask, deleteTask } = useAppContext();
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
    const formattedTask = {
      ...values,
      deadline: values.deadline ? values.deadline.format() : null,
    };

    if (editingTask) {
      updateTask({ ...editingTask, ...formattedTask });
    } else {
      addTask({
        ...formattedTask,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      });
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

  // Ajout d'une colonne pour le score AI
  const columns = [
    {
      title: 'Task',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'success' :
          status === 'in_progress' ? 'processing' : 'default'
        }>
          {status.replace('_', ' ')}
        </Tag>
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
      render: (_, record) => (
        taskProgress[record.id] ? (
          <Progress
            percent={Math.round(Object.values(taskProgress[record.id]).reduce((a, b) => a + b, 0) / Object.keys(taskProgress[record.id]).length)}
            size="small"
          />
        ) : <Progress percent={0} size="small" />
      ),
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
            onConfirm={() => handleDelete(record.id)}
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

  const taskStats = getTaskStats();
  const timeStats = getTimeStats();
  const priorityStats = getPriorityStats();
  const recentTasks = getRecentTasks();

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>Dashboard Overview</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Add Task
        </Button>
      </div>
      
      <Row gutter={[16, 16]}>
        {/* Task Statistics */}
        <Col span={8}>
          <Card title="Task Statistics">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Total Tasks: </Text>
                <Text>{taskStats.total}</Text>
              </div>
              <div>
                <Text strong>Completion Rate: </Text>
                <Progress percent={taskStats.completionRate} size="small" />
              </div>
              <div>
                <Text strong>Status Distribution: </Text>
                <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
                  <div>
                    <Tag color="success">Completed: {taskStats.completed}</Tag>
                  </div>
                  <div>
                    <Tag color="processing">In Progress: {taskStats.inProgress}</Tag>
                  </div>
                  <div>
                    <Tag color="default">Not Started: {taskStats.notStarted}</Tag>
                  </div>
                </Space>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Time Tracking */}
        <Col span={8}>
          <Card title="Time Tracking">
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
          <Card title="Priority Overview">
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

        {/* Task Management */}
        <Col span={24}>
          <Card 
            title="Task Management" 
            extra={
              <Space>
                <Button 
                  type={useSortedTasks ? "primary" : "default"}
                  icon={<RobotOutlined />}
                  onClick={toggleSortMode}
                  size="small"
                >
                  {useSortedTasks ? "Using AI Sort" : "Use AI Sort"}
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => showModal()}
                  size="small"
                >
                  Add Task
                </Button>
              </Space>
            }
          >
            {useSortedTasks && (
              <div style={{ marginBottom: 16, backgroundColor: '#f6ffed', padding: 12, borderRadius: 4, border: '1px solid #b7eb8f' }}>
                <Text strong>AI-powered task ordering enabled. </Text>
                <Text>Tasks are sorted based on priority, deadlines, progress, and productivity patterns.</Text>
              </div>
            )}
            <Table 
              dataSource={useSortedTasks ? aiSortedTasks : tasks} 
              columns={columns} 
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>

        {/* Recent Tasks */}
        <Col span={24}>
          <Card title="Recent Tasks">
            <Row gutter={[16, 16]}>
              {recentTasks.map(task => (
                <Col span={8} key={task.id}>
                  <Card 
                    size="small"
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
                      {taskProgress[task.id] && (
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
      </Row>

      {/* Task Form Modal */}
      <Modal
        title={editingTask ? "Edit Task" : "Add New Task"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            name: '',
            description: '',
            status: 'not_started',
            priority: 'medium',
            category: 'work',
          }}
        >
          <Form.Item
            name="name"
            label="Task Name"
            rules={[{ required: true, message: 'Please enter a task name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="not_started">Not Started</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select>
              <Option value="work">💼 Work</Option>
              <Option value="personal">🏠 Personal</Option>
              <Option value="study">📚 Study</Option>
              <Option value="health">💪 Health</Option>
              <Option value="other">📝 Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="deadline"
            label="Deadline"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTask ? 'Save Changes' : 'Add Task'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard; 