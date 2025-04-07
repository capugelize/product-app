import { Layout, ConfigProvider } from 'antd';
import { AppProvider } from './context/AppContext';
import AppHeader from './components/AppHeader';
import AppContent from './components/AppContent';
import './App.css';

const { Header, Content } = Layout;

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
        </Layout>
      </AppProvider>
    </ConfigProvider>
  );
}

export default App;
