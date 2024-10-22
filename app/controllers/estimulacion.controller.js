const db = require('../models');
const Estimulacion = db.estimulacion;
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const Op = Sequelize.Op;

// Crear y guardar un nuevo registro en estimulacion
exports.create = (req, res) => {
  const { nombre, apellido, id_intrahospitalario, constante, nueva, id_personal } = req.body;

  // Verificar que todos los campos requeridos estén presentes
  if (!nombre || !apellido  || !id_intrahospitalario || typeof constante === 'undefined' || typeof nueva === 'undefined' || !id_personal) {
    res.status(400).send({
      message: 'Todos los campos son obligatorios.',
    });
    return;
  }

  // Crear un registro en estimulacion
  Estimulacion.create({
    nombre,
    apellido,
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
        message: err.message || 'Error al crear el registro en estimulacion.',
      });
    });
};

// Recuperar todos los registros de estimulacion de la base de datos
exports.findAll = (req, res) => {
  const nombre = req.query.nombre;
  const mesActual = req.query.mesActual === 'true';

  let condition = {};

  if (nombre) {
    condition.nombre = { [Op.iLike]: `%${nombre}%` };
  }

  if (mesActual) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    condition.fecha = {
      [Op.between]: [startOfMonth, endOfMonth]
    };
  }

  Estimulacion.findAll({
    where: condition,
    include: [
      { model: db.servicio_in, as: 'servicio_ins' },
      { model: db.personal, as: 'personals' },
    ],
  })
    .then((data) => {
      res.send(data);
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
      { model: db.personal, as: 'personals' },
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
      SET lc_time TO 'es_ES';
      
      SELECT 
        TO_CHAR(fecha, 'TMMonth YYYY') AS mes,  -- Formatea el mes como texto (ej. "Septiembre 2024")
        COUNT(*) AS total_estimulaciones,
        COUNT(CASE WHEN constante = true THEN 1 END) AS total_constantes,
        COUNT(CASE WHEN nueva = true THEN 1 END) AS total_nuevas
      FROM 
        public.estimulacions
      WHERE 
        EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)  -- Filtrar solo por el año actual
      GROUP BY 
        mes
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
