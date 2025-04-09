import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import { 
  HomeOutlined, 
  ClockCircleOutlined, 
  BarChartOutlined,
  DashboardOutlined,
  SettingOutlined
} from '@ant-design/icons';
import TaskList from './components/TaskList';
import PomodoroTimer from './components/PomodoroTimer';
import { AppProvider } from './context/AppContext';
import { PomodoroProvider } from './context/PomodoroContext';
import Analysis from './components/Analysis';
import Dashboard from './components/Dashboard';
import SettingsPage from './pages/SettingsPage';
import './App.css';

const { Header, Content, Sider } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'tasks',
      icon: <HomeOutlined />,
      label: 'Tasks',
    },
    {
      key: 'pomodoro',
      icon: <ClockCircleOutlined />,
      label: 'Pomodoro',
    },
    {
      key: 'analysis',
      icon: <BarChartOutlined />,
      label: 'Analysis',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TaskList />;
      case 'pomodoro':
        return <PomodoroTimer />;
      case 'analysis':
        return <Analysis />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <PomodoroProvider>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
            <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
            <Menu
              theme="dark"
              defaultSelectedKeys={['dashboard']}
              mode="inline"
              items={menuItems}
              onClick={({ key }) => setSelectedTab(key)}
            />
          </Sider>
          <Layout className="site-layout">
            <Header style={{ padding: 0, background: colorBgContainer }} />
            <Content style={{ margin: '24px 16px' }}>
              <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
                {renderContent()}
              </div>
            </Content>
          </Layout>
        </Layout>
      </PomodoroProvider>
    </AppProvider>
  );
};

export default App;
