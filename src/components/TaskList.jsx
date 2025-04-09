import React, { useState } from 'react';
import { List, Card, Button, Modal, Form, Input, Select, DatePicker, Space, message, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { usePomodoro } from '../context/PomodoroContext';
import './TaskItem.css';

const { Option } = Select;
const { Panel } = Collapse;

const TaskList = () => {
  const { tasks, addTask, editTask, deleteTask, updateTaskStatus } = useAppContext();
  const { activeTask, startPomodoro, stopPomodoro, isRunning, getTaskTimeSpent, getTaskProgress } = usePomodoro();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();

  const showModal = (task = null) => {
    setEditingTask(task);
    if (task) {
      form.setFieldsValue({
        name: task.name,
        priority: task.priority,
        category: task.category,
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
        status: 'not_started',
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
      stopPomodoro();
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
              <Option value="work">Work</Option>
              <Option value="personal">Personal</Option>
              <Option value="study">Study</Option>
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