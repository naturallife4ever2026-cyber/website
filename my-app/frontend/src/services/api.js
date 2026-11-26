import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  timeout: 10000
})

export const getHealth = () => api.get('/api/health')
export const getComplaints = () => api.get('/api/complaints')
export const createComplaint = (payload) => api.post('/api/complaints', payload)

export default api
