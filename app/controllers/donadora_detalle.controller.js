const db = require('../models');
const DonadoraDetalle = db.donadora_detalle;
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const sequelize = db.sequelize; // Asegúrate de importar sequelize
const Op = Sequelize.Op;

// Crear y guardar un nuevo registro en donadora_detalle
exports.create = (req, res) => {
  const {no_frasco, id_donadora, fecha, onzas, id_extrahospitalario, id_intrahospitalario, constante, nueva, id_personal } = req.body;

  // Verificar que todos los campos requeridos estén presentes
  if (!no_frasco || !id_donadora || !onzas || typeof constante === 'undefined' || typeof nueva === 'undefined' || !id_personal) {
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

  // Crear un registro en donadora_detalle
  DonadoraDetalle.create({
    no_frasco,
    id_donadora,
    fecha,
    onzas,
    id_extrahospitalario,
    id_intrahospitalario,
    constante,
    nueva,
    id_personal,
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Error al crear el registro en donadora_detalle.',
      });
    });
};

 //donadora_detalle

 exports.findAll = (req, res) => {
  const { page = 1, pageSize = 10 } = req.query; // Obtiene la página actual y el tamaño de la página desde los query params
  const id_donadora = req.query.id_donadora;
  const mesActual = req.query.mesActual === 'true';
  const offset = (page - 1) * pageSize; // Calcula el desplazamiento
  const limit = parseInt(pageSize, 10); // Limita la cantidad de registros por página

  let condition = {};

  if (id_donadora) {
      condition.id_donadora = { [Op.eq]: id_donadora };
  }

  if (mesActual) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      condition.fecha = {
          [Op.between]: [startOfMonth, endOfMonth]
      };
  }

  // Usar findAndCountAll para obtener los datos paginados y el total de registros
  DonadoraDetalle.findAndCountAll({
      where: condition,
      include: [
          { model: db.donadoras, as: 'donadoras' },
          { model: db.servicio_ex, as: 'servicio_exes' },
          { model: db.servicio_in, as: 'servicio_ins' }, // Se añade la relación de intrahospitalario
          { model: db.personal, as: 'personals' },
      ],
      limit: limit,  // Límite por página
      offset: offset, // Desplazamiento según la página actual
      order: [['id_donadora_detalle', 'DESC']] // Ordenar por id_donadora_detalle en orden ascendente
  })
  .then(result => {
      res.send({
          donadoraDetalles: result.rows,        // Registros actuales
          totalRecords: result.count,           // Número total de registros
          currentPage: parseInt(page, 10),     // Página actual
          totalPages: Math.ceil(result.count / limit) // Total de páginas
      });
  })
  .catch(err => {
      res.status(500).send({
          message: err.message || 'Ocurrió un error al recuperar los registros de donadora_detalle.',
      });
  });
};

// Recuperar un registro de donadora_detalle por su ID
exports.findOne = (req, res) => {
  const id_donadora_detalle = req.params.id_donadora_detalle;

  DonadoraDetalle.findByPk(id_donadora_detalle, {
    include: [
      { model: db.donadoras, as: 'donadoras' },
      { model: db.servicio_ex, as: 'servicio_exes' },
      { model: db.servicio_in, as: 'servicio_ins' }, // Se añade la relación de intrahospitalario
      { model: db.personal, as: 'personals' },
    ],
  })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `No se encontró el registro con id=${id_donadora_detalle}.`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al recuperar el registro con id=${id_donadora_detalle}`,
      });
    });
};

// Actualizar un registro de donadora_detalle por su ID
// Actualizar un registro de donadora_detalle por su ID
exports.update = (req, res) => {
  const id_donadora_detalle = req.params.id_donadora_detalle;
  const { onzas } = req.body;

  // Si el campo onzas está presente, recalcular los litros
  if (onzas) {
    req.body.litros = onzas * 0.03;
  }

  DonadoraDetalle.update(req.body, {
    where: { id_donadora_detalle: id_donadora_detalle },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de donadora_detalle actualizado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede actualizar el registro de donadora_detalle con id=${id_donadora_detalle}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al actualizar el registro de donadora_detalle con id=${id_donadora_detalle}`,
      });
    });
};


