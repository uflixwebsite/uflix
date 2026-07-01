import api from './api';

// Get all products with filters
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

// Get single product
export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Get product reviews
export const getProductReviews = async (id, params = {}) => {
  const response = await api.get(`/products/${id}/reviews`, { params });
  return response.data;
};

// Create product (admin)
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

// Update product (admin)
export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

// Delete product (admin)
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Download all products as CSV (admin)
export const downloadProductsCsv = async () => {
  const response = await api.get('/products/export/csv', {
    responseType: 'blob',
  });

  return response.data;
};
