import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API calls
export const userAPI = {
  register: (userData) => api.post('/users/register', userData),
  getUserById: (userId) => api.get(`/users/${userId}`),
  getUserByEmail: (email) => api.get(`/users/email/${email}`),
  updateProfile: (userId, userData) => api.put(`/users/${userId}/profile`, userData),
  analyzeFace: (userId, imageUrl) => api.post(`/users/${userId}/analyze-face?imageUrl=${imageUrl}`),
};

// Wardrobe API calls
export const wardrobeAPI = {
  uploadClothing: (formData) => {
    return api.post('/wardrobe/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  addManualClothing: (clothingData) => api.post('/wardrobe/add-manual', clothingData),
  getUserWardrobe: (userId) => api.get(`/wardrobe/user/${userId}`),
  getFilteredWardrobe: (userId, params) => api.get(`/wardrobe/user/${userId}/filter`, { params }),
  deleteClothingItem: (itemId) => api.delete(`/wardrobe/${itemId}`),
};

// Recommendations API calls
export const recommendationsAPI = {
  generateRecommendation: (userId, occasion, location) => 
    api.post(`/recommendations/generate?userId=${userId}&occasion=${occasion}&location=${location || 'Delhi'}`),
  getRecommendationHistory: (userId) => api.get(`/recommendations/user/${userId}/history`),
  provideFeedback: (recommendationId, rating) => 
    api.post(`/recommendations/${recommendationId}/feedback?rating=${rating}`),
};

// Weather API (if needed for frontend)
export const weatherAPI = {
  getCurrentWeather: (location) => api.get(`/weather/current?location=${location}`),
};

export default api;