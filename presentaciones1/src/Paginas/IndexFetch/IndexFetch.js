import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert, Input, Card, Button, Tooltip } from 'antd';
import { SearchOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import Flex from 'components/shared-components/Flex';
import utils from 'utils';

const IndexFetch = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': '23b81e831amsh6db846581d271b6p11d5e0jsnaad06a5bb2df',
          'X-RapidAPI-Host': 'crud-operations2.p.rapidapi.com'
        }
      };

      try {
        const response = await fetch('https://crud-operations2.p.rapidapi.com/api/v1', options);
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        setData(data);
        setFilteredData(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    const value = e.currentTarget.value;
    const filtered = utils.wildCardSearch(data, value);
    setFilteredData(filtered);
  };

  const handleEdit = (record) => {
    console.log('Edit record:', record);
    // Añade aquí la lógica para editar el registro
  };

  const handleDelete = (record) => {
    console.log('Delete record:', record);
    // Añade aquí la lógica para eliminar el registro
  };

  const handleDetails = (record) => {
    console.log('View details of record:', record);
    // Añade aquí la lógica para ver los detalles del registro
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin tip="Cargando..." />
      </div>
    );
  }

  if (error) return <Alert message="Error" description={error.message} type="error" showIcon />;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
      sortDirections: ['ascend', 'descend']
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend']
    },
    {
      title: 'Mensaje',
      dataIndex: 'da',
      key: 'da',
      sorter: (a, b) => a.da.localeCompare(b.da),
      sortDirections: ['ascend', 'descend']
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (text, record) => (
        <div className="text-right">
          <Tooltip title="Editar">
            <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>
              Editar
            </Button>
          </Tooltip>
          <Tooltip title="Detalles">
            <Button icon={<EyeOutlined />} onClick={() => handleDetails(record)} style={{ marginRight: 8 }}>
              Detalles
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button type="primary" icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
              Eliminar
            </Button>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between" mobileFlex={false}>
        <div>
          <Button type="primary" icon={<PlusCircleOutlined />} block>Nuevo</Button>
        </div>
        <Flex className="mb-1" mobileFlex={false}>
          <div className="mr-md-3 mb-3">
            <Input placeholder="Buscar" prefix={<SearchOutlined />} onChange={handleSearch} />
          </div>
        </Flex>
      </Flex>
      <div className="table-responsive">
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="id" 
        />
      </div>
    </Card>
  );
};

export default IndexFetch;