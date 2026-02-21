import api from './api';

// Get all categories (flat list, optionally filtered by parentId)
export const getCategories = async (params = {}) => {
  const response = await api.get('/categories', { params });
  return response.data;
};

// Get full nested category tree
export const getCategoryTree = async () => {
  const response = await api.get('/categories/tree');
  return response.data;
};

// Get single category
export const getCategory = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

// Create category (admin)
export const createCategory = async (categoryData) => {
  const response = await api.post('/categories', categoryData);
  return response.data;
};

// Update category (admin)
export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/categories/${id}`, categoryData);
  return response.data;
};

// Delete category (admin)
export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

// Resolve category chain from slug path (['living', 'beds', 'king-size-beds'])
export const getCategoryByPath = async (slugs) => {
  const path = Array.isArray(slugs) ? slugs.join('/') : slugs;
  const response = await api.get('/categories/by-path', { params: { path } });
  return response.data;
};

// Get all descendant IDs of a category (including self)
export const getCategoryDescendants = async (id) => {
  const response = await api.get(`/categories/${id}/descendants`);
  return response.data;
};
