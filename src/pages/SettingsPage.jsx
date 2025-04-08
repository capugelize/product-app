import { Card, Form, Switch, Select, Button, InputNumber, message } from 'antd';
import { useAppContext } from '../context/AppContext';

const SettingsPage = () => {
  const { settings, updateSettings, resetApp } = useAppContext();
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    updateSettings({
      ...settings,
      ...values
    });
    message.success('Paramètres mis à jour');
  };

  const handleReset = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
      resetApp();
      message.success('Application réinitialisée');
    }
  };

  return (
    <div className="settings-page">
      <h1>Paramètres</h1>
      <Card>
        <Form
          form={form}
          layout="vertical"
          initialValues={settings}
          onFinish={handleFinish}
        >
          <Form.Item
            name="darkMode"
            label="Mode sombre"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="language"
            label="Langue"
          >
            <Select>
              <Select.Option value="fr">Français</Select.Option>
              <Select.Option value="en">English</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="workTime"
            label="Temps de travail (minutes)"
            rules={[{ required: true, message: 'Veuillez entrer un temps de travail' }]}
          >
            <InputNumber min={1} max={60} />
          </Form.Item>

          <Form.Item
            name="breakTime"
            label="Temps de pause (minutes)"
            rules={[{ required: true, message: 'Veuillez entrer un temps de pause' }]}
          >
            <InputNumber min={1} max={30} />
          </Form.Item>

          <Form.Item
            name="notifications"
            label="Notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Enregistrer
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 32, borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
          <h3>Réinitialiser l'application</h3>
          <p>Cette action supprimera toutes vos données et réinitialisera l'application à son état d'origine.</p>
          <Button danger onClick={handleReset}>
            Réinitialiser l'application
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage; 