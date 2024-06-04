import axios from 'axios';

const API_URL_PROCESO = 'https://localhost:44380/api/ProcesoPorOrdenCompraDetalle';
const API_KEY = '4b567cb1c6b24b51ab55248f8e66e5cc';

const axiosInstanceProceso = axios.create({
  headers: {
    'XApiKey': API_KEY,
    'accept': '*/*',
  }
});

export const insertarProcesoPorOrdenCompraDetalle = async (proceso) => {
  try {
    const response = await axiosInstanceProceso.post(`${API_URL_PROCESO}/Insertar`, proceso, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const eliminarProcesoPorOrdenCompraDetalle = async (proceso) => {
  try {
    const response = await axiosInstanceProceso.post(`${API_URL_PROCESO}/Eliminar`, proceso, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};




export const listarProcesosPorOrdenCompraDetalle = async (code_Id) => {
  try {
    const response = await axiosInstanceProceso.get(`${API_URL_PROCESO}/Listar`, {
      params: { code_Id }
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

