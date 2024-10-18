const db = require("../models");
const Proveedor = db.proveedor;
const Op = db.Sequelize.Op;

// Crear y Guardar un Nuevo Proveedor
exports.create = (req, res) => {
  if (!req.body.proveedor || !req.body.nit || !req.body.telefono || !req.body.direccion) {
    res.status(400).send({
      message: "All fields are required!"
    });
    return;
  }

  const proveedor = {
    proveedor: req.body.proveedor,
    nit: req.body.nit,
    telefono: req.body.telefono,
    direccion: req.body.direccion
  };

  Proveedor.create(proveedor)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Proveedor."
      });
    });
};

// Recuperar todos los Proveedores de la base de datos.
exports.findAll = (req, res) => {
  const nombre = req.query.nombre;
  var condition = nombre ? { proveedor: { [Op.iLike]: `%${nombre}%` } } : null;

  Proveedor.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving proveedores."
      });
    });
};

// Recuperar un Proveedor por su ID
exports.findOne = (req, res) => {
  const id_proveedor = req.params.id_proveedor; 

  Proveedor.findByPk(id_proveedor)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Proveedor with id_proveedor=" + id_proveedor
      });
    });
};

// Actualizar un Proveedor por su ID
exports.update = (req, res) => {
  const id_proveedor = req.params.id_proveedor;

  Proveedor.update(req.body, {
    where: { id_proveedor: id_proveedor }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Proveedor was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Proveedor with id_proveedor=${id_proveedor}. Maybe Proveedor was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Proveedor with id_proveedor=" + id_proveedor
      });
    });
};

// Eliminar un Proveedor por su ID
exports.delete = (req, res) => {
  const id_proveedor = req.params.id_proveedor;

  Proveedor.destroy({
    where: { id_proveedor: id_proveedor }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Proveedor was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Proveedor with id_proveedor=${id_proveedor}. Maybe Proveedor was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Proveedor with id_proveedor=" + id_proveedor
      });
    });
};

// Eliminar todos los Proveedores de la base de datos.
exports.deleteAll = (req, res) => {
  Proveedor.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Proveedores were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all proveedores."
      });
    });
};
