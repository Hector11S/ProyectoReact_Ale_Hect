import axios from 'axios';

const API_URL = 'https://localhost:44380/api/Tallas';
const API_KEY = '4b567cb1c6b24b51ab55248f8e66e5cc';

const axiosInstance = axios.create({
  headers: {
    'XApiKey': API_KEY,
    'accept': '*/*',
  }
});

export const getTallas = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/Listar`);
    console.log('Respuesta de la API:', response.data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getTallaById = async (tall_Id) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/ListarByIdtalla`, { params: { tall_Id } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const insertarTalla = async (talla) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/Insertar`, talla, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editarTalla = async (talla) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/Editar`, talla, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const eliminarTalla = async (talla) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/Eliminar`, talla, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
