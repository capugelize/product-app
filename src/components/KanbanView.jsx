import React from 'react';
import { Card, Space, Typography } from 'antd';
import { useAppContext } from '../context/AppContext';
import TaskCard from './TaskCard';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Title } = Typography;

const SortableTaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
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
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />
    </div>
  );
};

const KanbanView = ({ 
  tasks = [], 
  aiSortedTasks = [], 
  useSortedTasks = false,
  onEdit,
  onDelete
}) => {
  const { updateTaskStatus } = useAppContext();
  
  // Utiliser les tâches triées par l'IA si l'option est activée
  const displayedTasks = useSortedTasks ? aiSortedTasks : tasks;

  const statusColumns = [
    { id: 'not_started', title: '⏳ À faire', color: '#faad14' },
    { id: 'in_progress', title: '🔧 En cours', color: '#1890ff' },
    { id: 'completed', title: '✅ Terminé', color: '#52c41a' }
  ];

  const getTasksByStatus = (status) => {
    return displayedTasks.filter(task => task.status === status);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const taskId = active.id;
    const newStatus = over.id;
    
    if (statusColumns.some(column => column.id === newStatus)) {
      updateTaskStatus(taskId, newStatus);
    }
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-container" style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '16px', maxHeight: 'calc(100vh - 200px)' }}>
        {statusColumns.map(column => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <Card
              key={column.id}
              title={
                <div className="flex items-center">
                  <span>{column.title}</span>
                  <span className="ml-2 text-gray-500 text-sm">({columnTasks.length})</span>
                </div>
              }
              style={{
                minWidth: '330px',
                flex: 1,
                backgroundColor: '#f9f9f9',
                borderLeft: `4px solid ${column.color}`,
                borderRadius: '6px',
                overflow: 'hidden'
              }}
              bodyStyle={{ 
                padding: '12px', 
                maxHeight: 'calc(100vh - 280px)',
                overflow: 'auto'
              }}
              headStyle={{
                backgroundColor: '#f0f0f0',
                borderBottom: '1px solid #e8e8e8'
              }}
            >
              <SortableContext
                items={columnTasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
              >
                {columnTasks.map(task => (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => onEdit(task)}
                    onDelete={() => onDelete(task.id)}
                    onStatusChange={(newStatus) => updateTaskStatus(task.id, newStatus)}
                  />
                ))}
              </SortableContext>
              
              {columnTasks.length === 0 && (
                <div className="flex justify-center items-center p-4 text-gray-400" style={{ minHeight: '100px' }}>
                  Aucune tâche
                </div>
              )}
            </Card>
          );
        })}
      </div>
      <DragOverlay>
        {({ active }) => {
          if (active) {
            const task = displayedTasks.find(t => t.id === active.id);
            return task ? <TaskCard task={task} /> : null;
          }
          return null;
        }}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanView; 