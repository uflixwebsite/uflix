import api from './api';

// Get all navbar items with mega menu data
export const getNavbarItems = async () => {
  const response = await api.get('/mega-menu/navbar');
  return response.data;
};

// Update navbar items
export const updateNavbarItems = async (items) => {
  const response = await api.put('/mega-menu/navbar', { items });
  return response.data;
};

// Get single navbar item
export const getNavbarItem = async (id) => {
  const response = await api.get(`/mega-menu/navbar/${id}`);
  return response.data;
};

// Update single navbar item
export const updateNavbarItem = async (id, itemData) => {
  const response = await api.put(`/mega-menu/navbar/${id}`, itemData);
  return response.data;
};

// Create new navbar item
export const createNavbarItem = async (itemData) => {
  const response = await api.post('/mega-menu/navbar', itemData);
  return response.data;
};

// Delete navbar item
export const deleteNavbarItem = async (id) => {
  const response = await api.delete(`/mega-menu/navbar/${id}`);
  return response.data;
};

// Get all mega menu categories
export const getMegaMenuCategories = async (navbarItemId) => {
  const response = await api.get(`/mega-menu/categories?navbar=${navbarItemId}`);
  return response.data;
};

// Create new mega menu category
export const createMegaMenuCategory = async (categoryData) => {
  const response = await api.post('/mega-menu/categories', categoryData);
  return response.data;
};

// Get single mega menu category
export const getMegaMenuCategory = async (id) => {
  const response = await api.get(`/mega-menu/categories/${id}`);
  return response.data;
};

// Update mega menu category
export const updateMegaMenuCategory = async (id, categoryData) => {
  const response = await api.put(`/mega-menu/categories/${id}`, categoryData);
  return response.data;
};

// Delete mega menu category
export const deleteMegaMenuCategory = async (id) => {
  const response = await api.delete(`/mega-menu/categories/${id}`);
  return response.data;
};
