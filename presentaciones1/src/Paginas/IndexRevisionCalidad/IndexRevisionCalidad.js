import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert, Input, Card, Button, Form, Switch, notification, Modal, Row, Col, Upload, Popover, Tooltip, Select } from 'antd';
import { SearchOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import Flex from 'components/shared-components/Flex';
import utils from 'utils';
import { getRevision, insertarRevision, editarRevision, eliminarRevision, getRevisionEncabezado, getEnsaList } from 'services/RevisionCalidadService';
import axios from 'axios';
import '../IndexRevisionCalidad/EstiloRevisision.css';

const { Option } = Select;

const RevisionCalidad = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [showTable, setShowTable] = useState(true);
  const [form] = Form.useForm();
  const [currentRevision, setCurrentRevision] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [ensaDetails, setEnsaDetails] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [ensaList, setEnsaList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const revisiones = await getRevision();
        setData(revisiones);
        setFilteredData(revisiones);

        const ensaList = await getEnsaList(); // Obtener la lista de ensa_Id
        setEnsaList(ensaList);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  //revisiones segun lo que se busca en el datatable
  const handleSearch = (e) => { 
    const value = e.currentTarget.value.toLowerCase();
    const filtered = utils.wildCardSearch(data, value);
    setFilteredData(filtered);
  };


  //abro el formulario para crear o editar
  const handleCollapseOpen = async (key, revision = null) => {
    setActiveKey(key);
    setShowTable(false);
    if (revision) {
      const fechaRevision = revision.reca_FechaRevision ? revision.reca_FechaRevision.split('T')[0] : null;
      form.setFieldsValue({ ...revision, reca_FechaRevision: fechaRevision });
      setCurrentRevision(revision);
      setImageUrl(revision.reca_Imagen);
      if (revision.ensa_Id) {
        await handleEnsaIdChange(revision.ensa_Id);
      }
    } else {
      form.resetFields();
      setCurrentRevision(null);
      setImageUrl('');
      setEnsaDetails(null);
      setPopoverVisible(false);
    }
  };


  //cierro el formulario y cuando se cierra muestro las tablas
  const handleCollapseClose = () => {
    setActiveKey(null);
    setCurrentRevision(null);
    setShowTable(true);
    setImageUrl('');
    setEnsaDetails(null);
    setPopoverVisible(false);
  };


  //subo los datos del formulario al crear o editar
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!imageUrl) {
        notification.error({ message: 'Error', description: 'Debe subir una imagen antes de guardar.' });
        return;
      }

      if (!values.ensa_Id || !ensaDetails) {
        notification.error({ message: 'Error', description: 'Debe seleccionar una orden válida.' });
        return;
      }

      const date = new Date().toISOString();
      const formData = {
        ...values,
        reca_Imagen: imageUrl,
        reca_Scrap: values.reca_Scrap === 'true' || values.reca_Scrap === true,
        reca_FechaRevision: values.reca_FechaRevision ? new Date(values.reca_FechaRevision).toISOString() : null,
      };

      if (currentRevision) {
        const updatedRevision = {
          ...currentRevision,
          ...formData,
          reca_FechaModificacion: date,
          usua_UsuarioModificacion: 1,
        };
        await editarRevision(updatedRevision);
        notification.success({ message: 'Revisión actualizada correctamente' });
      } else {
        const newRevision = {
          ...formData,
          reca_FechaCreacion: date,
          usua_UsuarioCreacion: 1,
        };
        await insertarRevision(newRevision);
        notification.success({ message: 'Revisión insertada correctamente' });
      }

      const revisiones = await getRevision();
      setData(revisiones);
      setFilteredData(revisiones);
      handleCollapseClose();
    } catch (error) {
      console.error('Error al guardar la revisión:', error);
      notification.error({ message: 'Error al guardar la revisión', description: error.message });
    }
  };


   //aqui elimino la revision seleccionada
  const handleDelete = async (revision) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar esta revisión?',
      content: 'Esta acción no se puede deshacer',
      onOk: async () => {
        try {
          await eliminarRevision(revision);
          notification.success({ message: 'Revisión eliminada correctamente' });
          const revisiones = await getRevision();
          setData(revisiones);
          setFilteredData(revisiones);
        } catch (error) {
          notification.error({ message: 'Error al eliminar la revisión', description: error.message });
        }
      },
    });
  };


  //aqui subo la imagen al servidor y guardo la url
  const handleImageUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=f9d6222515be975edc2eef6cf40f435a`, formData);
      setImageUrl(response.data.data.url);
      notification.success({ message: 'Imagen subida correctamente' });
    } catch (error) {
      notification.error({ message: 'Error al subir la imagen', description: 'Asegúrese que sea un Formato Valido' });
    }
  };

  //Cambia el ID de ensa y obtiene detalles adicionales
  const handleEnsaIdChange = async (ensa_Id) => {
    form.setFieldsValue({ ensa_Id });
    if (ensa_Id) {
      try {
        const response = await getRevisionEncabezado(ensa_Id);
        setEnsaDetails(response.data.length > 0 ? response.data[0] : null);
        setPopoverVisible(true);
      } catch (error) {
        notification.error({ message: 'Error al obtener detalles del ensa_Id', description: error.message });
      }
    } else {
      setEnsaDetails(null);
      setPopoverVisible(false);
    }
  };

  //filtra la vista segun la busqueda
  //pero no lo uso
  const handleSearchEnsa = async (value) => {
    const filtered = ensaList.filter(ensa => {
        if (typeof ensa.ensa_Id === 'string') {
            return ensa.ensa_Id.toLowerCase().includes(value.toLowerCase());
        }
        return false; // O manejar el caso cuando ensa_Id no es una cadena
    });
    setEnsaList(filtered);
};


//obtengo los detalle de ensa_Id
  const fetchEnsaDetails = async (ensa_Id) => {
    try {
      const response = await getRevisionEncabezado(ensa_Id);
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      notification.error({ message: 'Error al obtener detalles del ensa_Id', description: error.message });
      return null;
    }
  };

  //expansion de la filas para mostrar lo otros detalles

  const handleExpand = async (expanded, aaa) => {
    if (expanded) {
      const details = await fetchEnsaDetails(aaa.ensa_Id);
      setEnsaDetails(details);
      setExpandedRowKeys([aaa.reca_Id]);
    } else {
      setExpandedRowKeys([]);
      setEnsaDetails(null);
    }
  };


  //Vista de las Imagenes
  const handlePreview = (file) => {
    setPreviewImage(file.url);
    setPreviewVisible(true);
  };

  const handleCancel = () => setPreviewVisible(false);

  //lo que lleva el popover desplegable
  const popoverContent = (
    <div>
      {ensaDetails ? (
        <Card title="Detalles de la Orden">
          <p><strong>ID:</strong> {ensaDetails.ensa_Id}</p>
          <p><strong>Cantidad:</strong> {ensaDetails.ensa_Cantidad}</p>
          <p><strong>Empleado:</strong> {ensaDetails.empl_NombreCompleto}</p>
          <p><strong>Descripción:</strong> {ensaDetails.esti_Descripcion}</p>
          <p><strong>Proceso:</strong> {ensaDetails.proc_Descripcion}</p>
          <p><strong>Fecha de Inicio:</strong> {ensaDetails.ensa_FechaInicio}</p>
          <p><strong>Fecha Límite:</strong> {ensaDetails.ensa_FechaLimite}</p>
        </Card>
      ) : (
        <p>No hay datos disponibles</p>
      )}
    </div>
  );

  //validacion pa que no pase de 0
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value < 0) {
      form.setFieldsValue({ reca_Cantidad: 0 });
    }
  };


  //validacion para que no pueda guardar espacios
  const validateDescription = (_, value) => {
    if (value && value.trim() === '') {
      return Promise.reject(new Error('La descripción no puede contener solo espacios en blanco'));
    }
    return Promise.resolve();
  };

  const detailsTemplate = () => {
    if (!currentRevision) return null;

    return (
      <div className="details-view">
        <Card>
          <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
            <Col>
              <h2>Detalle Revisión</h2>
            </Col>
            <Col>
              <Button type="primary" onClick={handleCollapseClose} danger>Cerrar</Button>
            </Col>
          </Row>
          <div style={{ marginBottom: '16px' }}>
            <Row gutter={[16, 16]}>
              <Col span={8}><strong>ID:</strong> {currentRevision.reca_Id}</Col>
              <Col span={8}><strong>Descripción:</strong> {currentRevision.reca_Descripcion}</Col>
              <Col span={8}><strong>Cantidad:</strong> {currentRevision.reca_Cantidad}</Col>
              <Col span={8}><strong>Fecha de Revisión:</strong> {currentRevision.reca_FechaRevision}</Col>
              <Col span={8}><strong>Scrap:</strong> {currentRevision.reca_Scrap ? 'Sí' : 'No'}</Col>
              <Col span={8}><strong>Imagen:</strong>
                <Tooltip title="Ver imagen">
                  <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
                    <img
                      src={currentRevision.reca_Imagen}
                      alt="Revisión"
                      style={{ width: '100px' }}
                      onClick={() => handlePreview({ url: currentRevision.reca_Imagen })}
                    />
                    <EyeOutlined
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '24px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        display: 'none',
                      }}
                      className="eye-icon"
                    />
                  </div>
                </Tooltip>
                <Modal visible={previewVisible} footer={null} onCancel={handleCancel}>
                  <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
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
                { key: '1', action: 'Creación', user: currentRevision.usuarioCreacionNombre, date: currentRevision.reca_FechaCreacion },
                { key: '2', action: 'Modificación', user: currentRevision.usuarioModificacionNombre || 'N/A', date: currentRevision.reca_FechaModificacion || 'N/A' }
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
              <h2>{currentRevision ? 'Editar Revisión' : 'Nueva Revisión'}</h2>
            </Col>
          </Row>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Popover
                  content={popoverContent}
                  title="Detalles de la Orden"
                  trigger="click"
                  visible={popoverVisible}
                  onVisibleChange={(visible) => setPopoverVisible(visible)}
                >
               <Form.Item
                name="ensa_Id"
                label="Orden"
                rules={[{ required: true, message: 'El Campo es obligatorio' }]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  placeholder="Seleccione una orden"
                  onSelect={handleEnsaIdChange}
                >
                  {ensaList.length > 0 ? (
                    ensaList.map(ensa => (
                      <Option key={ensa.ensa_Id} value={ensa.ensa_Id}>
                        {ensa.ensa_Id}
                      </Option>
                    ))
                  ) : (
                    <Option key="no-data" disabled>No data</Option>
                  )}
                </Select>
              </Form.Item>

                </Popover>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="reca_Descripcion"
                  label="Descripción"
                  rules={[
                    { required: true, message: 'La descripción es obligatoria' },
                    { validator: validateDescription },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="reca_Cantidad"
                  label="Cantidad"
                  rules={[{ required: true, message: 'La cantidad es obligatoria' }]}
                >
                  <Input type="number" min={0} onChange={handleQuantityChange} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="reca_Scrap" label="Scrap" valuePropName="checked" >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="reca_FechaRevision" label="Fecha de Revisión" rules={[{ required: true, message: 'La fecha de revisión es obligatoria' }]}>
                  <Input type="date" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="reca_Imagen" label="Imagen">
                  <Upload
                    listType="picture"
                    showUploadList={false}
                    customRequest={handleImageUpload}
                  >
                    <Button icon={<UploadOutlined />}>Subir Imagen</Button>
                  </Upload>
                  {imageUrl && <img src={imageUrl} alt="imagen subida" style={{ width: '100px', marginTop: '10px' }} />}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} justify="end">
              <Col>
                <Button onClick={handleCollapseClose} style={{ marginRight: '8px' }} danger>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit">
                  {currentRevision ? 'Actualizar' : 'Crear'}
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
      dataIndex: 'reca_Id',
      key: 'reca_Id',
      sorter: (a, b) => a.reca_Id - b.reca_Id,
    },
    {
      title: 'Descripción',
      dataIndex: 'reca_Descripcion',
      key: 'reca_Descripcion',
      sorter: (a, b) => a.reca_Descripcion.localeCompare(b.reca_Descripcion),
    },
    {
      title: 'Cantidad',
      dataIndex: 'reca_Cantidad',
      key: 'reca_Cantidad',
      sorter: (a, b) => a.reca_Cantidad - b.reca_Cantidad,
    },
    {
      title: 'Fecha de Revisión',
      dataIndex: 'reca_FechaRevision',
      key: 'reca_FechaRevision',
      sorter: (a, b) => new Date(a.reca_FechaRevision) - new Date(b.reca_FechaRevision),
    },
    {
      title: 'Scrap',
      dataIndex: 'reca_Scrap',
      key: 'reca_Scrap',
      render: (scrap) => (scrap ? 'Sí' : 'No'),
    },
    {
      title: 'Acciones',
      key: 'acciones',
       fixed:'left', width:350,
      align: 'center',
      render: (text, aaa) => (
        <Row justify="start">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleCollapseOpen('edit', aaa)}
            style={{ marginRight: 5, backgroundColor: 'blue', color: 'white'}}
          >
            Editar
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleCollapseOpen('details', aaa)}
            style={{ marginRight: 5, backgroundColor: 'orange', color: 'white' }}
          >
            Detalles
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(aaa)}
            style={{ marginRight: 5,backgroundColor: 'red', color: 'white'}}
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
            <h1 className="text-center">Index de Revisiones de Calidad</h1>
          </Card>
          <Flex alignItems="center" justifyContent="space-between" mobileFlex={false}>
            <div>
              <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => handleCollapseOpen('new')} block>Añadir Revision</Button>
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
              rowKey="reca_Id"
              pagination={{ pageSize: 10 }}
              expandable={{
                expandedRowRender: aaa => (
                  ensaDetails ? (
                    <table style={{ border: '1px solid #ddd', width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                          <td style={{ padding: '8px', borderRight: '1px solid #ddd' }}><strong>Cantidad:</strong> {ensaDetails.ensa_Cantidad}</td>
                          <td style={{ padding: '8px' }}><strong>Empleado:</strong> {ensaDetails.empl_NombreCompleto}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #ddd' }}><strong>Descripción:</strong> {ensaDetails.esti_Descripcion}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                          <td style={{ padding: '8px', borderRight: '1px solid #ddd' }}><strong>Proceso:</strong> {ensaDetails.proc_Descripcion}</td>
                          <td style={{ padding: '8px' }}><strong>Fecha de Inicio:</strong> {ensaDetails.ensa_FechaInicio}</td>
                          <td style={{ padding: '8px', borderRight: '1px solid #ddd' }}><strong>Fecha Límite:</strong> {ensaDetails.ensa_FechaLimite}</td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <p>Cargando detalles...</p>
                  )
                ),
                rowExpandable: aaa => true,
                onExpand: handleExpand,
                expandedRowKeys: expandedRowKeys,
              }}
            />
          </div>
        </>
      ) : (
        activeKey === 'details' ? detailsTemplate() : formTemplate()
      )}
    </Card>
  );
};

export default RevisionCalidad;
