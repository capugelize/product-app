import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import TaskList from './components/TaskList';
import PomodoroTimer from './components/PomodoroTimer';
import AppContext from './context/AppContext';
import { PomodoroProvider } from './context/PomodoroContext';
import Analysis from './components/Analysis';
import './App.css';

const { Header, Content } = Layout;

const App = () => {
  const [currentTab, setCurrentTab] = useState('tasks');
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const items = [
    {
      key: 'tasks',
      label: 'Tasks',
    },
    {
      key: 'analysis',
      label: 'Analysis',
    },
  ];

  return (
    <AppContext>
      <PomodoroProvider>
        <Layout style={{ minHeight: '100vh' }}>
          <Header style={{ display: 'flex', alignItems: 'center' }}>
            <div className="logo" />
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[currentTab]}
              items={items}
              onClick={({ key }) => setCurrentTab(key)}
              style={{ flex: 1, minWidth: 0 }}
            />
          </Header>
          <Content style={{ padding: '24px' }}>
            <div
              style={{
                padding: 24,
                minHeight: 360,
                background: colorBgContainer,
                borderRadius: '8px',
              }}
            >
              {currentTab === 'tasks' ? (
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <TaskList />
                  </div>
                  <div style={{ width: '300px' }}>
                    <PomodoroTimer />
                  </div>
                </div>
              ) : (
                <Analysis />
              )}
            </div>
          </Content>
        </Layout>
      </PomodoroProvider>
    </AppContext>
  );
};

export default App;
