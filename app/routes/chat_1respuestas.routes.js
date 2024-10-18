module.exports = (app) => {
    const chatRespuestas = require('../controllers/chat_1respuestas.controller.js');
    var router = require('express').Router();
  
    // Crear una nueva respuesta
    router.post('/add', chatRespuestas.addResponse);
  
    app.use('/api/chat_1respuestas', router);
  };
  