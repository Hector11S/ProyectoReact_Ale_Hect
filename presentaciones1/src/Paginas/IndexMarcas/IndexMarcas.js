import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert, Input, Card, Button, Modal, Form, notification } from 'antd';
import { SearchOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Flex from 'components/shared-components/Flex';
import utils from 'utils';
// import Right from 'views/app-views/components/data-display/timeline/Right';
import { fetchMarcas, fetchMarcaDetails, deleteMarca, saveMarca } from '../../services/MarcasServicios';

const IndexMarcas = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('table'); 
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [historialData, setHistorialData] = useState([]);
  const [marcaDetails, setMarcaDetails] = useState({});
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      const data = await fetchMarcas();
      setData(data);
      setFilteredData(data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e) => {
    const value = e.currentTarget.value.toLowerCase();
    const searchArray = value ? data : filteredData;
    const filtered = utils.wildCardSearch(searchArray, value);
    setFilteredData(filtered);
  };

  const handleNew = () => {
    form.resetFields();
    setSelectedRecord(null);
    setView('form');
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setSelectedRecord(record);
    setView('form');
  };

  const handleDetails = async (record) => {
    setSelectedRecord(record);
    setView('details');
    try {
      const details = await fetchMarcaDetails(record.marc_Id);
      setMarcaDetails(details);
      setHistorialData([
        { accion: 'Creación', fecha: details.marc_FechaCreacion, usuario: details.usuarioCreacionNombre },
        { accion: 'Modificación', fecha: details.marc_FechaModificacion, usuario: details.usuarioModificacionNombre },
        { accion: 'Eliminación', fecha: details.marc_FechaEliminacion, usuario: details.usuarioEliminacionNombre },
      ].filter(item => item.fecha));
    } catch (error) {
      console.error("Error fetching historial data:", error);
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar esta marca?',
      onOk: async () => {
        try {
          await deleteMarca(record);
          notification.success({ message: 'Marca eliminada correctamente' });
          fetchData(); // Refresh the data after deletion
        } catch (error) {
          notification.error({ message: 'Error al eliminar la marca' });
        }
      },
    });
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      await saveMarca(values);
      notification.success({ message: 'Operación completada correctamente' });
      fetchData(); // Refresh the data after insertion or editing
      setView('table');
    } catch (error) {
      notification.error({ message: 'Error al guardar la marca' });
    }
  };

  const handleCollapseClose = () => {
    setView('table');
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
      dataIndex: 'marc_Id',
      key: 'marc_Id',
      sorter: (a, b) => a.marc_Id - b.marc_Id,
    },
    {
      title: 'Marca',
      dataIndex: 'marc_Descripcion',
      key: 'marc_Descripcion',
      sorter: (a, b) => a.marc_Descripcion.localeCompare(b.marc_Descripcion),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (text, record) => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Button
            icon={<EditOutlined />}
            style={{ marginRight: 8, backgroundColor: 'orange', color: 'white' }}
            onClick={() => handleEdit(record)}
          >
            Editar
          </Button>
          <Button
            icon={<InfoCircleOutlined />}
            style={{ marginRight: 8, backgroundColor: 'blue', color: 'white' }}
            onClick={() => handleDetails(record)}
          >
            Detalles
          </Button>
          <Button
            icon={<DeleteOutlined />}
            style={{ backgroundColor: 'red', color: 'white' }}
            onClick={() => handleDelete(record)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      {view === 'table' ? (
        <>
          <Flex alignItems="center" justifyContent="space-between" mobileFlex={false}>
            <div>
              <Button type="primary" icon={<PlusCircleOutlined />} block onClick={handleNew}>Nuevo</Button>
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
              rowKey="marc_Id" 
            />
          </div>
        </>
      ) : view === 'form' ? (
        <div style={{ padding: '24px', background: '#fff' }}>
          <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
            <Form.Item name="marc_Id" label="ID" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="marc_Descripcion" label="Marca" rules={[{ required: true, message: 'Por favor ingrese la marca' }]}>
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Guardar</Button>
              <Button style={{ marginLeft: 8 }} onClick={handleCollapseClose}>Cancelar</Button>
            </Form.Item>
          </Form>
        </div>
      ) : (
        <div style={{ padding: '24px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Detalles Marcas</h2>
            <Button onClick={handleCollapseClose}>Cerrar</Button>
          </div>
          <hr />
          <br /><br />
          {marcaDetails && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}><strong>ID:</strong> {marcaDetails.marc_Id}</div>
                <div style={{ flex: 1 }}><strong>Marca:</strong> {marcaDetails.marc_Descripcion}</div>
                <div style={{ flex: 1 }}><strong>Estado:</strong> {marcaDetails.marc_Estado ? 'Activo' : 'Inactivo'}</div>
              </div>
              <br /><br />
              <Card title="Auditoría">
                <Table
                  columns={[
                    { title: 'Acción', dataIndex: 'accion', key: 'accion' },
                    { title: 'Usuario', dataIndex: 'usuario', key: 'usuario' },
                    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha' },
                  ]}
                  dataSource={historialData}
                  rowKey="id"
                />
              </Card>
            </>
          )}
        </div>
      )}
    </Card>
  );
};

export default IndexMarcas;
