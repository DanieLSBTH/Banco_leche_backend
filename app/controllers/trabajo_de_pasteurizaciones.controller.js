const db = require('../models');
const TrabajoDePasteurizaciones = db.trabajo_de_pasteurizaciones;
const ControlDeLeche = db.control_de_leches; // Importar el modelo ControlDeLeche

const Sequelize = require('sequelize');
const { Op } = Sequelize;

// Función para calcular los valores derivados
const calcularValoresDerivados = (data) => {
  const {
    crematorio_1_1,
    crematorio_1_2,
    crematorio_2_1,
    crematorio_2_2,
    crematorio_3_1,
    crematorio_3_2
  } = data;

  // Cálculos de los valores derivados
  const total_crematorio_1 = crematorio_1_1 && crematorio_1_2 ? (crematorio_1_1 / crematorio_1_2) * 100 : 0;
  const total_crematorio_2 = crematorio_2_1 && crematorio_2_2 ? (crematorio_2_1 / crematorio_2_2) * 100 : 0;
  const total_crematorio_3 = crematorio_3_1 && crematorio_3_2 ? (crematorio_3_1 / crematorio_3_2) * 100 : 0;

  const porcentaje_crema = (total_crematorio_1 + total_crematorio_2 + total_crematorio_3) / 3;
  const kcal_l = (porcentaje_crema * 66.8) + 290;
  const kcal_onz = (kcal_l * 30) / 1000;
  const porcentaje_grasa = (porcentaje_crema - 0.59) / 1.46;

  return {
    total_crematorio_1,
    total_crematorio_2,
    total_crematorio_3,
    porcentaje_crema,
    kcal_l,
    kcal_onz,
    porcentaje_grasa
  };
};

// Crear y guardar un nuevo registro en trabajo_de_pasteurizaciones
exports.create = async (req, res) => {
  try {
    const {
      fecha,
      no_frasco,
      crematorio_1_1,
      crematorio_1_2,
      crematorio_2_1,
      crematorio_2_2,
      crematorio_3_1,
      crematorio_3_2,
      acidez
    } = req.body;

    // Verificar que todos los campos requeridos estén presentes
    if (!fecha || !no_frasco || typeof crematorio_1_1 === 'undefined' || typeof crematorio_1_2 === 'undefined' ||
        typeof crematorio_2_1 === 'undefined' || typeof crematorio_2_2 === 'undefined' ||
        typeof crematorio_3_1 === 'undefined' || typeof crematorio_3_2 === 'undefined' || typeof acidez === 'undefined') {
      return res.status(400).send({
        message: 'Todos los campos son obligatorios.',
      });
    }

    // Calcular los valores derivados
    const valoresCalculados = calcularValoresDerivados({
      crematorio_1_1,
      crematorio_1_2,
      crematorio_2_1,
      crematorio_2_2,
      crematorio_3_1,
      crematorio_3_2,
      acidez
    });

    // Formatear la fecha a solo la parte de la fecha (sin la hora)
    const fechaSolo = new Date(fecha);
    fechaSolo.setHours(0, 0, 0, 0); // Asegúrate de que la hora sea cero

    // Buscar el último registro del día para obtener el número secuencial
    const lastRecord = await TrabajoDePasteurizaciones.findOne({
      where: {
        fecha: {
          [Op.eq]: fechaSolo // Busca solo registros de la fecha específica
        },
      },
      order: [['numero', 'DESC']],
    });

    // Calcular el nuevo número secuencial
    let numero = 1;
    if (lastRecord) {
      numero = lastRecord.numero + 1; // Incrementa el número del último registro
    }

    // Crear un registro en trabajo_de_pasteurizaciones
    const newRecord = await TrabajoDePasteurizaciones.create({
      fecha: fechaSolo, // Guardar la fecha formateada
      numero, // Asignar el número calculado
      no_frasco,
      crematorio_1_1,
      crematorio_1_2,
      crematorio_2_1,
      crematorio_2_2,
      crematorio_3_1,
      crematorio_3_2,
      acidez,
      ...valoresCalculados // Se agregan los valores calculados
    });

    res.send(newRecord);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Error al crear el registro en trabajo_de_pasteurizaciones.',
    });
  }
};


// Recuperar todos los registros de trabajo_de_pasteurizaciones de la base de datos con paginación
exports.findAll = (req, res) => {
  // Establecer valores predeterminados para page y pageSize
  const { page = 1, pageSize } = req.query; // Quita el valor predeterminado de 10
  const mesActual = req.query.mesActual === 'true';  

  let condition = {};
  
  // Filtrar por mes actual si se solicita
  if (mesActual) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    condition.fecha = {
      [Op.between]: [startOfMonth, endOfMonth],
    };
  }
  
  // Configurar las opciones de consulta con paginación opcional
  const limit = pageSize ? parseInt(pageSize, 10) : null;
  const offset = limit ? (page - 1) * limit : null;

  const queryOptions = {
    where: condition,
    order: [['id_pasteurizacion', 'DESC']],
    ...(limit ? { limit, offset } : {}), // Solo aplica límite y offset si están presentes
  };
  
  // Usar findAndCountAll para obtener los datos y el total de registros
  TrabajoDePasteurizaciones.findAndCountAll(queryOptions)
    .then(result => {
      const totalPages = limit ? Math.ceil(result.count / limit) : 1; // Total de páginas
      const currentPage = parseInt(page, 10); // Página actual
      
      res.send({
        pasteurizaciones: result.rows,  // Registros actuales
        totalRecords: result.count,     // Número total de registros
        currentPage: currentPage,       // Página actual
        totalPages: totalPages,         // Total de páginas
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || 'Ocurrió un error al recuperar los registros de trabajo_de_pasteurizaciones.',
      });
    });
};

