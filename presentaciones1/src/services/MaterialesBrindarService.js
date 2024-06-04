import axios from 'axios';

const API_URL_MATERIAL_BRINDAR = 'https://localhost:44380/api/MaterialesBrindar';
const API_KEY = '4b567cb1c6b24b51ab55248f8e66e5cc';

const axiosInstanceMaterialBrindar = axios.create({
  headers: {
    'XApiKey': API_KEY,
    'accept': '*/*',
  }
});

export const insertarMaterialBrindar = async (material) => {
  try {
    const response = await axiosInstanceMaterialBrindar.post(`${API_URL_MATERIAL_BRINDAR}/Insertar`, material, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const listarMaterialesBrindar = async (code_Id) => {
  try {
    const response = await axiosInstanceMaterialBrindar.get(`${API_URL_MATERIAL_BRINDAR}/ListarFiltrado`, {
      params: { code_Id }
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const eliminarMaterialBrindar = async (material) => {
  try {
    const response = await axiosInstanceMaterialBrindar.post(`${API_URL_MATERIAL_BRINDAR}/Eliminar`, material, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
