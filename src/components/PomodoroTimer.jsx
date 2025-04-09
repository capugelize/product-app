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
    <div className="pomodoro-timer-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card title="Pomodoro Timer" style={{ maxWidth: 800, margin: '0 auto' }}>
          <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <Title level={3}>
              {activeTask ? `Working on: ${activeTask.name}` : 'Select a task to start'}
            </Title>
            
            {activeTask && (
              <Space direction="vertical" align="center" style={{ marginBottom: 16 }}>
                <Text strong>Step {currentStep}</Text>
                <Space>
                  <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={previousStep}
                    disabled={currentStep === 1}
                  />
                  <Button 
                    icon={<ArrowRightOutlined />} 
                    onClick={nextStep}
                  />
                </Space>
              </Space>
            )}

            <Progress
              type="circle"
              percent={progressPercent}
              format={() => formatTime(timeLeft)}
              strokeColor="#1890ff"
              size={200}
            />
            <Space size="large" style={{ marginTop: 24 }}>
              {!activeTask ? (
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSelectTask}
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
                  >
                    {isRunning ? 'Pause' : 'Start'}
                  </Button>
                  <Button
                    type="default"
                    onClick={handleStopTimer}
                    size="large"
                  >
                    Stop & Save Progress
                  </Button>
                </>
              )}
              <Button
                icon={<SettingOutlined />}
                onClick={() => setIsSettingsVisible(true)}
                size="large"
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
            <InputNumber min={1} max={60} />
          </Form.Item>

          <Form.Item
            name="breakTime"
            label="Break Time (minutes)"
            rules={[{ required: true, message: 'Please enter break time' }]}
          >
            <InputNumber min={1} max={60} />
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
            <Select placeholder="Select a task">
              {tasks
                .filter(task => task.status !== 'completed')
                .map(task => (
                  <Option key={task.id} value={task.id}>{task.name}</Option>
                ))
              }
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PomodoroTimer; 