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
      label: 'Paramètres',
    },
    {
      key: '2',
      icon: <BulbOutlined />,
      label: (
        <Space>
          Mode sombre
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
      label: 'Réinitialiser',
      onClick: () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes vos données et réinitialiser l\'application ? Cette action est irréversible.')) {
          resetApp();
        }
      },
    },
  ];

  return (
    <Header className="app-header">
      <div className="header-content">
        <Title level={3} className="app-title">
          Gestionnaire de Productivité
        </Title>
        <Space>
          <Segmented
            value={settings.viewMode}
            onChange={(value) => updateSettings({ viewMode: value })}
            options={[
              { label: 'Jour', value: 'day' },
              { label: 'Semaine', value: 'week' },
              { label: 'Mois', value: 'month' },
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