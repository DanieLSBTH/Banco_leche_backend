module.exports = (app) => {
  const facturas = require("../controllers/factura.controller.js");
  const router = require("express").Router();

  // Crear una nueva factura
  router.post("/", facturas.create);

  // Recuperar todas las facturas
  router.get("/", facturas.findAll);

  // Recuperar una factura por su ID
  router.get("/:id_factura", facturas.findOne);

  // Actualizar una factura por su ID
  router.put("/:id_factura", facturas.update);

  // Eliminar una factura por su ID
  router.delete("/:id_factura", facturas.delete);

  app.use("/api/facturas", router);
};