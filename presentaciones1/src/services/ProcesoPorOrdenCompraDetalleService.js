import axios from 'axios';
import { notification } from 'antd';

const API_URL_PROCESO = 'https://localhost:44380/api/ProcesoPorOrdenCompraDetalle';
const API_KEY = '4b567cb1c6b24b51ab55248f8e66e5cc';

const axiosInstanceProceso = axios.create({
  headers: {
    'XApiKey': API_KEY,
    'accept': '*/*',
  }
});

// Insertar Proceso por Orden Compra Detalle
export const insertarProcesoPorOrdenCompraDetalle = async (proceso) => {
  try {
    const response = await axiosInstanceProceso.post(`${API_URL_PROCESO}/Insertar`, proceso, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    handleRequestError(error, 'Error al insertar proceso');
  }
};

// Eliminar Proceso por Orden Compra Detalle
// Eliminar Proceso por Orden Compra Detalle
export const eliminarProcesoPorOrdenCompraDetalle = async (proceso) => {
  try {
    const response = await axiosInstanceProceso.post(`${API_URL_PROCESO}/Eliminar`, proceso, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    handleRequestError(error, 'Error al eliminar proceso');
  }
};


// Listar Procesos por Orden Compra Detalle
export const listarProcesosPorOrdenCompraDetalle = async (code_Id) => {
  try {
    const response = await axiosInstanceProceso.get(`${API_URL_PROCESO}/Listar`, {
      params: { code_Id }
    });
    return response.data.data;
  } catch (error) {
    handleRequestError(error, 'Error al listar procesos');
  }
};

// Dibujar Procesos
export const dibujarProcesos = async (orco_Codigo) => {
  try {
    console.log(`Solicitando procesos dibujados para la orden de compra con código: ${orco_Codigo}`);
    const response = await axiosInstanceProceso.get(`${API_URL_PROCESO}/DibujarProcesos`, {
      params: { orco_Codigo }
    });
    console.log('Respuesta de procesos dibujados:', response.data);
    return response.data.data;
  } catch (error) {
    handleRequestError(error, 'Error al dibujar procesos');
  }
};

// Helper function for handling request errors
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
