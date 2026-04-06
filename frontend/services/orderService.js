import api from './api';

// Create new order
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

// Get user orders
export const getOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data;
};

// Get single order
export const getOrder = async (id, token) => {
  const response = await api.get(`/orders/${id}`, {
    params: token ? { token } : undefined,
  });
  return response.data;
};

// Cancel order
export const cancelOrder = async (id, reason) => {
  const response = await api.put(`/orders/${id}/cancel`, { reason });
  return response.data;
};

// Track order
export const trackOrder = async (id, token) => {
  const response = await api.get(`/orders/${id}/track`, {
    params: token ? { token } : undefined,
  });
  return response.data;
};

// Update order status
export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data;
};
