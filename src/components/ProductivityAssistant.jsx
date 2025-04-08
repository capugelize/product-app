import React, { useState } from 'react';
import { Card, Typography, List, Tag, Space, Button, Modal, Form, InputNumber, Select, DatePicker, TimePicker } from 'antd';
import moment from 'moment';
import 'moment/locale/fr';

const { Title, Text } = Typography;
const { Option } = Select;

const ProductivityAssistant = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

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

    // Sort tasks by priority and deadline
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return moment(a.deadline).diff(moment(b.deadline));
    });

    for (const task of sortedTasks) {
      const duration = calculatePomodoroBlocks(task.duration);
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
        title: task.name,
        start: currentTime.format('HH:mm'),
        end: endTime.format('HH:mm'),
        date: currentTime.format('YYYY-MM-DD'),
        pomodoro: true,
        priority: task.priority,
        duration: task.duration
      });

      currentTime = endTime;
    }

    return schedule;
  };

  const handleAddTask = () => {
    form.validateFields().then(values => {
      const newTask = {
        ...values,
        deadline: values.deadline.format('YYYY-MM-DD'),
        duration: values.duration || 25, // Default to one pomodoro
        priority: values.priority || 'medium'
      };
      setTasks([...tasks, newTask]);
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const schedule = generateSchedule(tasks);

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={3}>Assistant de Productivité</Title>
        
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Ajouter une tâche
        </Button>

        <List
          dataSource={schedule}
          renderItem={item => (
            <List.Item>
              <Space direction="vertical">
                <Text strong>{item.title}</Text>
                <Space>
                  <Tag color={item.priority === 'high' ? 'red' : item.priority === 'medium' ? 'orange' : 'green'}>
                    {item.priority}
                  </Tag>
                  <Text>{item.date} {item.start} - {item.end}</Text>
                  <Text type="secondary">({item.duration} min)</Text>
                </Space>
              </Space>
            </List.Item>
          )}
        />
      </Space>

      <Modal
        title="Ajouter une tâche"
        open={isModalVisible}
        onOk={handleAddTask}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Nom de la tâche"
            rules={[{ required: true, message: 'Veuillez entrer un nom' }]}
          >
            <input />
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
        </Form>
      </Modal>
    </Card>
  );
};

export default ProductivityAssistant; 