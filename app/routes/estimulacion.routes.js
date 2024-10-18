module.exports = (app) => {
    const estimulacion = require('../controllers/estimulacion.controller.js');
    var router = require('express').Router();
  
    // Crear un nuevo registro de estimulacion
    router.post('/', estimulacion.create);
  
    // Recuperar todos los registros de estimulacion
    router.get('/', estimulacion.findAll);
  
    // Nueva ruta para asistencias (colócala antes de la ruta con parámetro)
    router.get('/asistencias', estimulacion.getAsistencias);
    // Nueva ruta para obtener el resumen de estimulacion
    router.get('/resumen', estimulacion.getResumenEstimulacion);
    // Nueva ruta para obtener el resumen de estimulacion por mes
    router.get('/resumen_mensual',estimulacion.getResumenEstimulacionMensual);
    //nueva ruta
    router.get('/resumen_estimulacion',estimulacion.getResumen_Estimulacion_Mensual);
    // Recuperar datos por rango fecha
    router.get('/resumen_estimulacion-rangoFecha',estimulacion.getResumenEstimulacionPorRango);
    // Recuperar un registro de estimulacion por su ID
    router.get('/:id_estimulacion', estimulacion.findOne);
  
    // Actualizar un registro de estimulacion por su ID
    router.put('/:id_estimulacion', estimulacion.update);
  
    // Eliminar un registro de estimulacion por su ID
    router.delete('/:id_estimulacion', estimulacion.delete);
    // Agregar esta línea en estimulacion.routes.js

    // Montar el router en la aplicación
    app.use('/api/estimulacion', router);
   
};
