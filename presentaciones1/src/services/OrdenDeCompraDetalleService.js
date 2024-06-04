import axios from 'axios';

const API_URL = 'https://localhost:44380/api/OrdenCompraDetalles';
const API_KEY = '4b567cb1c6b24b51ab55248f8e66e5cc';

const axiosInstance = axios.create({
  headers: {
    'XApiKey': API_KEY,
    'accept': '*/*',
  }
});

export const eliminarOrdenDetalle = async (detalle) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/Eliminar`, detalle, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.log('Error al eliminar detalle de la orden:', error.response ? error.response.data : error.message);
    console.log('Error status:', error.response ? error.response.status : 'Sin respuesta');
    console.log('Error headers:', error.response ? error.response.headers : 'Sin respuesta');
    throw error;
  }
};

export const editarOrdenDetalle = async (detalle) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/Editar`, detalle, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.log('Error al editar detalle de la orden:', error.response ? error.response.data : error.message);
    console.log('Error status:', error.response ? error.response.status : 'Sin respuesta');
    console.log('Error headers:', error.response ? error.response.headers : 'Sin respuesta');
    throw error;
  }
};

export const insertarOrdenDetalle = async (detalle) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/Insertar`, detalle, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al insertar detalle de la orden:', error.response ? error.response.data : error);
    throw error;
  }
};



export const getOrdenDetalles = async (orco_Id) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/Listar`, {
      params: { orco_Id }
    });
    return response.data.data;
  } catch (error) {
    console.log('Error al obtener detalles de la orden:', error.response ? error.response.data : error.message);
    console.log('Error status:', error.response ? error.response.status : 'Sin respuesta');
    console.log('Error headers:', error.response ? error.response.headers : 'Sin respuesta');
    throw error;
  }
};
