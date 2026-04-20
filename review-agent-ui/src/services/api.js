import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8001' });

export const getRestaurants = () => API.get('/restaurants');
export const getAnalysis = (restaurant, nTopics = 5) =>
  API.get('/analyze', { params: { restaurant, n_topics: nTopics } });
