const db = require("../models");
const Factura = db.factura;
const Cliente = db.clientes;
const Empleado = db.empleado;

// Crear y guardar una nueva factura
exports.create = (req, res) => {
  // Validar la solicitud
  if (!req.body.fecha || !req.body.no_factura || !req.body.id_cliente || !req.body.id_empleado) {
    res.status(400).send({
      message: "Todos los campos son obligatorios."
    });
    return;
  }

  // Crear una factura
  const factura = {
    fecha: req.body.fecha,
    no_factura: req.body.no_factura,
    id_cliente: req.body.id_cliente,
    id_empleado: req.body.id_empleado,
  };

  // Guardar la factura en la base de datos
  Factura.create(factura)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Ocurrió un error al crear la factura."
      });
    });
};

// Recuperar todas las facturas de la base de datos.
exports.findAll = (req, res) => {
  Factura.findAll({
    include: [
      { 
        model: Cliente, 
        as: "clientes", 
        attributes: ["id_cliente", "nombre"] 
      },
      { 
        model: Empleado, 
        as: "empleados", 
        attributes: ["id_empleado", "nombre"] 
      }
    ]
  })
    .then(data => {
      const modifiedData = data.map(item => ({
        id_factura: item.id_factura,
        fecha: item.fecha,
        no_factura: item.no_factura,
        id_cliente: item.clientes ? item.clientes.nombre : null,
        id_empleado: item.empleados ? item.empleados.nombre : null // Cambia el ID del empleado por su nombre
      }));
      res.send(modifiedData);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Ocurrió un error al recuperar las facturas."
      });
    });
};



// Recuperar una factura por su ID
exports.findOne = (req, res) => {
  const id_factura = req.params.id_factura;

  Factura.findByPk(id_factura, {
    include: [
      { model: Cliente, as: "clientes" },
      { model: Empleado, as: "empleados" }
    ]
  })
    .then(data => {
      if (data) {
        const modifiedData = {
          id_factura: data.id_factura,
          fecha: data.fecha,
          no_factura: data.no_factura,
          id_cliente: data.clientes ? data.clientes.nombre : null,
          id_empleado: data.empleados ? data.empleados.nombre : null // Cambia el ID del empleado por su nombre
        };
        res.send(modifiedData);
      } else {
        res.status(404).send({
          message: `No se encontró la factura con id_factura=${id_factura}`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al recuperar la factura con id_factura=" + id_factura
      });
    });
};

// Actualizar una factura por su ID
exports.update = (req, res) => {
  const id_factura = req.params.id_factura;

  Factura.update(req.body, {
    where: { id_factura: id_factura }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "La factura se actualizó correctamente."
        });
      } else {
        res.send({
          message: `No se puede actualizar la factura con id_factura=${id_factura}. ¡Quizás la factura no se encontró o el cuerpo de la solicitud está vacío!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al actualizar la factura con id_factura=" + id_factura
      });
    });
};

// Eliminar una factura por su ID
exports.delete = (req, res) => {
  const id_factura = req.params.id_factura;

  Factura.destroy({
    where: { id_factura: id_factura }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "La factura se eliminó correctamente."
        });
      } else {
        res.send({
          message: `No se puede eliminar la factura con id_factura=${id_factura}. ¡Quizás la factura no se encontró!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "No se pudo eliminar la factura con id_factura=" + id_factura
      });
    });
};
