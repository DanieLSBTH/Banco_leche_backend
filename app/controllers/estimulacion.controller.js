const db = require('../models');
const Estimulacion = db.estimulacion;
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const Op = Sequelize.Op;

const parseFecha = (fecha) => {
  const [day, month, year] = fecha.split('/');
  return new Date(`${year}-${month}-${day}`);
};
const { literal, fn, col } = require('sequelize');

// Crear y guardar un nuevo registro en estimulacion
exports.create = (req, res) => {
  const { id_personal_estimulacion, fecha, id_intrahospitalario, constante, nueva , id_personal, id_extrahospitalario, } = req.body;

  // Verificar que todos los campos requeridos estén presentes
  if (!id_personal_estimulacion || !fecha || typeof constante === 'undefined' || typeof nueva === 'undefined' || !id_personal) {
    res.status(400).send({
      message: 'Todos los campos son obligatorios.',
    });
    return;
  }

   // Verificar que solo uno de los campos esté presente (id_extrahospitalario o id_intrahospitalario)
   if (id_extrahospitalario && id_intrahospitalario) {
    return res.status(400).send({
      message: 'Solo se puede seleccionar un campo: id_extrahospitalario o id_intrahospitalario.',
    });
  }

  // Crear un registro en estimulacion
  Estimulacion.create({
    id_personal_estimulacion,
    fecha: parseFecha(fecha),
    id_intrahospitalario,
    constante,
    nueva,
    id_personal,
    id_extrahospitalario,
    
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Error al crear el registro en estimulacion.',
      });
    });
};

// Recuperar todos los registros de estimulacion con paginación
exports.findAll = (req, res) => {
  const { page = 1, pageSize = 10 } = req.query; // Página y tamaño de página
  const id_personal_estimulacion = req.query.id_personal_estimulacion;
  const mesActual = req.query.mesActual === 'true';
  const offset = (page - 1) * pageSize; // Calcula el desplazamiento
  const limit = parseInt(pageSize, 10); // Limite de registros por página

  let condition = {};

  if (id_personal_estimulacion) {
    condition.id_personal_estimulacion = { [Op.eq]: id_personal_estimulacion };
  
  }

  if (mesActual) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    condition.fecha = {
      [Op.between]: [startOfMonth, endOfMonth],
    };
  }

  Estimulacion.findAndCountAll({
    where: condition,
    include: [
      { model: db.servicio_in, as: 'servicio_ins' },
      { model: db.personal_estimulaciones, as: 'personal_estimulaciones' },
      {model: db.personal, as: 'personals' },
      { model: db.servicio_ex, as: 'servicio_exes' },
    ],
    limit: limit, // Límite por página
    offset: offset, // Desplazamiento por página
    order: [['id_estimulacion', 'DESC']], // Ordenar por id_estimulacion en orden descendente
  })
    .then((result) => {
      res.send({
        estimulaciones: result.rows, // Registros actuales
        totalRecords: result.count, // Total de registros
        currentPage: parseInt(page, 10), // Página actual
        totalPages: Math.ceil(result.count / limit), // Total de páginas
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Ocurrió un error al recuperar los registros de estimulacion.',
      });
    });
};

// Recuperar un registro de estimulacion por su ID
exports.findOne = (req, res) => {
  const id_estimulacion = req.params.id_estimulacion;

  Estimulacion.findByPk(id_estimulacion, {
    include: [
      { model: db.servicio_in, as: 'servicio_ins' },
      { model: db.personal_estimulaciones, as: 'personal_estimulaciones' },
      { model: db.personal, as: 'personals' },
      { model: db.servicio_ex, as: 'servicio_exes' },
    ],
  })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `No se encontró el registro con id=${id_estimulacion}.`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al recuperar el registro con id=${id_estimulacion}`,
      });
    });
};

// Actualizar un registro de estimulacion por su ID
exports.update = (req, res) => {
  const id_estimulacion = req.params.id_estimulacion;

  Estimulacion.update(req.body, {
    where: { id_estimulacion: id_estimulacion },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de estimulacion actualizado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede actualizar el registro de estimulacion con id=${id_estimulacion}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al actualizar el registro de estimulacion con id=${id_estimulacion}`,
      });
    });
};
// Eliminar un registro de estimulacion por su ID
exports.delete = (req, res) => {
  const id_estimulacion = req.params.id_estimulacion;

  Estimulacion.destroy({
    where: { id_estimulacion: id_estimulacion },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de estimulacion eliminado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede eliminar el registro de estimulacion con id=${id_estimulacion}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al eliminar el registro de estimulacion con id=${id_estimulacion}`,
      });
    });
};

// Eliminar todos los registros de estimulacion de la base de datos
exports.deleteAll = (req, res) => {
  Estimulacion.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} registros de estimulacion eliminados con éxito.`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error al eliminar los registros de estimulacion.',
      });
    });
};

