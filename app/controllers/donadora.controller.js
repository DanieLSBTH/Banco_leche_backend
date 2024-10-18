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
exports.findAll = (req, res) => {
  const nombre = req.query.nombre;
  const page = parseInt(req.query.page) || 1; // Página actual, por defecto 1
  const limit = parseInt(req.query.limit) || 10; // Límite de registros por página, por defecto 10

  // Calcular el offset para la paginación
  const offset = (page - 1) * limit;

  let condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

  // Contar el total de registros
  Donadora.count({ where: condition })
    .then(totalRecords => {
      // Encontrar los registros con paginación
      return Donadora.findAll({
        where: condition,
        limit: limit,
        offset: offset,
      }).then(data => {
        const totalPages = Math.ceil(totalRecords / limit); // Calcular el total de páginas
        res.send({
          donadoras: data,
          totalRecords: totalRecords,
          currentPage: page,
          totalPages: totalPages,
        });
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || 'Ocurrió un error al recuperar los registros de Donadora.',
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

