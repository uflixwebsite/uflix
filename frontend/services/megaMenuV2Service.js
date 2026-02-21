import api from './api';

export const getMegaMenu = async (pagePath, navbarLinkUrl) => {
  const response = await api.get('/mega-menu-v2', {
    params: { pagePath, navbarLinkUrl }
  });
  return response.data;
};

export const getAllMegaMenus = async (pagePath) => {
  const response = await api.get('/mega-menu-v2/all', {
    params: { pagePath }
  });
  return response.data;
};

export const saveMegaMenu = async (data) => {
  const response = await api.post('/mega-menu-v2', data);
  return response.data;
};

export const deleteMegaMenu = async (id) => {
  const response = await api.delete(`/mega-menu-v2/${id}`);
  return response.data;
};
