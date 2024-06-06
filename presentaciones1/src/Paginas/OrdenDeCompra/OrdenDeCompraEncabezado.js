import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert, Input, Card, Button, Form, notification, Modal, Row, Col, DatePicker, Select, Checkbox, Radio, Collapse, Steps, InputNumber } from 'antd';
import { SearchOutlined, PlusCircleOutlined, CheckOutlined, EditOutlined, EyeOutlined, DeleteOutlined, FileTextOutlined, SolutionOutlined } from '@ant-design/icons';
import Flex from 'components/shared-components/Flex';
import utils from 'utils';

import dayjs from 'dayjs';
import { getOrden, insertarOrden, editarOrden, finalizarOrden, eliminarOrden } from 'services/OrdenDeCompraService';
import { getFormasDePago } from 'services/FormasDePagoService';
import { getTipoEmbalaje } from 'services/TipoEmbalajeService';
import { getClientes } from 'services/ClientesService';
import { getEstilos } from 'services/EstilosService';
import { getTallas } from 'services/TallasService';
import { getProcesos } from 'services/ProcesosService';
import { getColores } from 'services/ColoresService';
import { getUnidadesMedida } from 'services/UnidadMedidasService';

import { getOrdenDetalles, eliminarOrdenDetalle,  insertarOrdenDetalle, editarOrdenDetalle } from 'services/OrdenDeCompraDetalleService';
import {
  insertarProcesoPorOrdenCompraDetalle,
  eliminarProcesoPorOrdenCompraDetalle,
  listarProcesosPorOrdenCompraDetalle,
  dibujarProcesos,
   } from 'services/ProcesoPorOrdenCompraDetalleService';
import {
  insertarMaterialBrindar,
  editarMaterialBrindar,
  eliminarMaterialBrindar,
  listarMaterialesBrindar,
  listarMaterialesBrindarFiltrado,  } from 'services/MaterialesBrindarService';
import { listarMateriales } from 'services/MaterialesService';

const { Option } = Select;
const { Panel } = Collapse;
const { Step } = Steps;









const OrdenCompra = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [formasDePago, setFormasDePago] = useState([]);
  const [tipoEmbalaje, setTipoEmbalaje] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cliente, setCliente] = useState({});
  const [estilos, setEstilos] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [procesos, setProcesos] = useState([]);
  const [colores, setColores] = useState([]);
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);

  const [sexo, setSexo] = useState('M'); 
  const [editingKey, setEditingKey] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedProcesosComienza, setSelectedProcesosComienza] = useState([]);
  const [selectedProcesosActual, setSelectedProcesosActual] = useState([]);
  const [selectedMateriales, setSelectedMateriales] = useState([]);
  const [materialModalVisible, setMaterialModalVisible] = useState(false);
  const [availableMateriales, setAvailableMateriales] = useState([]);
  const [materialCounts, setMaterialCounts] = useState({});
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [materialForm] = Form.useForm();
  const [expandedRowKeys, setExpandedRowKeys] = useState([]); // Estado para la fila expandida
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState(null);



  const [showTable, setShowTable] = useState(true);
const [showDetails, setShowDetails] = useState(false);
const [showEdit, setShowEdit] = useState(false);  // Estado para mostrar el Collapse de edición
const [detailData, setDetailData] = useState(null);
const [currentOrden, setCurrentOrden] = useState(null);
const [details, setDetails] = useState([]);

