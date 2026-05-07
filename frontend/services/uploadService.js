import api from './api';

// Upload single image to Cloudinary
export const uploadSingleImage = async (file, folder = 'general') => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post(`/upload/image?folder=${folder}`, formData, {
    headers: {
      'Content-Type': undefined,
    },
  });

  return response.data;
};

// Upload multiple images to Cloudinary
export const uploadMultipleImages = async (files, folder = 'general') => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await api.post(`/upload/images?folder=${folder}`, formData);

  return response.data;
};

// Upload document (PDF, DOC) to Cloudinary
export const uploadDocument = async (file, folder = 'documents') => {
  const formData = new FormData();
  formData.append('document', file);

  const response = await api.post(`/upload/document?folder=${folder}`, formData);

  return response.data;
};

// Upload video to Cloudinary
export const uploadVideo = async (file, folder = 'videos') => {
  const formData = new FormData();
  formData.append('video', file);

  const response = await api.post(`/upload/video?folder=${folder}`, formData);

  return response.data;
};

// Delete file from Cloudinary (admin)
export const deleteFile = async (publicId, resourceType = 'image') => {
  const encodedPublicId = publicId.replace(/\//g, '_');
  const response = await api.delete(`/upload/${encodedPublicId}?type=${resourceType}`);
  return response.data;
};
