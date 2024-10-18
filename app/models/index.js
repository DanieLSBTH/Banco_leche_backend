const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);
db.clientes = require("./cliente.model.js")(sequelize, Sequelize);
db.personal = require("./personal.model.js")(sequelize, Sequelize);
db.usuarios = require("./usuario.model.js")(sequelize, Sequelize);
db.servicio_in = require("./servicio_intrahospitalario.model.js")(sequelize, Sequelize);
db.servicio_ex = require("./servicio_extrahospitalario.model.js")(sequelize, Sequelize);
db.estimulacion = require("./estimulacion.model.js")(sequelize, Sequelize);
db.empleado = require("./empleado.model.js")(sequelize, Sequelize);
db.proveedor = require("./proveedor.model.js")(sequelize, Sequelize);
db.producto = require("./producto.model.js")(sequelize, Sequelize);
db.factura = require("./factura.model.js")(sequelize, Sequelize);
db.factura_detalle = require("./factura_detalle.model.js")(sequelize, Sequelize);
db.carrito = require("./carrito.model.js")(sequelize, Sequelize);
db.carrito_detalle = require("./carrito_detalle.model.js")(sequelize, Sequelize);
db.chat_temas = require("./chat_temas.model.js")(sequelize, Sequelize);
db.chat_subtemas = require("./chat_subtemas.model.js")(sequelize, Sequelize);
db.chat_respuestas = require("./chat_respuestas.model.js")(sequelize, Sequelize);
db.donadoras=require("./donadora.model.js")(sequelize,Sequelize);
db.donadora_detalle = require("./donadora_detalle.model.js")(sequelize, Sequelize);
db.chat_1respuestas=require("./chat_1respuestas.model.js")(sequelize, Sequelize);
db.trabajo_de_pasteurizaciones=require("./trabajo_de_pasteurizaciones.model.js")(sequelize, Sequelize);
db.control_de_leches=require("./control_de_leches.model.js")(sequelize, Sequelize);
db.solicitud_de_leches=require("./solicitud_de_leches.model.js")(sequelize, Sequelize);
module.exports = db;
