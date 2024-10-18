module.exports = app => {
    const solicitudDeLechesController = require('../controllers/solicitud_de_leches.controller');
    const router = require("express").Router();
  
    // Crear un nuevo registro de solicitud_de_leches
    router.post('/', solicitudDeLechesController.create);
  
    // Recuperar todos los registros de solicitud_de_leches
    router.get('/', solicitudDeLechesController.findAll);
    //recupera por mes los datos 
    router.get('/resumen_mes',solicitudDeLechesController.getResumenPorMes);
  
    // Recuperar un registro de solicitud_de_leches por su ID
    router.get('/:id_solicitud', solicitudDeLechesController.findOne);
    // Recuperar el resumen por mes
    router.get('/resumen/por-mes', solicitudDeLechesController.getResumenPorMes);
    // Recuperar un resumen por servicio y fechas
    router.get('/resumen/por-servicio-y-fechas', solicitudDeLechesController.getResumenPorServicioYFechas);
  

  
    // Actualizar un registro de solicitud_de_leches por su ID
    router.put('/:id_solicitud', solicitudDeLechesController.update);
  
    // Eliminar un registro de solicitud_de_leches por su ID
    router.delete('/:id_solicitud', solicitudDeLechesController.delete);
  
    // Eliminar todos los registros de solicitud_de_leches
    router.delete('/', solicitudDeLechesController.deleteAll);
  
    app.use("/api/solicitud_de_leches", router);
  };
  