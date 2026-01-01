import api from './api'

const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  checkAuth: () => api.get('/auth/me'),
  logout: () => localStorage.clear(),
}

export default authService
