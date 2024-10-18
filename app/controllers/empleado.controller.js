const db = require("../models");
const Empleado = db.empleado;
const Op = db.Sequelize.Op;

// Crear y Guardar un Nuevo Empleado
exports.create = (req, res) => {
  if (!req.body.nombre || !req.body.apellido || !req.body.direccion || !req.body.puesto || !req.body.fecha_inicio || !req.body.salario) {
    res.status(400).send({
      message: "All fields are required!"
    });
    return;
  }

  const empleado = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    direccion: req.body.direccion,
    puesto: req.body.puesto,
    fecha_inicio: req.body.fecha_inicio,
    salario: req.body.salario
  };

  Empleado.create(empleado)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Empleado."
      });
    });
};

// Recuperar todos los Empleados de la base de datos.
exports.findAll = (req, res) => {
  const nombre = req.query.nombre;
  var condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

  Empleado.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving empleados."
      });
    });
};

// Recuperar un Empleado por su ID
exports.findOne = (req, res) => {
  const id_empleado = req.params.id_empleado;

  Empleado.findByPk(id_empleado)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Empleado with id_empleado=" + id_empleado
      });
    });
};

// Actualizar un Empleado por su ID
exports.update = (req, res) => {
  const id_empleado = req.params.id_empleado;

  Empleado.update(req.body, {
    where: { id_empleado: id_empleado }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Empleado was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Empleado with id_empleado=${id_empleado}. Maybe Empleado was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Empleado with id_empleado=" + id_empleado
      });
    });
};

// Eliminar un Empleado por su ID
exports.delete = (req, res) => {
  const id_empleado = req.params.id_empleado;

  Empleado.destroy({
    where: { id_empleado: id_empleado }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Empleado was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Empleado with id_empleado=${id_empleado}. Maybe Empleado was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Empleado with id_empleado=" + id_empleado
      });
    });
};

// Eliminar todos los Empleados de la base de datos.
exports.deleteAll = (req, res) => {
  Empleado.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Empleados were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all empleados."
      });
    });
};
