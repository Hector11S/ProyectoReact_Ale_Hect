import axios from 'axios';

const API_URL = 'https://localhost:44380/api/UnidadMedidas';
const API_KEY = '4b567cb1c6b24b51ab55248f8e66e5cc'; // Usa la misma API_KEY que utilizaste en el servicio de Tallas

const axiosInstance = axios.create({
  headers: {
    'XApiKey': API_KEY,
    'accept': '*/*',
  }
});

export const getUnidadesMedida = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/Listar`);
    console.log('Respuesta de la API:', response.data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
