import api from './api';

// Get page content by slug (public)
export const getPageContent = async (slug) => {
  const response = await api.get(`/pages/${slug}`);
  return response.data;
};

// Get page content for admin editing (includes hidden sections)
export const getPageContentAdmin = async (slug) => {
  const response = await api.get(`/pages/${slug}/admin`);
  return response.data;
};

// Get all pages (admin)
export const getAllPages = async () => {
  const response = await api.get('/pages');
  return response.data;
};

// Update page content
export const updatePageContent = async (slug, data) => {
  const response = await api.put(`/pages/${slug}`, data);
  return response.data;
};

// Add section to page
export const addSection = async (slug, sectionData) => {
  const response = await api.post(`/pages/${slug}/sections`, sectionData);
  return response.data;
};

// Update a specific section
export const updateSection = async (slug, sectionId, sectionData) => {
  const response = await api.put(`/pages/${slug}/sections/${sectionId}`, sectionData);
  return response.data;
};

// Delete a section
export const deleteSection = async (slug, sectionId) => {
  const response = await api.delete(`/pages/${slug}/sections/${sectionId}`);
  return response.data;
};

// Create a new page
export const createPage = async (pageData) => {
  const response = await api.post('/pages', pageData);
  return response.data;
};
