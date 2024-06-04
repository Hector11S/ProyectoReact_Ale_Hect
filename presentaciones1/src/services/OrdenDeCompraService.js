import axios from 'axios';

const API_URL = 'https://localhost:44380/api/OrdenCompra';
const API_KEY = '4b567cb1c6b24b51ab55248f8e66e5cc';

const axiosInstance = axios.create({
  headers: {
    'XApiKey': API_KEY,
    'accept': '*/*',
  }
});

export const getOrden = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/Listar`);
    console.log('Respuesta de la API:', response.data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const finalizarOrden = async (orden) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/FinalizarOrdenCompra`, orden, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const insertarOrden = async (talla) => {
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

export const editarOrden = async (talla) => {
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


export const eliminarOrden = async (record) => {
  const options = {
    method: 'POST',
    url: `${API_URL}/Eliminar`,
    headers: {
      'XApiKey': API_KEY,
    },
    data: record
  };

  try {
    const response = await axios.request(options);
    return response;
  } catch (error) {
    throw error;
  }
};



