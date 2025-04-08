import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

const statusOptions = [
  { value: 'not_started', label: '⏳ Not started', color: '#faad14' },
  { value: 'in_progress', label: '🔧 In progress', color: '#1890ff' },
  { value: 'completed', label: '✅ Completed', color: '#52c41a' }
];

const TaskStatus = ({ status, onChange }) => {
  return (
    <Select
      value={status}
      onChange={onChange}
      style={{ width: 150 }}
      dropdownStyle={{ minWidth: 150 }}
    >
      {statusOptions.map(option => (
        <Option key={option.value} value={option.value}>
          <span style={{ color: option.color }}>{option.label}</span>
        </Option>
      ))}
    </Select>
  );
};

export default TaskStatus; 