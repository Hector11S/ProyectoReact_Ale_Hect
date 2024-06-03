import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert, Input, Card, Button, Form, notification, Modal, Row, Col } from 'antd';
import { SearchOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import Flex from 'components/shared-components/Flex';
import utils from 'utils';
import { getTallas, insertarTalla, editarTalla, eliminarTalla } from 'services/TallaService';

const Talla = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [showTable, setShowTable] = useState(true);
  const [form] = Form.useForm();
  const [currentTalla, setCurrentTalla] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tallas = await getTallas();
        console.log('Datos recibidos de la API:', tallas);
        if (Array.isArray(tallas)) {
          setData(tallas);
          setFilteredData(tallas);
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
  }, [setLoading]);

  const handleSearch = (e) => {
    const value = e.currentTarget.value.toLowerCase();
    const filtered = utils.wildCardSearch(data, value);
    setFilteredData(filtered);
  };

  const handleCollapseOpen = (key, talla = null) => {
    setActiveKey(key);
    setShowTable(false);
  
    if (talla) {
      form.setFieldsValue(talla);
      setCurrentTalla(talla);
      console.log('Current Talla:', talla); 
    } else {
      form.resetFields();
      setCurrentTalla(null);
    }
  };

  const handleCollapseClose = () => {
    setActiveKey(null);
    setCurrentTalla(null);
    setShowTable(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const date = new Date().toISOString();
      if (currentTalla) {
        const updatedTalla = {
          //editar
          ...currentTalla,
          ...values,
          tall_FechaModificacion: date,
          usua_UsuarioModificacion: 1
        };
        await editarTalla(updatedTalla);
        notification.success({ message: 'Talla actualizada correctamente' });
      } else {
        //nuevo
        const newTalla = {
          ...values,
          tall_FechaCreacion: date,
          usua_UsuarioCreacion: 1,
        };
        await insertarTalla(newTalla);
        notification.success({ message: 'Talla insertada correctamente' });
      }

      const tallas = await getTallas();
      if (Array.isArray(tallas)) {
        setData(tallas);
        setFilteredData(tallas);
      } else {
        throw new Error('Data format es incorrect');
      }
      handleCollapseClose();
    } catch (error) {
      notification.error({ message: 'Error al guardar la talla', description: error.message });
    }
  };

  const handleDelete = async (talla) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar esta talla?',
      content: 'Esta acción no se puede deshacer',
      onOk: async () => {
        try {
          await eliminarTalla(talla);
          notification.success({ message: 'Talla eliminada correctamente' });
          const tallas = await getTallas();
          if (Array.isArray(tallas)) {
            setData(tallas);
            setFilteredData(tallas);
          } else {
            throw new Error('Data format is incorrect');
          }
        } catch (error) {
          notification.error({ message: 'Error al eliminar la talla', description: error.message });
        }
      },
    });
  };




const detailsTemplate = () => {
  if (!currentTalla) return null;

  return (
    <div className="details-view">
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
          <Col>
            <h2>Detalle Talla</h2>
          </Col>
          <Col>
            <Button type="primary" onClick={handleCollapseClose} danger>Cerrar</Button>
          </Col>
        </Row>
        <div style={{ marginBottom: '16px' }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <strong>ID:</strong> {currentTalla.tall_Id}
            </Col>
            <Col span={8}>
              <strong>Código:</strong> {currentTalla.tall_Codigo}
            </Col>
            <Col span={8}>
              <strong>Nombre:</strong> {currentTalla.tall_Nombre}
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
              { key: '1', action: 'Creación', user: currentTalla.usarioCreacion, date: currentTalla.tall_FechaCreacion },
              { key: '2', action: 'Modificación', user: currentTalla.usuarioModificacion || 'N/A', date: currentTalla.tall_FechaModificacion || 'N/A' }
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
              <h2>{currentTalla ? 'Editar Talla' : 'Nueva Talla'}</h2>
            </Col>
            <Col>
              {/* <Button type="primary" onClick={handleCollapseClose} danger>Cerrar</Button> */}
            </Col>
          </Row>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="tall_Codigo" label="Código" rules={[{ required: true, message: 'El código es obligatorio' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="tall_Nombre" label="Nombre" rules={[{ required: true, message: 'El nombre es obligatorio' }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} justify="end">
              <Col>
                <Button onClick={handleCollapseClose} style={{ marginRight: '8px' }} danger>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit">
                  {currentTalla ? 'Actualizar' : 'Crear'}
                </Button>
              </Col>
            </Row>
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
      dataIndex: 'tall_Id',
      key: 'tall_Id',
      sorter: (a, b) => a.tall_Id - b.tall_Id,
    },
    {
      title: 'Código',
      dataIndex: 'tall_Codigo',
      key: 'tall_Codigo',
      sorter: (a, b) => a.tall_Codigo.localeCompare(b.tall_Codigo),
    },
    {
      title: 'Nombre',
      dataIndex: 'tall_Nombre',
      key: 'tall_Nombre',
      sorter: (a, b) => a.tall_Nombre.localeCompare(b.tall_Nombre),
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
        
        </Row>
      ),
    },
  ];

  return (
    <Card>
      {showTable ? (
        <>
          <Card>
            <h1 className='text-center'>Index de Tallas</h1>
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
              rowKey="tall_Id"
              pagination={{ pageSize: 10 }}
            />
          </div>
        </>
      ) : (
        activeKey === 'details' ? detailsTemplate() : formTemplate()
      )}
    </Card>
  );
};

export default Talla;
