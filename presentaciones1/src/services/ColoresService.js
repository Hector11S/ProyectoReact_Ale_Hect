import axios from 'axios';

const API_URL = 'https://localhost:44380/api/Colores';
const API_KEY = '4b567cb1c6b24b51ab55248f8e66e5cc';

const axiosInstance = axios.create({
  headers: {
    'XApiKey': API_KEY,
    'accept': '*/*',
  }
});

export const getColores = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/Listar`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};