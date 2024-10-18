module.exports = (sequelize, Sequelize) => {
  const Estimulacion = sequelize.define('estimulacion', {
    id_estimulacion: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: Sequelize.STRING(255),
    },
    apellido: {
      type: Sequelize.STRING(255),
    },
    fecha: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW, 
    },
    id_intrahospitalario: {
      type: Sequelize.INTEGER,
    },
    constante: {
      type: Sequelize.BOOLEAN,
    },
    nueva: {
      type: Sequelize.BOOLEAN,
    },
    id_personal: {
      type: Sequelize.INTEGER,
    },
  });

  // Definir la relación con la tabla de Servicio Intrahospitalario
  Estimulacion.belongsTo(sequelize.models.servicio_in, {
    foreignKey: 'id_intrahospitalario',
    as: 'servicio_ins',
  });

  // Definir la relación con la tabla de Personal
  Estimulacion.belongsTo(sequelize.models.personal, {
    foreignKey: 'id_personal',
    as: 'personals',
  });

  return Estimulacion;
};
