module.exports = (app) => {
  const carrito = require('../controllers/carrito.controller.js');
  var router = require('express').Router();

  // Crear un nuevo carrito
  router.post('/', carrito.create);

  // Recuperar todos los carritos
  router.get('/', carrito.findAll);

  // Recuperar un carrito por su ID
  router.get('/:id_carrito', carrito.findOne);

  // Actualizar un carrito por su ID
  router.put('/:id_carrito', carrito.update);

  // Eliminar un carrito por su ID
  router.delete('/:id_carrito', carrito.delete);

  // Eliminar todos los carritos

  app.use('/api/carritos', router);
};