// Eliminar un registro de donadora_detalle por su ID
exports.delete = (req, res) => {
  const id_donadora_detalle = req.params.id_donadora_detalle;

  DonadoraDetalle.destroy({
    where: { id_donadora_detalle: id_donadora_detalle },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de donadora_detalle eliminado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede eliminar el registro de donadora_detalle con id=${id_donadora_detalle}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al eliminar el registro de donadora_detalle con id=${id_donadora_detalle}`,
      });
    });
};

// Eliminar todos los registros de donadora_detalle de la base de datos
exports.deleteAll = (req, res) => {
  DonadoraDetalle.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} registros de donadora_detalle eliminados con éxito.`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error al eliminar los registros de donadora_detalle.',
      });
    });
};

// Nueva función para obtener el resumen de donaciones por tipo de servicio
exports.getDonacionesPorServicio = (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  // Verificar que las fechas de inicio y fin estén presentes
  if (!fechaInicio || !fechaFin) {
    return res.status(400).send({
      message: 'Debe proporcionar una fecha de inicio y una fecha de fin.',
    });
  }

  // Verificar el formato de las fechas (opcional pero recomendable)
  const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
  if (!regexFecha.test(fechaInicio) || !regexFecha.test(fechaFin)) {
    return res.status(400).send({
      message: 'El formato de las fechas debe ser YYYY-MM-DD.',
    });
  }

  // Ajustar la fecha de fin para que incluya el día completo (23:59:59)
  const fechaFinAjustada = `${fechaFin} 23:59:59`;

  // Consulta SQL optimizada usando WITH
  const query = `
    WITH extrahospitalario AS (
    SELECT 
        'Extrahospitalario' AS servicio_tipo,
        COUNT(*) AS total_donaciones,
        COUNT(DISTINCT dd.id_donadora) AS total_donadoras,
        SUM(dd.litros) AS total_litros
    FROM 
        donadora_detalles dd
    JOIN 
        servicio_exes ext ON dd.id_extrahospitalario = ext.id_extrahospitalario
    WHERE 
        dd.fecha BETWEEN :fechaInicio AND :fechaFinAjustada
    UNION ALL
    SELECT 
        ext.servicio AS servicio_tipo,
        COUNT(*) AS total_donaciones,
        COUNT(DISTINCT dd.id_donadora) AS total_donadoras,
        SUM(dd.litros) AS total_litros
    FROM 
        donadora_detalles dd
    JOIN 
        servicio_exes ext ON dd.id_extrahospitalario = ext.id_extrahospitalario
    WHERE 
        dd.fecha BETWEEN :fechaInicio AND :fechaFinAjustada
    GROUP BY 
        ext.servicio
),
intrahospitalario AS (
    SELECT 
        'Intrahospitalario' AS servicio_tipo,
        COUNT(*) AS total_donaciones,
        COUNT(DISTINCT dd.id_donadora) AS total_donadoras,
        SUM(dd.litros) AS total_litros
    FROM 
        donadora_detalles dd
    JOIN 
        servicio_ins int ON dd.id_intrahospitalario = int.id_intrahospitalario
    WHERE 
        dd.fecha BETWEEN :fechaInicio AND :fechaFinAjustada
    UNION ALL
    SELECT 
        int.servicio AS servicio_tipo,
        COUNT(*) AS total_donaciones,
        COUNT(DISTINCT dd.id_donadora) AS total_donadoras,
        SUM(dd.litros) AS total_litros
    FROM 
        donadora_detalles dd
    JOIN 
        servicio_ins int ON dd.id_intrahospitalario = int.id_intrahospitalario
    WHERE 
        dd.fecha BETWEEN :fechaInicio AND :fechaFinAjustada
    GROUP BY 
        int.servicio
)
SELECT * FROM extrahospitalario
UNION ALL
SELECT * FROM intrahospitalario
UNION ALL
SELECT 
    'TOTAL GENERAL' AS servicio_tipo,
    SUM(total_donaciones) AS total_donaciones,
    SUM(total_donadoras) AS total_donadoras,
    SUM(total_litros) AS total_litros
FROM (
    SELECT * FROM extrahospitalario WHERE servicio_tipo = 'Extrahospitalario'
    UNION ALL
    SELECT * FROM intrahospitalario WHERE servicio_tipo = 'Intrahospitalario'
) AS main_categories;
  `;

  // Ejecutar la consulta SQL con los parámetros de fecha proporcionados
  sequelize.query(query, {
    replacements: { fechaInicio, fechaFinAjustada }, // Reemplazo seguro de las fechas
    type: Sequelize.QueryTypes.SELECT, // Especifica que la consulta es un SELECT
  })
  .then((results) => {
    res.send(results); // Devolver los resultados al cliente
  })
  .catch((err) => {
    res.status(500).send({
      message: 'Error al obtener el resumen de donaciones por tipo de servicio.',
      error: err.message,
    });
  });
};

