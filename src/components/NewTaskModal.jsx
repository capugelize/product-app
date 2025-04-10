import { Modal, Form, Input, Select, DatePicker, Button, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { useState, useEffect } from 'react';
import moment from 'moment';

const { Option } = Select;

const NewTaskModal = ({ visible, onCancel, onOk, editingTask }) => {
  const [form] = Form.useForm();
  const { settings } = useAppContext();
  const [subtasks, setSubtasks] = useState([]);

  // Mise à jour des sous-tâches et des valeurs du formulaire quand une tâche est en édition
  useEffect(() => {
    if (editingTask) {
      form.setFieldsValue({
        name: editingTask.name,
        description: editingTask.description,
        status: editingTask.status,
        priority: editingTask.priority,
        category: editingTask.category,
        tags: editingTask.tags,
        deadline: editingTask.deadline ? moment(editingTask.deadline) : null,
        color: editingTask.color || "#fbbf24",
        notificationTime: editingTask.notificationTime || "30"
      });
      
      setSubtasks(editingTask.subtasks || []);
    } else {
      form.resetFields();
      setSubtasks([]);
    }
  }, [editingTask, form]);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      // Inclure les sous-tâches dans les valeurs soumises
      const taskWithSubtasks = {
        ...values,
        subtasks: subtasks,
        id: editingTask?.id  // Conserver l'ID lors de la modification
      };
      onOk(taskWithSubtasks);
    }).catch(err => {
      console.error("Erreur de validation du formulaire:", err);
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
      title={editingTask ? "Modifier la tâche" : "Nouvelle tâche"}
      open={visible}
      onCancel={(e) => {
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        }
        form.resetFields();
        setSubtasks([]);
        onCancel();
      }}
      onOk={(e) => {
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        }
        handleSubmit();
      }}
      width={600}
      maskClosable={false}
      className="dark:bg-gray-800"
    >
      <Form
        form={form}
        layout="vertical"
        className="dark:text-gray-100"
        initialValues={{
          status: "not_started",
          priority: "medium",
          color: "#fbbf24",
          notificationTime: "30"
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
          <Input type="color" style={{ width: '100%', height: '32px' }} />
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
          name="priority"
          label="Priorité"
          initialValue="medium"
          rules={[{ required: true, message: 'Veuillez sélectionner une priorité' }]}
        >
          <Select>
            <Option value="high">🔴 Haute</Option>
            <Option value="medium">🟠 Moyenne</Option>
            <Option value="low">🟢 Basse</Option>
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

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Sous-tâches</h3>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                addSubtask();
              }}
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
                onChange={(e) => {
                  e.stopPropagation();
                  updateSubtask(index, e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <Button 
                type="text" 
                danger
                icon={<DeleteOutlined />} 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  removeSubtask(index);
                }}
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