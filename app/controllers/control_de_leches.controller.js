const db = require('../models');
const ControlDeLeche = db.control_de_leches;
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const sequelize = db.sequelize;
const Op = Sequelize.Op;

// Crear y guardar un nuevo registro en control_de_leches
exports.create = (req, res) => {
  const { id_pasteurizacion, fecha_almacenamiento, volumen_ml_onza, tipo_de_leche, fecha_entrega, responsable } = req.body;

  // Verificar que todos los campos requeridos estén presentes
  if (!id_pasteurizacion || !fecha_almacenamiento || !volumen_ml_onza || !tipo_de_leche || !fecha_entrega || !responsable) {
    res.status(400).send({
      message: 'Todos los campos son obligatorios.',
    });
    return;
  }

  // Crear un registro en control_de_leches
  ControlDeLeche.create({
    id_pasteurizacion,
    fecha_almacenamiento,
    volumen_ml_onza,
    tipo_de_leche,
    fecha_entrega,
    responsable,
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Error al crear el registro en control_de_leches.',
      });
    });
};

// Recuperar todos los registros de control_de_leches de la base de datos con paginación
exports.findAll = (req, res) => {
  // Obtener los parámetros de paginación de los query params
  const { page = 1, pageSize = 10 } = req.query; // Valores predeterminados: página 1, 10 registros por página
  const id_pasteurizacion = req.query.id_pasteurizacion;
  const tipo_de_leche = req.query.tipo_de_leche;

  // Calcular el desplazamiento y el límite
  const offset = (page - 1) * pageSize; // Desplazamiento
  const limit = parseInt(pageSize, 10); // Límite de registros por página

  // Inicializar la condición de búsqueda
  let condition = {};

  // Filtros condicionales
  if (id_pasteurizacion) {
    condition.id_pasteurizacion = { [Op.eq]: id_pasteurizacion };
  }

  if (tipo_de_leche) {
    condition.tipo_de_leche = { [Op.like]: `%${tipo_de_leche}%` };
  }

  // Usar findAndCountAll para obtener los datos paginados y el total de registros
  ControlDeLeche.findAndCountAll({
    where: condition,
    include: [
      { 
        model: db.trabajo_de_pasteurizaciones, 
        as: 'trabajo_de_pasteurizaciones',
        attributes: ['no_frasco', 'kcal_l', 'porcentaje_grasa', 'acidez'],
      },
    ],
    limit: limit,      // Límite por página
    offset: offset,    // Desplazamiento según la página actual
    order: [['id_control_leche', 'ASC']], // Ordenar por id_control_leche en orden ascendente
  })
    .then(result => {
      res.send({
        controlDeLeches: result.rows,  // Registros actuales
        totalRecords: result.count,    // Número total de registros
        currentPage: parseInt(page, 10),       // Página actual
        totalPages: Math.ceil(result.count / limit) // Total de páginas
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