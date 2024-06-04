import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert, Input, Card, Button, Form, notification, Modal, Row, Col } from 'antd';
import { SearchOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import Flex from 'components/shared-components/Flex';
import utils from 'utils';
import { fetchMarcas, saveMarca, deleteMarca } from 'services/MarcasServicios';

const IndexMarcas = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [showTable, setShowTable] = useState(true);
  const [form] = Form.useForm();
  const [currentMarca, setCurrentMarca] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const marcas = await fetchMarcas();
        console.log('Datos recibidos de la API:', marcas); 
        if (Array.isArray(marcas)) {
          setData(marcas);
          setFilteredData(marcas);
        } else {
          throw new Error('Data format is incorrect');
        }
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    const value = e.currentTarget.value.toLowerCase();
    const filtered = utils.wildCardSearch(data, value);
    setFilteredData(filtered);
  };

  const handleCollapseOpen = (key, marca = null) => {
    setActiveKey(key);
    setShowTable(false);

    if (marca) {
      form.setFieldsValue(marca);
      setCurrentMarca(marca);
    } else {
      form.resetFields();
      setCurrentMarca(null);
    }
  };

  const handleCollapseClose = () => {
    setActiveKey(null);
    setCurrentMarca(null);
    setShowTable(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const date = new Date().toISOString();
      if (currentMarca) {
        const updatedMarca = {
          ...currentMarca,
          ...values,
          marc_FechaModificacion: date,
          usua_UsuarioModificacion: 1
        };
        await saveMarca(updatedMarca);
        notification.success({ message: 'Marca actualizada correctamente' });
      } else {
        const newMarca = {
          ...values,
          marc_FechaCreacion: date,
          usua_UsuarioCreacion: 1,
        };
        await saveMarca(newMarca);
        notification.success({ message: 'Marca insertada correctamente' });
      }

      const marcas = await fetchMarcas();
      if (Array.isArray(marcas)) {
        setData(marcas);
        setFilteredData(marcas);
      } else {
        throw new Error('Data format is incorrect');
      }
      handleCollapseClose();
    } catch (error) {
      notification.error({ message: 'Error al guardar la marca', description: error.message });
    }
  };

  const handleDelete = async (marca) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar esta marca?',
      content: 'Esta acción no se puede deshacer',
      onOk: async () => {
        try {
          await deleteMarca(marca);
          notification.success({ message: 'Marca eliminada correctamente' });
          const marcas = await fetchMarcas();
          if (Array.isArray(marcas)) {
            setData(marcas);
            setFilteredData(marcas);
          } else {
            throw new Error('Data format is incorrect');
          }
        } catch (error) {
          notification.error({ message: 'Error al eliminar la marca', description: error.message });
        }
      },
    });
  };

  const detailsTemplate = () => {
    if (!currentMarca) return null;

    return (
      <div className="details-view">
        <Card>
          <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
            <Col>
              <h2>Detalle Marca</h2>
            </Col>
            <Col>
              <Button type="primary" onClick={handleCollapseClose} danger>Cerrar</Button>
            </Col>
          </Row>
          <div style={{ marginBottom: '16px' }}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <strong>ID:</strong> {currentMarca.marc_Id}
              </Col>
              <Col span={8}>
                <strong>Marca:</strong> {currentMarca.marc_Descripcion}
              </Col>
              <Col span={8}>
                <strong>Estado:</strong> {currentMarca.marc_Estado ? 'Activo' : 'Inactivo'}
              </Col>
            </Row>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <h3>Auditoría</h3>
            <Table
              columns={[
                { title: 'Acción', dataIndex: 'action', key: 'action' },
                { title: 'Usuario', dataIndex: 'user', key: 'user' },
                { title: 'Fecha', dataIndex: 'date', key: 'date' }
              ]}
              dataSource={[
                { key: '1', action: 'Creación', user: currentMarca.usuarioCreacionNombre, date: currentMarca.marc_FechaCreacion },
                { key: '2', action: 'Modificación', user: currentMarca.usuarioModificacionNombre, date: currentMarca.marc_FechaModificacion }
              ]}
              pagination={false}
            />
          </div>
        </Card>
      </div>
    );
  };

  const formTemplate = () => {
    return (
      <div className="form-view">
        <Card>
          <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
            <Col>
              <h2>{currentMarca ? 'Editar Marca' : 'Nueva Marca'}</h2>
            </Col>
            <Col>
              {/* <Button type="primary" onClick={handleCollapseClose} danger>Cerrar</Button> */}
            </Col>
          </Row>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="marc_Descripcion" label="Descripción" rules={[{ required: true, message: 'La descripción es obligatoria' }]}>
              <Input />
            </Form.Item>
            <Form.Item>
              <Row justify="end">
                <Col>


               
                <Button onClick={handleCollapseClose} style={{ marginRight: '8px' }}>
                  Cancelar
                </Button>
                  <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>

                    {currentMarca ? 'Actualizar' : 'Crear'}
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
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
      align: 'center',
      render: (text, record) => (
        <Row justify="center">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleCollapseOpen('edit', record)}
            style={{ marginRight: 8, backgroundColor: 'blue', color: 'white' }}
          >
            Editar
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleCollapseOpen('details', record)}
            style={{ marginRight: 8, backgroundColor: 'orange', color: 'white' }}
          >
            Detalles
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            style={{ backgroundColor: 'red', color: 'white' }}
          >
            Eliminar
          </Button>
        </Row>
      ),
    },
  ];

  return (
    <Card>
      {showTable ? (
        <>
          <Card>
            <h1 className='text-center'>Index de Marcas</h1>
          </Card>
          <Flex alignItems="center" justifyContent="space-between" mobileFlex={false}>
            <div>
              <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => handleCollapseOpen('new')} block>Nuevo</Button>
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
      ) : (
        activeKey === 'details' ? detailsTemplate() : formTemplate()
      )}
    </Card>
  );
};
export default IndexMarcas;
