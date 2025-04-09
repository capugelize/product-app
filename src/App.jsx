import React, { useState } from 'react';
import { Layout, Menu, theme, Typography, Space, Progress } from 'antd';
import { 
  HomeOutlined, 
  ClockCircleOutlined, 
  BarChartOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import TaskList from './components/TaskList';
import PomodoroTimer from './components/PomodoroTimer';
import AppContext from './context/AppContext';
import { PomodoroProvider } from './context/PomodoroContext';
import Analysis from './components/Analysis';
import Dashboard from './components/Dashboard';
import { usePomodoro } from './context/PomodoroContext';
import './App.css';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const TimerTab = () => {
  const { timeLeft, isRunning, formatTime, activeTask } = usePomodoro();
  const totalTime = 25 * 60; // 25 minutes in seconds
  const progressPercent = (timeLeft / totalTime) * 100;

  if (!isRunning || !activeTask) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      padding: '8px 16px',
      background: '#001529',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      zIndex: 1000,
      borderBottomLeftRadius: '8px',
    }}>
      <Text style={{ color: 'white', margin: 0 }}>
        {activeTask.name} - Step {activeTask.currentStep}
      </Text>
      <Progress
        type="circle"
        percent={progressPercent}
        format={() => formatTime(timeLeft)}
        strokeColor="#1890ff"
        size={24}
        showInfo={true}
      />
    </div>
  );
};

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
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppContext>
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
    </AppContext>
  );
};

export default App;
