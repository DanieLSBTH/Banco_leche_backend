const db = require('../models');
const FacturaDetalle = db.factura_detalle;
const Producto = db.producto;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Crear y guardar un nuevo registro en factura_detalle
exports.create = (req, res) => {
  const id_factura = req.body.id_factura;
  const id_producto = req.body.id_producto;
  const cantidad = req.body.cantidad;

  // Verificar si hay suficiente stock
  Producto.findByPk(id_producto)
    .then((producto) => {
      if (!producto) {
        res.status(400).send({
          message: 'Producto no encontrado.',
        });
      } else if (producto.stock < cantidad) {
        res.status(400).send({
          message: 'No hay suficiente stock para este producto.',
        });
      } else {
        // Crear un registro en factura_detalle
        return FacturaDetalle.create({
          id_factura: id_factura,
          id_producto: id_producto,
          cantidad: cantidad,
          precio: producto.precio_venta,
          total: cantidad * producto.precio_venta,
        })
        .then((facturaDetalle) => {
          // Actualizar el stock del producto
          return Producto.update(
            { stock: Sequelize.literal(`stock - ${cantidad}`) },
            { where: { id_producto: id_producto } }
          )
          .then(() => {
            res.send(facturaDetalle);
          })
          .catch((err) => {
            res.status(500).send({
              message: err.message || 'Error al actualizar el stock del producto.',
            });
          });
        })
        .catch((err) => {
          res.status(500).send({
            message: err.message || 'Error al crear el registro en factura_detalle.',
          });
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Error al verificar el stock del producto.',
      });
    });
};

// Recuperar todos los registros de factura_detalle de la base de datos.
exports.findAll = (req, res) => {
  FacturaDetalle.findAll({
    include: [
      { model: db.factura, as: 'facturas' },
      { model: db.producto, as: 'productos' },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Ocurrió un error al recuperar los registros de factura_detalle.',
      });
    });
};

// Recuperar un registro de factura_detalle por su ID
exports.findOne = (req, res) => {
  const id_venta_detalle = req.params.id_venta_detalle;

  FacturaDetalle.findByPk(id_venta_detalle)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `No se encontró el registro con id=${id_venta_detalle}.`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al recuperar el registro con id=${id_venta_detalle}`,
      });
    });
};

// Actualizar un registro de factura_detalle por su ID
exports.update = (req, res) => {
  const id_venta_detalle = req.params.id_venta_detalle;

  FacturaDetalle.update(req.body, {
    where: { id_venta_detalle: id_venta_detalle},
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de factura_detalle actualizado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede actualizar el registro de factura_detalle con id=${id_venta_detalle}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al actualizar el registro de factura_detalle con id=${id_venta_detalle}`,
      });
    });
};

// Eliminar un registro de factura_detalle por su ID
exports.delete = (req, res) => {
  const id_venta_detalle = req.params.id_venta_detalle;

  FacturaDetalle.destroy({
    where: { id_venta_detalle: id_venta_detalle },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de factura_detalle eliminado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede eliminar el registro de factura_detalle con id=${id_venta_detalle}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al eliminar el registro de factura_detalle con id=${id_venta_detalle}`,
      });
    });
};

// Eliminar todos los registros de factura_detalle de la base de datos.
exports.deleteAll = (req, res) => {
  FacturaDetalle.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} registros de factura_detalle eliminados con éxito.`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error al eliminar los registros de factura_detalle.',
      });
    });
};

