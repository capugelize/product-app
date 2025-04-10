import React from 'react';
import { Card, Space, Typography, Checkbox } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import TaskStatus from './TaskStatus';

const { Text } = Typography;

const Task = ({ task, onToggle, onEdit, onDelete, onStatusChange }) => {
  return (
    <Card
      size="small"
      style={{
        marginBottom: 8,
        backgroundColor: task.completed ? '#f6ffed' : 'white',
        borderLeft: `4px solid ${getStatusColor(task.status)}`
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Checkbox
            checked={task.completed}
            onChange={() => onToggle(task.id)}
          >
            <Text delete={task.completed}>{task.name}</Text>
          </Checkbox>
          <Space>
            <TaskStatus
              status={task.status}
              onChange={(newStatus) => onStatusChange(task.id, newStatus)}
            />
            <EditOutlined onClick={() => onEdit(task)} />
            <DeleteOutlined onClick={() => onDelete(task.id)} />
          </Space>
        </Space>
        {task.description && (
          <Text type="secondary">{task.description}</Text>
        )}
      </Space>
    </Card>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'not_started':
      return '#faad14';
    case 'in_progress':
      return '#1890ff';
    case 'completed':
      return '#52c41a';
    default:
      return '#d9d9d9';
  }
};

export default Task; 