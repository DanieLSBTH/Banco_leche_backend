const db = require("../models");
const Producto = db.producto;
const Proveedor = db.proveedor;
const Op = db.Sequelize.Op;
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Ruta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

// Crear y Guardar un Nuevo Producto con Imagen
exports.create = [upload.single('imagen'), (req, res) => {
  if (
    !req.body.producto ||
    !req.body.descripcion ||
    !req.body.precio_compra ||
    !req.body.precio_venta ||
    !req.body.stock ||
    !req.body.categoria ||
    !req.body.id_proveedor
  ) {
    res.status(400).send({
      message: "All fields are required!",
    });
    return;
  }

  const producto = {
    producto: req.body.producto,
    descripcion: req.body.descripcion,
    precio_compra: req.body.precio_compra,
    precio_venta: req.body.precio_venta,
    stock: req.body.stock,
    categoria: req.body.categoria,
    id_proveedor: req.body.id_proveedor,
  };

  if (req.file) {
    const imageUrl = req.file.filename;
    producto.imagen = imageUrl;
  }

  Producto.create(producto)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Producto.",
      });
    });
}];

// Resto del controlador (métodos findAll, findOne, update, delete, etc.) sin cambios

// Recuperar todos los Productos de la base de datos.
exports.findAll = (req, res) => {
  const producto = req.query.producto;
  var condition = producto ? { producto: { [Op.iLike]: `%${producto}%` } } : null;

  Producto.findAll({
    where: condition,
    include: Proveedor // Incluimos el proveedor relacionado en la consulta
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving productos."
      });
    });
};

// Recuperar un Producto por su ID
exports.findOne = (req, res) => {
  const id_producto = req.params.id_producto;

  Producto.findByPk(id_producto, {
    include: Proveedor // Incluimos el proveedor relacionado en la consulta
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Producto with id_producto=" + id_producto
      });
    });
};

// Actualizar un Producto por su ID
exports.update = (req, res) => {
  const id_producto = req.params.id_producto;

  Producto.update(req.body, {
    where: { id_producto: id_producto }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Producto was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Producto with id_producto=${id_producto}. Maybe Producto was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Producto with id_producto=" + id_producto
      });
    });
};

// Eliminar un Producto por su ID
exports.delete = (req, res) => {
  const id_producto = req.params.id_producto;

  Producto.destroy({
    where: { id_producto: id_producto }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Producto was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Producto with id_producto=${id_producto}. Maybe Producto was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Producto with id_producto=" + id_producto
      });
    });
};

// Eliminar todos los Productos de la base de datos.
exports.deleteAll = (req, res) => {
  Producto.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Productos were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all productos."
      });
    });
};