import api from './api';

export const getCollections = async (params = {}) => {
  const response = await api.get('/collections', { params });
  return response.data;
};

export const getHomeCollections = async () => {
  const response = await api.get('/collections/home');
  return response.data;
};

export const getCollectionBySlug = async (slug) => {
  const response = await api.get(`/collections/${slug}`);
  return response.data;
};

export const createCollection = async (data) => {
  const response = await api.post('/collections', data);
  return response.data;
};

export const updateCollection = async (id, data) => {
  const response = await api.put(`/collections/${id}`, data);
  return response.data;
};

export const deleteCollection = async (id) => {
  const response = await api.delete(`/collections/${id}`);
  return response.data;
};
