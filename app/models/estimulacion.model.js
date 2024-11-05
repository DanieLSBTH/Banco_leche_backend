module.exports = (sequelize, Sequelize) => {
  const Estimulacion = sequelize.define('estimulacion', {
    id_estimulacion: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_personal_estimulacion: {  // Cambio de id_personal a id_personal_estimulacion
      type: Sequelize.INTEGER,
      allowNull: false,
      
    },
    fecha: {
      type: Sequelize.DATE,
      allowNull: false,
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

  // Relación con Servicio Intrahospitalario
  Estimulacion.belongsTo(sequelize.models.servicio_in, {
    foreignKey: 'id_intrahospitalario',
    as: 'servicio_ins',
  });

  // Relación con Personal_estimulacion
  Estimulacion.belongsTo(sequelize.models.personal_estimulaciones, {
    foreignKey: 'id_personal_estimulacion',
    as: 'personal_estimulaciones',
  });

  Estimulacion.belongsTo(sequelize.models.personal, {
    foreignKey: 'id_personal',
    as: 'personals',
  });

  return Estimulacion;
};