// Controlador para la nueva consulta
exports.getResumenDonaciones = (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  // Verificar que las fechas de inicio y fin estén presentes
  if (!fechaInicio || !fechaFin) {
    return res.status(400).send({
      message: 'Debe proporcionar una fecha de inicio y una fecha de fin.',
    });
  }

  // Verificar el formato de las fechas (opcional pero recomendable)
  const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
  if (!regexFecha.test(fechaInicio) || !regexFecha.test(fechaFin)) {
    return res.status(400).send({
      message: 'El formato de las fechas debe ser YYYY-MM-DD.',
    });
  }

  // Ajustar la fecha de fin para que incluya el día completo (23:59:59)
  const fechaFinAjustada = `${fechaFin} 23:59:59`;

  // Consulta SQL optimizada usando WITH
  const query = `
   WITH donaciones AS (
    SELECT 
        CASE 
            WHEN dd.id_extrahospitalario IS NOT NULL THEN 'Extrahospitalario'
            ELSE 'Intrahospitalario'
        END AS servicio_tipo,
        COUNT(*) AS total_donaciones,
        COUNT(DISTINCT dd.id_donadora) AS total_donadoras, -- Contar donadoras únicas
        SUM(dd.litros) AS total_litros,
        COUNT(DISTINCT CASE WHEN dd.nueva = true THEN dd.id_donadora END) AS total_nuevas, -- Contar donadoras únicas nuevas
        COUNT(DISTINCT CASE WHEN dd.constante = true THEN dd.id_donadora END) AS total_constantes -- Contar donadoras únicas constantes
    FROM 
        donadora_detalles dd
    LEFT JOIN 
        servicio_exes ext ON dd.id_extrahospitalario = ext.id_extrahospitalario
    LEFT JOIN 
        servicio_ins int ON dd.id_intrahospitalario = int.id_intrahospitalario
    WHERE 
        dd.fecha BETWEEN :fechaInicio AND :fechaFinAjustada
        AND (dd.id_extrahospitalario IS NOT NULL OR dd.id_intrahospitalario IS NOT NULL)
    GROUP BY servicio_tipo
),
totales AS (
    SELECT 
        SUM(total_donaciones) AS total_general_donaciones,
        SUM(total_nuevas) AS total_general_nuevas,
        SUM(total_constantes) AS total_general_constantes
    FROM 
        donaciones
)
SELECT 
    d.servicio_tipo AS "Servicio Tipo",
    d.total_donaciones AS "Total Donaciones",
    d.total_donadoras AS "Total Donadoras",
    d.total_litros AS "Total Litros",
    ROUND((d.total_donaciones * 100.0 / t.total_general_donaciones), 2) AS "Porcentaje Donaciones",
    d.total_nuevas AS "Total Nuevas",
    d.total_constantes AS "Total Constantes"
FROM 
    donaciones d
CROSS JOIN 
    totales t

UNION ALL

SELECT 
    'TOTAL GENERAL' AS "Servicio Tipo",
    SUM(total_donaciones) AS "Total Donaciones",
    SUM(total_donadoras) AS "Total Donadoras",
    SUM(total_litros) AS "Total Litros",
    100 AS "Porcentaje Donaciones",
    SUM(total_nuevas) AS "Total Nuevas",
    SUM(total_constantes) AS "Total Constantes"
FROM 
    donaciones;

  `;

  // Ejecutar la consulta SQL con los parámetros de fecha proporcionados
  sequelize.query(query, {
    replacements: { fechaInicio, fechaFinAjustada }, // Reemplazo seguro de las fechas
    type: Sequelize.QueryTypes.SELECT, // Especifica que la consulta es un SELECT
  })
  .then((results) => {
    res.send(results); // Devolver los resultados al cliente
  })
  .catch((err) => {
    res.status(500).send({
      message: 'Error al obtener el resumen de donaciones.',
      error: err.message,
    });
  });
};

