import { useState, useMemo } from 'react';
import { Card, Calendar, Space, Row, Col, Empty } from 'antd';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAppContext } from '../context/AppContext';
import TaskItem from './TaskItem';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarView = () => {
  const { tasks, updateTask, settings } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over.id) {
      const activeTask = tasks.find(task => task.id === active.id);
      const overTask = tasks.find(task => task.id === over.id);
      
      if (activeTask && overTask) {
        const activeIndex = tasks.indexOf(activeTask);
        const overIndex = tasks.indexOf(overTask);
        
        const newTasks = [...tasks];
        newTasks[activeIndex] = overTask;
        newTasks[overIndex] = activeTask;
        
        newTasks.forEach((task, index) => {
          updateTask({ ...task, order: index });
        });
      }
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(task => task.id === active.id);
    if (activeTask) {
      updateTask({
        ...activeTask,
        deadline: selectedDate,
      });
    }
  };

  const filteredTasks = useMemo(() => {
    if (!selectedDate) return [];
    
    return tasks
      .filter(task => task.deadline?.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD'))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [tasks, selectedDate]);

  const renderCalendar = () => {
    switch (settings.viewMode) {
      case 'day':
        return (
          <Calendar
            onSelect={setSelectedDate}
            value={selectedDate}
            mode="month"
            fullscreen={false}
            dateCellRender={(date) => {
              const dateTasks = tasks.filter(task => 
                task.deadline?.format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
              );
              return dateTasks.length > 0 ? (
                <div className="calendar-task-indicator">
                  {dateTasks.length} task{dateTasks.length > 1 ? 's' : ''}
                </div>
              ) : null;
            }}
          />
        );
      case 'week':
        return (
          <Calendar
            onSelect={setSelectedDate}
            value={selectedDate}
            mode="month"
            fullscreen={false}
          />
        );
      case 'month':
        return (
          <Calendar
            onSelect={setSelectedDate}
            value={selectedDate}
            mode="month"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card title="Schedule">
      <Space direction="vertical" style={{ width: '100%' }}>
        {renderCalendar()}
        
        {selectedDate && (
          <div className="calendar-tasks-container">
            <h3>Tasks for {selectedDate.format('YYYY-MM-DD')}</h3>
            {filteredTasks.length > 0 ? (
              <DndContext
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
              >
                <SortableContext
                  items={filteredTasks.map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <AnimatePresence>
                    {filteredTasks.map(task => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TaskItem task={task} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </SortableContext>
                <DragOverlay>
                  {activeId ? (
                    <TaskItem task={tasks.find(task => task.id === activeId)} />
                  ) : null}
                </DragOverlay>
              </DndContext>
            ) : (
              <Empty description="No tasks scheduled for this day" />
            )}
          </div>
        )}
      </Space>
    </Card>
  );
};

export default CalendarView; 