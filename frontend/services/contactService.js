import api from './api';

// Create new contact submission
export const submitContactForm = async (formData) => {
  const response = await api.post('/contact', formData);
  return response.data;
};

// Get all contact submissions (Admin)
export const getContacts = async (params = {}) => {
  const response = await api.get('/contact', { params });
  return response.data;
};

// Get single contact submission (Admin)
export const getContact = async (id) => {
  const response = await api.get(`/contact/${id}`);
  return response.data;
};

// Update contact submission (Admin)
export const updateContact = async (id, data) => {
  const response = await api.put(`/contact/${id}`, data);
  return response.data;
};

// Delete contact submission (Admin)
export const deleteContact = async (id) => {
  const response = await api.delete(`/contact/${id}`);
  return response.data;
};
