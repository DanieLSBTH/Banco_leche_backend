const db = require("../models");
const Cliente = db.clientes;
const Op = db.Sequelize.Op;

// Create and Save a new Cliente
exports.create = (req, res) => {
  // Validate request
  if (!req.body.nombre || !req.body.apellido || !req.body.telefono || !req.body.nit || !req.body.fecha_registro) {
    res.status(400).send({
      message: "All fields are required!"
    });
    return;
  }

  // Create a Cliente
  const cliente = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    telefono: req.body.telefono,
    nit: req.body.nit,
    fecha_registro: req.body.fecha_registro,
    fecha_salida: req.body.fecha_salida ? req.body.fecha_salida : null
  };

  // Save Cliente in the database
  Cliente.create(cliente)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Cliente."
      });
    });
};

// Retrieve all Clientes from the database.
exports.findAll = (req, res) => {
  const nombre = req.query.nombre;
  var condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

  Cliente.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving clientes."
      });
    });
};


// Find a single Cliente with id_cliente
exports.findOne = (req, res) => {
  const id_cliente = req.params.id_cliente;

  Cliente.findByPk(id_cliente)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Cliente with id_cliente=" + id_cliente
      });
    });
};

// Update a Cliente by the id_cliente in the request
exports.update = (req, res) => {
  const id_cliente = req.params.id_cliente;

  Cliente.update(req.body, {
    where: { id_cliente: id_cliente }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Cliente was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Cliente with id_cliente=${id_cliente}. Maybe Cliente was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Cliente with id_cliente=" + id_cliente
      });
    });
};


// Delete a Cliente with the specified id_cliente in the request
exports.delete = (req, res) => {
  const id_cliente = req.params.id_cliente;

  Cliente.destroy({
    where: { id_cliente: id_cliente }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Cliente was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Cliente with id_cliente=${id_cliente}. Maybe Cliente was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Cliente with id_cliente=" + id_cliente
      });
    });
};
// Buscar un cliente por NIT
exports.findByNIT = (req, res) => {
  const nit = req.params.nit;

  Cliente.findOne({ where: { nit: nit } })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cliente con NIT=${nit} no encontrado.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al buscar Cliente con NIT=" + nit
      });
    });
};
// Delete all Clientes from the database.
exports.deleteAll = (req, res) => {
  Cliente.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Clientes were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all clientes."
      });
    });
};
