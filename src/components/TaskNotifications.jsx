import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { message } from 'antd';

const TaskNotifications = () => {
  const { tasks } = useAppContext();

  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      const tasksToNotify = new Set(); // Pour éviter les notifications en double

      tasks.forEach(task => {
        if (task.deadline && task.notificationTime) {
          const deadline = new Date(task.deadline);
          const notificationTime = parseInt(task.notificationTime) * 60000; // Convertir en millisecondes
          const notificationDeadline = new Date(deadline.getTime() - notificationTime);
          
          // Vérifie si nous sommes dans la fenêtre de notification
          if (now >= notificationDeadline && now < deadline && !tasksToNotify.has(task.id)) {
            const minutesLeft = Math.round((deadline - now) / 60000);
            const hoursLeft = Math.floor(minutesLeft / 60);
            const remainingMinutes = minutesLeft % 60;
            
            let timeLeftText = '';
            if (hoursLeft > 0) {
              timeLeftText = `${hoursLeft} heure${hoursLeft > 1 ? 's' : ''}`;
              if (remainingMinutes > 0) {
                timeLeftText += ` et ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
              }
            } else {
              timeLeftText = `${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`;
            }

            const categoryIcon = getCategoryIcon(task.category);
            const categoryColor = getCategoryColor(task.category);
            
            message.info({
              content: (
                <div className="flex flex-col gap-1">
                  <span className="font-medium">Échéance approchante</span>
                  <span>{task.name}</span>
                  <span className="text-sm text-gray-500">
                    {timeLeftText} restante{timeLeftText.includes('s') ? 's' : ''}
                  </span>
                  {task.category && (
                    <span className="text-xs" style={{ color: categoryColor }}>
                      {categoryIcon} {getCategoryLabel(task.category)}
                    </span>
                  )}
                </div>
              ),
              duration: 5,
              icon: '⏰',
              style: {
                background: '#fff',
                color: '#333',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              },
            });
            
            tasksToNotify.add(task.id);
          }
        }
      });
    };

    // Vérifie les échéances toutes les minutes
    const interval = setInterval(checkDeadlines, 60000);
    
    // Vérifie immédiatement au chargement
    checkDeadlines();

    return () => clearInterval(interval);
  }, [tasks]);

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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'work':
        return '💼';
      case 'personal':
        return '🏠';
      case 'study':
        return '📚';
      case 'health':
        return '💪';
      case 'other':
        return '📝';
      default:
        return '📝';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'work':
        return 'Work';
      case 'personal':
        return 'Personal';
      case 'study':
        return 'Study';
      case 'health':
        return 'Health';
      case 'other':
        return 'Other';
      default:
        return category;
    }
  };

  return null; // Ce composant ne rend rien visuellement
};

export default TaskNotifications; 