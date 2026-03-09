import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // Gateway Port
});

export default api;