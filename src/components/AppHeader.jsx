import { Layout, Typography, Dropdown, Space, Avatar, Segmented, Switch } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, BulbOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';

const { Header } = Layout;
const { Title } = Typography;

const AppHeader = () => {
  const { settings, updateSettings, resetApp } = useAppContext();

  const items = [
    {
      key: '1',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      key: '2',
      icon: <BulbOutlined />,
      label: (
        <Space>
          Dark Mode
          <Switch
            checked={settings.darkMode}
            onChange={(checked) => updateSettings({ darkMode: checked })}
            size="small"
          />
        </Space>
      ),
    },
    {
      key: '3',
      icon: <LogoutOutlined />,
      label: 'Reset App',
      onClick: () => {
        if (window.confirm('Are you sure you want to delete all your data and reset the app? This action is irreversible.')) {
          resetApp();
        }
      },
    },
  ];

  return (
    <Header className="app-header">
      <div className="header-content">
        <Title level={3} className="app-title">
          Productivity App
        </Title>
        <Space>
          <Segmented
            value={settings.viewMode}
            onChange={(value) => updateSettings({ viewMode: value })}
            options={[
              { label: 'Day', value: 'day' },
              { label: 'Week', value: 'week' },
              { label: 'Month', value: 'month' },
            ]}
          />
          <Dropdown
            menu={{
              items,
            }}
            placement="bottomRight"
          >
            <Space>
              <Avatar icon={<UserOutlined />} />
            </Space>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default AppHeader; 