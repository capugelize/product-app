import { Layout, Row, Col } from 'antd';
import TaskList from './TaskList';
import CalendarView from './CalendarView';
import PomodoroTimer from './PomodoroTimer';

const { Content } = Layout;

const AppContent = () => {
  return (
    <Content className="app-content">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <TaskList />
        </Col>
        <Col xs={24} md={16}>
          <CalendarView />
        </Col>
      </Row>
      <PomodoroTimer />
    </Content>
  );
};

export default AppContent; 