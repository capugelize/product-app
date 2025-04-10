import { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Progress, Modal, Form, Input, InputNumber, Select } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, SettingOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { usePomodoro } from '../context/PomodoroContext';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { Option } = Select;

const PomodoroTimer = () => {
  const { tasks, settings, updateSettings } = useAppContext();
  const { 
    activeTask, 
    timeLeft, 
    isRunning, 
    currentStep,
    startPomodoro,
    pausePomodoro, 
    resumePomodoro, 
    stopPomodoro,
    formatTime,
    nextStep,
    previousStep
  } = usePomodoro();
  
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
  const [isTaskSelectVisible, setIsTaskSelectVisible] = useState(false);
  const [form] = Form.useForm();
  const [progressForm] = Form.useForm();
  const [taskForm] = Form.useForm();

  const toggleTimer = () => {
    if (isRunning) {
      pausePomodoro();
    } else {
      resumePomodoro();
    }
  };

  const handleStopTimer = () => {
    setIsProgressModalVisible(true);
  };

  const handleProgressSubmit = () => {
    progressForm.validateFields().then(values => {
      stopPomodoro(values.progress, values.description);
      setIsProgressModalVisible(false);
      progressForm.resetFields();
    });
  };

  const handleSettingsOk = () => {
    form.validateFields().then(values => {
      updateSettings({
        ...settings,
        workTime: values.workTime,
        breakTime: values.breakTime,
      });
      setIsSettingsVisible(false);
    });
  };

  const handleSelectTask = () => {
    setIsTaskSelectVisible(true);
  };

  const handleTaskSubmit = () => {
    taskForm.validateFields().then(values => {
      const selectedTask = tasks.find(task => task.id === values.taskId);
      if (selectedTask) {
        startPomodoro(selectedTask);
      }
      setIsTaskSelectVisible(false);
    });
  };

  const totalTime = settings.workTime * 60;
  const progressPercent = (timeLeft / totalTime) * 100;

  return (
    <div className="pomodoro-timer-container" style={{ padding: '24px 0' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          title={<Title level={3} style={{ margin: 0, textAlign: 'center' }}>Pomodoro Timer</Title>} 
          style={{ 
            maxWidth: 850, 
            margin: '0 auto',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)'
          }}
          bodyStyle={{ padding: '32px 24px' }}
        >
          <Space direction="vertical" align="center" style={{ width: '100%', gap: '24px' }}>
            <Title level={3} style={{ marginTop: 0, marginBottom: '8px', textAlign: 'center' }}>
              {activeTask ? `Working on: ${activeTask.name}` : 'Select a task to start'}
            </Title>
            
            {activeTask && (
              <Space direction="vertical" align="center" style={{ marginBottom: '24px' }}>
                <Text strong style={{ fontSize: '16px', marginBottom: '12px' }}>Step {currentStep}</Text>
                <Space size="middle">
                  <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={previousStep}
                    disabled={currentStep === 1}
                    size="large"
                  />
                  <Button 
                    icon={<ArrowRightOutlined />} 
                    onClick={nextStep}
                    size="large"
                  />
                </Space>
              </Space>
            )}

            <Progress
              type="circle"
              percent={progressPercent}
              format={() => (
                <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '36px', fontWeight: 'bold' }}>{formatTime(timeLeft)}</span>
                  {isRunning && <Text type="secondary" style={{ marginTop: '8px' }}>Running</Text>}
                </div>
              )}
              strokeColor="#1890ff"
              size={240}
              strokeWidth={6}
            />

            <Space size="large" style={{ marginTop: '32px' }}>
              {!activeTask ? (
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSelectTask}
                  style={{ height: '46px', padding: '0 28px', fontSize: '16px' }}
                >
                  Select Task
                </Button>
              ) : (
                <>
                  <Button
                    type="primary"
                    icon={isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={toggleTimer}
                    size="large"
                    style={{ height: '46px', padding: '0 28px', fontSize: '16px' }}
                  >
                    {isRunning ? 'Pause' : 'Start'}
                  </Button>
                  <Button
                    type="default"
                    onClick={handleStopTimer}
                    size="large"
                    style={{ height: '46px', padding: '0 28px', fontSize: '16px' }}
                  >
                    Stop & Save Progress
                  </Button>
                </>
              )}
              <Button
                icon={<SettingOutlined />}
                onClick={() => setIsSettingsVisible(true)}
                size="large"
                style={{ height: '46px', width: '46px' }}
              />
            </Space>
          </Space>
        </Card>
      </motion.div>
        
      {/* Settings Modal */}
      <Modal
        title="Pomodoro Settings"
        open={isSettingsVisible}
        onOk={handleSettingsOk}
        onCancel={() => {
          form.resetFields();
          setIsSettingsVisible(false);
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            workTime: settings.workTime,
            breakTime: settings.breakTime,
          }}
        >
          <Form.Item
            name="workTime"
            label="Work Time (minutes)"
            rules={[{ required: true, message: 'Please enter work time' }]}
          >
            <InputNumber min={1} max={60} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="breakTime"
            label="Break Time (minutes)"
            rules={[{ required: true, message: 'Please enter break time' }]}
          >
            <InputNumber min={1} max={60} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Progress Modal */}
      <Modal
        title="Save Progress"
        open={isProgressModalVisible}
        onOk={handleProgressSubmit}
        onCancel={() => {
          setIsProgressModalVisible(false);
          progressForm.resetFields();
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Form
          form={progressForm}
          layout="vertical"
          initialValues={{
            progress: 50
          }}
        >
          <Form.Item
            name="progress"
            label={`Progress for Step ${currentStep} (%)`}
            rules={[{ required: true, message: 'Please enter progress percentage' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Detailed Description"
            rules={[{ required: true, message: 'Please provide a detailed description' }]}
          >
            <Input.TextArea rows={6} placeholder="Provide a detailed description of what you did in this step..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Task Selection Modal */}
      <Modal
        title="Select a Task"
        open={isTaskSelectVisible}
        onOk={handleTaskSubmit}
        onCancel={() => {
          setIsTaskSelectVisible(false);
          taskForm.resetFields();
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Form
          form={taskForm}
          layout="vertical"
        >
          <Form.Item
            name="taskId"
            label="Choose a Task"
            rules={[{ required: true, message: 'Please select a task' }]}
          >
            <Select placeholder="Select a task" size="large" style={{ width: '100%' }}>
              {tasks
                .filter(task => task.status !== 'completed')
                .map(task => (
                  <Option key={task.id} value={task.id}>{task.name}</Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PomodoroTimer; 