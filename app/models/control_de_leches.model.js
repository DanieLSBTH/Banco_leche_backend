module.exports = (sequelize, Sequelize) => {
  const ControlDeLeche = sequelize.define("control_de_leches", {
    id_control_leche: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_pasteurizacion: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    fecha_almacenamiento: {
      type: Sequelize.DATE,
      allowNull: false,
      get() {
        // Devolver solo la parte de la fecha
        return this.getDataValue('fecha_almacenamiento').toISOString().split('T')[0];
      }
    },
    volumen_ml_onza: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    tipo_de_leche: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    fecha_entrega: {
      type: Sequelize.DATE,
      allowNull: false,
      get() {
        // Devolver solo la parte de la fecha
        return this.getDataValue('fecha_entrega').toISOString().split('T')[0];
      }
    },
    responsable: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
  });

  ControlDeLeche.belongsTo(sequelize.models.trabajo_de_pasteurizaciones, {
    foreignKey: 'id_pasteurizacion',
    as: 'trabajo_de_pasteurizaciones', // Alias más descriptivo
  });
  
  return ControlDeLeche;
};
