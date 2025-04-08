import { Card } from 'antd';
import CategoryManager from '../components/CategoryManager';

const CategoriesPage = () => {
  return (
    <div className="categories-page">
      <h1>Gestion des catégories</h1>
      <Card>
        <CategoryManager />
      </Card>
    </div>
  );
};

export default CategoriesPage; 