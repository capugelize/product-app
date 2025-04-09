import React, { useState } from 'react';
import { Card, Table, Typography, Space, Progress, Tag, Tabs, List, Empty, Alert } from 'antd';
import { useAppContext } from '../context/AppContext';
import { usePomodoro } from '../context/PomodoroContext';
import moment from 'moment';
import ProductivityStats from './ProductivityStats';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Analysis = () => {
  const { tasks } = useAppContext();
  const { taskTimeSpent, taskProgress, taskProductivity, getTaskStepDescription } = usePomodoro();
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
          <Text strong>Total: {timeSpent.total || 0} minutes</Text>
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
      render: (progress, record) => (
        <Space direction="vertical">
          {Object.entries(progress).map(([step, value]) => {
            const description = getTaskStepDescription(record.key, step.replace('step', ''));
            return (
              <div key={step}>
                <Text strong>{step}</Text>
                <Progress
                  percent={parseInt(value) || 0}
                  size="small"
                  status={parseInt(value) === 100 ? 'success' : 'active'}
                />
                {description && (
                  <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                    {description}
                  </Text>
                )}
              </div>
            );
          })}
        </Space>
      ),
    },
    {
      title: 'Productivity',
      dataIndex: 'productivity',
      key: 'productivity',
      render: (productivity) => (
        <Progress
          percent={productivity.average || 0}
          size="small"
          status={productivity.average >= 70 ? 'success' : productivity.average >= 40 ? 'normal' : 'exception'}
        />
      ),
    },
  ];

  const data = tasks.map(task => ({
    key: task.id,
    name: task.name,
    priority: task.priority,
    category: task.category,
    status: task.status,
    timeSpent: taskTimeSpent[task.id] || {},
    progress: taskProgress[task.id] || {},
    productivity: taskProductivity[task.id] || { average: 0 },
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

  const hasData = Object.keys(taskTimeSpent).length > 0;

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {!hasData && (
        <Alert
          message="No Analysis Data Available"
          description="Start using the Pomodoro timer with your tasks to generate analysis data."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {hasData && (
        <>
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
              <Table
                columns={columns}
                dataSource={data}
                onRow={(record) => ({
                  onClick: () => setActiveTaskId(record.key),
                  style: { cursor: 'pointer' }
                })}
                rowClassName={(record) => record.key === activeTaskId ? 'selected-row' : ''}
              />
            </TabPane>
            <TabPane tab="Detailed Analysis" key="2">
              {activeTaskId ? (
                <ProductivityStats taskId={activeTaskId} />
              ) : (
                <Empty
                  description={
                    <Text>
                      Select a task from the overview to see detailed statistics
                    </Text>
                  }
                />
              )}
            </TabPane>
          </Tabs>
        </>
      )}
    </Space>
  );
};

export default Analysis; 