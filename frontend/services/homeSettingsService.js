import api from './api';

export const getHomeSettings = async () => {
  const response = await api.get('/home');
  return response.data;
};

export const updateHomeSettings = async (data) => {
  const response = await api.put('/home', data);
  return response.data;
};

export const updateHomeSection = async (section, data) => {
  const response = await api.put(`/home/${section}`, data);
  return response.data;
};

export const updateHomeSections = async (sections) => {
  const response = await api.put('/home/sections', { sections });
  return response.data;
};
