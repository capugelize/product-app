import { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  CalendarOutlined,
  TagsOutlined,
  ClockCircleOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState('dashboard');

  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    setSelectedKey(path);
  }, [location]);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: 'Tableau de bord',
      onClick: () => navigate('/')
    },
    {
      key: 'calendar',
      icon: <CalendarOutlined />,
      label: 'Calendrier',
      onClick: () => navigate('/calendar')
    },
    {
      key: 'categories',
      icon: <TagsOutlined />,
      label: 'Catégories',
      onClick: () => navigate('/categories')
    },
    {
      key: 'pomodoro',
      icon: <ClockCircleOutlined />,
      label: 'Pomodoro',
      onClick: () => navigate('/pomodoro')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Paramètres',
      onClick: () => navigate('/settings')
    }
  ];

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      theme="light"
      width={230}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000
      }}
    >
      <div className="logo" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#1890ff', margin: 0, fontWeight: 'bold' }}>
          {collapsed ? 'PA' : 'Productivity App'}
        </h2>
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar; 