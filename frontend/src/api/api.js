import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const sendMessage = async (message, location) => {
  try {
    const response = await axios.post(`${API_URL}/ask`, { 
      message,
      location: location || null
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const initDocs = async () => {
  try {
    const response = await axios.post(`${API_URL}/init`);
    return response;
  } catch (error) {
    console.error('Error initializing docs:', error);
    throw error;
  }
};