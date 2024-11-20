const db = require('../models');
const ControlDeLeche = db.control_de_leches;
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const {trabajo_de_pasteurizaciones } = require('../models'); // Asegúrate de que esta línea esté bien
const sequelize = db.sequelize;
const Op = Sequelize.Op;

exports.create = async (req, res) => {
  const { id_pasteurizacion, frasco, tipo_frasco, unidosis, tipo_unidosis,fecha_almacenamiento, tipo_de_leche, fecha_entrega,responsable, letra_adicional } = req.body;

  try {
    const pasteurizacion = await db.trabajo_de_pasteurizaciones.findByPk(id_pasteurizacion);
    if (!pasteurizacion) {
      return res.status(404).send({ message: `No se encontró la pasteurización con id=${id_pasteurizacion}.` });
    }

    const no_frascoBase = pasteurizacion.no_frasco.match(/^\d+/)[0]; // Extrae los números del no_frasco
    let registros = [];
    let volumen_ml;

    if (frasco) {
      volumen_ml = tipo_frasco === '180ml' ? 180 : 150;
      registros.push({
        id_pasteurizacion,
        no_frascoregistro: `${no_frascoBase}${letra_adicional || ''}`,
        frasco: true,
        tipo_frasco,
        unidosis: false,
        fecha_almacenamiento,
        volumen_ml_onza: volumen_ml,
        tipo_de_leche,
        fecha_entrega,
        responsable,
       
      });
    }

    if (unidosis) {
      let sufijos = [];
      if (tipo_unidosis === '10ml') {
        sufijos = [...'abcdefghijklmnñopq']; // Incluye las letras de la 'a' a la 'q' más la 'ñ'
  
        volumen_ml = 10;
      } else if (tipo_unidosis === '20ml') {
        sufijos = Array.from({ length: 9 }, (_, i) => String.fromCharCode(97 + i)); // a - i
        volumen_ml = 20;
      } else if (tipo_unidosis === '30ml') {
        sufijos = Array.from({ length: 6 }, (_, i) => String.fromCharCode(97 + i)); // a - f
        volumen_ml = 30;
      }

      sufijos.forEach(sufijo => {
        registros.push({
          id_pasteurizacion,
          no_frascoregistro: `${no_frascoBase}${letra_adicional || ''}${sufijo}`,
          frasco: false,
          unidosis: true,
          tipo_unidosis,
          fecha_almacenamiento,
          volumen_ml_onza: volumen_ml,
          tipo_de_leche,
          fecha_entrega,
          responsable,
          
        });
      });
    }

    // Insertar registros
    await ControlDeLeche.bulkCreate(registros);
    res.send({ message: 'Registros creados con éxito.', registros });
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Error al crear registros en control_de_leches.',
    });
  }
};



exports.findAll = (req, res) => {
  const { page, pageSize } = req.query; // page y pageSize opcionales
  const id_pasteurizacion = req.query.id_pasteurizacion;
  const tipo_de_leche = req.query.tipo_de_leche;

  // Inicializamos condiciones de búsqueda
  let condition = {};

  if (id_pasteurizacion) {
    condition.id_pasteurizacion = { [Op.eq]: id_pasteurizacion };
  }

  if (tipo_de_leche) {
    condition.tipo_de_leche = { [Op.like]: `%${tipo_de_leche}%` };
  }

  // Configurar opciones de paginación solo si page y pageSize están definidos
  const queryOptions = {
    where: condition,
    include: [
      { 
        model: db.trabajo_de_pasteurizaciones, 
        as: 'trabajo_de_pasteurizaciones',
        attributes: ['no_frasco', 'kcal_l', 'porcentaje_grasa', 'acidez'],
      },
    ],
    order: [['id_control_leche', 'ASC']],
  };

  if (page && pageSize) {
    const offset = (page - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  // Ejecutar consulta con las opciones definidas
  ControlDeLeche.findAndCountAll(queryOptions)
    .then(result => {
      const formattedRows = result.rows.map(row => {
        return {
          ...row.dataValues,
          fecha_almacenamiento: row.fecha_almacenamiento,
          fecha_entrega: row.fecha_entrega,
        };
      });

      // Preparar respuesta con o sin paginación
      const totalPages = page && pageSize ? Math.ceil(result.count / pageSize) : 1;
      const currentPage = page ? parseInt(page, 10) : 1;

      res.send({
        controlDeLeches: formattedRows,
        totalRecords: result.count,
        currentPage: currentPage,
        totalPages: totalPages,
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || 'Ocurrió un error al recuperar los registros de control_de_leches.',
      });
    });
};

// Recuperar un registro de control_de_leches por su ID
exports.findOne = (req, res) => {
  const id_control_leche = req.params.id_control_leche;

  ControlDeLeche.findByPk(id_control_leche, {
    include: [
      { model: db.trabajo_de_pasteurizaciones, as: 'trabajo_de_pasteurizaciones',
        attributes: ['no_frasco', 'kcal_l', 'porcentaje_grasa', 'acidez'],
       },
    ],
  })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `No se encontró el registro con id=${id_control_leche}.`,
        });
      } else {
        data.fecha_almacenamiento = data.fecha_almacenamiento.toISOString().split('T')[0];
        data.fecha_entrega = data.fecha_entrega.toISOString().split('T')[0];
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al recuperar el registro con id=${id_control_leche}.`,
      });
    });
};

// Actualizar un registro de control_de_leches por su ID
exports.update = (req, res) => {
  const id_control_leche = req.params.id_control_leche;

  ControlDeLeche.update(req.body, {
    where: { id_control_leche: id_control_leche },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de control_de_leches actualizado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede actualizar el registro de control_de_leches con id=${id_control_leche}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al actualizar el registro de control_de_leches con id=${id_control_leche}.`,
      });
    });
};

