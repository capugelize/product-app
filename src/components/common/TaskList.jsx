import React, { useState } from 'react';
import { List, Radio, Space } from 'antd';
import Task from './Task';
import TaskStatus from './TaskStatus';

const TaskList = ({ tasks, onToggle, onEdit, onDelete, onStatusChange }) => {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTasks = tasks.filter(task => {
    if (statusFilter === 'all') return true;
    return task.status === statusFilter;
  });

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Radio.Group
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          optionType="button"
        >
          <Radio.Button value="all">All</Radio.Button>
          <Radio.Button value="not_started">⏳ Not started</Radio.Button>
          <Radio.Button value="in_progress">🔧 In progress</Radio.Button>
          <Radio.Button value="completed">✅ Completed</Radio.Button>
        </Radio.Group>
      </Space>

      <List
        dataSource={filteredTasks}
        renderItem={task => (
          <List.Item>
            <Task
              task={task}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default TaskList; 