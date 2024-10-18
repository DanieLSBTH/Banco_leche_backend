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
      SET lc_time = 'es_ES';
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