import { Row, Col, Card, Tabs } from 'antd';
import TaskList from '../components/TaskList';
import KanbanView from '../components/KanbanView';
import { useAppContext } from '../context/AppContext';
import ProductivityAssistant from '../components/ProductivityAssistant';
import PomodoroTimer from '../components/PomodoroTimer';

const Dashboard = () => {
  const { tasks } = useAppContext();
  
  // Calculs pour le tableau de bord
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const incompleteTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Tâches par catégorie
  const tasksByCategory = tasks.reduce((acc, task) => {
    const category = task.category || 'Non catégorisé';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  const items = [
    {
      key: '1',
      label: 'Liste',
      children: <TaskList />,
    },
    {
      key: '2',
      label: 'Kanban',
      children: <KanbanView />,
    },
  ];
  
  return (
    <div className="dashboard-page">
      <h1>Tableau de bord</h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="stat-card">
              <h3>Tâches totales</h3>
              <p className="stat-value">{totalTasks}</p>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="stat-card">
              <h3>Tâches terminées</h3>
              <p className="stat-value">{completedTasks}</p>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="stat-card">
              <h3>Tâches en cours</h3>
              <p className="stat-value">{incompleteTasks}</p>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="stat-card">
              <h3>Taux de complétion</h3>
              <p className="stat-value">{completionRate}%</p>
            </div>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Tabs defaultActiveKey="1" items={items} />
        </Col>
      </Row>
      
      <Row gutter={[24, 24]} style={{ marginTop: '16px' }}>
        <Col xs={24} md={12}>
          <ProductivityAssistant />
        </Col>
        <Col xs={24} md={12}>
          <PomodoroTimer fullWidth />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 