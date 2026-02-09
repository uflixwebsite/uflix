import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getFooterSettings = async () => {
  const response = await axios.get(`${API_URL}/footer`);
  return response.data;
};

export const updateFooterSettings = async (data) => {
  const response = await axios.put(`${API_URL}/footer`, data, { withCredentials: true });
  return response.data;
};

export const addLinkColumn = async (data) => {
  const response = await axios.post(`${API_URL}/footer/link-column`, data, { withCredentials: true });
  return response.data;
};

export const removeLinkColumn = async (columnId) => {
  const response = await axios.delete(`${API_URL}/footer/link-column/${columnId}`, { withCredentials: true });
  return response.data;
};

export const addSocialLink = async (data) => {
  const response = await axios.post(`${API_URL}/footer/social-link`, data, { withCredentials: true });
  return response.data;
};

export const removeSocialLink = async (linkId) => {
  const response = await axios.delete(`${API_URL}/footer/social-link/${linkId}`, { withCredentials: true });
  return response.data;
};