const openMaterialModal = () => {
  fetchMateriales(selectedMateriales);
  setMaterialModalVisible(true);
};
 

  const handleViewDetails = async (record) => {
    try {
      const encabezado = data.find(o => o.orco_Id === record.orco_Id);
      const detalles = await fetchOrdenDetalles(record.orco_Id);
  
      console.log('Encabezado:', encabezado);
      console.log('Detalles:', detalles);
  
      setDetailData({ encabezado, detalles });
      setShowDetails(true);
      setShowEdit(false);
      setShowTable(false);
    } catch (error) {
      notification.error({ message: 'Error al cargar detalles de la orden', description: error.message });
    }
  };
  
  
  
  const handleEdit = async (record) => {
    try {
      const encabezado = data.find(o => o.orco_Id === record.orco_Id);
      if (encabezado.orco_FechaEmision) {
        encabezado.orco_FechaEmision = dayjs(encabezado.orco_FechaEmision);
      }
      if (encabezado.orco_FechaLimite) {
        encabezado.orco_FechaLimite = dayjs(encabezado.orco_FechaLimite);
      }
  
      encabezado.orco_Materiales = !!encabezado.orco_Materiales;
      form.setFieldsValue({ ...form.getFieldsValue(), ...encabezado });
      setCurrentOrden(encabezado);
  
      await fetchOrdenDetalles(record.orco_Id);
      setShowEdit(true);
      setShowDetails(false);
      setShowTable(false);
    } catch (error) {
      notification.error({ message: 'Error al cargar la orden de compra', description: error.message });
    }
  };
  
  
  
  

  const renderDetailCollapse = () => (
    <Collapse activeKey={showDetails ? ['1'] : []} onChange={handleDetailModalClose}>
      <Panel header="Detalles de la Orden" key="1">
        {detailData && (
          <div>
            <Row>
              <Col span={12}>
                <h3>DATOS DEL CLIENTE</h3>
                <p>Nombre: {detailData.encabezado.clie_Nombre_O_Razon_Social}</p>
                <p>Dirección: {detailData.encabezado.clie_Direccion}</p>
                <p>Mail: {detailData.encabezado.clie_Correo_Electronico}</p>
                <p>Teléfono: {detailData.encabezado.clie_Numero_Contacto}</p>
              </Col>
              <Col span={12}>
                <h3>DATOS DE LA EMPRESA</h3>
                <p>Nombre: SIMEXPRO</p>
                <p>Dirección: Calle Cualquiera 123, Cualquier Lugar</p>
                <p>Mail: hola@unsitiogenial.es</p>
                <p>Teléfono: 911-234-5678</p>
              </Col>
            </Row>
            <h3>Fecha: {dayjs(detailData.encabezado.orco_FechaEmision).format('DD/MM/YYYY')}</h3>
            <h3>Dirección de entrega: {detailData.encabezado.orco_DireccionEntrega}</h3>
            <Table
              dataSource={detailData.detalles}
              columns={[
                { title: 'Cantidad', dataIndex: 'code_CantidadPrenda', key: 'code_CantidadPrenda' },
                { title: 'Color', dataIndex: 'colr_Id', key: 'colr_Id', render: text => colores.find(color => color.colr_Id === text)?.colr_Nombre },
                { title: 'Estilo', dataIndex: 'esti_Id', key: 'esti_Id', render: text => estilos.find(est => est.esti_Id === text)?.esti_Descripcion },
                { title: 'Talla', dataIndex: 'tall_Id', key: 'tall_Id', render: text => tallas.find(talla => talla.tall_Id === text)?.tall_Nombre },
                { title: 'Especificación de Embalaje', dataIndex: 'code_EspecificacionEmbalaje', key: 'code_EspecificacionEmbalaje' },
                {
                  title: 'Proceso Comienza',
                  dataIndex: 'proc_IdComienza',
                  key: 'proc_IdComienza',
                  render: (text, record) => procesos.filter(proc => record.proc_IdComienza.includes(proc.proc_Id)).map(proc => proc.proc_Descripcion).join(', '),
                },
                {
                  title: 'Proceso Actual',
                  dataIndex: 'proc_IdActual',
                  key: 'proc_IdActual',
                  render: (text, record) => procesos.filter(proc => record.proc_IdActual.includes(proc.proc_Id)).map(proc => proc.proc_Descripcion).join(', '),
                },
                {
                  title: 'Materiales',
                  dataIndex: 'materials',
                  key: 'materials',
                  render: (materials) => (
                    <Table
                      dataSource={materials}
                      columns={[
                        { title: 'Material', dataIndex: 'mate_Id', key: 'mate_Id', render: text => availableMateriales.find(m => m.mate_Id === text)?.mate_Descripcion },
                        { title: 'Cantidad', dataIndex: 'mabr_Cantidad', key: 'mabr_Cantidad' },
                        { title: 'Unidad de Medida', dataIndex: 'unme_Id', key: 'unme_Id', render: text => unidadesMedida.find(unidad => unidad.unme_Id === text)?.unme_Descripcion },
                      ]}
                      pagination={false}
                      rowKey={record => `${record.mate_Id}-${record.unme_Id}`}
                    />
                  )
                },
              ]}
              pagination={false}
              summary={pageData => {
                let total = 0;
                pageData.forEach(({ code_CantidadPrenda, code_Valor }) => {
                  total += code_CantidadPrenda * code_Valor;
                });
                return (
                  <>
                    <Table.Summary.Row>
                      <Table.Summary.Cell>Total</Table.Summary.Cell>
                      <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                      <Table.Summary.Cell>{total.toFixed(2)}</Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell>IVA 21%</Table.Summary.Cell>
                      <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                      <Table.Summary.Cell>{(total * 0.21).toFixed(2)}</Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell>IRPF 7%</Table.Summary.Cell>
                      <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                      <Table.Summary.Cell>{(total * 0.07).toFixed(2)}</Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell>Total con IVA e IRPF</Table.Summary.Cell>
                      <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                      <Table.Summary.Cell>{(total * 1.21 - total * 0.07).toFixed(2)}</Table.Summary.Cell>
                    </Table.Summary.Row>
                  </>
                );
              }}
            />
            <div style={{ textAlign: 'right', marginTop: '20px' }}>
              <p>Forma de pago: {formasDePago.find(fp => fp.fopa_Id === detailData.encabezado.orco_MetodoPago)?.fopa_Descripcion}</p>
              <p>Nota: El servicio tiene una validez de 30 días.</p>
            </div>
            <div style={{ textAlign: 'right', marginTop: '40px' }}>
              <p>Firma: _______________________</p>
              <p>Sandra Haro</p>
            </div>
          </div>
        )}
      </Panel>
    </Collapse>
  );
  
  
  
  

 const handleDetailModalClose = () => {
   setShowDetails(false);
   setDetailData(null);
   setShowTable(true);  // Regresar a la tabla después de cerrar detalles
 };
  

  
  
  





  const renderDetailModal = () => (
    <Modal
      title="Detalles de la Orden"
      visible={detailModalVisible}
      onCancel={handleDetailModalClose}
      footer={null}
      width={800}
    >
      {detailData && (
        <div>
          <Row>
            <Col span={12}>
              <h3>DATOS DEL CLIENTE</h3>
              <p>Nombre: {detailData.encabezado.clie_Nombre_O_Razon_Social}</p>
              <p>Dirección: {detailData.encabezado.clie_Direccion}</p>
              <p>Mail: {detailData.encabezado.clie_Correo_Electronico}</p>
              <p>Teléfono: {detailData.encabezado.clie_Numero_Contacto}</p>
            </Col>
            <Col span={12}>
              <h3>DATOS DE LA EMPRESA</h3>
              <p>Nombre: {detailData.encabezado.orco_Codigo}</p>
              <p>Dirección: Calle Cualquiera 123, Cualquier Lugar</p>
              <p>Mail: hola@unsitiogenial.es</p>
              <p>Teléfono: 911-234-5678</p>
            </Col>
          </Row>
          <h3>Fecha: {dayjs(detailData.encabezado.orco_FechaEmision).format('DD/MM/YYYY')}</h3>
          <Table
            dataSource={detailData.detalles}
            columns={[
              { title: 'Concepto', dataIndex: 'esti_Id', key: 'esti_Id', render: text => estilos.find(est => est.esti_Id === text)?.esti_Descripcion },
              { title: 'Cantidad', dataIndex: 'code_CantidadPrenda', key: 'code_CantidadPrenda' },
              { title: 'Precio', dataIndex: 'code_Valor', key: 'code_Valor' },
              { title: 'Total', key: 'total', render: (text, record) => (record.code_CantidadPrenda * record.code_Valor).toFixed(2) }
            ]}
            pagination={false}
            summary={pageData => {
              let total = 0;
              pageData.forEach(({ code_CantidadPrenda, code_Valor }) => {
                total += code_CantidadPrenda * code_Valor;
              });
              return (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell>Total</Table.Summary.Cell>
                    <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                    <Table.Summary.Cell>{total.toFixed(2)}</Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell>IVA 21%</Table.Summary.Cell>
                    <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                    <Table.Summary.Cell>{(total * 0.21).toFixed(2)}</Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell>IRPF 7%</Table.Summary.Cell>
                    <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                    <Table.Summary.Cell>{(total * 0.07).toFixed(2)}</Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell>Total con IVA e IRPF</Table.Summary.Cell>
                    <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                    <Table.Summary.Cell>{(total * 1.21 - total * 0.07).toFixed(2)}</Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              );
            }}
          />
          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <p>Forma de pago: {formasDePago.find(fp => fp.fopa_Id === detailData.encabezado.orco_MetodoPago)?.fopa_Descripcion}</p>
            <p>Nota: El servicio tiene una validez de 30 días.</p>
          </div>
          <div style={{ textAlign: 'right', marginTop: '40px' }}>
            <p>Firma: _______________________</p>
            <p>Sandra Haro</p>
          </div>
        </div>
      )}
    </Modal>
  );
  
 
  
  











  // DATAMASTERRRRRRRRR
  const renderExpandedRow = (record) => {
    const procesosComienzaData = Array.isArray(record.proc_IdComienza) ? record.proc_IdComienza.map((proc_Id, index) => ({
      proc_Id,
      key: `${record.code_Id}-comienza-${index}`,
      code_Id: record.code_Id,
      tipo: 'Comienza'
    })) : [];
  
    const procesosActualData = Array.isArray(record.proc_IdActual) ? record.proc_IdActual.map((proc_Id, index) => ({
      proc_Id,
      key: `${record.code_Id}-actual-${index}`,
      code_Id: record.code_Id,
      tipo: 'Actual'
    })) : [];
  
    const materialesData = Array.isArray(record.materials) ? record.materials : [];
  
    return (
      <div>
        <h4>Materiales</h4>
        <Form form={materialForm} component={false}>
          <Table
            dataSource={materialesData}
            columns={[
              {
                title: 'Material',
                dataIndex: 'mate_Id',
                key: 'mate_Id',
                render: (text) => availableMateriales.find(m => m.mate_Id === text)?.mate_Descripcion
              },
              {
                title: 'Cantidad',
                dataIndex: 'mabr_Cantidad',
                key: 'mabr_Cantidad',
                render: (text, material) => renderMaterialCell(text, material, 'mabr_Cantidad')
              },
              {
                title: 'Unidad de Medida',
                dataIndex: 'unme_Id',
                key: 'unme_Id',
                render: (text, material) => renderMaterialCell(text, material, 'unme_Id')
              },
              {
                title: 'Acciones',
                key: 'acciones',
                render: (text, material) => (
                  <span>
                    {editingMaterialId === material.mate_Id ? (
                      <Button onClick={() => handleSaveMaterial(material)} style={{ marginRight: 8 }}>Guardar</Button>
                    ) : (
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEditMaterial(material)}
                        style={{ marginRight: 8 }}
                      >
                        Editar
                      </Button>
                    )}
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteMaterial(material, record)}
                      style={{ marginLeft: 8 }}
                    />
                  </span>
                ),
              },
            ]}
            rowKey={(record) => `${record.mate_Id}-${record.unme_Id}`} // Asegúrate de que la clave sea única
            pagination={false}
          />
        </Form>
        <h4>Procesos</h4>
        <Table
          dataSource={[...procesosComienzaData, ...procesosActualData]}
          columns={[
            { title: 'Tipo', dataIndex: 'tipo', key: 'tipo' },
            { title: 'Proceso', dataIndex: 'proc_Id', key: 'proc_Id', render: (text) => procesos.find(p => p.proc_Id === text)?.proc_Descripcion },
            {
              title: 'Acciones',
              key: 'acciones',
              render: (text, record) => (
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteProceso(record, record.tipo === 'Comienza' ? 'proc_IdComienza' : 'proc_IdActual')}
                  style={{ marginLeft: 8 }}
                />
              ),
            },
          ]}
          rowKey={(record) => record.key}
          pagination={false}
        />
      </div>
    );
  };
  
  
  
  
  
  
  
  




  //EDITADO
  const fetchOrdenDetalles = async (orco_Id) => {
    try {
      console.log(`Fetching details for order ID: ${orco_Id}`);
      
      const detalles = await getOrdenDetalles(orco_Id);
  
      const detallesConProcesosYMateriales = await Promise.all(detalles.map(async (detalle) => {
        const [procesos, materiales] = await Promise.all([
          listarProcesosPorOrdenCompraDetalle(detalle.code_Id),
          listarMaterialesBrindarFiltrado(detalle.code_Id)
        ]);
  
        console.log(`Procesos for code_Id ${detalle.code_Id}:`, procesos);  // Verificar que los procesos están siendo recibidos
        console.log(`Materiales for code_Id ${detalle.code_Id}:`, materiales);  // Verificar que los materiales están siendo recibidos
  
        const proc_IdActual = procesos.length > 0 ? procesos.map(proc => proc.proc_Id) : [];
        const proc_IdComienza = procesos.length > 0 ? procesos.map(proc => proc.proc_Id) : [];
  
        return {
          ...detalle,
          proc_IdComienza,
          proc_IdActual,
          materials: Array.isArray(materiales) ? materiales : []
        };
      }));
  
      console.log("Detalles con Procesos y Materiales:", detallesConProcesosYMateriales);
  
      setDetails(detallesConProcesosYMateriales);
      return detallesConProcesosYMateriales;
    } catch (error) {
      notification.error({ message: 'Error al cargar detalles de la orden', description: error.message });
    }
  };
  
  
  
  
  
  
  
  
  
  
  
  
  

  const handleExpand = (expanded, record) => {
    setExpandedRowKeys(expanded ? [record.code_Id] : []);
  };
  

