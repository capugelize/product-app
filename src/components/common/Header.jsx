import { Layout, Button, Space, Switch, Avatar, Dropdown } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, BulbOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAppContext } from '../../context/AppContext';

const { Header: AntHeader } = Layout;

const Header = ({ collapsed, toggleSidebar }) => {
  const { settings, updateSettings, resetApp } = useAppContext();

  const items = [
    {
      key: '1',
      icon: <SettingOutlined />,
      label: 'Paramètres',
      onClick: () => {/* Implémenter plus tard */}
    },
    {
      key: '2',
      icon: <BulbOutlined />,
      label: (
        <Space>
          Mode sombre
          <Switch
            checked={settings?.darkMode}
            onChange={(checked) => updateSettings({ darkMode: checked })}
            size="small"
          />
        </Space>
      ),
    },
    {
      key: '3',
      icon: <LogoutOutlined />,
      label: 'Réinitialiser',
      onClick: () => {
        if (window.confirm('Êtes-vous sûr de vouloir réinitialiser l\'application ? Cette action est irréversible.')) {
          resetApp();
        }
      },
    },
  ];

  return (
    <AntHeader style={{ 
      padding: '0 16px', 
      background: '#fff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 999,
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={toggleSidebar}
        style={{ fontSize: '16px', width: 64, height: 64 }}
      />
      
      <Space>
        <Dropdown
          menu={{ items }}
          placement="bottomRight"
          arrow
        >
          <Avatar 
            style={{ cursor: 'pointer', backgroundColor: '#1890ff' }} 
            icon={<UserOutlined />} 
          />
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header; 