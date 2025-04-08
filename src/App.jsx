import { Layout, ConfigProvider, message } from 'antd';
import { AppProvider } from './context/AppContext';
import AppHeader from './components/AppHeader';
import AppContent from './components/AppContent';
import TaskNotifications from './components/TaskNotifications';
import './App.css';

const { Header, Content } = Layout;

// Configuration globale des messages
message.config({
  top: 100,
  duration: 3,
  maxCount: 3,
});

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <AppProvider>
        <Layout className="app-layout">
          <Header className="app-header">
            <AppHeader />
          </Header>
          <Content className="app-content">
            <AppContent />
          </Content>
          <TaskNotifications />
        </Layout>
      </AppProvider>
    </ConfigProvider>
  );
}

export default App;
