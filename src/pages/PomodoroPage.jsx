import { Card, Row, Col, Select, Space, Typography } from 'antd';
import { useAppContext } from '../context/AppContext';
import { usePomodoro } from '../context/PomodoroContext';
import PomodoroTimer from '../components/PomodoroTimer';

const { Title } = Typography;
const { Option } = Select;

const PomodoroPage = () => {
  const { tasks } = useAppContext();
  const { activeTask, startPomodoro, stopPomodoro, isRunning } = usePomodoro();

  const handleTaskSelect = (taskId) => {
    const selectedTask = tasks.find(task => task.id === taskId);
    if (selectedTask) {
      if (activeTask && activeTask.id === taskId) {
        stopPomodoro();
      } else {
        startPomodoro(selectedTask);
      }
    }
  };

  return (
    <div className="pomodoro-page">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Title level={2}>Pomodoro Timer</Title>
              
              <Select
                style={{ width: '100%' }}
                placeholder="Select a task to work on"
                value={activeTask?.id}
                onChange={handleTaskSelect}
              >
                {tasks.map(task => (
                  <Option key={task.id} value={task.id}>
                    {task.name} - {task.status === 'not_started' ? '⏳ Not started' :
                      task.status === 'in_progress' ? '🔧 In progress' :
                      task.status === 'completed' ? '✅ Completed' : 'Unknown'}
                  </Option>
                ))}
              </Select>

              {activeTask && (
                <div>
                  <Title level={4}>Current Task: {activeTask.name}</Title>
                  <p>Status: {activeTask.status}</p>
                  <p>Priority: {activeTask.priority}</p>
                </div>
              )}
            </Space>
          </Card>
        </Col>
        
        <Col span={24}>
          <Card>
            <PomodoroTimer fullWidth />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PomodoroPage; 