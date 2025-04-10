import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Progress, Typography } from 'antd';
import { PauseOutlined, PlayCircleOutlined, StopOutlined, ReloadOutlined, StepForwardOutlined } from '@ant-design/icons';
import { usePomodoro } from '../context/PomodoroContext';

const { Title, Text } = Typography;

const Timer = () => {
  const {
    activeTask,
    timeLeft,
    timerRunning,
    timerMode,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimer,
    taskTimeSpent,
    taskProgress
  } = usePomodoro();

  const [timerProgress, setTimerProgress] = useState(0);

  useEffect(() => {
    if (activeTask) {
      const totalSeconds = timerMode === 'work' ? 25 * 60 : 5 * 60; // 25 min for work, 5 min for break
      const progress = Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100);
      setTimerProgress(progress);
    }
  }, [timeLeft, activeTask, timerMode]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get accumulated time for active task
  const getTaskTimeSpentText = () => {
    if (!activeTask || !taskTimeSpent[activeTask.id]) return '00:00';
    const minutes = taskTimeSpent[activeTask.id].total || 0;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}h${mins.toString().padStart(2, '0')}m`;
  };

  // Get task progress
  const getTaskProgressPercent = () => {
    if (!activeTask || !taskProgress[activeTask.id]) return 0;
    
    // Calculate average progress across all sessions
    const progressEntries = Object.entries(taskProgress[activeTask.id] || {});
    if (progressEntries.length === 0) return 0;
    
    const sum = progressEntries.reduce((acc, [_, value]) => acc + value, 0);
    return Math.round(sum / progressEntries.length);
  };

  return (
    <Card 
      title={
        <Title level={4} style={{ margin: 0 }}>
          {activeTask ? (
            timerMode === 'work' ? 
            `Working on: ${activeTask.name}` : 
            `Taking a break after: ${activeTask.name}`
          ) : 'Pomodoro Timer'}
        </Title>
      }
      style={{ marginBottom: 20 }}
    >
      {activeTask ? (
        <>
          <Row justify="center" style={{ marginBottom: 20 }}>
            <Col span={24} style={{ textAlign: 'center' }}>
              <Title level={1} style={{ margin: 0, fontSize: '4rem' }}>{formatTime(timeLeft)}</Title>
              <Text type="secondary">{timerMode === 'work' ? 'Focus time' : 'Break time'}</Text>
            </Col>
          </Row>
          <Row justify="center" style={{ marginBottom: 20 }}>
            <Col span={18}>
              <Progress 
                percent={timerProgress} 
                status={timerMode === 'work' ? 'active' : 'success'} 
                strokeColor={timerMode === 'work' ? '#1890ff' : '#52c41a'} 
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card size="small" title="Task Time">
                <Text strong>{getTaskTimeSpentText()}</Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Task Progress">
                <Progress percent={getTaskProgressPercent()} size="small" />
              </Card>
            </Col>
          </Row>
          <Row justify="center" style={{ marginTop: 20 }}>
            <Col>
              {timerRunning ? (
                <Button 
                  type="primary" 
                  icon={<PauseOutlined />} 
                  onClick={pauseTimer} 
                  size="large"
                >
                  Pause
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />} 
                  onClick={resumeTimer} 
                  size="large"
                >
                  Resume
                </Button>
              )}
              <Button 
                icon={<ReloadOutlined />} 
                onClick={resetTimer} 
                style={{ marginLeft: 8 }}
                size="large"
              >
                Reset
              </Button>
              <Button 
                icon={<StepForwardOutlined />} 
                onClick={skipTimer} 
                style={{ marginLeft: 8 }}
                size="large"
              >
                Skip
              </Button>
            </Col>
          </Row>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Text>Select a task from your list to start a Pomodoro session</Text>
        </div>
      )}
    </Card>
  );
};

export default Timer; 