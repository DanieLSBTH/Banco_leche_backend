require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const app = express();
const session = require('express-session');
const verificarToken = require('./app/middleware/verificarToken'); // Importar el middleware

var corsOptions = {
  origin: "https://banco-leche-front.onrender.com/"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

app.use(session({
  secret: 'secret_key', // Cambia esta clave a una más segura
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 }, // 1 hora
}));

const db = require("./app/models");
db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

app.get("/", (req, res) => {
  res.json({ message: "FARMACIA EN LINEA." });
});

// Rutas protegidas por JWT (todas las rutas)
const usuarioRoutes = require('./app/routes/usuario.routes');
const productoRoutes = require('./app/routes/producto.routes');

// Proteger todas las rutas a continuación
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/productos', verificarToken, productoRoutes);

// Otras rutas protegidas
require("./app/routes/turorial.routes")(app);
app.use('/api/tutoriales', verificarToken, require("./app/routes/turorial.routes"));

require("./app/routes/cliente.routes")(app);
app.use('/api/clientes', verificarToken, require("./app/routes/cliente.routes"));

require("./app/routes/empleado.routes")(app);
app.use('/api/empleados', verificarToken, require("./app/routes/empleado.routes"));

require("./app/routes/proveedor.routes")(app);
app.use('/api/proveedores', verificarToken, require("./app/routes/proveedor.routes"));

require("./app/routes/factura.routes")(app);
app.use('/api/facturas', verificarToken, require("./app/routes/factura.routes"));

require("./app/routes/factura_detalle.routes")(app);
app.use('/api/factura_detalle', verificarToken, require("./app/routes/factura_detalle.routes"));

require("./app/routes/carrito.routes")(app);
app.use('/api/carritos', verificarToken, require("./app/routes/carrito.routes"));

require("./app/routes/carrito_detalle.routes")(app);
app.use('/api/carrito_detalle', verificarToken, require("./app/routes/carrito_detalle.routes"));

require("./app/routes/personal.routes")(app);
app.use('/api/personal', verificarToken, require("./app/routes/personal.routes"));

require("./app/routes/servicio_intrahospitalario.routes")(app);
app.use('/api/servicio_intrahospitalario', verificarToken, require("./app/routes/servicio_intrahospitalario.routes"));

require("./app/routes/servicio_extrahospitalario.routes")(app);
app.use('/api/servicio_extrahospitalario', verificarToken, require("./app/routes/servicio_extrahospitalario.routes"));

require("./app/routes/estimulacion.routes")(app);
app.use('/api/estimulacion', verificarToken, require("./app/routes/estimulacion.routes"));

require("./app/routes/chat_temas.routes")(app);
app.use('/api/chat_temas', verificarToken, require("./app/routes/chat_temas.routes"));

require("./app/routes/chat_subtemas.routes")(app);
app.use('/api/chat_subtemas', verificarToken, require("./app/routes/chat_subtemas.routes"));

require("./app/routes/chat_respuestas.routes")(app);
app.use('/api/chat_respuestas', verificarToken, require("./app/routes/chat_respuestas.routes"));

require("./app/routes/donadora.routes")(app);
app.use('/api/donadora', verificarToken, require("./app/routes/donadora.routes"));

require("./app/routes/donadora_detalle.routes")(app);
app.use('/api/donadora_detalle', verificarToken, require("./app/routes/donadora_detalle.routes"));

require("./app/routes/chat_1respuestas.routes")(app);
app.use('/api/chat_1respuestas', verificarToken, require("./app/routes/chat_1respuestas.routes"));

require("./app/routes/trabajo_de_pasteurizaciones.routes")(app);
app.use('/api/trabajo_de_pasteurizaciones', verificarToken, require("./app/routes/trabajo_de_pasteurizaciones.routes"));

require("./app/routes/control_de_leches.routes")(app);
app.use('/api/control_de_leches', verificarToken, require("./app/routes/control_de_leches.routes"));

require("./app/routes/solicitud_de_leches.routes")(app);
app.use('/api/solicitud_de_leches', verificarToken, require("./app/routes/solicitud_de_leches.routes"));

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
