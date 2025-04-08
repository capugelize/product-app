import { motion } from 'framer-motion';
import { Checkbox, Tag, Button } from 'antd';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAppContext } from '../context/AppContext';

const getCategoryIcon = (category) => {
  switch (category) {
    case 'work':
      return '💻';
    case 'personal':
      return '📖';
    case 'health':
      return '🏃‍♂️';
    case 'shopping':
      return '🛒';
    default:
      return '📝';
  }
};

const getCategoryColor = (category) => {
  switch (category) {
    case 'work':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'personal':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'health':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'shopping':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const TaskCard = ({ task, onEdit, onDelete, onToggleComplete }) => {
  const { settings } = useAppContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`task-card ${task.completed ? 'opacity-60' : ''}`}
      style={{ backgroundColor: task.color || 'white' }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onChange={(e) => onToggleComplete(task.id, e.target.checked)}
            className="mt-1"
          />
          <div>
            <h3 className={`text-lg font-medium ${task.completed ? 'line-through' : ''}`}>
              {task.name}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {task.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="text"
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={() => onEdit(task)}
          />
          <Button
            type="text"
            danger
            icon={<TrashIcon className="w-4 h-4" />}
            onClick={() => onDelete(task.id)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(task.category)}`}>
          {getCategoryIcon(task.category)} {task.category}
        </span>
        {task.tags?.map((tag, index) => (
          <Tag key={index} color="default">
            {tag}
          </Tag>
        ))}
      </div>

      {task.deadline && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Échéance: {new Date(task.deadline).toLocaleDateString('fr-FR')}
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard; 