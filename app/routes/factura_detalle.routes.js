module.exports = (app) => {
    const facturaDetalle = require('../controllers/factura_detalle.controller.js');
  
    var router = require('express').Router();
  
    // Crear un nuevo registro en factura_detalle
    router.post('/', facturaDetalle.create);
  
    // Recuperar todos los registros de factura_detalle
    router.get('/', facturaDetalle.findAll);
  
    // Recuperar un registro de factura_detalle por su ID
    router.get('/:id_venta_detalle', facturaDetalle.findOne);
  
    // Actualizar un registro de factura_detalle por su ID
    router.put('/:id_venta_detalle', facturaDetalle.update);
  
    // Eliminar un registro de factura_detalle por su ID
    router.delete('/:id_venta_detalle', facturaDetalle.delete);
  
    // Eliminar todos los registros de factura_detalle
    router.delete('/', facturaDetalle.deleteAll);
  
    app.use('/api/factura_detalle', router);
  };
  