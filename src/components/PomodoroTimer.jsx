import { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Progress, Modal, Form, InputNumber } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';

const { Title } = Typography;

const PomodoroTimer = () => {
  const { settings, updateSettings } = useAppContext();
  const [timeLeft, setTimeLeft] = useState(settings.workTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setIsWorkTime(!isWorkTime);
      setTimeLeft((isWorkTime ? settings.breakTime : settings.workTime) * 60);
      
      // Show notification
      if (settings.notifications && Notification.permission === 'granted') {
        new Notification(isWorkTime ? 'Break Time!' : 'Work Time!', {
          body: isWorkTime 
            ? 'Time for a break!'
            : 'Time to get back to work!',
          icon: '/favicon.ico',
        });
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isWorkTime, settings]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsWorkTime(true);
    setTimeLeft(settings.workTime * 60);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSettingsOk = () => {
    form.validateFields().then(values => {
      updateSettings({
        workTime: values.workTime,
        breakTime: values.breakTime,
      });
      setIsSettingsVisible(false);
      resetTimer();
    });
  };

  const requestNotificationPermission = () => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const totalTime = isWorkTime ? settings.workTime * 60 : settings.breakTime * 60;
  const progressPercent = (timeLeft / totalTime) * 100;

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
            {isWorkTime ? 'Work Time' : 'Break Time'}
          </Title>
          <Progress
            type="circle"
            percent={progressPercent}
            format={() => formatTime(timeLeft)}
            strokeColor={isWorkTime ? '#1890ff' : '#52c41a'}
            size={120}
          />
          <Space>
            <Button
              type="primary"
              icon={isActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={toggleTimer}
              size="large"
            >
              {isActive ? 'Pause' : 'Start'}
            </Button>
            <Button onClick={resetTimer} size="large">
              Reset
            </Button>
            <Button
              icon={<SettingOutlined />}
              onClick={() => {
                setIsSettingsVisible(true);
                requestNotificationPermission();
              }}
              size="large"
            />
          </Space>
        </Space>
      </Card>

      <Modal
        title="Pomodoro Settings"
        open={isSettingsVisible}
        onOk={handleSettingsOk}
        onCancel={() => setIsSettingsVisible(false)}
      >
        <Form
          form={form}
          initialValues={{
            workTime: settings.workTime,
            breakTime: settings.breakTime,
          }}
        >
          <Form.Item
            name="workTime"
            label="Work Duration (minutes)"
            rules={[{ required: true, message: 'Please input work duration!' }]}
          >
            <InputNumber min={1} max={60} />
          </Form.Item>
          <Form.Item
            name="breakTime"
            label="Break Duration (minutes)"
            rules={[{ required: true, message: 'Please input break duration!' }]}
          >
            <InputNumber min={1} max={60} />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default PomodoroTimer; 