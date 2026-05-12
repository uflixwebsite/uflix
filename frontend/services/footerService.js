import api from './api';

export const getFooterSettings = async () => {
  const response = await api.get('/footer');
  return response.data;
};

export const updateFooterSettings = async (data) => {
  const response = await api.put('/footer', data);
  return response.data;
};

export const addLinkColumn = async (data) => {
  const response = await api.post('/footer/link-column', data);
  return response.data;
};

export const removeLinkColumn = async (columnId) => {
  const response = await api.delete(`/footer/link-column/${columnId}`);
  return response.data;
};

export const addSocialLink = async (data) => {
  const response = await api.post('/footer/social-link', data);
  return response.data;
};

export const removeSocialLink = async (linkId) => {
  const response = await api.delete(`/footer/social-link/${linkId}`);
  return response.data;
};
