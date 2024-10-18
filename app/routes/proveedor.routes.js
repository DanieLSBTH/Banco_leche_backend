module.exports = app =>{
const proveedores = require("../controllers/proveedor.controller.js");
const router = require("express").Router();

// Crear un nuevo Proveedor
router.post("/", proveedores.create);

// Recuperar todos los Proveedores
router.get("/", proveedores.findAll);

// Recuperar un Proveedor por su ID
router.get("/:id_proveedor", proveedores.findOne);

// Actualizar un Proveedor por su ID
router.put("/:id_proveedor", proveedores.update);

// Eliminar un Proveedor por su ID
router.delete("/:id_proveedor", proveedores.delete);

// Eliminar todos los Proveedores
router.delete("/", proveedores.deleteAll);

app.use("/api/proveedor", router);

};