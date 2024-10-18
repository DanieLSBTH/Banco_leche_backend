module.exports = (sequelize, Sequelize) => {
    const Carrito = sequelize.define('carrito', {
      id_carrito: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_cliente: {
        type: Sequelize.INTEGER,
      },
      fecha_creacion: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      estado: {
        type: Sequelize.STRING(20),
        defaultValue: 'abierto',
      },
      departamento: {
        type: Sequelize.STRING
      },
      direccion: {
        type: Sequelize.STRING
      },
      metodo_de_pago: {
        type: Sequelize.STRING,
      },
    });
  
    // Definir la relación con la tabla de Clientes
    Carrito.belongsTo(sequelize.models.cliente, {
      foreignKey: 'id_cliente',
      as: 'clientes',
    });
  
  
    return Carrito;
  };