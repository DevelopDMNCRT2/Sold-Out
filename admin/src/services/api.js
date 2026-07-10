import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Conexión a nuestro backend en Node
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
