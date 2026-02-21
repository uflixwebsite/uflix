import api from './api';

// Get all pincode settings (admin only)
export const getPincodeSettings = async () => {
  const response = await api.get('/pincode-settings');
  return response.data;
};

// Update pincode settings (admin only)
export const updatePincodeSettings = async (settings) => {
  const response = await api.put('/pincode-settings', settings);
  return response.data;
};

// Add new pincode entry (admin only)
export const addPincode = async (pincodeData) => {
  const response = await api.post('/pincode-settings/pincode', pincodeData);
  return response.data;
};

// Update specific pincode entry (admin only)
export const updatePincode = async (index, pincodeData) => {
  const response = await api.put(`/pincode-settings/pincode/${index}`, pincodeData);
  return response.data;
};

// Delete specific pincode entry (admin only)
export const deletePincode = async (index) => {
  const response = await api.delete(`/pincode-settings/pincode/${index}`);
  return response.data;
};
