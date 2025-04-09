import React from 'react';
import { Card, Row, Col, Typography, Space, Progress, Tag } from 'antd';
import { useAppContext } from '../context/AppContext';
import { usePomodoro } from '../context/PomodoroContext';
import moment from 'moment';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { tasks } = useAppContext();
  const { taskTimeSpent, taskProgress, taskProductivity, getTaskStepDescription } = usePomodoro();

  const getTotalProductivity = () => {
    const tasks = Object.entries(taskProductivity);
    if (tasks.length === 0) return 0;
    
    const total = tasks.reduce((sum, [_, data]) => {
      return sum + (data.average || 0);
    }, 0);
    
    return Math.round(total / tasks.length);
  };

  const getTaskStats = () => {
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      notStarted: tasks.filter(t => t.status === 'not_started').length,
    };

    return {
      ...stats,
      completionRate: Math.round((stats.completed / stats.total) * 100) || 0,
    };
  };

  const getTimeStats = () => {
    const totalTime = Object.values(taskTimeSpent).reduce((sum, data) => sum + (data.total || 0), 0);
    const hours = Math.floor(totalTime / 60);
    const minutes = totalTime % 60;

    return {
      totalTime,
      formattedTime: `${hours}h ${minutes}m`,
      sessions: Object.keys(taskTimeSpent).length,
    };
  };

  const getRecentTasks = () => {
    return tasks
      .sort((a, b) => moment(b.deadline).valueOf() - moment(a.deadline).valueOf())
      .slice(0, 5);
  };

  const getPriorityStats = () => {
    return {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };
  };

  const taskStats = getTaskStats();
  const timeStats = getTimeStats();
  const priorityStats = getPriorityStats();
  const recentTasks = getRecentTasks();

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Dashboard Overview</Title>
      
      <Row gutter={[16, 16]}>
        {/* Task Statistics */}
        <Col span={8}>
          <Card title="Task Statistics">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Total Tasks: </Text>
                <Text>{taskStats.total}</Text>
              </div>
              <div>
                <Text strong>Completion Rate: </Text>
                <Progress percent={taskStats.completionRate} size="small" />
              </div>
              <div>
                <Text strong>Status Distribution: </Text>
                <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
                  <div>
                    <Tag color="success">Completed: {taskStats.completed}</Tag>
                  </div>
                  <div>
                    <Tag color="processing">In Progress: {taskStats.inProgress}</Tag>
                  </div>
                  <div>
                    <Tag color="default">Not Started: {taskStats.notStarted}</Tag>
                  </div>
                </Space>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Time Tracking */}
        <Col span={8}>
          <Card title="Time Tracking">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Total Time Spent: </Text>
                <Text>{timeStats.formattedTime}</Text>
              </div>
              <div>
                <Text strong>Pomodoro Sessions: </Text>
                <Text>{timeStats.sessions}</Text>
              </div>
              <div>
                <Text strong>Overall Productivity: </Text>
                <Progress
                  percent={getTotalProductivity()}
                  status={getTotalProductivity() >= 70 ? 'success' : getTotalProductivity() >= 40 ? 'normal' : 'exception'}
                />
              </div>
            </Space>
          </Card>
        </Col>

        {/* Priority Overview */}
        <Col span={8}>
          <Card title="Priority Overview">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>High Priority: </Text>
                <Tag color="red">{priorityStats.high}</Tag>
              </div>
              <div>
                <Text strong>Medium Priority: </Text>
                <Tag color="orange">{priorityStats.medium}</Tag>
              </div>
              <div>
                <Text strong>Low Priority: </Text>
                <Tag color="green">{priorityStats.low}</Tag>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Recent Tasks */}
        <Col span={24}>
          <Card title="Recent Tasks">
            <Row gutter={[16, 16]}>
              {recentTasks.map(task => (
                <Col span={8} key={task.id}>
                  <Card size="small">
                    <Space direction="vertical">
                      <Text strong>{task.name}</Text>
                      <Space>
                        <Tag color={
                          task.priority === 'high' ? 'red' :
                          task.priority === 'medium' ? 'orange' : 'green'
                        }>
                          {task.priority}
                        </Tag>
                        <Tag color={
                          task.status === 'completed' ? 'success' :
                          task.status === 'in_progress' ? 'processing' : 'default'
                        }>
                          {task.status}
                        </Tag>
                      </Space>
                      {task.deadline && (
                        <Text type="secondary">
                          Deadline: {moment(task.deadline).format('YYYY-MM-DD HH:mm')}
                        </Text>
                      )}
                      {taskProgress[task.id] && (
                        <Progress
                          percent={Object.values(taskProgress[task.id]).reduce((a, b) => a + b, 0) / Object.keys(taskProgress[task.id]).length}
                          size="small"
                        />
                      )}
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 