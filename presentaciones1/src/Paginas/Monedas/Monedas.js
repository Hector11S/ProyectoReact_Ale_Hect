import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert, Input, Card, Button, Form, notification, Row, Col, Checkbox } from 'antd';
import { SearchOutlined, PlusCircleOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import Flex from 'components/shared-components/Flex';
import utils from 'utils';
import { getMonedas, insertarMoneda, editarMoneda } from 'services/MonedaService';

const Moneda = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [showTable, setShowTable] = useState(true);
  const [form] = Form.useForm();
  const [actualmoneda, setActualMoneda] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

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
    setIsEdit(!!moneda);
    if (moneda) {
      form.setFieldsValue({
        ...moneda,
        mone_EsAduana: !!moneda.mone_EsAduana 
      });
    } else {
      form.resetFields();
    }
  };

  const handleCollapseClose = () => {
    setActiveKey(null);
    setActualMoneda(null);
    setShowTable(true);
    setIsEdit(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const date = new Date().toISOString();
      if (actualmoneda) {
        const updatedMoneda = {
          ...actualmoneda,
          ...values,
          mone_FechaModificacion: date,
          usua_UsuarioModificacion: 1
        };
        await editarMoneda(updatedMoneda);
        notification.success({ message: 'Moneda actualizada correctamente' });
      } else {
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

  const detailsTemplate = () => {
    if (!actualmoneda) return null;

    return (
      <div className="details-view">
        <Card>
          <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
            <Col>
              <h2>Detalles de Moneda</h2>
            </Col>
            <Col>
              <Button type="primary" onClick={handleCollapseClose} danger>Cerrar</Button>
            </Col>
          </Row>
          <div style={{ marginBottom: '16px' }}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <strong>ID:</strong> {actualmoneda.mone_Id}
              </Col>
              <Col span={8}>
                <strong>Código:</strong> {actualmoneda.mone_Codigo}
              </Col>
              <Col span={8}>
                <strong>Moneda:</strong> {actualmoneda.mone_Descripcion}
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <strong>Aduana:</strong> {actualmoneda.mone_EsAduana ? 'Sí' : 'No'}
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
                { key: '1', action: 'Creación', user: actualmoneda.usuarioCreacionNombre, date: actualmoneda.mone_FechaCreacion },
                { key: '2', action: 'Modificación', user: actualmoneda.usuarioModificacionNombre, date: actualmoneda.mone_FechaModificacion }
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
              <h2>{actualmoneda ? 'Editar Moneda' : 'Nueva Moneda'}</h2>
            </Col>
       
          </Row>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="mone_Codigo" label="Código" rules={[{ required: true, message: 'Por favor, ingrese el código' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="mone_Descripcion" label="Descripción" rules={[{ required: true, message: 'Por favor, ingrese la descripción' }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            {!isEdit && (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="mone_EsAduana" valuePropName="checked">
                    <Checkbox>Aduana</Checkbox>
                  </Form.Item>
                </Col>
              </Row>
            )}
         

     
            <Row gutter={16} justify="end">
              <Col>
                <Button onClick={handleCollapseClose} style={{ marginRight: '8px' }}>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit">
                  {actualmoneda ? 'Actualizar' : 'Crear'}
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
      dataIndex: 'mone_Id',
      key: 'mone_Id',
      sorter: (a, b) => a.mone_Id - b.mone_Id,
    },
    {
      title: 'Código',
      dataIndex: 'mone_Codigo',
      key: 'mone_Codigo',
      sorter: (a, b) => a.mone_Codigo.localeCompare(b.mone_Codigo),
    },
    {
      title: 'Moneda',
      dataIndex: 'mone_Descripcion',
      key: 'mone_Descripcion',
      sorter: (a, b) => a.mone_Descripcion.localeCompare(b.mone_Descripcion),
    },
    {
      title: 'Aduana',
      dataIndex: 'mone_EsAduana',
      key: 'mone_EsAduana',
      render: (text) => (text ? 'Sí' : 'No'),
      sorter: (a, b) => a.mone_EsAduana - b.mone_EsAduana,
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
            style={{ marginRight: 8, backgroundColor: 'orange', color: 'white' }}
          >
            Editar
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleCollapseOpen('details', record)}
            style={{ marginRight: 8, backgroundColor: 'blue', color: 'white' }}
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
            <h1 className='text-center'>Index de Monedas</h1>
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
              rowKey="mone_Id"
            />
          </div>
        </>
      ) : (
        activeKey === 'details' ? detailsTemplate() : formTemplate()
      )}
    </Card>
  );
};

export default Moneda;
