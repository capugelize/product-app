import React, { useState } from 'react';
import { Card, Typography, List, Tag, Space, Button, Modal, Form, InputNumber, Select, DatePicker, Popconfirm, Input } from 'antd';
import moment from 'moment';
import 'moment/locale/fr';
import { useAppContext } from '../context/AppContext';

const { Title, Text } = Typography;
const { Option } = Select;

const ProductivityAssistant = () => {
  const { tasks, editTask, deleteTask } = useAppContext();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm] = Form.useForm();

  const productivityHours = {
    morning: { start: '09:00', end: '12:00' },
    afternoon: { start: '14:00', end: '18:00' }
  };

  const isProductivityHour = (time) => {
    const hour = moment(time, 'HH:mm').hour();
    return (hour >= 9 && hour < 12) || (hour >= 14 && hour < 18);
  };

  const calculatePomodoroBlocks = (duration) => {
    const pomodoroDuration = 25;
    const breakDuration = 5;
    const blocks = Math.ceil(duration / pomodoroDuration);
    return blocks * (pomodoroDuration + breakDuration);
  };

  const generateSchedule = (tasks) => {
    const schedule = [];
    let currentTime = moment().startOf('day').add(9, 'hours'); // Start at 9 AM

    // Filter out completed tasks and sort by priority and deadline
    const activeTasks = tasks.filter(task => task.status !== 'completed');
    const sortedTasks = [...activeTasks].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return moment(a.deadline).diff(moment(b.deadline));
    });

    for (const task of sortedTasks) {
      const duration = calculatePomodoroBlocks(task.duration || 25);
      const endTime = moment(currentTime).add(duration, 'minutes');

      // Skip to next productivity hour if current time is outside
      if (!isProductivityHour(currentTime)) {
        if (currentTime.hour() < 14) {
          currentTime = moment().startOf('day').add(14, 'hours');
        } else {
          currentTime = moment(currentTime).add(1, 'day').startOf('day').add(9, 'hours');
        }
      }

      schedule.push({
        id: task.id,
        name: task.name,
        title: task.name,
        start: currentTime.format('HH:mm'),
        end: endTime.format('HH:mm'),
        date: currentTime.format('YYYY-MM-DD'),
        pomodoro: true,
        priority: task.priority,
        duration: task.duration || 25,
        status: task.status
      });

      currentTime = endTime;
    }

    return schedule;
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    editForm.setFieldsValue({
      name: task.name,
      priority: task.priority,
      duration: task.duration,
      deadline: task.deadline ? moment(task.deadline) : null,
      category: task.category || 'work'
    });
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = () => {
    editForm.validateFields().then(values => {
      const updatedTask = {
        ...values,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
        duration: values.duration || 25,
        priority: values.priority || 'medium',
        category: values.category || 'work'
      };
      editTask(editingTask.id, updatedTask);
      setIsEditModalVisible(false);
      editForm.resetFields();
      setEditingTask(null);
    });
  };

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
  };

  const schedule = generateSchedule(tasks);

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={3}>Assistant de Productivité</Title>

        <List
          dataSource={schedule}
          renderItem={item => (
            <List.Item>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text strong>{item.name || item.title}</Text>
                  <Space>
                    <Button type="link" onClick={() => handleEditTask(item)}>
                      Modifier
                    </Button>
                    <Popconfirm
                      title="Supprimer la tâche"
                      description="Êtes-vous sûr de vouloir supprimer cette tâche ?"
                      onConfirm={() => handleDeleteTask(item.id)}
                      okText="Oui"
                      cancelText="Non"
                    >
                      <Button type="link" danger>
                        Supprimer
                      </Button>
                    </Popconfirm>
                  </Space>
                </Space>
                <Space>
                  <Tag color={item.priority === 'high' ? 'red' : item.priority === 'medium' ? 'orange' : 'green'}>
                    {item.priority}
                  </Tag>
                  <Text>{item.date} {item.start} - {item.end}</Text>
                  <Text type="secondary">({item.duration} min)</Text>
                  <Tag color={item.status === 'completed' ? 'success' : item.status === 'in_progress' ? 'processing' : 'default'}>
                    {item.status === 'completed' ? '✅ Completed' : item.status === 'in_progress' ? '🔧 In Progress' : '⏳ Not Started'}
                  </Tag>
                </Space>
              </Space>
            </List.Item>
          )}
        />
      </Space>

      <Modal
        title="Modifier la tâche"
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
          setEditingTask(null);
        }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="Nom de la tâche"
            rules={[{ required: true, message: 'Veuillez entrer un nom' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priorité"
            rules={[{ required: true, message: 'Veuillez sélectionner une priorité' }]}
          >
            <Select>
              <Option value="high">Haute</Option>
              <Option value="medium">Moyenne</Option>
              <Option value="low">Basse</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="duration"
            label="Durée estimée (minutes)"
            rules={[{ required: true, message: 'Veuillez entrer une durée' }]}
          >
            <InputNumber min={1} max={480} />
          </Form.Item>

          <Form.Item
            name="deadline"
            label="Date limite"
            rules={[{ required: true, message: 'Veuillez sélectionner une date' }]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            name="category"
            label="Catégorie"
            rules={[{ required: true, message: 'Veuillez sélectionner une catégorie' }]}
          >
            <Select>
              <Option value="work">Travail</Option>
              <Option value="personal">Personnel</Option>
              <Option value="health">Santé</Option>
              <Option value="shopping">Courses</Option>
              <Option value="projects">Projets</Option>
              <Option value="appointments">Rendez-vous</Option>
              <Option value="leisure">Loisirs</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ProductivityAssistant; 