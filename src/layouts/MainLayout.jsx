import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import '../App.css';

const { Content } = Layout;

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="app">
      <Sidebar collapsed={collapsed} />
      <Layout className="main-container">
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content className="main-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout; 