exports.getEstadisticasPorFechas = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  
  if (!fechaInicio || !fechaFin) {
    return res.status(400).send({ message: 'Las fechas de inicio y fin son requeridas.' });
  }
  
  try {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);
    
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).send({ message: 'Formato de fecha inválido' });
    }
    
    const dateCondition = {
      fecha: {
        [Op.between]: [inicio, fin],
      },
    };
    
    // Total de estimulaciones (este sí debe contar todas)
    const totalEstimulaciones = await db.estimulacion.count({
      where: dateCondition,
    });

    // Total de estimulaciones nuevas
    const totalNuevas = await db.estimulacion.count({
      where: {
        ...dateCondition,
        nueva: true
      }
    });

    // Total de estimulaciones constantes
    const totalConstantes = await db.estimulacion.count({
      where: {
        ...dateCondition,
        constante: true
      }
    });
    
    // Desglose detallado por servicios intrahospitalarios
    const detalleServiciosIn = await db.estimulacion.findAll({
      where: dateCondition,
      attributes: [
        [Sequelize.col('estimulacion.id_intrahospitalario'), 'id_intrahospitalario'],
        [Sequelize.fn('COUNT', Sequelize.col('estimulacion.id_estimulacion')), 'total_estimulaciones'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN estimulacion.nueva = true THEN 1 END')), 'total_nuevas'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN estimulacion.constante = true THEN 1 END')), 'total_constantes']
      ],
      include: [{
        model: db.servicio_in,
        as: 'servicio_ins',
        attributes: ['servicio'],
        required: true
      }],
      group: [
        'estimulacion.id_intrahospitalario',
        'servicio_ins.id_intrahospitalario',
        'servicio_ins.servicio'
      ],
      order: [[Sequelize.fn('COUNT', Sequelize.col('estimulacion.id_estimulacion')), 'DESC']]
    });

    // Desglose detallado por servicios extrahospitalarios
    const detalleServiciosEx = await db.estimulacion.findAll({
      where: dateCondition,
      attributes: [
        [Sequelize.col('estimulacion.id_extrahospitalario'), 'id_extrahospitalario'],
        [Sequelize.fn('COUNT', Sequelize.col('estimulacion.id_estimulacion')), 'total_estimulaciones'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN estimulacion.nueva = true THEN 1 END')), 'total_nuevas'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN estimulacion.constante = true THEN 1 END')), 'total_constantes']
      ],
      include: [{
        model: db.servicio_ex,
        as: 'servicio_exes',
        attributes: ['servicio'],
        required: true
      }],
      group: [
        'estimulacion.id_extrahospitalario',
        'servicio_exes.id_extrahospitalario',
        'servicio_exes.servicio'
      ],
      order: [[Sequelize.fn('COUNT', Sequelize.col('estimulacion.id_estimulacion')), 'DESC']]
    });

    // Formatear detalles de servicios intrahospitalarios
    const formattedDetalleServiciosIn = detalleServiciosIn.map(servicio => ({
      id_intrahospitalario: servicio.id_intrahospitalario,
      servicio: servicio.servicio_ins.servicio,
      total_estimulaciones: parseInt(servicio.get('total_estimulaciones')),
      total_nuevas: parseInt(servicio.get('total_nuevas')),
      total_constantes: parseInt(servicio.get('total_constantes'))
    }));

    // Formatear detalles de servicios extrahospitalarios
    const formattedDetalleServiciosEx = detalleServiciosEx.map(servicio => ({
      id_extrahospitalario: servicio.id_extrahospitalario,
      servicio: servicio.servicio_exes.servicio,
      total_estimulaciones: parseInt(servicio.get('total_estimulaciones')),
      total_nuevas: parseInt(servicio.get('total_nuevas')),
      total_constantes: parseInt(servicio.get('total_constantes'))
    }));
    
    // Total de personas distintas
    const totalPersonas = await db.estimulacion.count({
      where: dateCondition,
      distinct: true,
      col: 'id_personal_estimulacion',
    });
    
    // Respuesta
    res.send({
      totalEstimulaciones,
      totalNuevas,
      totalConstantes,
      totalPersonas,
      serviciosIntrahospitalarios: formattedDetalleServiciosIn,
      serviciosExtrahospitalarios: formattedDetalleServiciosEx
    });
  } catch (error) {
    console.error('Error en getEstadisticasPorFechas:', error);
    res.status(500).send({
      message: 'Error al recuperar las estadísticas de estimulaciones.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Nueva función para búsqueda detallada por id_personal_estimulacion
exports.findDetailsById = async (req, res) => {
  const { id_personal_estimulacion } = req.query;

  if (!id_personal_estimulacion) {
    return res.status(400).send({
      message: 'El ID de la persona es requerido para la búsqueda.'
    });
  }

  try {
    // Buscar todas las estimulaciones relacionadas con el id_personal_estimulacion
    const resultados = await db.estimulacion.findAll({
      include: [
        {
          model: db.personal_estimulaciones,
          as: 'personal_estimulaciones',
          where: {
            id_personal_estimulacion: id_personal_estimulacion
          },
          attributes: ['id_personal_estimulacion', 'nombre', 'apellido']
        },
        {
          model: db.servicio_in,
          as: 'servicio_ins',
          attributes: ['servicio']
        }
      ],
      order: [['fecha', 'ASC']] // Ordenar por fecha ascendente
    });

    if (!resultados.length) {
      return res.status(404).send({
        message: 'No se encontraron registros para este ID.'
      });
    }

    // Agrupar los datos por persona
    const personasMap = new Map();

    resultados.forEach(estimulacion => {
      const persona = estimulacion.personal_estimulaciones;
      const idPersona = persona.id_personal_estimulacion;

      if (!personasMap.has(idPersona)) {
        personasMap.set(idPersona, {
          informacion_personal: {
            id: persona.id_personal_estimulacion,
            nombre: persona.nombre,
            apellido: persona.apellido,
          },
          resumen: {
            total_visitas: 0,
            primera_visita: null,
            ultima_visita: null,
            total_nuevas: 0,
            total_constantes: 0,
            servicios_visitados: new Set()
          },
          visitas: []
        });
      }

      const personaData = personasMap.get(idPersona);
      
      // Actualizar resumen
      personaData.resumen.total_visitas++;
      if (estimulacion.nueva) personaData.resumen.total_nuevas++;
      if (estimulacion.constante) personaData.resumen.total_constantes++;
      personaData.resumen.servicios_visitados.add(estimulacion.servicio_ins.servicio);
      
      // Actualizar primera y última visita
      const fechaVisita = estimulacion.fecha;
      if (!personaData.resumen.primera_visita || fechaVisita < personaData.resumen.primera_visita) {
        personaData.resumen.primera_visita = fechaVisita;
      }
      if (!personaData.resumen.ultima_visita || fechaVisita > personaData.resumen.ultima_visita) {
        personaData.resumen.ultima_visita = fechaVisita;
      }

      // Agregar detalle de la visita
      personaData.visitas.push({
        fecha: estimulacion.fecha,
        servicio: estimulacion.servicio_ins.servicio,
        tipo: {
          nueva: estimulacion.nueva,
          constante: estimulacion.constante
        },
        id_estimulacion: estimulacion.id_estimulacion
      });
    });

    // Convertir el Map a un array y formatear los datos finales
    const resultadosFormateados = Array.from(personasMap.values()).map(persona => ({
      ...persona,
      resumen: {
        ...persona.resumen,
        servicios_visitados: Array.from(persona.resumen.servicios_visitados),
        primera_visita: persona.resumen.primera_visita.toLocaleDateString(),
        ultima_visita: persona.resumen.ultima_visita.toLocaleDateString(),
        dias_desde_ultima_visita: Math.floor(
          (new Date() - persona.resumen.ultima_visita) / (1000 * 60 * 60 * 24)
        )
      },
      visitas: persona.visitas.map(visita => ({
        ...visita,
        fecha: visita.fecha.toLocaleDateString()
      }))
    }));

    // Calcular estadísticas adicionales
    const estadisticasGenerales = {
      total_personas_encontradas: resultadosFormateados.length,
      promedio_visitas_por_persona: (resultadosFormateados
        .reduce((acc, persona) => acc + persona.resumen.total_visitas, 0) / resultadosFormateados.length
      ).toFixed(2),
      servicios_mas_frecuentes: obtenerServiciosMasFrecuentes(resultadosFormateados)
    };

    res.send({
      estadisticas_generales: estadisticasGenerales,
      resultados: resultadosFormateados
    });

  } catch (error) {
    console.error('Error en findDetailsById:', error);
    res.status(500).send({
      message: 'Error al buscar los detalles por ID.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Función auxiliar para calcular servicios más frecuentes
function obtenerServiciosMasFrecuentes(resultados) {
  const serviciosCount = {};
  
  resultados.forEach(persona => {
    persona.visitas.forEach(visita => {
      serviciosCount[visita.servicio] = (serviciosCount[visita.servicio] || 0) + 1;
    });
  });

  return Object.entries(serviciosCount)
    .sort(([,a], [,b]) => b - a)
    .reduce((acc, [servicio, count]) => {
      acc[servicio] = count;
      return acc;
    }, {});
}


exports.getAsistencias = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).send({
        message: 'Se requieren fechaInicio y fechaFin en el formato YYYY-MM-DD',
      });
    }

    const query = `
      SELECT 
        LOWER(nombre) AS nombre, 
        LOWER(apellido) AS apellido, 
        constante, 
        nueva,  
        COUNT(*) AS ASISTENCIAS 
      FROM 
        estimulacions
      WHERE 
        cast(fecha as date) BETWEEN :fechaInicio AND :fechaFin
      GROUP BY 
        LOWER(nombre), 
        LOWER(apellido), 
        constante, 
        nueva;
    `;

    const asistencias = await db.sequelize.query(query, {
      replacements: { fechaInicio, fechaFin },
      type: QueryTypes.SELECT,
    });

    res.send(asistencias);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al obtener las asistencias.',
    });
  }
};

exports.getResumenEstimulacion = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) AS total_general,
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)) AS total_por_mes,
        COUNT(CASE WHEN constante = true AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) AS total_constantes_por_mes,
        COUNT(CASE WHEN nueva = true AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) AS total_nuevas_por_mes
      FROM 
        public.estimulacions;
    `;

    const resumen = await db.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.send(resumen[0]);  // Enviar el primer objeto del array ya que solo esperamos un único resultado
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al obtener el resumen de estimulación.',
    });
  }
};

exports.getResumenEstimulacionMensual = async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', fecha), 'TMMonth YYYY') AS mes,  -- Formatea el mes como texto (ej. "Septiembre 2024")
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)) AS total_por_mes,
        COUNT(CASE WHEN constante = true AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) AS total_constantes_por_mes,
        COUNT(CASE WHEN nueva = true AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) AS total_nuevas_por_mes
      FROM 
        public.estimulacions
      WHERE 
        DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)  -- Asegura filtrar solo por el mes actual
      GROUP BY 
        DATE_TRUNC('month', fecha)
      ORDER BY 
        mes;
    `;

    const resumen = await db.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.send(resumen);  // Enviar el resultado completo, puede contener múltiples filas
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al obtener el resumen mensual de estimulación.',
    });
  }
};

