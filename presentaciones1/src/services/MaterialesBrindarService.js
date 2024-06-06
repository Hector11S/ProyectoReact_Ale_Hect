import axios from 'axios';
import { notification } from 'antd';

const API_URL_MATERIAL_BRINDAR = 'https://localhost:44380/api/MaterialesBrindar';
const API_KEY = '4b567cb1c6b24b51ab55248f8e66e5cc';

const axiosInstanceMaterialBrindar = axios.create({
  headers: {
    'XApiKey': API_KEY,
    'accept': '*/*',
  }
});

// Insertar Material
export const insertarMaterialBrindar = async (material) => {
  try {
    const response = await axiosInstanceMaterialBrindar.post(`${API_URL_MATERIAL_BRINDAR}/Insertar`, material, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    handleRequestError(error, 'Error al insertar material');
  }
};

// Editar Material
export const editarMaterialBrindar = async (material) => {
  try {
    const response = await axiosInstanceMaterialBrindar.post(`${API_URL_MATERIAL_BRINDAR}/Editar`, material, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    handleRequestError(error, 'Error al editar material');
  }
};

// Eliminar Material
export const eliminarMaterialBrindar = async (material) => {
  try {
    const response = await axiosInstanceMaterialBrindar.post(`${API_URL_MATERIAL_BRINDAR}/Eliminar`, material, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    handleRequestError(error, 'Error al eliminar material');
  }
};

// Listar Materiales
export const listarMaterialesBrindar = async () => {
  try {
    const response = await axiosInstanceMaterialBrindar.get(`${API_URL_MATERIAL_BRINDAR}/Listar`);
    return response.data.data;
  } catch (error) {
    handleRequestError(error, 'Error al listar materiales');
  }
};

export const listarMaterialesBrindarFiltrado = async (code_Id) => {
  try {
    const response = await axiosInstanceMaterialBrindar.get(`${API_URL_MATERIAL_BRINDAR}/ListarFiltrado`, {
      params: { code_Id }
    });
    return response.data.data;
  } catch (error) {
    handleRequestError(error, 'Error al listar materiales filtrados');
  }
};

const handleRequestError = (error, defaultMessage) => {
  if (error.response) {
    notification.error({
      message: defaultMessage,
      description: `Error del servidor: ${error.response.data}`
    });
  } else if (error.request) {
    notification.error({
      message: defaultMessage,
      description: 'No se recibió respuesta del servidor. Verifique su conexión.'
    });
  } else {
    notification.error({
      message: defaultMessage,
      description: `Error desconocido: ${error.message}`
    });
  }
  throw error;
};