// Recuperar un registro de trabajo_de_pasteurizaciones por su ID
exports.findOne = (req, res) => {
  const id_pasteurizacion = req.params.id_pasteurizacion;

  TrabajoDePasteurizaciones.findByPk(id_pasteurizacion)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `No se encontró el registro con id=${id_pasteurizacion}.`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al recuperar el registro con id=${id_pasteurizacion}.`,
      });
    });
};

// Actualizar un registro de trabajo_de_pasteurizaciones por su ID
exports.update = (req, res) => {
  const id_pasteurizacion = req.params.id_pasteurizacion;

  // Calcular los valores derivados
  const valoresCalculados = calcularValoresDerivados(req.body);

  TrabajoDePasteurizaciones.update(
    { ...req.body, ...valoresCalculados },
    { where: { id_pasteurizacion: id_pasteurizacion } }
  )
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de trabajo_de_pasteurizaciones actualizado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede actualizar el registro de trabajo_de_pasteurizaciones con id=${id_pasteurizacion}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al actualizar el registro de trabajo_de_pasteurizaciones con id=${id_pasteurizacion}.`,
      });
    });
};

// Eliminar un registro de trabajo_de_pasteurizaciones por su ID
exports.delete = (req, res) => {
  const id_pasteurizacion = req.params.id_pasteurizacion;

  TrabajoDePasteurizaciones.destroy({
    where: { id_pasteurizacion: id_pasteurizacion },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de trabajo_de_pasteurizaciones eliminado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede eliminar el registro de trabajo_de_pasteurizaciones con id=${id_pasteurizacion}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al eliminar el registro de trabajo_de_pasteurizaciones con id=${id_pasteurizacion}.`,
      });
    });
};

// Eliminar todos los registros de trabajo_de_pasteurizaciones de la base de datos
exports.deleteAll = (req, res) => {
  TrabajoDePasteurizaciones.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} registros de trabajo_de_pasteurizaciones eliminados con éxito.`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error al eliminar los registros de trabajo_de_pasteurizaciones.',
      });
    });
};

// Obtener estadísticas de pasteurización entre fechas
exports.getStatsByDateRange = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    // Validar que se proporcionaron ambas fechas
    if (!fechaInicio || !fechaFin) {
      return res.status(400).send({
        message: 'Se requieren fechaInicio y fechaFin para la consulta',
      });
    }

    // Convertir las fechas y asegurar que fechaInicio empiece a las 00:00:00
    // y fechaFin termine a las 23:59:59
    const startDate = new Date(fechaInicio);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(fechaFin);
    endDate.setHours(23, 59, 59, 999);

    // Realizar la consulta con Sequelize
    const results = await TrabajoDePasteurizaciones.findOne({
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('kcal_l')), 'promedio_kcal_l'],
        [Sequelize.fn('SUM', Sequelize.col('acidez')), 'total_acidez'],
        [Sequelize.fn('COUNT', Sequelize.col('id_pasteurizacion')), 'total_registros']
      ],
      where: {
        fecha: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // Si no hay resultados, devolver valores en cero
    if (!results) {
      return res.send({
        promedio_kcal_l: 0,
        total_acidez: 0,
        total_registros: 0
        
      });
    }

    // Formatear los resultados
    const stats = {
      promedio_kcal_l: Number(results.getDataValue('promedio_kcal_l') || 0).toFixed(2),
      total_acidez: Number(results.getDataValue('total_acidez') || 0).toFixed(2),
      total_registros: Number(results.getDataValue('total_registros') || 0),
     
    };

    res.send(stats);

  } catch (err) {
    res.status(500).send({
      message: err.message || 'Error al obtener las estadísticas de pasteurización.',
      error: err
    });
  }
};

exports.getStates = async (req, res) => {
  try {
    // Obtener las fechas del mes actual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // Primer día del mes
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // Último día del mes

    // Realizar la consulta con Sequelize
    const results = await TrabajoDePasteurizaciones.findOne({
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('kcal_l')), 'promedio_kcal_l'],
        [Sequelize.fn('SUM', Sequelize.col('acidez')), 'total_acidez'],
        [Sequelize.fn('COUNT', Sequelize.col('id_pasteurizacion')), 'total_registros'],
      ],
      where: {
        fecha: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    // Formatear el mes y año actual
    const formattedMonth = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
    }).format(now);

    // Si no hay resultados, devolver valores en cero junto con el mes
    if (!results) {
      return res.send({
        promedio_kcal_l: 0,
        total_acidez: 0,
        total_registros: 0,
        mes: formattedMonth,
      });
    }

    // Formatear los resultados
    const stats = {
      promedio_kcal_l: Number(results.getDataValue('promedio_kcal_l') || 0).toFixed(2),
      total_acidez: Number(results.getDataValue('total_acidez') || 0).toFixed(2),
      total_registros: Number(results.getDataValue('total_registros') || 0),
      mes: formattedMonth,
    };

    res.send(stats);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Error al obtener las estadísticas de pasteurización.',
      error: err,
    });
  }
};