import React, { useState } from 'react';
import { Card, Table, Typography, Space, Progress, Tag, Tabs, List } from 'antd';
import { useAppContext } from '../context/AppContext';
import { usePomodoro } from '../context/PomodoroContext';
import moment from 'moment';
import ProductivityStats from './ProductivityStats';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Analysis = () => {
  const { tasks } = useAppContext();
  const { taskTimeSpent, taskProgress, taskProductivity } = usePomodoro();
  const [activeTaskId, setActiveTaskId] = useState(null);

  const columns = [
    {
      title: 'Task Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical">
          <Text strong>{text}</Text>
          <Space>
            <Tag color={record.priority === 'high' ? 'red' : record.priority === 'medium' ? 'orange' : 'green'}>
              {record.priority}
            </Tag>
            <Tag>{record.category}</Tag>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'success' :
          status === 'in_progress' ? 'processing' :
          'default'
        }>
          {status === 'completed' ? '✅ Completed' :
           status === 'in_progress' ? '🔧 In Progress' :
           '⏳ Not Started'}
        </Tag>
      ),
    },
    {
      title: 'Time Spent',
      dataIndex: 'timeSpent',
      key: 'timeSpent',
      render: (timeSpent) => (
        <Space direction="vertical">
          <Text strong>Total: {timeSpent.total} minutes</Text>
          {Object.entries(timeSpent)
            .filter(([key]) => key.startsWith('step'))
            .map(([step, minutes]) => (
              <Text key={step} type="secondary">
                {step}: {minutes} minutes
              </Text>
            ))}
        </Space>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Space direction="vertical">
          {Object.entries(progress).map(([step, value]) => (
            <div key={step}>
              <Text strong>{step}</Text>
              <Progress
                percent={parseInt(value) || 0}
                size="small"
                status={parseInt(value) === 100 ? 'success' : 'active'}
              />
            </div>
          ))}
        </Space>
      ),
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (deadline) => (
        deadline ? (
          <Text type={moment(deadline).isBefore(moment()) ? 'danger' : 'secondary'}>
            {moment(deadline).format('YYYY-MM-DD HH:mm')}
          </Text>
        ) : '-'
      ),
    },
  ];

  const data = tasks.map(task => ({
    key: task.id,
    name: task.name,
    priority: task.priority,
    category: task.category,
    status: task.status,
    deadline: task.deadline,
    timeSpent: taskTimeSpent[task.id] || {},
    progress: taskProgress[task.id] || {},
  }));

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getTotalProductivity = () => {
    const tasks = Object.entries(taskProductivity);
    if (tasks.length === 0) return 0;
    
    const total = tasks.reduce((sum, [_, data]) => {
      return sum + (data.average || 0);
    }, 0);
    
    return Math.round(total / tasks.length);
  };

  const getTaskList = () => {
    return Object.entries(taskTimeSpent).map(([taskId, data]) => ({
      taskId,
      timeSpent: data,
      productivity: taskProductivity[taskId] || { average: 0 },
      progress: taskProgress[taskId] || {}
    }));
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card>
        <Title level={3}>Overall Productivity</Title>
        <Progress
          percent={getTotalProductivity()}
          size="large"
          status={getTotalProductivity() >= 70 ? 'success' : getTotalProductivity() >= 40 ? 'normal' : 'exception'}
        />
        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
          Based on {Object.keys(taskProductivity).length} completed tasks
        </Text>
      </Card>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Tasks Overview" key="1">
          <List
            dataSource={getTaskList()}
            renderItem={({ taskId, timeSpent, productivity }) => (
              <List.Item
                onClick={() => setActiveTaskId(taskId)}
                style={{ cursor: 'pointer' }}
              >
                <Card style={{ width: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Task ID: {taskId}</Text>
                    <Text>Total Time: {formatTime(timeSpent.total || 0)}</Text>
                    <Progress
                      percent={productivity.average || 0}
                      size="small"
                      status={productivity.average >= 70 ? 'success' : productivity.average >= 40 ? 'normal' : 'exception'}
                    />
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        </TabPane>
        <TabPane tab="Detailed Analysis" key="2">
          {activeTaskId ? (
            <ProductivityStats taskId={activeTaskId} />
          ) : (
            <Text>Select a task from the overview to see detailed statistics</Text>
          )}
        </TabPane>
      </Tabs>
    </Space>
  );
};

export default Analysis; 