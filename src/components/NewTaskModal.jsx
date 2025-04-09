import { Modal, Form, Input, Select, DatePicker, ColorPicker, Switch, Button, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { useState } from 'react';

const { Option } = Select;

const NewTaskModal = ({ visible, onCancel, onOk, initialValues }) => {
  const [form] = Form.useForm();
  const { settings } = useAppContext();
  const [subtasks, setSubtasks] = useState(initialValues?.subtasks || []);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      // Inclure les sous-tâches dans les valeurs soumises
      const taskWithSubtasks = {
        ...values,
        subtasks: subtasks,
      };
      onOk(taskWithSubtasks);
      form.resetFields();
      setSubtasks([]);
    });
  };

  const addSubtask = () => {
    const newSubtask = {
      id: Date.now().toString(),
      name: '',
      completed: false,
    };
    setSubtasks([...subtasks, newSubtask]);
  };

  const updateSubtask = (index, value) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index] = {
      ...updatedSubtasks[index],
      name: value,
    };
    setSubtasks(updatedSubtasks);
  };

  const removeSubtask = (index) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks.splice(index, 1);
    setSubtasks(updatedSubtasks);
  };

  return (
    <Modal
      title="Nouvelle tâche"
      open={visible}
      onCancel={() => {
        form.resetFields();
        setSubtasks([]);
        onCancel();
      }}
      onOk={handleSubmit}
      width={600}
      className="dark:bg-gray-800"
    >
      <Form
        form={form}
        layout="vertical"
        className="dark:text-gray-100"
        initialValues={{
          notificationTime: "30",
          recurring: false,
          ...initialValues
        }}
      >
        <Form.Item
          name="name"
          label="Nom de la tâche"
          rules={[{ required: true, message: 'Veuillez entrer un nom' }]}
        >
          <Input placeholder="Ex: Réunion d'équipe" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={3} placeholder="Détails de la tâche..." />
        </Form.Item>

        <Form.Item
          name="color"
          label="Couleur"
          initialValue="#fbbf24"
        >
          <ColorPicker />
        </Form.Item>

        <Form.Item
          name="status"
          label="Statut"
          initialValue="not_started"
          rules={[{ required: true, message: 'Veuillez sélectionner un statut' }]}
        >
          <Select>
            <Option value="not_started">⏳ Not started</Option>
            <Option value="in_progress">🔧 In progress</Option>
            <Option value="completed">✅ Completed</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="category"
          label="Catégorie"
          rules={[{ required: true, message: 'Veuillez sélectionner une catégorie' }]}
        >
          <Select placeholder="Sélectionnez une catégorie">
            <Option value="work">💼 Work</Option>
            <Option value="personal">🏠 Personal</Option>
            <Option value="study">📚 Study</Option>
            <Option value="health">💪 Health</Option>
            <Option value="other">📝 Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="tags"
          label="Étiquettes"
        >
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Ajoutez des étiquettes"
            options={[
              { value: 'rdv', label: 'Rendez-vous' },
              { value: 'projet', label: 'Projet' },
              { value: 'loisirs', label: 'Loisirs' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'important', label: 'Important' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="deadline"
          label="Date limite"
        >
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item
          name="notificationTime"
          label="Notification avant l'échéance"
          tooltip="Choisissez quand vous souhaitez être notifié avant l'échéance"
        >
          <Select>
            <Option value="5">5 minutes avant</Option>
            <Option value="15">15 minutes avant</Option>
            <Option value="30">30 minutes avant</Option>
            <Option value="60">1 heure avant</Option>
            <Option value="120">2 heures avant</Option>
            <Option value="1440">1 jour avant</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="recurring"
          label="Répétition"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        {form.getFieldValue('recurring') && (
          <Form.Item
            name="recurrenceType"
            label="Type de répétition"
          >
            <Select>
              <Option value="daily">Quotidien</Option>
              <Option value="weekly">Hebdomadaire</Option>
              <Option value="monthly">Mensuel</Option>
            </Select>
          </Form.Item>
        )}

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Sous-tâches</h3>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={addSubtask}
            >
              Ajouter une sous-tâche
            </Button>
          </div>

          {subtasks.map((subtask, index) => (
            <div key={subtask.id} className="flex items-center mb-2">
              <Input
                className="flex-grow"
                placeholder="Nom de la sous-tâche"
                value={subtask.name}
                onChange={(e) => updateSubtask(index, e.target.value)}
              />
              <Button 
                type="text" 
                danger
                icon={<DeleteOutlined />} 
                onClick={() => removeSubtask(index)}
                className="ml-2"
              />
            </div>
          ))}
        </div>
      </Form>
    </Modal>
  );
};

export default NewTaskModal; 