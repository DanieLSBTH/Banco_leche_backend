module.exports = (sequelize, Sequelize) => {
  const Cliente = sequelize.define("cliente", {
    id_cliente: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    
    nombre: {
      type: Sequelize.STRING
    },
    apellido: {
      type: Sequelize.STRING
    },
    telefono: {
      type: Sequelize.STRING
    },
    nit: {
      type: Sequelize.STRING
    },
    fecha_registro: {
      type: Sequelize.DATE
    },
    fecha_salida: {
      type: Sequelize.DATE
    }
  });

  return Cliente;
};

  