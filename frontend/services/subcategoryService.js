import api from './api';

// Get all subcategories
export const getSubcategories = async () => {
  const response = await api.get('/subcategories');
  return response.data;
};

// Create new subcategory
export const createSubcategory = async (name) => {
  const response = await api.post('/subcategories', { name });
  return response.data;
};

// Delete subcategory
export const deleteSubcategory = async (id) => {
  const response = await api.delete(`/subcategories/${id}`);
  return response.data;
};
