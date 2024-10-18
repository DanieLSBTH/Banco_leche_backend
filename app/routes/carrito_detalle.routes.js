module.exports = (app) => {
    const carritoDetalle = require('../controllers/carrito_detalle.controller.js');
    var router = require('express').Router();
  
    // Crear un nuevo detalle de carrito
    router.post('/', carritoDetalle.create);
  
    // Recuperar todos los detalles de carrito
    router.get('/', carritoDetalle.findAll);
  
    // Recuperar un detalle de carrito por su ID
    router.get('/:id_carrito_detalle', carritoDetalle.findOne);
  
    // Actualizar un detalle de carrito por su ID
    router.put('/:id_carrito_detalle', carritoDetalle.update);
  
    // Eliminar un detalle de carrito por su ID
    router.delete('/:id_carrito_detalle', carritoDetalle.delete);
  
   
  
    app.use('/api/carrito_detalles', router);
  };