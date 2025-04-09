import { useState, useMemo } from 'react';
import { Card, Calendar, Space, Row, Col, Empty, Timeline, Tag, Button, Modal, Form, TimePicker, Input, InputNumber, Select } from 'antd';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAppContext } from '../context/AppContext';
import TaskItem from './TaskItem';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import { PlusOutlined } from '@ant-design/icons';

const CalendarView = () => {
  const { tasks, updateTask, settings, addTask } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [form] = Form.useForm();

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
      .filter(task => {
        if (!task.deadline) return false;
        const taskDate = moment(task.deadline);
        return taskDate.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD');
      })
      .sort((a, b) => {
        const timeA = moment(a.deadline).format('HH:mm');
        const timeB = moment(b.deadline).format('HH:mm');
        return timeA.localeCompare(timeB);
      });
  }, [tasks, selectedDate]);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'work':
        return '#1890ff';
      case 'personal':
        return '#722ed1';
      case 'health':
        return '#52c41a';
      case 'shopping':
        return '#faad14';
      case 'projects':
        return '#13c2c2';
      case 'appointments':
        return '#eb2f96';
      case 'leisure':
        return '#fa8c16';
      default:
        return '#bfbfbf';
    }
  };

  const renderCalendar = () => {
    switch (settings.viewMode) {
      case 'day':
        return (
          <Calendar
            onSelect={setSelectedDate}
            value={selectedDate}
            mode="month"
            fullscreen={false}
            cellRender={(date) => {
              const dateTasks = tasks.filter(task => 
                task.deadline?.format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
              );
              
              if (dateTasks.length > 0) {
                const categories = [...new Set(dateTasks.map(task => task.category))];
                return (
                  <div className="calendar-task-indicators">
                    {categories.map(category => (
                      <div
                        key={category}
                        className="calendar-task-indicator"
                        style={{
                          backgroundColor: getCategoryColor(category),
                          opacity: 0.2,
                          height: '4px',
                          marginBottom: '2px',
                          borderRadius: '2px'
                        }}
                      />
                    ))}
                  </div>
                );
              }
              return null;
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

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(moment().hour(hour).minute(0));
    }
    return slots;
  };

  const getTasksForTimeSlot = (timeSlot) => {
    return filteredTasks.filter(task => {
      if (!task.deadline) return false;
      const taskTime = moment(task.deadline);
      return taskTime.hour() === timeSlot.hour() && taskTime.minute() === timeSlot.minute();
    });
  };

  const handleAddTask = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    form.setFieldsValue({
      deadline: timeSlot,
    });
    setIsAddTaskModalVisible(true);
  };

  const handleAddTaskSubmit = () => {
    form.validateFields().then(values => {
      const newTask = {
        ...values,
        id: Date.now().toString(),
        status: 'not_started',
        createdAt: moment(),
        deadline: values.deadline,
      };
      addTask(newTask);
      setIsAddTaskModalVisible(false);
      form.resetFields();
    });
  };

  const renderTaskDetails = (task) => {
    const deadline = moment(task.deadline);
    const duration = task.duration || 25;
    const endTime = moment(deadline).add(duration, 'minutes');

    return (
      <div
        style={{
          padding: '8px',
          borderRadius: '4px',
          backgroundColor: `${getCategoryColor(task.category)}20`,
          borderLeft: `4px solid ${getCategoryColor(task.category)}`,
          marginBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>{task.name}</span>
          <Tag color={getCategoryColor(task.category)}>
            {task.category}
          </Tag>
        </div>
        <div style={{ fontSize: '0.8em', color: '#666', marginTop: '4px' }}>
          <div>Heure: {deadline.format('HH:mm')} - {endTime.format('HH:mm')}</div>
          <div>Durée: {duration} minutes</div>
          <div>Priorité: {
            task.priority === 'high' ? 'Haute' :
            task.priority === 'medium' ? 'Moyenne' : 'Basse'
          }</div>
          <div>Statut: {
            task.status === 'not_started' ? '⏳ Non commencé' :
            task.status === 'in_progress' ? '🔧 En cours' :
            task.status === 'completed' ? '✅ Terminé' : 'Inconnu'
          }</div>
        </div>
      </div>
    );
  };

  const renderTimeline = () => {
    const timeSlots = getTimeSlots();
    
    return (
      <div className="timeline-container" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Planning du {selectedDate.format('dddd D MMMM YYYY')}</h3>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAddTask(selectedDate)}
          >
            Ajouter une tâche
          </Button>
        </div>
        <Timeline>
          {timeSlots.map((timeSlot, index) => {
            const tasksForSlot = getTasksForTimeSlot(timeSlot);
            return (
              <Timeline.Item
                key={index}
                color={tasksForSlot.length > 0 ? getCategoryColor(tasksForSlot[0].category) : 'gray'}
              >
                <div className="time-slot" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ minWidth: '60px', fontWeight: 'bold' }}>
                    {timeSlot.format('HH:mm')}
                  </span>
                  <div className="tasks-container" style={{ flex: 1 }}>
                    {tasksForSlot.length > 0 ? (
                      <DndContext
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                      >
                        <SortableContext
                          items={tasksForSlot.map(task => task.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <AnimatePresence>
                            {tasksForSlot.map(task => (
                              <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                              >
                                {renderTaskDetails(task)}
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
                      <div style={{ color: '#999', fontStyle: 'italic' }}>
                        Aucune tâche planifiée
                        <Button
                          type="link"
                          onClick={() => handleAddTask(timeSlot)}
                          style={{ marginLeft: '8px' }}
                        >
                          Ajouter une tâche
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Timeline.Item>
            );
          })}
        </Timeline>

        <Modal
          title="Ajouter une nouvelle tâche"
          open={isAddTaskModalVisible}
          onOk={handleAddTaskSubmit}
          onCancel={() => {
            setIsAddTaskModalVisible(false);
            form.resetFields();
          }}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              priority: 'medium',
              category: 'work',
              duration: 25,
              status: 'not_started',
            }}
          >
            <Form.Item
              name="name"
              label="Nom de la tâche"
              rules={[{ required: true, message: 'Veuillez entrer un nom' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="deadline"
              label="Heure"
              rules={[{ required: true, message: 'Veuillez sélectionner une heure' }]}
            >
              <TimePicker format="HH:mm" />
            </Form.Item>

            <Form.Item
              name="duration"
              label="Durée (minutes)"
              rules={[{ required: true, message: 'Veuillez entrer une durée' }]}
            >
              <InputNumber min={1} max={480} />
            </Form.Item>

            <Form.Item
              name="category"
              label="Catégorie"
              rules={[{ required: true, message: 'Veuillez sélectionner une catégorie' }]}
            >
              <Select>
                {settings.categories?.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="priority"
              label="Priorité"
              rules={[{ required: true, message: 'Veuillez sélectionner une priorité' }]}
            >
              <Select>
                <Option value="low">Basse</Option>
                <Option value="medium">Moyenne</Option>
                <Option value="high">Haute</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };

  return (
    <Card title="Schedule">
      <Space direction="vertical" style={{ width: '100%' }}>
        {renderCalendar()}
        
        {selectedDate && (
          <div className="calendar-tasks-container">
            {filteredTasks.length > 0 ? renderTimeline() : (
              <Empty description="No tasks scheduled for this day" />
            )}
          </div>
        )}
      </Space>
    </Card>
  );
};

export default CalendarView; 