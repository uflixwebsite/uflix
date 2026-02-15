import api from './api';

export const getNavbarConfig = async (path) => {
  const response = await api.get('/navbar', { params: { path } });
  return response.data;
};

export const getNavbarSettingsAdmin = async () => {
  const response = await api.get('/navbar/admin');
  return response.data;
};

export const updateNavbarSettings = async (data) => {
  const response = await api.put('/navbar', data);
  return response.data;
};
