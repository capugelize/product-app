import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, Tag, Space } from 'antd';

const TaskItem = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'blue';
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card size="small" style={{ marginBottom: 8 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>{task.name}</div>
          <Space>
            <Tag color={getPriorityColor(task.priority)}>
              {task.priority}
            </Tag>
            <Tag color="blue">{task.category}</Tag>
            {task.deadline && (
              <Tag color="purple">
                {task.deadline.format('YYYY-MM-DD')}
              </Tag>
            )}
          </Space>
        </Space>
      </Card>
    </div>
  );
};

export default TaskItem; 