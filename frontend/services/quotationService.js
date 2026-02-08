import api from './api';

// Create new quotation request
export const createQuotation = async (quotationData) => {
  const response = await api.post('/quotations', quotationData);
  return response.data;
};

// Get all quotations (Admin)
export const getQuotations = async (params = {}) => {
  const response = await api.get('/quotations', { params });
  return response.data;
};

// Get single quotation (Admin)
export const getQuotation = async (id) => {
  const response = await api.get(`/quotations/${id}`);
  return response.data;
};

// Update quotation status/notes (Admin)
export const updateQuotation = async (id, data) => {
  const response = await api.put(`/quotations/${id}`, data);
  return response.data;
};

// Delete quotation (Admin)
export const deleteQuotation = async (id) => {
  const response = await api.delete(`/quotations/${id}`);
  return response.data;
};
