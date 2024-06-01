import axios from 'axios';

const API_URL = 'https://localhost:44380/api/RevisionDeCalidad';
const API_KEY = '4b567cb1c6b24b51ab55248f8e66e5cc';

const axiosInstance = axios.create({
  headers: {
    'XApiKey': API_KEY,
    'accept': '*/*',
  }
});

export const getRevision = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/Listar`);
    console.log('Respuesta de la API:', response.data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const insertarRevision = async (revision) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/Insertar`, revision, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Datos del error:', error.response.data);
      console.error('Estado del error:', error.response.status);
      console.error('Cabeceras del error:', error.response.headers);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};

export const editarRevision = async (revision) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/Editar`, revision, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Datos del error:', error.response.data);
      console.error('Estado del error:', error.response.status);
      console.error('Cabeceras del error:', error.response.headers);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};

export const eliminarRevision = async (revision) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/Eliminar`, revision, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Datos del error:', error.response.data);
      console.error('Estado del error:', error.response.status);
      console.error('Cabeceras del error:', error.response.headers);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};
