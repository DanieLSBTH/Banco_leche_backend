const db = require('../models');
const Donadora = db.donadoras;
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
  Donadora.create({
    nombre,
    apellido,
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Error al crear el registro en Donadora.',
      });
    });
};

// Recuperar todos los registros de Donadora de la base de datos con paginación
// Recuperar todos los registros de Donadora de la base de datos con o sin paginación
exports.findAll = (req, res) => {
  const nombre = req.query.nombre;
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  // Calcular el offset solo si la paginación está activa
  const offset = page && limit ? (page - 1) * limit : null;
  
  let condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

  // Contar el total de registros
  Donadora.count({ where: condition })
    .then(totalRecords => {
      // Si no hay paginación, obtener todos los registros
      const queryOptions = {
        where: condition,
        ...(limit ? { limit } : {}),  // Solo se aplica el límite si está presente
        ...(offset ? { offset } : {}) // Solo se aplica el offset si está presente
      };

      return Donadora.findAll(queryOptions).then(data => {
        const totalPages = limit ? Math.ceil(totalRecords / limit) : 1;
        res.send({
          donadoras: data,
          totalRecords: totalRecords,
          currentPage: page || 1,
          totalPages: totalPages
        });
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || 'Ocurrió un error al recuperar los registros de Donadora.'
      });
    });
};


// Recuperar un registro de Donadora por su ID
exports.findOne = (req, res) => {
  const id_donadora = req.params.id_donadora;

  Donadora.findByPk(id_donadora)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `No se encontró el registro con id=${id_donadora}.`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al recuperar el registro con id=${id_donadora}`,
      });
    });
};

// Actualizar un registro de Donadora por su ID
exports.update = (req, res) => {
  const id_donadora = req.params.id_donadora;

  Donadora.update(req.body, {
    where: { id_donadora: id_donadora },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de Donadora actualizado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede actualizar el registro de Donadora con id=${id_donadora}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al actualizar el registro de Donadora con id=${id_donadora}`,
      });
    });
};

// Eliminar un registro de Donadora por su ID
exports.delete = (req, res) => {
  const id_donadora = req.params.id_donadora;

  Donadora.destroy({
    where: { id_donadora: id_donadora },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de Donadora eliminado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede eliminar el registro de Donadora con id=${id_donadora}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al eliminar el registro de Donadora con id=${id_donadora}`,
      });
    });
};

// Eliminar todos los registros de Donadora de la base de datos
exports.deleteAll = (req, res) => {
  Donadora.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} registros de Donadora eliminados con éxito.`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error al eliminar los registros de Donadora.',
      });
    });
};

