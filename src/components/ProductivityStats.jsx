import React from 'react';
import { Card, Typography, Progress, Space, List } from 'antd';
import { usePomodoro } from '../context/PomodoroContext';

const { Title, Text } = Typography;

const ProductivityStats = ({ taskId }) => {
  const { getTaskTimeSpent, getTaskProgress, getTaskProductivity } = usePomodoro();
  
  const timeSpent = getTaskTimeSpent(taskId);
  const progress = getTaskProgress(taskId);
  const productivity = getTaskProductivity(taskId);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Card title="Productivity Statistics" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>Total Time Spent: </Text>
          <Text>{formatTime(timeSpent.total || 0)}</Text>
        </div>

        <div>
          <Text strong>Average Productivity: </Text>
          <Progress
            percent={productivity.average || 0}
            size="small"
            status={productivity.average >= 70 ? 'success' : productivity.average >= 40 ? 'normal' : 'exception'}
          />
        </div>

        <List
          header={<Text strong>Step-by-Step Progress</Text>}
          dataSource={Object.entries(progress)}
          renderItem={([step, progressText]) => {
            const stepTime = timeSpent[step] || 0;
            const stepProductivity = productivity[step] || 0;
            
            return (
              <List.Item>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>{step}: </Text>
                    <Text>{progressText}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Time: {formatTime(stepTime)}</Text>
                    <Progress
                      percent={stepProductivity}
                      size="small"
                      status={stepProductivity >= 70 ? 'success' : stepProductivity >= 40 ? 'normal' : 'exception'}
                    />
                  </div>
                </Space>
              </List.Item>
            );
          }}
        />
      </Space>
    </Card>
  );
};

export default ProductivityStats; 