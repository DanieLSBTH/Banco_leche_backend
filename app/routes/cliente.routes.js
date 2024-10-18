module.exports = app =>{
const clientes = require("../controllers/cliente.controller.js");

var router = require("express").Router();

// Create a new Cliente
router.post("/", clientes.create);

// Retrieve all Clientes
router.get("/", clientes.findAll);

// Retrieve a single Cliente with id
router.get("/:id_cliente", clientes.findOne);

// Update a Cliente with id
router.put("/:id_cliente", clientes.update);

// Delete a Cliente with id
router.delete("/:id_cliente", clientes.delete);

// Delete all Clientes
router.delete("/", clientes.deleteAll);
 // Retrieve a single Cliente with NIT
 router.get("/buscar/nit/:nit", clientes.findByNIT);  // Nueva ruta


app.use("/api/cliente", router);
};