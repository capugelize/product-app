import { useState } from 'react';
import { Modal, Form, Input, Select, Button, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import EmojiPicker from 'emoji-picker-react';

const CategoryManager = () => {
  const { settings, updateSettings } = useAppContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [form] = Form.useForm();

  const categories = settings.categories || [
    { id: 'work', name: 'Work', icon: '💼', color: '#1890ff' },
    { id: 'personal', name: 'Personal', icon: '🏠', color: '#722ed1' },
    { id: 'study', name: 'Study', icon: '📚', color: '#52c41a' },
    { id: 'health', name: 'Health', icon: '💪', color: '#faad14' },
    { id: 'other', name: 'Other', icon: '📝', color: '#13c2c2' },
  ];

  const showModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      form.setFieldsValue(category);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      const newCategories = [...categories];
      if (editingCategory) {
        const index = newCategories.findIndex(c => c.id === editingCategory.id);
        newCategories[index] = { ...editingCategory, ...values };
      } else {
        newCategories.push({
          ...values,
          id: values.name.toLowerCase().replace(/\s+/g, '-'),
        });
      }

      updateSettings({
        ...settings,
        categories: newCategories,
      });

      message.success(editingCategory ? 'Catégorie modifiée' : 'Catégorie ajoutée');
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleDelete = (categoryId) => {
    const newCategories = categories.filter(c => c.id !== categoryId);
    updateSettings({
      ...settings,
      categories: newCategories,
    });
    message.success('Catégorie supprimée');
  };

  const onEmojiClick = (emojiObject) => {
    form.setFieldsValue({ icon: emojiObject.emoji });
    setShowEmojiPicker(false);
  };

  return (
    <div className="category-manager">
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => showModal()}
        style={{ marginBottom: 16 }}
      >
        Ajouter une catégorie
      </Button>

      <div className="categories-list">
        {categories.map(category => (
          <div
            key={category.id}
            className="category-item"
            style={{
              backgroundColor: `${category.color}20`,
              borderColor: category.color,
            }}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
            <Space>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => showModal(category)}
              />
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(category.id)}
              />
            </Space>
          </div>
        ))}
      </div>

      <Modal
        title={editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          form.resetFields();
          setIsModalVisible(false);
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            color: '#1890ff',
          }}
        >
          <Form.Item
            name="name"
            label="Nom de la catégorie"
            rules={[{ required: true, message: 'Veuillez entrer un nom' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="icon"
            label="Icône"
            rules={[{ required: true, message: 'Veuillez sélectionner une icône' }]}
          >
            <div style={{ position: 'relative' }}>
              <Input
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                value={form.getFieldValue('icon')}
                readOnly
                placeholder="Cliquez pour choisir un emoji"
              />
              {showEmojiPicker && (
                <div style={{ position: 'absolute', zIndex: 1000, marginTop: 8 }}>
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item
            name="color"
            label="Couleur"
            rules={[{ required: true, message: 'Veuillez sélectionner une couleur' }]}
          >
            <Select>
              <Select.Option value="#1890ff">Bleu</Select.Option>
              <Select.Option value="#722ed1">Violet</Select.Option>
              <Select.Option value="#52c41a">Vert</Select.Option>
              <Select.Option value="#faad14">Jaune</Select.Option>
              <Select.Option value="#13c2c2">Cyan</Select.Option>
              <Select.Option value="#eb2f96">Rose</Select.Option>
              <Select.Option value="#fa8c16">Orange</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManager; 