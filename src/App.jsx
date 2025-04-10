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
    token: { colorBgContainer, borderRadiusLG },
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
          <Sider 
            collapsible 
            collapsed={collapsed} 
            onCollapse={(value) => setCollapsed(value)}
            style={{
              boxShadow: '2px 0 8px rgba(0, 0, 0, 0.06)',
              overflow: 'auto',
              height: '100vh',
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 1000
            }}
          >
            <div 
              style={{ 
                height: 70, 
                margin: '24px auto', 
                textAlign: 'center', 
                lineHeight: '70px', 
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold'
              }}
            >
              TaskMaster
            </div>
            <Menu
              theme="dark"
              defaultSelectedKeys={['dashboard']}
              mode="inline"
              items={menuItems}
              onClick={({ key }) => setSelectedTab(key)}
              style={{ padding: '12px 0' }}
            />
          </Sider>
          <Layout className="site-layout" style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.3s' }}>
            <Header 
              style={{ 
                padding: '0 36px', 
                background: colorBgContainer, 
                display: 'flex', 
                alignItems: 'center',
                height: 80,
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
                position: 'sticky',
                top: 0,
                zIndex: 999,
              }}
            >
              <h1 style={{ fontSize: '22px', margin: 0 }}>
                {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
              </h1>
            </Header>
            <Content style={{ margin: '40px 40px 0', overflow: 'initial' }}>
              <div 
                style={{ 
                  padding: 40, 
                  minHeight: 'calc(100vh - 160px)', 
                  background: colorBgContainer,
                  borderRadius: borderRadiusLG,
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'
                }}
              >
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