const handleAddDetail = async () => {
  try {
    const values = await form.validateFields(detailFields);
    const newDetail = {
      ...values,
      code_CantidadPrenda: values.code_CantidadPrenda || 1,
      code_Unidad: values.code_Unidad || 1,
      esti_Id: values.esti_Id || 0,
      tall_Id: values.tall_Id || 0,
      code_FechaProcActual: formatDate(new Date()),
      code_FechaCreacion: formatDate(new Date()),
      usua_UsuarioCreacion: 1,
      isNew: true,
      orco_Id: currentOrden ? currentOrden.orco_Id : null,
      proc_IdComienza: Array.isArray(selectedProcesosComienza) ? selectedProcesosComienza : [],
      proc_IdActual: Array.isArray(selectedProcesosActual) ? selectedProcesosActual : [],
      materials: Array.isArray(selectedMateriales) ? selectedMateriales.map(material => ({
        ...material,
        code_Id: undefined 
      })) : []
    };

    console.log('New Detail:', newDetail);
    setDetails(prevDetails => [...prevDetails, newDetail]);
    form.resetFields(detailFields);
    setSelectedColor(null);
    fetchMateriales();

    setSelectedMateriales([]); 
  } catch (errorInfo) {
    console.error('Validation failed:', errorInfo);
  }
};

  
  

 
 

  
  
  
  
  