exports.getResumenPorMes = async (req, res) => {
  try {
    // Consulta SQL en bruto
    const query = `
      WITH donaciones AS (
    SELECT 
        TO_CHAR(dd.fecha, 'TMMonth YYYY') AS mes,
        TO_DATE(TO_CHAR(dd.fecha, 'TMMonth YYYY'), 'TMMonth YYYY') AS fecha_ordenamiento,
        CASE 
            WHEN dd.id_extrahospitalario IS NOT NULL THEN 'Extrahospitalario'
            ELSE 'Intrahospitalario'
        END AS servicio_tipo,
        COUNT(*) AS total_donaciones,
        COUNT(DISTINCT dd.id_donadora) AS total_donadoras,
        SUM(dd.litros) AS total_litros,
        SUM(CASE WHEN dd.nueva THEN 1 ELSE 0 END) AS total_nuevas
    FROM 
        donadora_detalles dd
    GROUP BY 
        TO_CHAR(dd.fecha, 'TMMonth YYYY'),
        CASE 
            WHEN dd.id_extrahospitalario IS NOT NULL THEN 'Extrahospitalario'
            ELSE 'Intrahospitalario'
        END
),
totales AS (
    SELECT 
        mes,
        fecha_ordenamiento,
        SUM(total_donaciones) AS total_general_donaciones,
        SUM(total_nuevas) AS total_general_nuevas
    FROM 
        donaciones
    GROUP BY mes, fecha_ordenamiento
),
resultados_combinados AS (
    SELECT 
        d.mes,
        d.fecha_ordenamiento,
        d.servicio_tipo,
        d.total_donaciones,
        d.total_donadoras,
        d.total_litros,
        ROUND((d.total_donaciones * 100.0 / NULLIF(t.total_general_donaciones, 0)), 2) AS porcentaje_donaciones,
        d.total_nuevas,
        CASE 
            WHEN d.servicio_tipo = 'Extrahospitalario' THEN 0
            WHEN d.servicio_tipo = 'Intrahospitalario' THEN 1
            ELSE 2
        END AS orden_tipo
    FROM 
        donaciones d
    JOIN 
        totales t ON d.mes = t.mes
    UNION ALL
    SELECT 
        d.mes,
        d.fecha_ordenamiento,
        'TOTAL GENERAL' AS servicio_tipo,
        SUM(d.total_donaciones) AS total_donaciones,
        SUM(d.total_donadoras) AS total_donadoras,
        SUM(d.total_litros) AS total_litros,
        100 AS porcentaje_donaciones,
        SUM(d.total_nuevas) AS total_nuevas,
        2 AS orden_tipo
    FROM 
        donaciones d
    GROUP BY d.mes, d.fecha_ordenamiento
)
SELECT 
    mes,
    servicio_tipo,
    total_donaciones,
    total_donadoras,
    total_litros,
    porcentaje_donaciones,
    total_nuevas
FROM 
    resultados_combinados
ORDER BY 
    fecha_ordenamiento,
    orden_tipo;

    `;

    // Ejecutar la consulta SQL
    const results = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      raw: true,
    });

    // Enviar los resultados al cliente
    res.json(results);
  } catch (error) {
    console.error('Error al obtener el resumen por mes:', error);
    res.status(500).json({
      message: 'Error al obtener el resumen por mes.',
      error: error.message,
    });
  }
};



