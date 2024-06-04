import axios from 'axios';

const API_URL_MATERIALES = 'https://localhost:44380/api/Materiales';
const API_KEY = '4b567cb1c6b24b51ab55248f8e66e5cc';

const axiosInstanceMateriales = axios.create({
  headers: {
    'XApiKey': API_KEY,
    'accept': '*/*',
  }
});

export const listarMateriales = async () => {
  try {
    const response = await axiosInstanceMateriales.get(`${API_URL_MATERIALES}/Listar`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
