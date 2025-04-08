import { Calendar, List } from 'antd';
import { CalendarDaysIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const Sidebar = () => {
  const { settings, updateSettings, tasks } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(null);

  const onSelect = (date) => {
    setSelectedDate(date);
    updateSettings({ selectedDate: date });
  };

  const getTaskCounts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      today: tasks.filter(task => {
        const taskDate = new Date(task.deadline);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      }).length,
      upcoming: tasks.filter(task => {
        const taskDate = new Date(task.deadline);
        return taskDate > today;
      }).length,
      completed: tasks.filter(task => task.completed).length
    };
  };

  const taskCounts = getTaskCounts();

  return (
    <div className="w-80 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-6">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDaysIcon className="w-6 h-6 text-primary-500" />
        <h2 className="text-xl font-semibold">Calendrier</h2>
      </div>
      
      <Calendar
        fullscreen={false}
        onSelect={onSelect}
        value={selectedDate}
        className="border-0"
      />

      <div className="flex items-center gap-2 mt-4">
        <ListBulletIcon className="w-6 h-6 text-primary-500" />
        <h2 className="text-xl font-semibold">Listes</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <List
          dataSource={[
            { title: "Aujourd'hui", count: taskCounts.today },
            { title: 'À venir', count: taskCounts.upcoming },
            { title: 'Terminées', count: taskCounts.completed },
          ]}
          renderItem={(item) => (
            <div className="sidebar-item">
              <span className="flex-1">{item.title}</span>
              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg text-sm">
                {item.count}
              </span>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default Sidebar; 