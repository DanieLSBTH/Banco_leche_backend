const db = require('../models');
const Personal_estimulacion = db.personal_estimulaciones;
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const Op = Sequelize.Op;

// Crear y guardar un nuevo registro en Donadora
exports.create = (req, res) => {
  const { nombre, apellido } = req.body;

  // Verificar que todos los campos requeridos estén presentes
  if (!nombre || !apellido) {
    res.status(400).send({
      message: 'Los campos nombre y apellido son obligatorios.',
    });
    return;
  }

  // Crear un registro en Donadora
  Personal_estimulacion.create({
    nombre,
    apellido,
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

// Recuperar todos los registros de Donadora de la base de datos con o sin paginación
exports.findAll = (req, res) => {
  const nombre = req.query.nombre;
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  // Calcular el offset solo si la paginación está activa
  const offset = page && limit ? (page - 1) * limit : null;
  
  let condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

  // Contar el total de registros
    Personal_estimulacion.count({ where: condition })
    .then(totalRecords => {
      // Si no hay paginación, obtener todos los registros
      const queryOptions = {
        where: condition,
        ...(limit ? { limit } : {}),  // Solo se aplica el límite si está presente
        ...(offset ? { offset } : {}) // Solo se aplica el offset si está presente
      };

      return Personal_estimulacion.findAll(queryOptions).then(data => {
        const totalPages = limit ? Math.ceil(totalRecords / limit) : 1;
        res.send({
        personal_estimulaciones: data,
          totalRecords: totalRecords,
          currentPage: page || 1,
          totalPages: totalPages
        });
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || 'Ocurrió un error al recuperar los registros de estimulacion.'
      });
    });
};


// Recuperar un registro de Donadora por su ID
exports.findOne = (req, res) => {
  const id_personal_estimulacion = req.params.id_personal_estimulacion;

  Personal_estimulacion.findByPk(id_personal_estimulacion)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `No se encontró el registro con id=${id_personal_estimulacion}.`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al recuperar el registro con id=${id_personal_estimulacion}`,
      });
    });
};

// Actualizar un registro de Donadora por su ID
exports.update = (req, res) => {
  const id_personal_estimulacion = req.params.id_personal_estimulacion;

  Personal_estimulacion.update(req.body, {
    where: { id_personal_estimulacion: id_personal_estimulacion },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de estimulacion actualizado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede actualizar el registro de estimulacion con id=${id_personal_estimulacion}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al actualizar el registro de estimulacion con id=${id_personal_estimulacion}`,
      });
    });
};

// Eliminar un registro de Donadora por su ID
exports.delete = (req, res) => {
  const id_personal_estimulacion = req.params.id_personal_estimulacion;

  Personal_estimulacion.destroy({
    where: { id_personal_estimulacion: id_personal_estimulacion },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de Donadora eliminado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede eliminar el registro de estimulacino con id=${id_personal_estimulacion}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al eliminar el registro de estimulacion con id=${id_personal_estimulacion}`,
      });
    });
};

// Eliminar todos los registros de Donadora de la base de datos
exports.deleteAll = (req, res) => {
  Personal_estimulacion.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} registros de estimulacino eliminados con éxito.`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error al eliminar los registros de estimulacion.',
      });
    });
};

