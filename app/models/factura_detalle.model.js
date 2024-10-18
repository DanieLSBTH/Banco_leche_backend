module.exports = (sequelize, Sequelize) => {
    const FacturaDetalle = sequelize.define('factura_detalle', {
      id_venta_detalle: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_factura: {
        type: Sequelize.INTEGER,
      },
      id_producto: {
        type: Sequelize.INTEGER,
      },
      cantidad: {
        type: Sequelize.INTEGER,
      },
      precio: {
        type: Sequelize.DECIMAL(10, 2),
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
      },
    });
  
    // Definir la relación con la tabla de Factura
    FacturaDetalle.belongsTo(sequelize.models.factura, {
      foreignKey: 'id_factura',
      as: 'facturas',
    });
  
    // Definir la relación con la tabla de Producto
    FacturaDetalle.belongsTo(sequelize.models.producto, {
      foreignKey: 'id_producto',
      as: 'productos',
    });
  
    return FacturaDetalle;
  };
  