import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const sendMessage = async (message) => {
  return axios.post(`${API_URL}/ask`, { message });
};

export const initDocs = async () => {
  return axios.post(`${API_URL}/init`);
};
