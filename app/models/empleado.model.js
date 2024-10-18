module.exports = (sequelize, Sequelize) => {
    const Empleado = sequelize.define("empleado", {
      id_empleado: {
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
      direccion: {
        type: Sequelize.STRING
      },
      puesto: {
        type: Sequelize.STRING
      },
      fecha_inicio: {
        type: Sequelize.DATE
      },
      salario: {
        type: Sequelize.DECIMAL(10, 2)
      }
    });
  
    return Empleado;
  };
  