const fetchMateriales = async (selectedMateriales = []) => {
  try {
    const materiales = await listarMateriales();
    const filteredMateriales = materiales.filter(material => 
      !selectedMateriales.some(selected => selected.mate_Id === material.mate_Id)
    );
    setAvailableMateriales(filteredMateriales);
  } catch (error) {
    notification.error({ message: 'Error al cargar materiales', description: error.message });
  }
};



  const addMaterial = async (material) => {
    try {
      const values = await materialForm.validateFields();
      if (!material.unme_Id) {
        throw new Error('Debe seleccionar una unidad de medida antes de agregar el material.');
      }
      const updatedMaterial = {
        ...material,
        mabr_Cantidad: material.mabr_Cantidad || 1,  // Verifica que aquí se está asignando el valor correcto
        unme_Id: material.unme_Id, // Asegúrate de que el `unme_Id` se esté asignando correctamente
      };
      console.log('Material actualizado:', updatedMaterial);
      setSelectedMateriales([...selectedMateriales, updatedMaterial]);
      setAvailableMateriales(availableMateriales.filter(m => m.mate_Id !== material.mate_Id));
      notification.success({ message: 'Material agregado', description: 'El material ha sido agregado correctamente' });
    } catch (error) {
      console.error('Validation failed:', error);
      notification.error({ message: 'Error al agregar material', description: error.message || 'Hubo un problema al agregar el material' });
    }
  };
  
  
  
  
  
  
  

   
  
  


    const fetchUnidadesMedida = async () => {
      try {
        const unidades = await getUnidadesMedida();
        setUnidadesMedida(unidades);
      } catch (error) {
        notification.error({ message: 'Error al cargar unidades de medida', description: error.message });
      }
    };


    const handleMaterialChange = (materialId, field, value) => {
      setSelectedMateriales((prev) =>
        prev.map((material) =>
          material.mate_Id === materialId ? { ...material, [field]: value } : material
        )
      );
    };
  
    useEffect(() => {
      fetchUnidadesMedida();
    }, []);


    const renderMaterialModal = () => (
      <Modal
        title="Seleccionar Material"
        visible={materialModalVisible}
        onCancel={() => setMaterialModalVisible(false)}
        footer={null}
      >
        <Form form={materialForm} layout="vertical">
          <Table
            dataSource={availableMateriales}
            columns={[
              { title: 'Descripción', dataIndex: 'mate_Descripcion', key: 'mate_Descripcion' },
              {
                title: 'Cantidad',
                dataIndex: 'cantidad',
                key: 'cantidad',
                render: (text, record) => (
                  <InputNumber 
                    min={1} 
                    defaultValue={record.cantidad || 1} 
                    onChange={(value) => handleMaterialCountChange(record.mate_Id, value)} 
                  />
                ),
              },
              {
                title: 'Unidad de Medida',
                dataIndex: 'unme_Id',
                key: 'unme_Id',
                render: (text, record) => (
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Selecciona una unidad"
                    onChange={(value) => {
                      record.unme_Id = value;
                      handleMaterialChange(record.mate_Id, 'unme_Id', value); // Asegúrate de que el cambio se maneje correctamente
                    }}
                  >
                    {unidadesMedida.map(unidad => (
                      <Option key={unidad.unme_Id} value={unidad.unme_Id}>{unidad.unme_Descripcion}</Option>
                    ))}
                  </Select>
                ),
              },
              {
                title: 'Acciones',
                key: 'acciones',
                render: (text, record) => (
                  <Button icon={<PlusCircleOutlined />} onClick={() => addMaterial(record)}>Agregar</Button>
                ),
              }
            ]}
            rowKey="mate_Id"
          />
        </Form>
      </Modal>
    );
    
    
  
    
    
    
    
    
    
    
    
    
    

  
  
  const updateMaterialQuantity = (mate_Id, quantity) => {
    setAvailableMateriales((prev) =>
      prev.map((material) =>
        material.mate_Id === mate_Id ? { ...material, cantidad: quantity } : material
      )
    );
  };
  
  
  
  



 



  const edit = async (record) => {
    const currentValues = form.getFieldsValue();
  
    const detailFields = {
      code_CantidadPrenda: record.code_CantidadPrenda,
      colr_Id: record.colr_Id,
      proc_IdComienza: record.proc_IdComienza,
      proc_IdActual: record.proc_IdActual,
      code_Unidad: record.code_Unidad,
      code_Valor: record.code_Valor,
      code_Sexo: record.code_Sexo,
      code_Impuesto: record.code_Impuesto,
      code_EspecificacionEmbalaje: record.code_EspecificacionEmbalaje,
      esti_Id: record.esti_Id,
      tall_Id: record.tall_Id,
    };
  
    form.setFieldsValue({
      ...currentValues,
      ...detailFields,
    });
    setSexo(record.code_Sexo);
    setEditingKey(record.code_Id);
    setEditingRecord(record);
  
    setSelectedProcesosComienza(record.proc_IdComienza);
    setSelectedProcesosActual(record.proc_IdActual);
    setSelectedMateriales(record.materials);
  
    fetchMateriales(record.materials);  // Fetch materials excluding the already selected ones
  };
  

  
  
  
  

  
  
  
  
  
  

  
  
  const save = async (record) => {
    try {
      const row = await form.validateFields();
      const detailData = {
        ...row,
        proc_IdComienza: selectedProcesosComienza,
        proc_IdActual: selectedProcesosActual,
        materials: selectedMateriales
      };
  
      const newData = [...details];
      const index = newData.findIndex((item) => record.code_Id === item.code_Id);
  
      if (index > -1) {
        const item = newData[index];
        const updatedRecord = { ...item, ...detailData };
  
        newData.splice(index, 1, updatedRecord);
        setDetails(newData);
        setEditingKey('');
        setEditingRecord(null);
  
        if (!updatedRecord.isNew) {
          await editarOrdenDetalle(updatedRecord);
          notification.success({ message: 'Detalle actualizado correctamente' });
        } else {
          notification.success({ message: 'Detalle actualizado en la tabla' });
        }
      } else {
        newData.push(row);
        setDetails(newData);
        setEditingKey('');
        setEditingRecord(null);
      }
  
      form.resetFields(detailFields);
    } catch (error) {
      console.error('Error al actualizar el detalle:', error);
      notification.error({ message: 'Error al actualizar el detalle', description: error.message });
  
      if (error.errorFields) {
        error.errorFields.forEach(fieldError => {
          console.error(`Error en el campo: ${fieldError.name}, Errores: ${fieldError.errors}`);
        });
      }
    }
  };
  


  const removeMaterial = (material) => {
    setSelectedMateriales(selectedMateriales.filter(m => m.mate_Id !== material.mate_Id));
    setAvailableMateriales([...availableMateriales, material]);
  
    if (editingRecord) {
      const updatedMaterials = editingRecord.materials.filter(m => m.mate_Id !== material.mate_Id);
      setEditingRecord({ ...editingRecord, materials: updatedMaterials });
  
      const filteredMateriales = availableMateriales.filter(mat => 
        !updatedMaterials.some(selected => selected.mate_Id === mat.mate_Id)
      );
      setAvailableMateriales(filteredMateriales);
    }
  };
  
  
  
  const cancel = () => {
    setEditingKey('');
    setEditingRecord(null);
  };
  

  
  
  
  

  
  
  const initialValues = {
    code_CantidadPrenda: 1,
    code_Unidad: 1,
    code_Sexo: 'M',
    code_Impuesto: 15.00,
    esti_Id: undefined,
    tall_Id: undefined,
    colr_Id: undefined,
    proc_IdComienza: undefined,
    proc_IdActual: undefined,
    code_EspecificacionEmbalaje: '',
    orco_EstadoOrdenCompra: null,  
    orco_Codigo: null  
  };
  

  const detailFields = [
    'code_CantidadPrenda',
    'colr_Id',
    'proc_IdComienza',
    'proc_IdActual',
    'code_Unidad',
    'code_Valor',
    'code_Sexo',
    'code_Impuesto',
    'code_EspecificacionEmbalaje',
    'esti_Id',
    'tall_Id'
  ];




 
  
  
  

  const handleSexoChange = (e) => {
    setSexo(e.target.value);
    form.setFieldsValue({ code_Sexo: e.target.value });
  };






  



  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordenes, formasPago, tiposEmbalaje, clientesList, estilosList, tallasList, procesosList, coloresList] = await Promise.all([
          getOrden(),
          getFormasDePago(),
          getTipoEmbalaje(),
          getClientes(),
          getEstilos(),
          getTallas(),
          getProcesos(),
          getColores()
        ]);
  
        console.log('Ordenes:', ordenes); // Agregar console.log para verificar las órdenes
  
        if (Array.isArray(ordenes) && Array.isArray(formasPago) && Array.isArray(tiposEmbalaje) &&
          Array.isArray(clientesList) && Array.isArray(estilosList) && Array.isArray(tallasList) &&
          Array.isArray(procesosList) && Array.isArray(coloresList)) {
          setData(ordenes);
          setFilteredData(ordenes);
          setFormasDePago(formasPago);
          setTipoEmbalaje(tiposEmbalaje);
          setClientes(clientesList);
          setEstilos(estilosList);
          setTallas(tallasList);
          setProcesos(procesosList);
          setColores(coloresList);
        } else {
          throw new Error('Formato de datos incorrecto');
        }
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
  
    fetchData();
  }, [setLoading]);
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'orco_Id',
      key: 'orco_Id',
      sorter: (a, b) => a.orco_Id - b.orco_Id,
    },
    {
      title: 'Código',
      dataIndex: 'orco_Codigo',
      key: 'orco_Codigo',
      sorter: (a, b) => a.orco_Codigo.localeCompare(b.orco_Codigo),
    },
    {
      title: 'Fecha Emisión',
      dataIndex: 'orco_FechaEmision',
      key: 'orco_FechaEmision',
      sorter: (a, b) => new Date(a.orco_FechaEmision) - new Date(b.orco_FechaEmision),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      align: 'center',
      render: (text, record) => {
        console.log(`Orden ID: ${record.orco_Id}, Estado Finalizado: ${record.orco_EstadoFinalizado}`); // Verificar cada orden y estado finalizado
  
        const isFinalizado = record.orco_EstadoFinalizado === true || record.orco_EstadoFinalizado === 1;
        return (
          <Row justify="center">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ marginRight: 8, backgroundColor: isFinalizado ? 'grey' : 'blue', color: 'white' }}
              disabled={isFinalizado}  // Deshabilitar el botón si está finalizado
            >
              Editar
            </Button>
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
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
            <Button
              icon={<CheckOutlined />}
              onClick={!isFinalizado ? () => handleFinalizar(record) : null}
              style={{ backgroundColor: isFinalizado ? 'grey' : 'green', color: 'white' }}
            >
              {isFinalizado ? 'Finalizado' : 'Finalizar'}
            </Button>
          </Row>
        );
      },
    }
  ];
  
  
  
  // Asegúrate de que tu componente devuelva el JSX correcto, incluyendo la tabla que usa las columnas definidas anteriormente
  
  
  
  
  
  
  
  



  
  const handleSearch = (e) => {
    const value = e.currentTarget.value.toLowerCase();
    const filtered = utils.wildCardSearch(data, value);
    setFilteredData(filtered);
  };

  const handleStepChange = async (step) => {
    try {
      if (step > currentStep) {
        await form.validateFields();
      }
      setCurrentStep(step);
    } catch (error) {
      notification.error({
        message: 'Campos requeridos faltantes',
        description: 'Por favor, complete todos los campos obligatorios antes de continuar.',
      });
    }
  };

  const handleRTNBlur = (e) => {
    const rtn = e.target.value;
    const clienteData = clientes.find(cliente => cliente.clie_RTN === rtn);
    if (clienteData) {
      setCliente(clienteData);
      form.setFieldsValue({
        clie_Direccion: clienteData.clie_Direccion,
        clie_Nombre_Contacto: clienteData.clie_Nombre_Contacto,
        clie_Numero_Contacto: clienteData.clie_Numero_Contacto,
        clie_Nombre_O_Razon_Social: clienteData.clie_Nombre_O_Razon_Social,
        clie_Correo_Electronico: clienteData.clie_Correo_Electronico,
      });
    } else {
      setCliente({});
      notification.error({ message: 'Cliente no encontrado', description: `No se encontró un cliente con el RTN ${rtn}` });
    }
  };

  const openColorModal = () => {
    setColorModalVisible(true);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    form.setFieldsValue({
      colr_Id: color.colr_Id
    });
    setColorModalVisible(false);
  };




  

  
  const handleFinalizarOrden = async (orden) => {
    try {
      const response = await finalizarOrden(orden);
      if (response.messageStatus === '1') {
        notification.success({ message: 'Orden finalizada correctamente' });
        const ordenes = await getOrden();
        setData(ordenes);
        setFilteredData(ordenes);
      } else {
        notification.error({ message: 'Error al finalizar la orden', description: response.messageStatus });
      }
    } catch (error) {
      notification.error({ message: 'Error al finalizar la orden', description: error.message });
    }
  };
  
  
  



  const handleDelete = async (orden) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar esta Orden de Compra?',
      content: 'Esta acción no se puede deshacer',
      onOk: async () => {
        try {
          await eliminarOrden(orden);
          notification.success({ message: 'Orden de compra eliminada correctamente' });
          const marcas = await getOrden();
          if (Array.isArray(marcas)) {
            setData(marcas);
            setFilteredData(marcas);
          } else {
            throw new Error('Data format is incorrect');
          }
        } catch (error) {
          notification.error({ message: 'Error al eliminar la Orden de Compra', description: error.message });
        }
      },
    });
  };



  const handleFinalizar = async (orden) => {
    Modal.confirm({
      title: '¿Estás seguro de Finalizar esta Orden?',
      content: 'Si la finaliza, no podra editar esta orden de ninguna forma',
      onOk: async () => {
        try {
          await finalizarOrden(orden);
          notification.success({ message: 'Orden de compra Finalizada correctamente' });
          const marcas = await getOrden();
          if (Array.isArray(marcas)) {
            setData(marcas);
            setFilteredData(marcas);
          } else {
            throw new Error('Formato Incorrecto');
          }
        } catch (error) {
          notification.error({ message: 'Error al eliminar la Orden de Compra', description: error.message });
        }
      },
    });
  };
  
  
  






 
  


  
  const validateDate = (date) => {
    const minDate = new Date('1753-01-01T00:00:00');
    const maxDate = new Date('9999-12-31T23:59:59');
    return date >= minDate && date <= maxDate;
  };
  
 
  




  const handleSubmit = async () => {
    try {
      const values = form.getFieldsValue();
      const date = new Date();
      const orco_FechaEmision = values.orco_FechaEmision ? new Date(values.orco_FechaEmision) : date;
      const orco_FechaLimite = values.orco_FechaLimite ? new Date(values.orco_FechaLimite) : date;
  
      if (!validateDate(orco_FechaEmision) || !validateDate(orco_FechaLimite)) {
        throw new Error('Fecha fuera del rango permitido.');
      }
  
      const commonData = {
        ...values,
        orco_IdCliente: cliente.clie_Id,
        orco_FechaEmision: formatDate(orco_FechaEmision),
        orco_FechaLimite: formatDate(orco_FechaLimite),
        orco_Materiales: values.orco_Materiales ? true : false,
      };
  
      let newOrdenId;
      if (currentOrden) {
        const updatedOrden = {
          ...commonData,
          orco_Id: currentOrden.orco_Id,
          orco_FechaModificacion: date,
          usua_UsuarioModificacion: 1,
        };
  
        console.log('Updating Orden:', updatedOrden);
        await editarOrden(updatedOrden);
        newOrdenId = currentOrden.orco_Id;
  
        const newDetails = details.filter(detail => detail.isNew);
        for (const detail of newDetails) {
          const detailWithEncabezadoId = {
            ...detail,
            orco_Id: currentOrden.orco_Id,
            isNew: undefined,
            code_FechaProcActual: formatDate(new Date()),
            code_FechaCreacion: formatDate(new Date()),
            proc_IdComienza: detail.proc_IdComienza[0], 
            proc_IdActual: detail.proc_IdActual[0], 
          };
  
          console.log('Detail before insert:', detailWithEncabezadoId);
          const insertedDetail = await insertarOrdenDetalle(detailWithEncabezadoId);
          const detailId = insertedDetail ? insertedDetail.data.messageStatus : null;
  
          if (detailId) {
            for (const proceso of detail.proc_IdComienza) {
              await insertarProcesoPorOrdenCompraDetalle({
                code_Id: detailId,
                proc_Id: proceso,
                usua_UsuarioCreacion: 1,
                poco_FechaCreacion: formatDate(new Date())
              });
            }
            for (const proceso of detail.proc_IdActual) {
              await insertarProcesoPorOrdenCompraDetalle({
                code_Id: detailId,
                proc_Id: proceso,
                usua_UsuarioCreacion: 1,
                poco_FechaCreacion: formatDate(new Date())
              });
            }
            for (const material of detail.materials) {
              const materialData = {
                code_Id: detailId,
                mate_Id: material.mate_Id,
                unme_Id: material.unme_Id,
                mabr_Cantidad: material.mabr_Cantidad,
                usua_UsuarioCreacion: 1,
                mabr_FechaCreacion: formatDate(new Date())
              };
              console.log('Material a insertar:', materialData); // Añadir console.log aquí
              await insertarMaterialBrindar(materialData);
            }
          } else {
            console.error('Error: No detail ID returned from the API');
          }
        }
  
        notification.success({ message: 'Orden actualizada correctamente' });
  
        const ordenes = await getOrden();
        if (Array.isArray(ordenes)) {
          setData(ordenes);
          setFilteredData(ordenes);
        } else {
          throw new Error('Formato de datos incorrecto');
        }
      } else {
        const newOrden = {
          ...commonData,
          orco_FechaCreacion: date,
          usua_UsuarioCreacion: 1,
        };
  
        console.log('Creating Orden:', newOrden);
        const response = await insertarOrden(newOrden);
        newOrdenId = response.data.messageStatus;
  
        for (const detail of details) {
          const detailWithEncabezadoId = {
            ...detail,
            orco_Id: newOrdenId,
            isNew: undefined,
            code_FechaProcActual: formatDate(new Date()),
            code_FechaCreacion: formatDate(new Date()),
            proc_IdComienza: detail.proc_IdComienza[0], 
            proc_IdActual: detail.proc_IdActual[0], 
          };
  
          console.log('Detail before insert:', detailWithEncabezadoId);
          const insertedDetail = await insertarOrdenDetalle(detailWithEncabezadoId);
          const detailId = insertedDetail ? insertedDetail.data.messageStatus : null;
  
          if (detailId) {
            for (const proceso of detail.proc_IdComienza) {
              await insertarProcesoPorOrdenCompraDetalle({
                code_Id: detailId,
                proc_Id: proceso,
                usua_UsuarioCreacion: 1,
                poco_FechaCreacion: formatDate(new Date())
              });
            }
            for (const proceso of detail.proc_IdActual) {
              await insertarProcesoPorOrdenCompraDetalle({
                code_Id: detailId,
                proc_Id: proceso,
                usua_UsuarioCreacion: 1,
                poco_FechaCreacion: formatDate(new Date())
              });
            }
            for (const material of detail.materials) {
              const materialData = {
                code_Id: detailId,
                mate_Id: material.mate_Id,
                unme_Id: material.unme_Id,
                mabr_Cantidad: material.mabr_Cantidad,
                usua_UsuarioCreacion: 1,
                mabr_FechaCreacion: formatDate(new Date())
              };
              console.log('Material a insertar:', materialData); // Añadir console.log aquí también
              await insertarMaterialBrindar(materialData);
            }
          } else {
            console.error('Error: No detail ID returned from the API');
          }
        }
  
        notification.success({ message: 'Orden creada correctamente' });
  
        const ordenes = await getOrden();
        if (Array.isArray(ordenes)) {
          setData(ordenes);
          setFilteredData(ordenes);
        } else {
          throw new Error('Formato de datos incorrecto');
        }
      }
  
      setDetails([]);
      handleCollapseClose();
    } catch (error) {
      notification.error({ message: 'Error al guardar la orden', description: error.message });
      console.error('Error details:', error);
    }
  };
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

  

  const insertarProcesoYMateriales = async (detailId) => {
    const fechaActual = formatDate(new Date());
  
    for (const proceso of selectedProcesosComienza) {
      await insertarProcesoPorOrdenCompraDetalle({
        code_Id: detailId,
        proc_Id: proceso,
        usua_UsuarioCreacion: 1,
        poco_FechaCreacion: fechaActual
      });
    }
  
    for (const material of selectedMateriales) {
      const materialData = {
        code_Id: detailId,
        mate_Id: material.mate_Id,
        usua_UsuarioCreacion: 1,
        mabr_Cantidad: material.cantidad,
        mabr_FechaCreacion: fechaActual
      };
  
      console.log('Material a insertar:', materialData); 
  
      await insertarMaterialBrindar(materialData);
    }
  };
  
  
  



  
  
  
  
  
  
  
  
  
  
  


  const formatDate = (date) => {
    if (!date) return null;
    return dayjs(date).format('YYYY-MM-DDTHH:mm:ss');
  };



  const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
  }) => {
    let inputNode;
    if (dataIndex === 'code_CantidadPrenda' || dataIndex === 'code_Unidad' || dataIndex === 'code_Valor' || dataIndex === 'code_Impuesto') {
      inputNode = <InputNumber />;
    } else {
      inputNode = <Input />;
    }
  
    return (
      <td {...restProps}>
        {editable ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `${title} es obligatorio.`,
              },
            ]}
          >
            {React.cloneElement(inputNode, {
              onPressEnter: () => handleSave(record),
            })}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };
  
  
  
  

  const handleDeleteDetail = (index, detail) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar este detalle?',
      content: 'Esta acción no se puede deshacer',
      onOk: async () => {
        try {
          const updatedDetails = [...details];
          if (!detail.isNew) {
            await eliminarOrdenDetalle(detail);  
            notification.success({ message: 'Detalle eliminado correctamente' });
          } else {
            notification.success({ message: 'Detalle eliminado de la tabla' });
          }
          updatedDetails.splice(index, 1);
          setDetails(updatedDetails);
        } catch (error) {
          notification.error({ message: 'Error al eliminar el detalle', description: error.message });
        }
      },
    });
  };
  







  


  
  const handleCollapseOpen = async (type, orden = null) => {
    setCurrentStep(0);
    setShowTable(false);
  
    if (type === 'edit') {
      try {
        const encabezado = data.find(o => o.orco_Id === orden.orco_Id);
  
        if (encabezado.orco_FechaEmision) {
          encabezado.orco_FechaEmision = dayjs(encabezado.orco_FechaEmision);
        }
        if (encabezado.orco_FechaLimite) {
          encabezado.orco_FechaLimite = dayjs(encabezado.orco_FechaLimite);
        }
  
        encabezado.orco_Materiales = !!encabezado.orco_Materiales;
  
        const currentValues = form.getFieldsValue();
        form.setFieldsValue({
          ...currentValues,
          ...encabezado
        });
        setCurrentOrden(encabezado);
  
        await fetchOrdenDetalles(orden.orco_Id);
  
        setShowEdit(true);
        setShowDetails(false);
      } catch (error) {
        console.error("Error al cargar la orden de compra:", error);
        notification.error({
          message: 'Error al cargar la orden de compra',
          description: error.message,
        });
      }
    } else if (type === 'details') {
      try {
        const encabezado = data.find(o => o.orco_Id === orden.orco_Id);
        const detalles = await fetchOrdenDetalles(orden.orco_Id);
  
        setDetailData({ encabezado, detalles });
        setShowDetails(true);
        setShowEdit(false);
      } catch (error) {
        notification.error({ message: 'Error al cargar detalles de la orden', description: error.message });
      }
    } else if (type === 'new') {
      form.resetFields();
      setCurrentOrden(null);
      setCliente({});
      setShowEdit(true);
      setShowDetails(false);
    }
  };
  
  
  
  


  const handleCollapseClose = () => {
    setCurrentOrden(null);
    setShowTable(true);
  };
  

  const renderColorModal = () => (
    <Modal
      title="Seleccionar Color"
      visible={colorModalVisible}
      onCancel={() => setColorModalVisible(false)}
      footer={[
        <Button key="submit" type="primary" onClick={() => setColorModalVisible(false)}>
          Seleccionar Color
        </Button>
      ]}
    >
      <h3>Seleccione un color</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {colores.map((color) => (
          <div
            key={color.colr_Id}
            onClick={() => handleColorSelect(color)}
            style={{
              width: '120px',
              height: '120px',
              backgroundColor: color.colr_CodigoHtml,
              margin: '10px',
              cursor: 'pointer',
              border: selectedColor && selectedColor.colr_Id === color.colr_Id ? '2px solid #000' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              borderRadius: '10px'
            }}
          >
            <span style={{ color: 'white', fontWeight: 'bold' }}>{color.colr_Nombre}</span>
            <span style={{ color: 'white', fontSize: '12px' }}>{color.colr_CodigoHtml}</span>
            <Checkbox
              checked={selectedColor && selectedColor.colr_Id === color.colr_Id}
              style={{ position: 'absolute', top: '5px', right: '5px' }}
              onChange={() => handleColorSelect(color)}
            />
          </div>
        ))}
      </div>
    </Modal>
  );

  const steps = [
    {
      title: 'Encabezado',
      content: (
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="orco_Codigo" label="Código" rules={[{ required: true, message: 'El código es obligatorio' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="clie_RTN" label="RTN del Cliente" rules={[{ required: true, message: 'El RTN del cliente es obligatorio' }]}>
                <Input onBlur={handleRTNBlur} />
              </Form.Item>
            </Col>
          </Row>
          <Collapse defaultActiveKey={cliente.clie_Id ? ['1'] : []}>
            <Panel header="Datos del Cliente" key="1">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Nombre o Razón Social">
                    <Input value={cliente.clie_Nombre_O_Razon_Social} readOnly />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Dirección">
                    <Input value={cliente.clie_Direccion} readOnly />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Nombre del Contacto">
                    <Input value={cliente.clie_Nombre_Contacto} readOnly />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Número de Contacto">
                    <Input value={cliente.clie_Numero_Contacto} readOnly />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Correo Electrónico">
                    <Input value={cliente.clie_Correo_Electronico} readOnly />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>
          </Collapse>
          <Row gutter={16}>
            <Col span={12}>
          
            <Form.Item
  name="orco_FechaEmision"
  label="Fecha Emisión"
  rules={[
    {
      required: true,
      message: 'La fecha de emisión es obligatoria',
    },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || (getFieldValue('orco_FechaLimite') && value.isBefore(getFieldValue('orco_FechaLimite')))) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('La fecha de emisión debe ser menor que la fecha límite'));
      },
    }),
  ]}
>
  <DatePicker style={{ width: '100%' }} onChange={() => form.validateFields(['orco_FechaEmision', 'orco_FechaLimite'])} />
</Form.Item>

<Form.Item
  name="orco_FechaLimite"
  label="Fecha Límite"
  rules={[
    {
      required: true,
      message: 'La fecha límite es obligatoria',
    },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || (getFieldValue('orco_FechaEmision') && value.isAfter(getFieldValue('orco_FechaEmision')))) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('La fecha límite debe ser mayor que la fecha de emisión'));
      },
    }),
  ]}
