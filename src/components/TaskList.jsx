import { useState } from 'react';
import { Card, Button, List, Modal, Form, Input, Select, DatePicker, Space, message, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const { Option } = Select;

const TaskList = () => {
  const { tasks, addTask, editTask, deleteTask, settings } = useAppContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();

  const showModal = (task = null) => {
    setEditingTask(task);
    if (task) {
      form.setFieldsValue({
        ...task,
        deadline: task.deadline || null,
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
        id: editingTask?.id || Date.now(),
        createdAt: editingTask?.createdAt || new Date().toISOString(),
      };

      if (editingTask) {
        editTask(taskData.id, taskData);
        message.success('Task updated successfully');
      } else {
        addTask(taskData);
        message.success('Task created successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = (taskId) => {
    deleteTask(taskId);
    message.success('Task deleted successfully');
  };

  return (
    <Card
      title="Tasks"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Add Task
        </Button>
      }
    >
      <AnimatePresence>
        <List
          dataSource={tasks}
          renderItem={task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <List.Item
                actions={[
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
                  title={task.name}
                  description={
                    <Space direction="vertical" size="small">
                      <div>Priority: {task.priority}</div>
                      <div>Category: {task.category}</div>
                      <div>Status: {
                        task.status === 'not_started' ? '⏳ Not started' :
                        task.status === 'in_progress' ? '🔧 In progress' :
                        task.status === 'completed' ? '✅ Completed' : 'Unknown'
                      }</div>
                      {task.deadline && (
                        <div>Deadline: {moment(task.deadline).format('YYYY-MM-DD')}</div>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            </motion.div>
          )}
        />
      </AnimatePresence>

      <Modal
        title={editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            priority: 'medium',
            category: 'work',
            notificationTime: '30',
          }}
        >
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
              <Option value="low">Basse</Option>
              <Option value="medium">Moyenne</Option>
              <Option value="high">Haute</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Statut"
            rules={[{ required: true, message: 'Veuillez sélectionner un statut' }]}
          >
            <Select>
              <Option value="not_started">⏳ Not started</Option>
              <Option value="in_progress">🔧 In progress</Option>
              <Option value="completed">✅ Completed</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label="Catégorie"
            rules={[{ required: true, message: 'Veuillez sélectionner une catégorie' }]}
          >
            <Select>
              {settings.categories?.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="deadline"
            label="Date limite"
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Durée estimée (minutes)"
            rules={[{ required: true, message: 'Veuillez entrer une durée' }]}
          >
            <InputNumber min={1} max={480} className="w-full" />
          </Form.Item>

          <Form.Item
            name="notificationTime"
            label="Notification avant l'échéance"
            tooltip="Choisissez quand vous souhaitez être notifié avant l'échéance"
          >
            <Select>
              <Option value="5">5 minutes avant</Option>
              <Option value="15">15 minutes avant</Option>
              <Option value="30">30 minutes avant</Option>
              <Option value="60">1 heure avant</Option>
              <Option value="120">2 heures avant</Option>
              <Option value="1440">1 jour avant</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TaskList; 