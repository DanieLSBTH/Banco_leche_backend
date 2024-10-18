module.exports = (sequelize, Sequelize) => {
  const Factura = sequelize.define("factura", {
    id_factura: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha: {
      type: Sequelize.DATE,
    },
    no_factura: {
      type: Sequelize.STRING,
    },
  });

  // Definir las relaciones con las tablas de cliente y empleado
  Factura.belongsTo(sequelize.models.cliente, {
    foreignKey: "id_cliente",
  as: "clientes",
  });

  Factura.belongsTo(sequelize.models.empleado, {
    foreignKey: "id_empleado",
    as: "empleados",
  });

  return Factura;
};
