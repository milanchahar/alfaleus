import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export const meetingsApi = {
  getMeetings: () => api.get('/meetings'),
  getMeeting: (id) => api.get(`/meetings/${id}`),
  deleteMeeting: (id) => api.delete(`/meetings/${id}`),
  analyzeMeeting: (formData) => api.post('/meetings/analyze', formData),
  getChatHistory: (id) => api.get(`/meetings/${id}/chat`),
  sendMessage: (id, message) => api.post(`/meetings/${id}/chat`, { message }),
  generateEmail: (id) => api.post(`/meetings/${id}/email`),
  exportMarkdown: (id) => `http://localhost:8000/api/meetings/${id}/export/markdown`,
};

export default api;
