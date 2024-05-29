import axios from 'axios';

const API_URL = 'https://localhost:44380/api/Moneda';
const API_KEY = '4b567cb1c6b24b51ab55248f8e66e5cc';

const axiosInstance = axios.create({
  headers: {
    'XApiKey': API_KEY,
    'accept': '*/*',
  }
});

export const getMonedas = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/Listar`);
    console.log('Respuesta de la API:', response.data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const insertarMoneda = async (moneda) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/Insertar`, moneda, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editarMoneda = async (moneda) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/Editar`, moneda, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
 