// Nueva función para búsqueda detallada por nombre de donadora
exports.findDetailsByName = async (req, res) => {
  const { id_donadora } = req.query;

  if (!id_donadora) {
    return res.status(400).send({
      message: 'El id_donadora es requerido para la búsqueda.'
    });
  }

  try {
    // Buscar todas las donaciones relacionadas con el nombre
    const resultados = await DonadoraDetalle.findAll({
      include: [
        {
          model: db.donadoras,
          as: 'donadoras',
          where: {
            id_donadora: id_donadora
          },
          attributes: ['id_donadora', 'nombre', 'apellido']
        },
        {
          model: db.servicio_ex,
          as: 'servicio_exes',
          attributes: ['servicio']
        },
        {
          model: db.servicio_in,
          as: 'servicio_ins',
          attributes: ['servicio']
        },
        {
          model: db.personal,
          as: 'personals',
          attributes: ['nombre']
        }
      ],
      order: [['fecha', 'ASC']]
    });

    if (!resultados.length) {
      return res.status(404).send({
        message: 'No se encontraron registros para esta donadora.'
      });
    }

    // Agrupar los datos por donadora
    const donadorasMap = new Map();

    resultados.forEach(donacion => {
      const donadora = donacion.donadoras;
      const idDonadora = donadora.id_donadora;

      if (!donadorasMap.has(idDonadora)) {
        donadorasMap.set(idDonadora, {
          informacion_personal: {
            id: donadora.id_donadora,
            nombre: donadora.nombre,
            apellido: donadora.apellido
          },
          resumen: {
            total_donaciones: 0,
            primera_donacion: null,
            ultima_donacion: null,
            total_nuevas: 0,
            total_constantes: 0,
            total_onzas: 0,
            total_litros: 0,
            servicios_visitados: new Set(),
            personal_atendio: new Set()
          },
          donaciones: []
        });
      }

      const donadoraData = donadorasMap.get(idDonadora);
      
      // Actualizar resumen
      donadoraData.resumen.total_donaciones++;
      if (donacion.nueva) donadoraData.resumen.total_nuevas++;
      if (donacion.constante) donadoraData.resumen.total_constantes++;
      donadoraData.resumen.total_onzas += parseFloat(donacion.onzas || 0);
      donadoraData.resumen.total_litros += parseFloat(donacion.onzas || 0) * 0.03;
      
      // Agregar servicios y personal
      if (donacion.servicio_ins) {
        donadoraData.resumen.servicios_visitados.add(donacion.servicio_ins.servicio);
      }
      if (donacion.servicio_exes) {
        donadoraData.resumen.servicios_visitados.add(donacion.servicio_exes.servicio);
      }
      if (donacion.personals) {
        donadoraData.resumen.personal_atendio.add(donacion.personals.nombre);
      }
      
      // Actualizar primera y última donación
      const fechaDonacion = donacion.fecha;
      if (!donadoraData.resumen.primera_donacion || fechaDonacion < donadoraData.resumen.primera_donacion) {
        donadoraData.resumen.primera_donacion = fechaDonacion;
      }
      if (!donadoraData.resumen.ultima_donacion || fechaDonacion > donadoraData.resumen.ultima_donacion) {
        donadoraData.resumen.ultima_donacion = fechaDonacion;
      }

      // Agregar detalle de la donación
      donadoraData.donaciones.push({
        id_donadora_detalle: donacion.id_donadora_detalle,
        fecha: donacion.fecha,
        no_frasco: donacion.no_frasco,
        onzas: donacion.onzas,
        litros: parseFloat(donacion.onzas || 0) * 0.03,
        servicio: donacion.servicio_ins ? donacion.servicio_ins.servicio : 
                 donacion.servicio_exes ? donacion.servicio_exes.servicio : null,
        tipo_servicio: donacion.servicio_ins ? 'Intrahospitalario' : 'Extrahospitalario',
        personal_atendio: donacion.personals ? donacion.personals.nombre : null,
        tipo: {
          nueva: donacion.nueva,
          constante: donacion.constante
        }
      });
    });

    // Convertir el Map a un array y formatear los datos finales
    const resultadosFormateados = Array.from(donadorasMap.values()).map(donadora => ({
      ...donadora,
      resumen: {
        ...donadora.resumen,
        servicios_visitados: Array.from(donadora.resumen.servicios_visitados),
        personal_atendio: Array.from(donadora.resumen.personal_atendio),
        primera_donacion: donadora.resumen.primera_donacion.toLocaleDateString(),
        ultima_donacion: donadora.resumen.ultima_donacion.toLocaleDateString(),
        total_onzas: parseFloat(donadora.resumen.total_onzas.toFixed(2)),
        total_litros: parseFloat(donadora.resumen.total_litros.toFixed(2)),
        dias_desde_ultima_donacion: Math.floor(
          (new Date() - donadora.resumen.ultima_donacion) / (1000 * 60 * 60 * 24)
        ),
        promedio_onzas_por_donacion: parseFloat((donadora.resumen.total_onzas / donadora.resumen.total_donaciones).toFixed(2))
      },
      donaciones: donadora.donaciones.map(donacion => ({
        ...donacion,
        fecha: donacion.fecha.toLocaleDateString()
      }))
    }));

    // Calcular estadísticas adicionales
    const estadisticasGenerales = {
      total_donadoras_encontradas: resultadosFormateados.length,
      total_donaciones: resultadosFormateados.reduce((acc, donadora) => 
        acc + donadora.resumen.total_donaciones, 0),
      promedio_donaciones_por_donadora: (resultadosFormateados
        .reduce((acc, donadora) => acc + donadora.resumen.total_donaciones, 0) / 
        resultadosFormateados.length).toFixed(2),
      total_onzas_recolectadas: resultadosFormateados
        .reduce((acc, donadora) => acc + donadora.resumen.total_onzas, 0).toFixed(2),
      total_litros_recolectados: resultadosFormateados
        .reduce((acc, donadora) => acc + donadora.resumen.total_litros, 0).toFixed(2),
      servicios_mas_frecuentes: obtenerServiciosMasFrecuentes(resultadosFormateados)
    };

    res.send({
      estadisticas_generales: estadisticasGenerales,
      resultados: resultadosFormateados
    });

  } catch (error) {
    console.error('Error en findDetailsByName:', error);
    res.status(500).send({
      message: 'Error al buscar los detalles por nombre.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Función auxiliar para calcular servicios más frecuentes
function obtenerServiciosMasFrecuentes(resultados) {
  const serviciosCount = {};
  
  resultados.forEach(donadora => {
    donadora.donaciones.forEach(donacion => {
      if (donacion.servicio) {
        serviciosCount[donacion.servicio] = (serviciosCount[donacion.servicio] || 0) + 1;
      }
    });
  });

  return Object.entries(serviciosCount)
    .sort(([,a], [,b]) => b - a)
    .reduce((acc, [servicio, count]) => {
      acc[servicio] = count;
      return acc;
    }, {});
}

// Obtener estadísticas de donaciones
exports.getStats = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    let dateCondition = '';

    // Si se proporcionan fechas, añadir condición
    if (fecha_inicio && fecha_fin) {
      dateCondition = `WHERE fecha BETWEEN '${fecha_inicio}' AND '${fecha_fin}'`;
    }

    // Consulta para obtener estadísticas generales
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT id_donadora) as total_donadoras,
        COUNT(id_donadora_detalle) as total_donaciones,
        ROUND(SUM(onzas * 0.03), 2) as total_litros
      FROM donadora_detalles
      ${dateCondition}
    `;

    // Subconsultas separadas para contar donadoras nuevas y constantes
    const nuevasQuery = `
      SELECT COUNT(DISTINCT id_donadora) as total_nuevas
      FROM donadora_detalles
      WHERE nueva = true
      ${fecha_inicio && fecha_fin ? `AND fecha BETWEEN '${fecha_inicio}' AND '${fecha_fin}'` : ''}
    `;

    const constantesQuery = `
      SELECT COUNT(DISTINCT id_donadora) as total_constantes
      FROM donadora_detalles
      WHERE constante = true
      ${fecha_inicio && fecha_fin ? `AND fecha BETWEEN '${fecha_inicio}' AND '${fecha_fin}'` : ''}
    `;

    // Consulta para obtener litros, donadoras, donaciones, nuevas y constantes por servicio extrahospitalario
    const servicioExQuery = `
      SELECT 
        se.servicio,
        COUNT(DISTINCT dd.id_donadora) as total_donadoras,
        COUNT(dd.id_donadora_detalle) as total_donaciones,
        ROUND(SUM(dd.onzas * 0.03), 2) as litros,
        COUNT(DISTINCT CASE WHEN dd.nueva = true THEN dd.id_donadora END) as nuevas,
        COUNT(DISTINCT CASE WHEN dd.constante = true THEN dd.id_donadora END) as constantes
      FROM donadora_detalles dd
      JOIN servicio_exes se ON dd.id_extrahospitalario = se.id_extrahospitalario
      ${dateCondition}
      GROUP BY se.servicio
      ORDER BY litros DESC
    `;

    // Consulta para obtener litros, donadoras, donaciones, nuevas y constantes por servicio intrahospitalario
    const servicioInQuery = `
      SELECT 
        si.servicio,
        COUNT(DISTINCT dd.id_donadora) as total_donadoras,
        COUNT(dd.id_donadora_detalle) as total_donaciones,
        ROUND(SUM(dd.onzas * 0.03), 2) as litros,
        COUNT(DISTINCT CASE WHEN dd.nueva = true THEN dd.id_donadora END) as nuevas,
        COUNT(DISTINCT CASE WHEN dd.constante = true THEN dd.id_donadora END) as constantes
      FROM donadora_detalles dd
      JOIN servicio_ins si ON dd.id_intrahospitalario = si.id_intrahospitalario
      ${dateCondition}
      GROUP BY si.servicio
      ORDER BY litros DESC
    `;

    // Ejecutar todas las consultas
    const [statsResult, nuevasResult, constantesResult, servicioExResult, servicioInResult] = await Promise.all([
      sequelize.query(statsQuery, { type: QueryTypes.SELECT }),
      sequelize.query(nuevasQuery, { type: QueryTypes.SELECT }),
      sequelize.query(constantesQuery, { type: QueryTypes.SELECT }),
      sequelize.query(servicioExQuery, { type: QueryTypes.SELECT }),
      sequelize.query(servicioInQuery, { type: QueryTypes.SELECT })
    ]);

    // Preparar respuesta
    const response = {
      estadisticas_generales: {
        ...statsResult[0],
        total_nuevas: nuevasResult[0].total_nuevas,
        total_constantes: constantesResult[0].total_constantes,
      },
      litros_por_servicio: {
        extrahospitalario: servicioExResult.map(servicio => ({
          servicio: servicio.servicio,
          total_donadoras: servicio.total_donadoras,
          total_donaciones: servicio.total_donaciones,
          litros: servicio.litros,
          nuevas: servicio.nuevas,
          constantes: servicio.constantes
        })),
        intrahospitalario: servicioInResult.map(servicio => ({
          servicio: servicio.servicio,
          total_donadoras: servicio.total_donadoras,
          total_donaciones: servicio.total_donaciones,
          litros: servicio.litros,
          nuevas: servicio.nuevas,
          constantes: servicio.constantes
        }))
      }
    };

    res.send(response);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Error al obtener las estadísticas.',
    });
  }
};


//top de donadoras 
// Nuevo controlador para obtener el top 5 de donadoras por servicio
exports.getTopDonadoras = (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  // Verificar que las fechas de inicio y fin estén presentes
  if (!fechaInicio || !fechaFin) {
    return res.status(400).send({
      message: 'Debe proporcionar una fecha de inicio y una fecha de fin.',
    });
  }

  // Verificar el formato de las fechas
  const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
  if (!regexFecha.test(fechaInicio) || !regexFecha.test(fechaFin)) {
    return res.status(400).send({
      message: 'El formato de las fechas debe ser YYYY-MM-DD.',
    });
  }

  // Ajustar la fecha de fin para que incluya el día completo (23:59:59)
  const fechaFinAjustada = `${fechaFin} 23:59:59`;

  // Consulta SQL para obtener el top 5 de donadoras por servicio
  const query = ` 
  WITH extrahospitalario AS (
    SELECT 
      d.id_donadora,
      d.nombre AS donadora_nombre,
      d.apellido AS donadora_apellido,
      'Extrahospitalario' AS servicio_tipo,
      COUNT(*) AS total_donaciones,
      SUM(dd.onzas) AS total_onzas,
      SUM(dd.litros) AS total_litros
    FROM donadora_detalles dd
    JOIN donadoras d ON dd.id_donadora = d.id_donadora
    JOIN servicio_exes ext ON dd.id_extrahospitalario = ext.id_extrahospitalario
    WHERE dd.fecha BETWEEN :fechaInicio AND :fechaFinAjustada
      AND dd.id_extrahospitalario IS NOT NULL
    GROUP BY d.id_donadora, d.nombre, ext.servicio
    ORDER BY total_donaciones DESC, total_onzas DESC
    LIMIT 5
  ), intrahospitalario AS (
    SELECT 
      d.id_donadora,
      d.nombre AS donadora_nombre,
      d.apellido AS donadora_apellido,
      'Intrahospitalario' AS servicio_tipo,
      COUNT(*) AS total_donaciones,
      SUM(dd.onzas) AS total_onzas,
      SUM(dd.litros) AS total_litros
    FROM donadora_detalles dd
    JOIN donadoras d ON dd.id_donadora = d.id_donadora
    JOIN servicio_ins int ON dd.id_intrahospitalario = int.id_intrahospitalario
    WHERE dd.fecha BETWEEN :fechaInicio AND :fechaFinAjustada
      AND dd.id_intrahospitalario IS NOT NULL
    GROUP BY d.id_donadora, d.nombre, int.servicio
    ORDER BY total_donaciones DESC, total_onzas DESC
    LIMIT 5
  ) 
  SELECT * FROM extrahospitalario 
  UNION ALL 
  SELECT * FROM intrahospitalario 
  ORDER BY servicio_tipo, total_donaciones DESC, total_onzas DESC;
  `;

  // Ejecutar la consulta SQL con los parámetros de fecha proporcionados
  sequelize.query(query, {
    replacements: { fechaInicio, fechaFinAjustada }, // Reemplazo seguro de las fechas
    type: Sequelize.QueryTypes.SELECT, // Especifica que la consulta es un SELECT
  })
  .then((results) => {
    // Procesar los resultados para agruparlos por tipo de servicio
    const topDonadoras = {
      extrahospitalario: results.filter(r => r.servicio_tipo === 'Extrahospitalario'),
      intrahospitalario: results.filter(r => r.servicio_tipo === 'Intrahospitalario')
    };

    res.send(topDonadoras); // Devolver los resultados al cliente
  })
  .catch((err) => {
    res.status(500).send({
      message: 'Error al obtener el top 5 de donadoras.',
      error: err.message,
    });
  });
};

