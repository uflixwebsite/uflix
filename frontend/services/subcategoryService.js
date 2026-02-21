import api from './api';

// Get all subcategories (optionally filtered by category)
export const getSubcategories = async (params = {}) => {
  const response = await api.get('/subcategories', { params });
  return response.data;
};

// Create new subcategory
export const createSubcategory = async (subcategoryData) => {
  const response = await api.post('/subcategories', subcategoryData);
  return response.data;
};

// Delete subcategory
export const deleteSubcategory = async (id) => {
  const response = await api.delete(`/subcategories/${id}`);
  return response.data;
};

