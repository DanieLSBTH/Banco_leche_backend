module.exports = app => {
    const trabajoDePasteurizaciones = require('../controllers/trabajo_de_pasteurizaciones.controller.js');
    
    var router = require('express').Router();
  
    // Crear un nuevo registro en trabajo_de_pasteurizaciones
    router.post('/', trabajoDePasteurizaciones.create);
  
    // Recuperar todos los registros de trabajo_de_pasteurizaciones
    router.get('/', trabajoDePasteurizaciones.findAll);

  
    
    router.get('/metrics', trabajoDePasteurizaciones.getMetrics);
    
    // Recuperar un solo registro de trabajo_de_pasteurizaciones por ID
    router.get('/:id_pasteurizacion', trabajoDePasteurizaciones.findOne);
  
    // Actualizar un registro de trabajo_de_pasteurizaciones por ID
    router.put('/:id_pasteurizacion', trabajoDePasteurizaciones.update);
  
    // Eliminar un registro de trabajo_de_pasteurizaciones por ID
    router.delete('/:id_pasteurizacion', trabajoDePasteurizaciones.delete);
  
    // Eliminar todos los registros de trabajo_de_pasteurizaciones
    router.delete('/', trabajoDePasteurizaciones.deleteAll);
  
    // Agregar el prefijo de la ruta para las operaciones de trabajo_de_pasteurizaciones
    app.use('/api/trabajo_de_pasteurizaciones', router);
  };
  