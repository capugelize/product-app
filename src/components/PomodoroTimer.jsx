import { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Progress, Modal, Form, Input, InputNumber } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, SettingOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { usePomodoro } from '../context/PomodoroContext';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const PomodoroTimer = ({ fullWidth = false }) => {
  const { settings, updateSettings } = useAppContext();
  const { 
    activeTask, 
    timeLeft, 
    isRunning, 
    currentStep,
    pausePomodoro, 
    resumePomodoro, 
    stopPomodoro,
    formatTime,
    nextStep,
    previousStep
  } = usePomodoro();
  
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [progressForm] = Form.useForm();

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        // Timer is managed by PomodoroContext
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Timer completion is handled by PomodoroContext
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

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
      stopPomodoro(values.progress);
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

  const totalTime = settings.workTime * 60;
  const progressPercent = (timeLeft / totalTime) * 100;

  if (fullWidth) {
    return (
      <div className="pomodoro-timer-full">
        <Space direction="vertical" align="center" style={{ width: '100%' }}>
          <Title level={2}>
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
            <Button
              type="primary"
              icon={isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={toggleTimer}
              size="large"
              disabled={!activeTask}
            >
              {isRunning ? 'Pause' : 'Start'}
            </Button>
            <Button
              type="default"
              onClick={handleStopTimer}
              size="large"
              disabled={!activeTask}
            >
              Stop & Save Progress
            </Button>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setIsSettingsVisible(true)}
              size="large"
            />
          </Space>
        </Space>
        
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
          >
            <Form.Item
              name="progress"
              label={`Progress for Step ${currentStep}`}
              rules={[{ required: true, message: 'Please describe your progress' }]}
            >
              <Input.TextArea rows={4} placeholder="Describe what you accomplished in this step..." />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        style={{ 
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 300,
          zIndex: 1000,
        }}
      >
        <Space direction="vertical" align="center" style={{ width: '100%' }}>
          <Title level={4}>
            {activeTask ? `Working on: ${activeTask.name}` : 'Select a task'}
          </Title>
          
          {activeTask && (
            <Space direction="vertical" align="center" style={{ marginBottom: 8 }}>
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
            size={120}
          />
          <Space>
            <Button
              type="primary"
              icon={isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={toggleTimer}
              size="large"
              disabled={!activeTask}
            >
              {isRunning ? 'Pause' : 'Start'}
            </Button>
            <Button
              type="default"
              onClick={handleStopTimer}
              size="large"
              disabled={!activeTask}
            >
              Stop & Save
            </Button>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setIsSettingsVisible(true)}
              size="large"
            />
          </Space>
        </Space>
      </Card>

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
        >
          <Form.Item
            name="progress"
            label={`Progress for Step ${currentStep}`}
            rules={[{ required: true, message: 'Please describe your progress' }]}
          >
            <Input.TextArea rows={4} placeholder="Describe what you accomplished in this step..." />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default PomodoroTimer; 