>
  <DatePicker style={{ width: '100%' }} onChange={() => form.validateFields(['orco_FechaEmision', 'orco_FechaLimite'])} />
</Form.Item>

              <Form.Item name="orco_MetodoPago" label="Método de Pago" rules={[{ required: true, message: 'El método de pago es obligatorio' }]}>
                <Select>
                  {formasDePago.map((forma) => (
                    <Option key={forma.fopa_Id} value={forma.fopa_Id}>{forma.fopa_Descripcion}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="orco_EstadoOrdenCompra" label="Estado de la Orden" rules={[{ required: true, message: 'El estado de la orden es obligatorio' }]}>
                <Radio.Group>
                  <Radio value="C">En Curso</Radio>
                  <Radio value="P">Pendiente</Radio>
                  <Radio value="T">Terminado</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
            <Form.Item name="orco_Materiales" label="Materiales" valuePropName="checked">
  <Checkbox />
</Form.Item>


              <Form.Item name="orco_DireccionEntrega" label="Dirección de Entrega" rules={[{ required: true, message: 'La dirección de entrega es obligatoria' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="orco_IdEmbalaje" label="Especificación Embalaje" rules={[{ required: true, message: 'La especificación de embalaje es obligatoria' }]}>
                <Select>
                  {tipoEmbalaje.map((embalaje) => (
                    <Option key={embalaje.orco_IdEmbalaje} value={embalaje.tiem_Id}>{embalaje.tiem_Descripcion}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )
    },
    {
      title: 'Detalle',
      content: (
        <>
          <Form form={form} layout="vertical" onFinish={handleAddDetail}>
            <Row gutter={16}>
              <Col span={12}>

              <Form.Item hidden name="orco_Materiales" label="Materiales" valuePropName="checked">
  <Checkbox />
</Form.Item>
             
                <Form.Item
                  hidden
                  name="orco_MetodoPago"
                  label="Método de Pago"
                  rules={[{ required: true, message: 'El método de pago es obligatorio' }]}
                >
                  <Select>
                    {formasDePago.map((forma) => (
                      <Option key={forma.fopa_Id} value={forma.fopa_Id}>
                        {forma.fopa_Descripcion}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item hidden
                  
                  name="orco_EstadoOrdenCompra"
                  label="Estado de la Orden"
                  rules={[{ required: true, message: 'El estado de la orden es obligatorio' }]}
                >
                  <Radio.Group>
                    <Radio value="C">C</Radio>
                    <Radio value="P">P</Radio>
                    <Radio value="T">T</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item
                  hidden
                  name="orco_Codigo"
                  label="Código"
                  rules={[{ required: true, message: 'El código es obligatorio' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  hidden
                  name="orco_DireccionEntrega"
                  label="Dirección de Entrega"
                  rules={[{ required: true, message: 'La dirección de entrega es obligatoria' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  hidden
                  name="orco_IdEmbalaje"
                  label="Especificación Embalaje"
                  rules={[{ required: true, message: 'La especificación de embalaje es obligatoria' }]}
                >
                  <Select>
                    {tipoEmbalaje.map((embalaje) => (
                      <Option key={embalaje.tiem_Id} value={embalaje.tiem_Id}>
                        {embalaje.tiem_Descripcion}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="code_CantidadPrenda"
                  label="Cantidad Prenda"
                  rules={[{ required: true, message: 'La cantidad es obligatoria' }]}
                  initialValue={initialValues.code_CantidadPrenda}
                >
                  <InputNumber min={1} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="colr_Id" label="Color" rules={[{ required: true, message: 'El color es obligatorio' }]}>
                  <Button type="primary" onClick={openColorModal}>Seleccionar Color</Button>
                  {selectedColor && (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '20px', height: '20px', backgroundColor: selectedColor.colr_CodigoHtml, marginRight: '10px' }}></div>
                        <span>{selectedColor.colr_Nombre}</span>
                      </div>
                    </div>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
              <Form.Item name="proc_IdComienza" label="Proceso Comienza">
      <Select
        mode="multiple"
        value={selectedProcesosComienza}
        onChange={setSelectedProcesosComienza}
      >
        {procesos.map(proceso => (
          <Option key={proceso.proc_Id} value={proceso.proc_Id}>
            {proceso.proc_Descripcion}
          </Option>
        ))}
      </Select>
    </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item name="proc_IdActual" label="Proceso Actual">
      <Select
        mode="multiple"
        value={selectedProcesosActual}
        onChange={setSelectedProcesosActual}
      >
        {procesos.map(proceso => (
          <Option key={proceso.proc_Id} value={proceso.proc_Id}>
            {proceso.proc_Descripcion}
          </Option>
        ))}
      </Select>
    </Form.Item>
              </Col>
            </Row>

            <Button type="primary" onClick={openMaterialModal}>
  Agregar Materiales
</Button>
{renderMaterialModal()}

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="code_Unidad"
                  label="Unidad"
                  rules={[{ required: true, message: 'La unidad es obligatoria' }]}
                  initialValue={initialValues.code_Unidad}
                >
                  <InputNumber min={1} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="code_Valor" label="Valor" rules={[{ required: true, message: 'El valor es obligatorio' }]}>
                  <InputNumber min={0} step={0.01} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="code_Sexo" label="Sexo" rules={[{ required: true, message: 'El sexo es obligatorio' }]}>
                  <Radio.Group onChange={handleSexoChange} value={sexo}>
                    <Radio value="M">Masculino</Radio>
                    <Radio value="F">Femenino</Radio>
                    <Radio value="U">Unisex</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="code_Impuesto" label="Impuesto" initialValue={initialValues.code_Impuesto} rules={[{ required: true, message: 'El impuesto es obligatorio' }]}>
                  <InputNumber min={0} step={0.01} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="code_EspecificacionEmbalaje" label="Especificación Embalaje" rules={[{ required: true, message: 'La especificación de embalaje es obligatoria' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="esti_Id" label="Estilo" rules={[{ required: true, message: 'El estilo es obligatorio' }]}>
                  <Select>
                    {estilos.map((estilo) => (
                      <Option key={estilo.esti_Id} value={estilo.esti_Id}>{estilo.esti_Descripcion}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="tall_Id" label="Talla" rules={[{ required: true, message: 'La talla es obligatoria' }]}>
                  <Select>
                    {tallas.map((talla) => (
                      <Option key={talla.tall_Id} value={talla.tall_Id}>{talla.tall_Nombre}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} justify="end">
              <Col>
                <Button type="primary" htmlType="submit">
                  Añadir Detalle
                </Button>
              </Col>
            </Row>
          </Form>

          <Table
  dataSource={details}
  columns={[
    {
      title: 'Cantidad Prenda',
      dataIndex: 'code_CantidadPrenda',
      key: 'code_CantidadPrenda',
    },
    {
      title: 'Color',
      dataIndex: 'colr_Id',
      key: 'colr_Id',
      render: (text) => colores.find((color) => color.colr_Id === text)?.colr_Nombre,
    },
    {
      title: 'Proceso Comienza',
      dataIndex: 'proc_IdComienza',
      key: 'proc_IdComienza',
      render: (text) => procesos.find((proceso) => proceso.proc_Id === text)?.proc_Descripcion,
    },
    {
      title: 'Proceso Actual',
      dataIndex: 'proc_IdActual',
      key: 'proc_IdActual',
      render: (text) => procesos.find((proceso) => proceso.proc_Id === text)?.proc_Descripcion,
    },
    {
      title: 'Unidad',
      dataIndex: 'code_Unidad',
      key: 'code_Unidad',
    },
    {
      title: 'Valor',
      dataIndex: 'code_Valor',
      key: 'code_Valor',
    },
    {
      title: 'Especificación de Embalaje',
      dataIndex: 'code_EspecificacionEmbalaje',
      key: 'code_EspecificacionEmbalaje',
    },
    {
      title: 'Estilo',
      dataIndex: 'esti_Id',
      key: 'esti_Id',
      render: (text) => estilos.find((estilo) => estilo.esti_Id === text)?.esti_Descripcion,
    },
    {
      title: 'Talla',
      dataIndex: 'tall_Id',
      key: 'tall_Id',
      render: (text) => tallas.find((talla) => talla.tall_Id === text)?.tall_Nombre,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (text, record, index) => {
        const editable = editingKey === record.code_Id;
        return editable ? (
          <span>
            <Button
              onClick={() => save(record)}
              style={{ marginRight: 8 }}
            >
              Guardar
            </Button>
            <Button onClick={cancel}>
              Cancelar
            </Button>
          </span>
        ) : (
          <span>
            <Button
              icon={<EditOutlined />}
              onClick={() => edit(record)}
              style={{ marginRight: 8 }}
            >
              Editar
            </Button>
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteDetail(index, record)}
              style={{ marginRight: 8 }}
            >
              Eliminar
            </Button>
          </span>
        );
      },
    }
  ]}
  rowClassName="editable-row"
  components={{
    body: {
      cell: EditableCell,
    },
  }}
  rowKey="code_Id"
  expandable={{
    expandedRowRender: renderExpandedRow,
    expandedRowKeys: expandedRowKeys,
    onExpand: handleExpand,
  }}
/>



        </>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin tip="Cargando..." />
      </div>
    );
  }

  if (error) return <Alert message="Error" description={error.message} type="error" showIcon />;





 
  
  
  
  
  
  
  
  
  
  


  const renderDetailTable = (details) => (
    <Table
      dataSource={details}
      columns={[
        {
          title: 'Cantidad Prenda',
          dataIndex: 'code_CantidadPrenda',
          key: 'code_CantidadPrenda',
        },
        {
          title: 'Color',
          dataIndex: 'colr_Id',
          key: 'colr_Id',
          render: (text) => colores.find((color) => color.colr_Id === text)?.colr_Nombre,
        },
        {
          title: 'Proceso Comienza',
          dataIndex: 'proc_IdComienza',
          key: 'proc_IdComienza',
          render: (text, record) => (
            <div>
              {procesos.find((proceso) => proceso.proc_Id === text)?.proc_Descripcion}
              <Button
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteProceso(record, 'proc_IdComienza')}
                style={{ marginLeft: 8 }}
              />
            </div>
          ),
        },
        {
          title: 'Proceso Actual',
          dataIndex: 'proc_IdActual',
          key: 'proc_IdActual',
          render: (text, record) => (
            <div>
              {procesos.find((proceso) => proceso.proc_Id === text)?.proc_Descripcion}
              <Button
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteProceso(record, 'proc_IdActual')}
                style={{ marginLeft: 8 }}
              />
            </div>
          ),
        },
        {
          title: 'Material',
          dataIndex: 'materials',
          key: 'materials',
          render: (materials, record) => (
            <Table
              dataSource={materials}
              columns={[
                {
                  title: 'Descripción',
                  dataIndex: 'mate_Id',
                  key: 'mate_Id',
                  render: (text) => availableMateriales.find((material) => material.mate_Id === text)?.mate_Descripcion,
                },
                {
                  title: 'Cantidad',
                  dataIndex: 'mabr_Cantidad',
                  key: 'mabr_Cantidad',
                  render: (text, material) => (
                    <div>
                      <InputNumber
                        min={1}
                        value={text}
                        onChange={(value) => handleMaterialCountChange(material.mate_Id, value)}
                      />
                    </div>
                  ),
                },
                {
                  title: 'Unidad de Medida',
                  dataIndex: 'unme_Id',
                  key: 'unme_Id',
                  render: (text) => unidadesMedida.find((unidad) => unidad.unme_Id === text)?.unme_Descripcion,
                },
                {
                  title: 'Acciones',
                  key: 'acciones',
                  render: (text, material) => (
                    <span>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEditMaterial(material.mate_Id, material.mabr_Cantidad)}
                        style={{ marginLeft: 8 }}
                      />
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteMaterial(material, record)}
                        style={{ marginLeft: 8 }}
                      />
                    </span>
                  ),
                },
              ]}
              rowKey={(record) => `${record.mate_Id}-${record.unme_Id}`} // Asegúrate de que la clave sea única
              pagination={false}
            />
          ),
        },
        {
          title: 'Unidad',
          dataIndex: 'code_Unidad',
          key: 'code_Unidad',
        },
        {
          title: 'Valor',
          dataIndex: 'code_Valor',
          key: 'code_Valor',
        },
        {
          title: 'Especificación de Embalaje',
          dataIndex: 'code_EspecificacionEmbalaje',
          key: 'code_EspecificacionEmbalaje',
        },
        {
          title: 'Estilo',
          dataIndex: 'esti_Id',
          key: 'esti_Id',
          render: (text) => estilos.find((estilo) => estilo.esti_Id === text)?.esti_Descripcion,
        },
        {
          title: 'Talla',
          dataIndex: 'tall_Id',
          key: 'tall_Id',
          render: (text) => tallas.find((talla) => talla.tall_Id === text)?.tall_Nombre,
        },
        {
          title: 'Sexo',
          dataIndex: 'code_Sexo',
          key: 'code_Sexo',
        },
        {
          title: 'Impuesto',
          dataIndex: 'code_Impuesto',
          key: 'code_Impuesto',
        },
        {
          title: 'Acciones',
          key: 'acciones',
          render: (text, record, index) => {
            const editable = editingKey === record.code_Id;
            return editable ? (
              <span>
                <Button onClick={() => save(record)} style={{ marginRight: 8 }}>
                  Guardar
                </Button>
                <Button onClick={cancel}>Cancelar</Button>
              </span>
            ) : (
              <span>
                <Button icon={<EditOutlined />} onClick={() => edit(record)} style={{ marginRight: 8 }}>
                  Editar
                </Button>
                <Button icon={<DeleteOutlined />} onClick={() => handleDeleteDetail(index, record)} style={{ marginRight: 8 }}>
                  Eliminar
                </Button>
              </span>
            );
          },
        },
      ]}
      rowClassName="editable-row"
      components={{
        body: {
          cell: EditableCell,
        },
      }}
      rowKey="code_Id"
      expandable={{
        expandedRowRender: renderExpandedRow,
        expandedRowKeys: expandedRowKeys,
        onExpand: handleExpand,
      }}

    />
  );
  
  
  
  

  const handleDeleteMaterial = async (material, record) => {
    if (!material.isNew) {
      try {
        const materialToDelete = { mabr_Id: material.mabr_Id };
        await eliminarMaterialBrindar(materialToDelete);
        notification.success({ message: 'Material eliminado correctamente' });
      } catch (error) {
        notification.error({ message: 'Error al eliminar material', description: error.message });
      }
    }
  
    setDetails((prevDetails) =>
      prevDetails.map((detail) =>
        detail.code_Id === record.code_Id
          ? { 
              ...detail, 
              materials: detail.materials.filter((mat) => mat.mate_Id !== material.mate_Id) 
            }
          : detail
      )
    );
  };
  
  
  
  const handleEditMaterial = (material) => {
    setEditingMaterialId(material.mate_Id);
    materialForm.setFieldsValue({
      mate_Id: material.mate_Id, // Asegúrate de capturar el ID del material
      mabr_Cantidad: material.mabr_Cantidad,
      unme_Id: material.unme_Id,
      code_Id: material.code_Id // Asegúrate de capturar el ID del detalle general
    });
  };
  
  
  
  const handleSaveMaterial = async (material) => {
    try {
      const values = await materialForm.validateFields();
      const materialData = {
        ...values,
        mabr_Id: material.mabr_Id, // ID del material brindado
        code_Id: material.code_Id, // ID del detalle general
        mate_Id: material.mate_Id  // Asegúrate de que el mate_Id se está pasando
      };
      await editarMaterialBrindar(materialData);
      setDetails((prevDetails) =>
        prevDetails.map((detail) => ({
          ...detail,
          materials: detail.materials.map((mat) =>
            mat.mate_Id === material.mate_Id
              ? { ...mat, mabr_Cantidad: values.mabr_Cantidad, unme_Id: values.unme_Id }
              : mat
          ),
        }))
      );
      setEditingMaterialId(null);
      notification.success({ message: 'Material actualizado correctamente' });
    } catch (error) {
      console.error('Error al guardar el material:', error);
      notification.error({ message: 'Error al guardar el material', description: error.message });
    }
  };
  
  
  
  
  
  
  
  


  

  const renderMaterialCell = (text, material, field) => {
    if (editingMaterialId === material.mate_Id) {
      if (field === 'mabr_Cantidad') {
        return (
          <Form.Item
            name="mabr_Cantidad"
            style={{ margin: 0 }}
            rules={[{ required: true, message: 'La cantidad es obligatoria' }]}
          >
            <InputNumber min={1} />
          </Form.Item>
        );
      }
      if (field === 'unme_Id') {
        return (
          <Form.Item
            name="unme_Id"
            style={{ margin: 0 }}
            rules={[{ required: true, message: 'La unidad de medida es obligatoria' }]}
          >
            <Select>
              {unidadesMedida.map((unidad) => (
                <Option key={unidad.unme_Id} value={unidad.unme_Id}>
                  {unidad.unme_Descripcion}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );
      }
    }
    if (field === 'unme_Id') {
      return unidadesMedida.find((unidad) => unidad.unme_Id === text)?.unme_Descripcion || text;
    }
    return text;
  };
  
  


  

 
  
  const handleDeleteProceso = async (record, processType) => {
    try {
      const proceso = {
        code_Id: record.code_Id,
        proc_Id: record.proc_Id
      };
      await eliminarProcesoPorOrdenCompraDetalle(proceso);
      setDetails((prevDetails) =>
        prevDetails.map((detail) =>
          detail.code_Id === record.code_Id
            ? { 
                ...detail, 
                [processType]: detail[processType].filter((proc) => proc !== record.proc_Id) 
              }
            : detail
        )
      );
      notification.success({ message: 'Proceso eliminado correctamente' });
    } catch (error) {
      notification.error({ message: 'Error al eliminar el proceso', description: error.message });
    }
  };
  
  
  
  
  
  
  
  
  
  const handleMaterialCountChange = (mate_Id, value) => {
    setSelectedMateriales((prevMaterials) =>
      prevMaterials.map((material) =>
        material.mate_Id === mate_Id ? { ...material, mabr_Cantidad: value } : material
      )
    );
  };
  



  return (
    <Card>
      {showTable ? (
        <>
          <Card>
            <h1 className="text-center">Órdenes de Compra</h1>
          </Card>
          <Flex alignItems="center" justifyContent="space-between" mobileFlex={false}>
            <div>
              <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => handleCollapseOpen('new')} block>
                Nueva Orden
              </Button>
            </div>
            <Flex className="mb-1" mobileFlex={false}>
              <div className="mr-md-3 mb-3">
                <Input placeholder="Buscar" prefix={<SearchOutlined />} onChange={handleSearch} />
              </div>
            </Flex>
          </Flex>
          <div className="table-responsive">
            <Table columns={columns} dataSource={filteredData} rowKey="orco_Id" pagination={{ pageSize: 10 }} />
          </div>
        </>
      ) : (
        <>
          {showDetails && renderDetailCollapse()}  {/* Renderiza el Collapse de Detalles */}
          {!showDetails && showEdit && (
            <>
              <Steps current={currentStep} onChange={handleStepChange}>
                <Step title="Encabezado" icon={<FileTextOutlined />} />
                <Step title="Detalle" icon={<SolutionOutlined />} />
              </Steps>
              <div className="steps-content">{steps[currentStep].content}</div>
              <div className="steps-action">
                {currentStep < steps.length - 1 && (
                  <Button type="primary" onClick={() => handleStepChange(currentStep + 1)}>
                    Siguiente
                  </Button>
                )}
                {currentStep === steps.length - 1 && (
                  <Button type="primary" onClick={handleSubmit}>
                    {currentOrden ? 'Actualizar' : 'Crear'}
                  </Button>
                )}
                {currentStep > 0 && (
                  <Button style={{ margin: '0 8px' }} onClick={() => handleStepChange(currentStep - 1)}>
                    Anterior
                  </Button>
                )}
              </div>
            </>
          )}
        </>
      )}
      {renderColorModal()}
      {renderMaterialModal()}
    </Card>
  );
  
  
  
  
  
  
  
};

export default OrdenCompra;
