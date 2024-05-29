import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert, Input, Card, Button, Form, notification, Collapse, Modal, Descriptions, Row, Col } from 'antd';
import { SearchOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import Flex from 'components/shared-components/Flex';
import utils from 'utils';
import { getTallas, insertarTalla, editarTalla, eliminarTalla } from 'services/TallaService';


const { Panel } = Collapse;

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
  }, []);

  const handleSearch = (e) => {
    const value = e.currentTarget.value.toLowerCase();
    const filtered = utils.wildCardSearch(data, value);
    setFilteredData(filtered);
  };

  const handleCollapseOpen = (key, talla = null) => {
    setActiveKey(key);
    setCurrentTalla(talla);
    setShowTable(false);
    if (talla) {
      form.setFieldsValue(talla);
    } else {
      form.resetFields();
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
      if (currentTalla) {
        await editarTalla({ ...currentTalla, ...values });
        notification.success({ message: 'Talla actualizada correctamente' });
      } else {
        await insertarTalla(values);
        notification.success({ message: 'Talla insertada correctamente' });
      }
      const tallas = await getTallas();
      if (Array.isArray(tallas)) {
        setData(tallas);
        setFilteredData(tallas);
      } else {
        throw new Error('Data format is incorrect');
      }
      handleCollapseClose();
    } catch (error) {
      notification.error({ message: 'Error al guardar la talla', description: error.message });
    }
  };

  // const handleDelete = async (talla) => {
  //   Modal.confirm({
  //     title: '¿Estás seguro de eliminar esta talla?',
  //     content: 'Esta acción no se puede deshacer',
  //     onOk: async () => {
  //       try {
  //         await eliminarTalla(talla);
  //         notification.success({ message: 'Talla eliminada correctamente' });
  //         const tallas = await getTallas();
  //         if (Array.isArray(tallas)) {
  //           setData(tallas);
  //           setFilteredData(tallas);
  //         } else {
  //           throw new Error('Data format is incorrect');
  //         }
  //       } catch (error) {
  //         notification.error({ message: 'Error al eliminar la talla', description: error.message });
  //       }
  //     },
  //   });
  // };

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
    },
    {
      title: 'Código',
      dataIndex: 'tall_Codigo',
      key: 'tall_Codigo',
    },
    {
      title: 'Nombre',
      dataIndex: 'tall_Nombre',
      key: 'tall_Nombre',
    },
    {
        title: 'Acciones',
        key: 'actions',
        align: 'center',
        render: (text, record) => (
          <Row justify="center">
           
            <Button
              icon={<EditOutlined />}
              onClick={() => handleCollapseOpen('edit', record)}
              style={{ marginRight: 8 }}
            >
              Editar
            </Button>

            <Button
              icon={<EyeOutlined />}
              onClick={() => handleCollapseOpen('details', record)}
              style={{ marginRight: 8 }}
            >
              Detalles
            </Button>
            {/* <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              type="danger"
            >
              Eliminar
            </Button> */}
          </Row>
        ),
      },
  ];

  return (
    <Card>
      {showTable ? (
        <>
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
            />
          </div>
        </>
      ) : (
        <Collapse activeKey={activeKey}>
        <Panel header={currentTalla ? (activeKey === 'details' ? 'Detalles de Talla' : 'Editar Talla') : 'Nueva Talla'} key={activeKey}>
          {activeKey === 'details' ? (
            <>
              <Card title="Información de Talla" bordered={false}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Descriptions.Item label="ID">ID: {currentTalla.tall_Id}</Descriptions.Item>
                  </Col>
                  <Col span={12}>
                    <Descriptions.Item label="Código">Código: {currentTalla.tall_Codigo}</Descriptions.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Descriptions.Item label="Nombre">Nombre: {currentTalla.tall_Nombre}</Descriptions.Item>
                  </Col>
                </Row>
              </Card>
              
              <Card title="Auditoría" bordered={false} style={{ marginTop: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Descriptions.Item label="Usuario Creación">
                      Usuario Creación: {currentTalla.usarioCreacion}
                    </Descriptions.Item>
                  </Col>
                  <Col span={12}>
                    <Descriptions.Item label="Fecha Creación">
                      Fecha Creación: {currentTalla.tall_FechaCreacion}
                    </Descriptions.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Descriptions.Item label="Usuario Modificación">
                      Usuario Modificación: {currentTalla.usuarioModificacion}
                    </Descriptions.Item>
                  </Col>
                  <Col span={12}>
                    <Descriptions.Item label="Fecha Modificación">
                      Fecha Modificación: {currentTalla.tall_FechaModificacion}
                    </Descriptions.Item>
                  </Col>
                </Row>
              </Card>
              <Button onClick={handleCollapseClose} style={{ marginLeft: 8 }}>Cancelar</Button>
            </>
          ) : (
            <Form form={form} layout="vertical">
              <Form.Item name="tall_Codigo" label="Código" rules={[{ required: true, message: 'Por favor, ingrese el código' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="tall_Nombre" label="Nombre" rules={[{ required: true, message: 'Por favor, ingrese el nombre' }]}>
                <Input />
              </Form.Item>
              <Button type="primary" onClick={handleSubmit}>Guardar</Button>
              <Button onClick={handleCollapseClose} style={{ marginLeft: 8 }}>Cancelar</Button>
            </Form>
          )}
        </Panel>
      </Collapse>
      
      )}
    </Card>
  );
};

export default Talla;
