import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spin, Alert, Input, Card, Button } from 'antd';
import { SearchOutlined, PlusCircleOutlined } from '@ant-design/icons';
import Flex from 'components/shared-components/Flex';
import utils from 'utils';

const IndexAxion = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const options = {
        method: 'GET',
        url: 'https://crud-operations2.p.rapidapi.com/api/v1',
        headers: {
          'X-RapidAPI-Key': '23b81e831amsh6db846581d271b6p11d5e0jsnaad06a5bb2df',
          'X-RapidAPI-Host': 'crud-operations2.p.rapidapi.com'
        }
      };

      try {
        const response = await axios.request(options);
        setData(response.data);
        setFilteredData(response.data);
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
    const searchArray = value ? data : filteredData;
    const filtered = utils.wildCardSearch(searchArray, value);
    setFilteredData(filtered);
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
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mensaje',
      dataIndex: 'da',
      key: 'da',
    },
  ];

  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between" mobileFlex={false}>
        <div>
          <Button type="primary" icon={<PlusCircleOutlined />} block>Nuevo</Button>
        </div>
        <Flex className="mb-1" mobileFlex={false}>
          <div className="mr-md-3 mb-3">
            <Input placeholder="Nuevo" prefix={<SearchOutlined />} onChange={handleSearch} />
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

export default IndexAxion;