// Eliminar un registro de control_de_leches por su ID
exports.delete = (req, res) => {
  const id_control_leche = req.params.id_control_leche;

  ControlDeLeche.destroy({
    where: { id_control_leche: id_control_leche },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de control_de_leches eliminado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede eliminar el registro de control_de_leches con id=${id_control_leche}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al eliminar el registro de control_de_leches con id=${id_control_leche}.`,
      });
    });
};

// Eliminar todos los registros de control_de_leches de la base de datos
exports.deleteAll = (req, res) => {
  ControlDeLeche.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} registros de control_de_leches eliminados con éxito.`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error al eliminar los registros de control_de_leches.',
      });
    });
};
// Calcular el total de leche pasteurizada, promedio de valor energético y stock sin acidez Dornic
// Obtener las métricas de leche pasteurizada (total, promedio kcal/l, stock sin acidez dornic)
exports.getMetrics = async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;

  try {
      // Asegúrate de que las fechas sean válidas
      if (!fecha_inicio || !fecha_fin) {
          return res.status(400).json({ message: "Fecha de inicio y fecha de fin son requeridas." });
      }

      // Calcular el total de leche pasteurizada en litros
      const totalLechePasteurizadaEnLitros = await control_de_leches.sum('volumen_ml_onza', {
          where: {
              fecha_almacenamiento: {
                  [Op.between]: [fecha_inicio, fecha_fin]
              }
          }
      }) / 1000; // Convertir de mililitros a litros

      // Calcular el promedio del valor energético en Kcal/L
      const promedioValorEnergeticoKcalL = await trabajo_de_pasteurizaciones.avg('kcal_l', {
          include: [{
              model: control_de_leches,
              required: true,
              where: {
                  fecha_almacenamiento: {
                      [Op.between]: [fecha_inicio, fecha_fin]
                  }
              }
          }]
      });

      // Calcular el stock sin acidez Dornic en litros
      const stockSinAcidezDornicEnLitros = await control_de_leches.sum('volumen_ml_onza', {
          include: [{
              model: trabajo_de_pasteurizaciones,
              required: true,
              where: {
                  [Op.or]: [
                      { acidez: 0 },
                      { acidez: null }
                  ]
              }
          }],
          where: {
              fecha_almacenamiento: {
                  [Op.between]: [fecha_inicio, fecha_fin]
              }
          }
      }) / 1000; // Convertir de mililitros a litros

      return res.status(200).json({
          totalLechePasteurizadaEnLitros: totalLechePasteurizadaEnLitros || 0,
          promedioValorEnergeticoKcalL: promedioValorEnergeticoKcalL || 0,
          stockSinAcidezDornicEnLitros: stockSinAcidezDornicEnLitros || 0
      });
  } catch (error) {
      console.error("Error al recuperar métricas:", error);
      return res.status(500).json({ message: "Error al recuperar las métricas." });
  }
};

exports.findTotalsAndRecordsByDateRange = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).send({
      message: "Debes proporcionar 'fechaInicio' y 'fechaFin'.",
    });
  }

  try {
    // Realiza la consulta para obtener registros y totales
    const registros = await ControlDeLeche.findAll({
      where: {
        fecha_almacenamiento: {
          [Op.between]: [new Date(fechaInicio), new Date(fechaFin)],
        },
      },
      include: [
        {
          model: trabajo_de_pasteurizaciones,
          as: 'trabajo_de_pasteurizaciones',
          attributes: ['kcal_l', 'porcentaje_grasa', 'acidez'],
        },
      ],
      attributes: [
        'id_control_leche',
        'no_frascoregistro',
        'fecha_almacenamiento',
        'volumen_ml_onza',
        'tipo_de_leche',
        'fecha_entrega',
        'responsable',
        'frasco',
        'unidosis',
      ],
      order: [['fecha_almacenamiento', 'ASC']], // Ordenar por fecha de almacenamiento
    });

    // Calcular totales de frascos y unidosis
    let totalFrascos = 0;
    let totalUnidosis = 0;

    registros.forEach((registro) => {
      if (registro.frasco) totalFrascos += 1;
      if (registro.unidosis) totalUnidosis += 1;
    });

    // Formatear registros para incluir datos relacionados
    const registrosFormateados = registros.map((registro) => ({
      ID: registro.id_control_leche,
      NoFrasco: registro.no_frascoregistro,
      FechaAlmacenamiento: registro.fecha_almacenamiento,
      Volumen: registro.volumen_ml_onza,
      Kcal_l: registro.trabajo_de_pasteurizaciones?.kcal_l || null,
      Grasa: registro.trabajo_de_pasteurizaciones?.porcentaje_grasa || null,
      Acidez: registro.trabajo_de_pasteurizaciones?.acidez || null,
      TipoDeLeche: registro.tipo_de_leche,
      FechaEntrega: registro.fecha_entrega,
      Responsable: registro.responsable,
    }));

    // Enviar respuesta con totales y registros
    res.send({
      fechaInicio,
      fechaFin,
      totalFrascos,
      totalUnidosis,
      registros: registrosFormateados,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Ocurrió un error al recuperar los datos.',
    });
  }
};
//K