import { Layout, Row, Col, Tabs } from 'antd';
import TaskList from './TaskList';
import CalendarView from './CalendarView';
import PomodoroTimer from './PomodoroTimer';
import CategoryManager from './CategoryManager';

const { Content } = Layout;
const { TabPane } = Tabs;

const AppContent = () => {
  return (
    <Content className="app-content">
      <Tabs defaultActiveKey="1">
        <TabPane tab="Tâches" key="1">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <TaskList />
            </Col>
            <Col xs={24} md={16}>
              <CalendarView />
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="Catégories" key="2">
          <CategoryManager />
        </TabPane>
      </Tabs>
      <PomodoroTimer />
    </Content>
  );
};

export default AppContent; 