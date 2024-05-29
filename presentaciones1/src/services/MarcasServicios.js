import axios from 'axios';

const apiUrl = 'https://localhost:44380/api/Marcas';
const apiKey = '4b567cb1c6b24b51ab55248f8e66e5cc';

export const fetchMarcas = async () => {
  const options = {
    method: 'GET',
    url: `${apiUrl}/Listar`,
    headers: {
      'XApiKey': apiKey,
    }
  };

  try {
    const response = await axios.request(options);
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      throw new Error('La respuesta de la API no es un array');
    }
  } catch (error) {
    throw error;
  }
};

export const fetchMarcaDetails = async (id) => {
  const options = {
    method: 'GET',
    url: `${apiUrl}/ObtenerPorId/${id}`,
    headers: {
      'XApiKey': apiKey,
    }
  };

  try {
    const response = await axios.request(options);
    if (response.data && response.data.data) {
      return response.data.data;
    } else {
      throw new Error('La respuesta de la API no contiene los datos esperados');
    }
  } catch (error) {
    throw error;
  }
};

export const deleteMarca = async (record) => {
  const options = {
    method: 'POST',
    url: `${apiUrl}/Eliminar`,
    headers: {
      'XApiKey': apiKey,
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

export const saveMarca = async (record) => {
  const url = record.marc_Id ? `${apiUrl}/Editar` : `${apiUrl}/Insertar`;
  const options = {
    method: 'POST',
    url,
    headers: {
      'XApiKey': apiKey,
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
