import { useState } from 'react';
import { Card, Button, List, Modal, Form, Input, Select, DatePicker, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const { Option } = Select;

const TaskList = () => {
  const { tasks, addTask, updateTask, deleteTask } = useAppContext();
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
        updateTask(taskData);
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
                      {task.deadline && (
                        <div>Deadline: {task.deadline.format('YYYY-MM-DD')}</div>
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
        title={editingTask ? 'Edit Task' : 'Add Task'}
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
          }}
        >
          <Form.Item
            name="name"
            label="Task Name"
            rules={[{ required: true, message: 'Please input task name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select priority!' }]}
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
            rules={[{ required: true, message: 'Please select category!' }]}
          >
            <Select>
              <Option value="work">Work</Option>
              <Option value="personal">Personal</Option>
              <Option value="leisure">Leisure</Option>
            </Select>
          </Form.Item>

          <Form.Item 
            name="deadline" 
            label="Deadline"
            tooltip="Select a date to automatically place the task in the calendar"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TaskList; 