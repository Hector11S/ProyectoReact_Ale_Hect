import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert, Input, Card, Button, Form, notification, Collapse, Modal, Descriptions, Row, Col, Checkbox  } from 'antd';
import { SearchOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import Flex from 'components/shared-components/Flex';
import utils from 'utils';
import { getMonedas, insertarMoneda, editarMoneda } from 'services/MonedaService';
import { BODY_BACKGROUND } from 'constants/ThemeConstant';
import Header from 'components/layout-components/HeaderNav/Header';


const { Panel } = Collapse;

const Moneda = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [showTable, setShowTable] = useState(true);
  const [form] = Form.useForm();
  const [actualmoneda, setActualMoneda] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const monedas = await getMonedas();
        console.log('Datos recibidos de la API:', monedas); 
        if (Array.isArray(monedas)) {
          setData(monedas);
          setFilteredData(monedas);
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

  const handleCollapseOpen = (key, moneda = null) => {
    setActiveKey(key);
    setActualMoneda(moneda);
    setShowTable(false);
    if (moneda) {
      form.setFieldsValue(moneda);
    } else {
      form.resetFields();
    }
  };

  const handleCollapseClose = () => {
    setActiveKey(null);
    setActualMoneda(null);
    setShowTable(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const date = new Date().toISOString();
      if (actualmoneda) {
        // Editar
        const updatedMoneda = {
          ...actualmoneda,
          ...values,
          mone_FechaModificacion: date,
          usua_UsuarioModificacion: 1
        };
        await editarMoneda(updatedMoneda);
        notification.success({ message: 'Moneda actualizada correctamente' });
      } else {
        // Nuevo
        const newMoneda = {
          ...values,
          mone_FechaCreacion: date,
          usua_UsuarioCreacion: 1,
        };
        await insertarMoneda(newMoneda);
        notification.success({ message: 'Moneda insertada correctamente' });
      }


      const monedas = await getMonedas();
      if (Array.isArray(monedas)) {
        setData(monedas);
        setFilteredData(monedas);
      } else {
        throw new Error('Data format is incorrect');
      }
      handleCollapseClose();
    } catch (error) {
      notification.error({ message: 'Error al guardar la moneda', description: error.message });
    }
  };

  // const handleDelete = async (moneda) => {
  //   Modal.confirm({
  //     title: '¿Estás seguro de eliminar esta moneda?',
  //     content: 'Esta acción no se puede deshacer',
  //     onOk: async () => {
  //       try {
  //         await eliminarMoneda(moneda);
  //         notification.success({ message: 'Moneda eliminada correctamente' });
  //         const monedas = await getMonedas();
  //         if (Array.isArray(monedas)) {
  //           setData(monedas);
  //           setFilteredData(monedas);
  //         } else {
  //           throw new Error('Data format is incorrect');
  //         }
  //       } catch (error) {
  //         notification.error({ message: 'Error al eliminar la moneda', description: error.message });
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
      dataIndex: 'mone_Id',
      key: 'mone_Id',
    },
    {
      title: 'Código',
      dataIndex: 'mone_Codigo',
      key: 'mone_Codigo',
    },
    {
      title: 'Moneda',
      dataIndex: 'mone_Descripcion',
      key: 'mone_Descripcion',
    },
    {
        title: 'Es Aduana',
        dataIndex: 'mone_EsAduana',
        key: 'mone_EsAduana',
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

    <Card style={{ background: "linear-gradient(to bottom, #33ccff 0%, #ff99cc 100%)" }}>
      {showTable ? (
        <>
         <Card style={{background: "#94DDFF"}}>
         <h1 className='text-center'>Index de Monedas</h1>
         </Card>
          <Flex alignItems="center" justifyContent="space-between" mobileFlex={false}>
            <div>
              <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => handleCollapseOpen('new')} block>Nuevo</Button>
            </div>
            <Flex className="mb-1" mobileFlex={false}>
              <div className="mr-md-3 mb-3">
                <Input placeholder="Buscar" style={{borderColor: "#94DDFF"}} prefix={<SearchOutlined />} onChange={handleSearch} />
              </div>
            </Flex>
          </Flex>
          <div className="table-responsive">
            <Table
              columns={columns} 
              dataSource={filteredData} 
              rowKey="mone_Id" 
            />
          </div>
        </>
      ) : (
        <Collapse activeKey={activeKey}>
        <Panel header={actualmoneda ? (activeKey === 'details' ? 'Detalles de Moneda' : 'Editar Moneda') : 'Nueva Moneda'} key={activeKey}>
          {activeKey === 'details' ? (
            <>
              <Card title="Información de Moneda"  bordered={false}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Descriptions.Item label="ID">ID: {actualmoneda.mone_Id}</Descriptions.Item>
                  </Col>
                  <Col span={12}>
                    <Descriptions.Item label="Código">Código: {actualmoneda.mone_Codigo}</Descriptions.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Descriptions.Item label="Moneda">Moneda: {actualmoneda.mone_Descripcion}</Descriptions.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Descriptions.Item label="Aduana">Aduana: {actualmoneda.mone_EsAduana}</Descriptions.Item>
                  </Col>
                </Row>
              </Card>
              
              <Card title="Auditoría" bordered={false} style={{ marginTop: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Descriptions.Item label="Usuario Creación">
                      Usuario Creación: {actualmoneda.usuarioCreacionNombre}
                    </Descriptions.Item>
                  </Col>
                  <Col span={12}>
                    <Descriptions.Item label="Fecha Creación">
                      Fecha Creación: {actualmoneda.mone_FechaCreacion}
                    </Descriptions.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Descriptions.Item label="Usuario Modificación">
                      Usuario Modificación: {actualmoneda.usua_UsuarioModificacion}
                    </Descriptions.Item>
                  </Col>
                  <Col span={12}>
                    <Descriptions.Item label="Fecha Modificación">
                      Fecha Modificación: {actualmoneda.mone_FechaModificacion}
                    </Descriptions.Item>
                  </Col>
                </Row>
              </Card>
              <Button onClick={handleCollapseClose} style={{ marginLeft: 8 }}>Cancelar</Button>
            </>
          ) : (
            <Form form={form} layout="vertical">
              <Form.Item name="mone_Codigo" label="Código" rules={[{ required: true, message: 'Por favor, ingrese el código' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="mone_Descripcion" label="Nombre" rules={[{ required: true, message: 'Por favor, ingrese el nombre' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="mone_EsAduana" label="Es Aduana">
                <Checkbox  />
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

export default Moneda;