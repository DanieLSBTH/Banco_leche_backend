module.exports = (sequelize, Sequelize) => {
    const ChatRespuestas = sequelize.define("chat_1respuestas", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      keyword: {
        type: Sequelize.STRING,
        allowNull: false
      },
      reply: {
        type: Sequelize.STRING,
        allowNull: false
      }
    }, {
      timestamps: false // Desactiva los campos createdAt y updatedAt
    });
  
    return ChatRespuestas;
  };
  