// Obtener el resumen de estimulaciones mensuales solo para el año actual
exports.getResumen_Estimulacion_Mensual = async (req, res) => {
  try {
    const query = `
      SELECT 
  TO_CHAR(fecha, 'TMMonth YYYY') AS mes,  -- Formatea el mes como texto (ej. "September 2024")
  COUNT(*) AS total_estimulaciones,
  COUNT(CASE WHEN constante = true THEN 1 END) AS total_constantes,
  COUNT(CASE WHEN nueva = true THEN 1 END) AS total_nuevas
FROM 
  public.estimulacions
WHERE 
  EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)  -- Filtrar solo por el año actual
GROUP BY 
  TO_CHAR(fecha, 'TMMonth YYYY')
ORDER BY 
  MIN(fecha);

    `;

    const resumen = await db.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.send(resumen);  // Enviar el resultado completo, puede contener múltiples filas
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al obtener el resumen mensual de estimulación.',
    });
  }
};

exports.getResumenEstimulacionPorRango = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    // Verificar que el usuario haya proporcionado ambas fechas
    if (!fechaInicio || !fechaFin) {
      return res.status(400).send({
        message: 'Se requieren fechaInicio y fechaFin en el formato YYYY-MM-DD',
      });
    }
    // Ajustar la fecha de fin para que incluya el día completo (23:59:59)
    const fechaFinAjustada = `${fechaFin} 23:59:59`;
    
    const query = `
      SELECT 
  TO_CHAR(fecha, 'TMMonth YYYY') AS mes,  -- Esto ya convierte el mes a texto (en inglés por defecto)
  COUNT(*) AS total_estimulaciones,
  COUNT(CASE WHEN constante = true THEN 1 END) AS total_constantes,
  COUNT(CASE WHEN nueva = true THEN 1 END) AS total_nuevas
FROM 
  public.estimulacions
WHERE 
  fecha BETWEEN :fechaInicio AND :fechaFinAjustada  -- Filtrar por el rango de fechas proporcionado por el usuario
GROUP BY 
  mes
ORDER BY 
  MIN(fecha);

    `;

    const resumen = await db.sequelize.query(query, {
      replacements: { fechaInicio, fechaFinAjustada },
      type: QueryTypes.SELECT,
    });

    res.send(resumen);  // Enviar el resultado completo
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al obtener el resumen de estimulación por rango de fechas.',
    });
  }
};
