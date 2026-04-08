import api from './api';

export const getHomeSettings = async () => {
  const maxAttempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await api.get('/home', { timeout: 8000 });
      return response.data;
    } catch (error) {
      lastError = error;

      // Retry only transient/network/server/rate-limit failures.
      const status = error?.response?.status;
      const isRetriable = !status || status >= 500 || status === 429;
      if (!isRetriable || attempt === maxAttempts) {
        throw error;
      }

      const backoffMs = 300 * attempt;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw lastError;
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
