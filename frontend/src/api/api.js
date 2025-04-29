import axios from 'axios'

const API_URL='http://localhost:5000/api';

export const letsChat=async()=>{
    try{
        const response= await axios.get(`${API_URL}/chat`);
        return response.data;
    }catch{
        console.error('Erreur de connection !');
    }
};