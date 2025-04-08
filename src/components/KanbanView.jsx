import React from 'react';
import { Card, Space, Typography } from 'antd';
import { useAppContext } from '../context/AppContext';
import TaskCard from './TaskCard';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Title } = Typography;

const SortableTaskCard = ({ task, onStatusChange }) => {
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
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        onStatusChange={onStatusChange}
      />
    </div>
  );
};

const KanbanView = () => {
  const { tasks, updateTaskStatus } = useAppContext();

  const statusColumns = [
    { id: 'not_started', title: '⏳ Not Started', color: '#faad14' },
    { id: 'in_progress', title: '🔧 In Progress', color: '#1890ff' },
    { id: 'completed', title: '✅ Completed', color: '#52c41a' }
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const taskId = active.id;
      const newStatus = over.id;
      
      if (statusColumns.some(column => column.id === newStatus)) {
        updateTaskStatus(taskId, newStatus);
      }
    }
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-container" style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '16px' }}>
        {statusColumns.map(column => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <Card
              key={column.id}
              style={{
                minWidth: '300px',
                flex: 1,
                backgroundColor: '#f5f5f5',
                borderLeft: `4px solid ${column.color}`
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={4} style={{ margin: 0 }}>
                  {column.title} ({columnTasks.length})
                </Title>
                <div className="task-list" style={{ minHeight: '200px' }}>
                  <SortableContext
                    items={columnTasks.map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {columnTasks.map(task => (
                      <SortableTaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={(newStatus) => updateTaskStatus(task.id, newStatus)}
                      />
                    ))}
                  </SortableContext>
                </div>
              </Space>
            </Card>
          );
        })}
      </div>
      <DragOverlay>
        {({ active }) => {
          if (active) {
            const task = tasks.find(t => t.id === active.id);
            return task ? <TaskCard task={task} /> : null;
          }
          return null;
        }}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanView; 