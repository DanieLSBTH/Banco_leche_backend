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
  // Obtener los parámetros de paginación de los query params
  const { page = 1, pageSize = 10 } = req.query; // Valores predeterminados: página 1, 10 registros por página
  const mesActual = req.query.mesActual === 'true';
  
  // Calcular el desplazamiento y el límite
  const offset = (page - 1) * pageSize; // Desplazamiento
  const limit = parseInt(pageSize, 10); // Límite de registros por página

  let condition = {};

  if (mesActual) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // Primer día del mes actual
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Último día del mes actual

    condition.fecha = {
      [Op.between]: [startOfMonth, endOfMonth]
    };
  }

  // Usar findAndCountAll para obtener los datos paginados y el total de registros
  TrabajoDePasteurizaciones.findAndCountAll({
    where: condition,
    limit: limit,      // Límite por página
    offset: offset,    // Desplazamiento según la página actual
    order: [['id_pasteurizacion', 'DESC']] // Ordenar por id_pasteurizacion en orden ascendente
  })
  .then(result => {
    res.send({
      pasteurizaciones: result.rows,  // Registros actuales
      totalRecords: result.count,            // Número total de registros
      currentPage: parseInt(page, 10),       // Página actual
      totalPages: Math.ceil(result.count / limit) // Total de páginas
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

exports.getMetrics = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ message: "Se requieren fechaInicio y fechaFin" });
    }

    const startDate = new Date(fechaInicio);
    const endDate = new Date(fechaFin);
    endDate.setHours(23, 59, 59, 999);

    const totalLechePasteurizada = await ControlDeLeche.sum('volumen_ml_onza', {
      where: {
        fecha_almacenamiento: {
          [Op.between]: [startDate, endDate]
        }
      }
    }) / 1000 || 0;

    const promedioValorEnergetico = await TrabajoDePasteurizaciones.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('kcal_l')), 'promedio_kcal_l']],
      where: {
        fecha: {
          [Op.between]: [startDate, endDate]
        }
      },
      raw: true
    });

    const stockSinAcidezDornic = await ControlDeLeche.sum('volumen_ml_onza', {
      include: [{
        model: TrabajoDePasteurizaciones,
        as: 'trabajo_de_pasteurizaciones',
        attributes: [],
        where: {
          acidez: 0
        }
      }],
      where: {
        fecha_almacenamiento: {
          [Op.between]: [startDate, endDate]
        }
      }
    }) / 1000 || 0;

    const numeroCrematocritos = await TrabajoDePasteurizaciones.count({
      where: {
        fecha: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    res.json({
      totalLechePasteurizadaLitros: Number(totalLechePasteurizada.toFixed(2)),
      promedioValorEnergeticoKcalL: promedioValorEnergetico?.promedio_kcal_l 
        ? Number(promedioValorEnergetico.promedio_kcal_l.toFixed(2)) 
        : 0,
      stockLecheSinAcidezDornicLitros: Number(stockSinAcidezDornic.toFixed(2)),
      numeroCrematocritos
    });

  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({ message: 'Error al obtener métricas', error: error.message });
  }
};