import React from 'react';
import { Card, Table, Typography, Space, Progress, Tag } from 'antd';
import { useAppContext } from '../context/AppContext';
import { usePomodoro } from '../context/PomodoroContext';
import moment from 'moment';

const { Title, Text } = Typography;

const Analysis = () => {
  const { tasks } = useAppContext();
  const { getTaskTimeSpent, getTaskProgress } = usePomodoro();

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
    timeSpent: getTaskTimeSpent(task.id),
    progress: getTaskProgress(task.id),
  }));

  return (
    <Card>
      <Title level={2}>Task Analysis</Title>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: (record) => (
            <Space direction="vertical" style={{ padding: '16px' }}>
              <Title level={4}>Detailed Progress</Title>
              {Object.entries(record.progress).map(([step, value]) => (
                <Card key={step} size="small" style={{ marginBottom: '8px' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>{step}</Text>
                    <Progress
                      percent={parseInt(value) || 0}
                      status={parseInt(value) === 100 ? 'success' : 'active'}
                    />
                    <Text type="secondary">
                      Time spent: {record.timeSpent[step] || 0} minutes
                    </Text>
                  </Space>
                </Card>
              ))}
            </Space>
          ),
        }}
      />
    </Card>
  );
};

export default Analysis; 