module.exports = (sequelize, Sequelize) => {
    const CarritoDetalle = sequelize.define('carrito_detalle', {
      id_carrito_detalle: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_carrito: {
        type: Sequelize.INTEGER,
      },
      id_producto: {
        type: Sequelize.INTEGER,
      },
      cantidad: {
        type: Sequelize.INTEGER,
      },
      precio_unitario: {
        type: Sequelize.DECIMAL(10, 2),
      },
    });
  
    // Definir la relación con la tabla de Carrito
    CarritoDetalle.belongsTo(sequelize.models.carrito, {
      foreignKey: 'id_carrito',
      as: 'carritos',
    });
  
    // Definir la relación con la tabla de Producto
    CarritoDetalle.belongsTo(sequelize.models.producto, {
      foreignKey: 'id_producto',
      as: 'productos',
    });
  
    return CarritoDetalle;
  };