import api from './api';

// Get all materials
export const getMaterials = async () => {
  const response = await api.get('/materials');
  return response.data;
};

// Create new material
export const createMaterial = async (name) => {
  const response = await api.post('/materials', { name });
  return response.data;
};

// Update material
export const updateMaterial = async (id, name) => {
  const response = await api.put(`/materials/${id}`, { name });
  return response.data;
};

// Delete material
export const deleteMaterial = async (id) => {
  const response = await api.delete(`/materials/${id}`);
  return response.data;
};
