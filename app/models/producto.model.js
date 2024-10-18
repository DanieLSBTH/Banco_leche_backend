module.exports = (sequelize, Sequelize) => {
    const Producto = sequelize.define("producto", {
      id_producto: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      producto: {
        type: Sequelize.STRING
      },
      descripcion: {
        type: Sequelize.STRING
      },
      precio_compra: {
        type: Sequelize.DECIMAL(10, 2)
      },
      precio_venta: {
        type: Sequelize.DECIMAL(10, 2)
      },
      stock: {
        type: Sequelize.INTEGER
      },
      imagen: {
        type: Sequelize.STRING // Puedes almacenar la ruta o el nombre del archivo de la imagen
      },
      categoria: {
        type: Sequelize.STRING
      },
      id_proveedor: {
        type: Sequelize.INTEGER,
        references: {
          model: 'proveedors', // Nombre de la tabla de proveedores
          key: 'id_proveedor' // Clave primaria de la tabla de proveedores
        }
      }
    });
  
    // Definir la relación con la tabla de proveedores
    Producto.belongsTo(sequelize.models.proveedor, { foreignKey: 'id_proveedor' });
  
    return Producto;
  };
  