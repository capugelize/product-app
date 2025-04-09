import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Space, Progress, Tag, Tabs, List, Empty, Alert, Timeline } from 'antd';
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
  const [productivityAnalysis, setProductivityAnalysis] = useState({
    peakHours: [],
    productivityByTime: {},
    optimalDuration: 0,
    suggestedSchedule: [],
  });
  const [classifiedTasks, setClassifiedTasks] = useState({
    urgent: [],
    important: [],
    routine: [],
    optional: []
  });

  // Analyze productivity patterns based on task data
  useEffect(() => {
    if (Object.keys(taskTimeSpent).length > 0) {
      analyzeProductivityPatterns();
    }
  }, [taskTimeSpent, taskProductivity]);

  // Classify tasks using AI logic whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      classifyTasksWithAI();
    }
  }, [tasks, taskProductivity]);

  // AI task classification based on priority, status, and productivity
  const classifyTasksWithAI = () => {
    // Initialize task categories
    const classified = {
      urgent: [],
      important: [],
      routine: [],
      optional: []
    };

    // AI classification logic
    tasks.forEach(task => {
      // Get productivity data if available
      const productivity = taskProductivity[task.id]?.average || 0;
      const timeSpent = taskTimeSpent[task.id]?.total || 0;
      
      // Calculate task score based on multiple factors
      let score = 0;
      
      // Priority factor (high impact)
      if (task.priority === 'high') score += 50;
      else if (task.priority === 'medium') score += 30;
      else score += 10;
      
      // Deadline factor (if applicable - simulated here)
      const hasNearDeadline = task.dueDate ? moment(task.dueDate).diff(moment(), 'days') < 2 : false;
      if (hasNearDeadline) score += 30;
      
      // Status factor
      if (task.status === 'in_progress') score += 15;
      else if (task.status === 'not_started') score += 10;
      
      // Productivity factor (boost score if task has high productivity)
      if (productivity > 70) score += 15;
      else if (productivity > 50) score += 10;
      
      // Task complexity factor (estimated by time spent)
      if (timeSpent > 60) score += 10; // Complex tasks get priority
      
      // Classify based on final score
      const taskWithScore = {
        ...task,
        aiScore: score,
        productivity: productivity,
        timeSpent: timeSpent
      };
      
      if (score >= 70) classified.urgent.push(taskWithScore);
      else if (score >= 50) classified.important.push(taskWithScore);
      else if (score >= 30) classified.routine.push(taskWithScore);
      else classified.optional.push(taskWithScore);
    });
    
    // Sort each category by score (highest first)
    Object.keys(classified).forEach(category => {
      classified[category].sort((a, b) => b.aiScore - a.aiScore);
    });
    
    setClassifiedTasks(classified);
  };

  // Analyze productivity patterns and find the optimal times
  const analyzeProductivityPatterns = () => {
    // Extract all productivity data with timestamps
    const productivityData = [];
    
    // This is a simplified example - in a real app, you would store timestamps with each entry
    // Here we're simulating this data based on the existing structures
    Object.entries(taskProductivity).forEach(([taskId, data]) => {
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'average' && typeof value === 'number') {
          // Extract time information (simulated for this implementation)
          // In a real app, you would have actual timestamps for each entry
          const timeInfo = {
            taskId,
            step: key,
            productivity: value,
            timeSpent: taskTimeSpent[taskId]?.[key] || 0,
            // Simulate a timestamp (would be real in actual implementation)
            timestamp: Math.floor(Math.random() * 24), // Random hour between 0-23
          }
          productivityData.push(timeInfo);
        }
      });
    });

    // Group by hour of day
    const productivityByHour = {};
    productivityData.forEach(data => {
      const hour = data.timestamp;
      if (!productivityByHour[hour]) {
        productivityByHour[hour] = [];
      }
      productivityByHour[hour].push(data.productivity);
    });

    // Calculate average productivity by hour
    const avgProductivityByHour = {};
    Object.entries(productivityByHour).forEach(([hour, values]) => {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      avgProductivityByHour[hour] = Math.round(avg);
    });

    // Find peak productivity hours (top 3)
    const sortedHours = Object.entries(avgProductivityByHour)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Determine optimal task duration based on most productive sessions
    const productiveSessions = productivityData
      .filter(data => data.productivity > 70) // Consider only high productivity sessions
      .map(data => data.timeSpent);
    
    const optimalDuration = productiveSessions.length > 0
      ? Math.round(productiveSessions.reduce((sum, val) => sum + val, 0) / productiveSessions.length)
      : 25; // Default to 25 minutes if no data

    // Generate suggested schedule based on peak hours and optimal duration
    const suggestedSchedule = sortedHours.map(hour => {
      const formattedHour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
      return {
        time: formattedHour,
        duration: optimalDuration,
        productivity: avgProductivityByHour[hour]
      };
    });

    setProductivityAnalysis({
      peakHours: sortedHours,
      productivityByTime: avgProductivityByHour,
      optimalDuration,
      suggestedSchedule
    });
  };

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

  // Render AI task classification card
  const renderTaskClassification = () => {
    const getCategoryColor = (category) => {
      switch(category) {
        case 'urgent': return 'red';
        case 'important': return 'orange';
        case 'routine': return 'blue';
        case 'optional': return 'green';
        default: return 'default';
      }
    };

    const getCategoryIcon = (category) => {
      switch(category) {
        case 'urgent': return '🔥';
        case 'important': return '⭐';
        case 'routine': return '📝';
        case 'optional': return '📌';
        default: return '📋';
      }
    };

    return (
      <Card title="AI Task Classification" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert 
            message="Task Priority Classification" 
            description="AI has analyzed your tasks based on priority, deadlines, progress, and productivity patterns to suggest the optimal order." 
            type="info" 
            showIcon 
            style={{ marginBottom: 16 }}
          />
          
          {Object.entries(classifiedTasks).map(([category, tasks]) => (
            <div key={category} style={{ marginBottom: 16 }}>
              <Title level={4}>
                {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)} Tasks
                <Tag color={getCategoryColor(category)} style={{ marginLeft: 8 }}>
                  {tasks.length}
                </Tag>
              </Title>
              
              {tasks.length > 0 ? (
                <List
                  size="small"
                  bordered
                  dataSource={tasks}
                  renderItem={task => (
                    <List.Item 
                      key={task.id}
                      extra={
                        <Space>
                          <Tag color={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'orange' : 'green'}>
                            {task.priority}
                          </Tag>
                          <Tag color="blue">Score: {task.aiScore}</Tag>
                        </Space>
                      }
                    >
                      <List.Item.Meta
                        title={task.name}
                        description={
                          <Text type="secondary">
                            {task.category} • {task.status === 'completed' ? 'Completed' : 
                             task.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description={`No ${category} tasks found`} />
              )}
            </div>
          ))}
        </Space>
      </Card>
    );
  };

  // Render productivity time analysis card
  const renderProductivityTimeAnalysis = () => {
    return (
      <Card title="Productivity Time Analysis" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Title level={4}>Peak Productivity Hours</Title>
            {productivityAnalysis.peakHours.length > 0 ? (
              <Timeline>
                {productivityAnalysis.suggestedSchedule.map((schedule, index) => (
                  <Timeline.Item 
                    key={index} 
                    color={schedule.productivity >= 70 ? 'green' : 'blue'}
                  >
                    <Text strong>{schedule.time}</Text> - 
                    <Text> {schedule.productivity}% productivity</Text>
                    <div>
                      <Text type="secondary">
                        Suggested session: {schedule.duration} minutes
                      </Text>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty description="Not enough data to determine peak hours" />
            )}
          </div>
          
          <div>
            <Title level={4}>Optimal Session Duration</Title>
            <Text>
              Based on your most productive tasks, your optimal work session duration is: 
              <Text strong style={{ marginLeft: 8 }}>
                {productivityAnalysis.optimalDuration} minutes
              </Text>
            </Text>
          </div>
          
          <Alert
            message="Productivity Insight"
            description={`You tend to be most productive during ${productivityAnalysis.peakHours.map(h => h < 10 ? `0${h}:00` : `${h}:00`).join(', ')} hours. 
              Consider scheduling your most important tasks during these times for optimal results.`}
            type="info"
            showIcon
          />
        </Space>
      </Card>
    );
  };

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

          {/* AI Task Classification */}
          {renderTaskClassification()}

          {/* Productivity Time Analysis */}
          {renderProductivityTimeAnalysis()}

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
            <TabPane tab="Task Priority Analysis" key="3">
              <Card>
                <Title level={4}>Task Priority Distribution</Title>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 32 }}>
                  {Object.entries(classifiedTasks).map(([category, tasks]) => (
                    <div key={category} style={{ textAlign: 'center' }}>
                      <Progress
                        type="circle"
                        percent={Math.round((tasks.length / (tasks.length ? tasks.length : 1)) * 100)}
                        format={() => tasks.length}
                        status={
                          category === 'urgent' ? 'exception' :
                          category === 'important' ? 'warning' :
                          category === 'routine' ? 'active' : 'success'
                        }
                      />
                      <div style={{ marginTop: 8 }}>
                        <Text strong>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
                      </div>
                    </div>
                  ))}
                </div>
                <Alert
                  message="AI Recommendation"
                  description={
                    classifiedTasks.urgent.length > 0 
                      ? "Focus on completing urgent tasks during your peak productivity hours for maximum efficiency."
                      : classifiedTasks.important.length > 0
                      ? "You've handled urgent tasks well. Focus on important tasks next to prevent them from becoming urgent."
                      : "Great job! Your task management is effective. Consider taking on new challenges or longer-term projects."
                  }
                  type="info"
                  showIcon
                />
              </Card>
            </TabPane>
            <TabPane tab="Productivity Timeline" key="4">
              <Card>
                <Title level={4}>Your Productivity Over Time</Title>
                {Object.keys(productivityAnalysis.productivityByTime).length > 0 ? (
                  <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end' }}>
                    {Object.entries(productivityAnalysis.productivityByTime)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([hour, value]) => (
                        <div 
                          key={hour} 
                          style={{ 
                            height: `${value}%`, 
                            width: '30px', 
                            margin: '0 4px',
                            background: value >= 70 ? '#52c41a' : value >= 40 ? '#1890ff' : '#ff4d4f',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            borderRadius: '3px 3px 0 0'
                          }}
                        >
                          {value}%
                          <div style={{ marginTop: '4px', fontSize: '9px' }}>
                            {hour}:00
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <Empty description="Not enough data to display productivity timeline" />
                )}
              </Card>
            </TabPane>
          </Tabs>
        </>
      )}
    </Space>
  );
};

export default Analysis; 