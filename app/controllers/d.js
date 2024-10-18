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
  


  // Recupera todo el personal con paginación.
exports.findAll = (req, res) => {
    const { page = 1, pageSize = 10 } = req.query; // Obtiene la página actual y el tamaño de la página desde los query params
    const nombre = req.query.nombre;
    const offset = (page - 1) * pageSize; // Calcula el desplazamiento
    const limit = parseInt(pageSize, 10); // Limita la cantidad de registros por página
  
    var condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;
  
    // Usar findAndCountAll para obtener los datos paginados y el total de registros
    Personal.findAndCountAll({
      where: condition,
      limit: limit,  // Límite por página
      offset: offset // Desplazamiento según la página actual
    })
      .then(result => {
        res.send({
          personal: result.rows,        // Registros actuales
          totalRecords: result.count,   // Número total de registros
          currentPage: parseInt(page, 10),  // Página actual
          totalPages: Math.ceil(result.count / limit) // Total de páginas
        });
      })
      .catch(err => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving personal."
        });
      });
  };

  //donadora_detalle

  exports.findAll = (req, res) => {
    const { page = 1, pageSize = 10 } = req.query; // Obtiene la página actual y el tamaño de la página desde los query params
    const id_donadora = req.query.id_donadora;
    const mesActual = req.query.mesActual === 'true';
    const offset = (page - 1) * pageSize; // Calcula el desplazamiento
    const limit = parseInt(pageSize, 10); // Limita la cantidad de registros por página
  
    let condition = {};
  
    if (id_donadora) {
        condition.id_donadora = { [Op.eq]: id_donadora };
    }
  
    if (mesActual) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
        condition.fecha = {
            [Op.between]: [startOfMonth, endOfMonth]
        };
    }
  
    // Usar findAndCountAll para obtener los datos paginados y el total de registros
    DonadoraDetalle.findAndCountAll({
        where: condition,
        include: [
            { model: db.donadoras, as: 'donadoras' },
            { model: db.servicio_ex, as: 'servicio_exes' },
            { model: db.servicio_in, as: 'servicio_ins' }, // Se añade la relación de intrahospitalario
            { model: db.personal, as: 'personals' },
        ],
        limit: limit,  // Límite por página
        offset: offset, // Desplazamiento según la página actual
        order: [['id_donadora_detalle', 'ASC']] // Ordenar por id_donadora_detalle en orden ascendente
    })
    .then(result => {
        res.send({
            donadoraDetalles: result.rows,        // Registros actuales
            totalRecords: result.count,           // Número total de registros
            currentPage: parseInt(page, 10),     // Página actual
            totalPages: Math.ceil(result.count / limit) // Total de páginas
        });
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || 'Ocurrió un error al recuperar los registros de donadora_detalle.',
        });
    });
  };
  

  //controller de pasteurizacion 
  // Recuperar todos los registros de trabajo_de_pasteurizaciones de la base de datos con paginación
exports.findAll = (req, res) => {
  // Obtener los parámetros de paginación de los query params
  const { page = 1, pageSize = 10 } = req.query; // Valores predeterminados: página 1, 10 registros por página
  const mesActual = req.query.mesActual === 'true';
  
  // Calcular el desplazamiento y el límite
  const offset = (page - 1) * pageSize; // Desplazamiento
  const limit = parseInt(pageSize, 10); // Límite de registros por página

  let condition = {};

  if (mesActual) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // Primer día del mes actual
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Último día del mes actual

    condition.fecha = {
      [Op.between]: [startOfMonth, endOfMonth]
    };
  }

  // Usar findAndCountAll para obtener los datos paginados y el total de registros
  TrabajoDePasteurizaciones.findAndCountAll({
    where: condition,
    limit: limit,      // Límite por página
    offset: offset,    // Desplazamiento según la página actual
    order: [['id_pasteurizacion', 'DESC']] // Ordenar por id_pasteurizacion en orden ascendente
  })
  .then(result => {
    res.send({
      pasteurizaciones: result.rows,  // Registros actuales
      totalRecords: result.count,            // Número total de registros
      currentPage: parseInt(page, 10),       // Página actual
      totalPages: Math.ceil(result.count / limit) // Total de páginas
    });
  })
  .catch(err => {
    res.status(500).send({
      message: err.message || 'Ocurrió un error al recuperar los registros de trabajo_de_pasteurizaciones.',
    });
  });
};



//control_de_leches.controller.js
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

exports.findAll = (req, res) => {
  const { page = 1, pageSize = 10 } = req.query; // Parámetros de paginación
  const id_pasteurizacion = req.query.id_pasteurizacion;
  const tipo_de_leche = req.query.tipo_de_leche;

  const offset = (page - 1) * pageSize; // Cálculo del desplazamiento
  const limit = parseInt(pageSize, 10); // Límite de registros por página

  let condition = {};

  if (id_pasteurizacion) {
    condition.id_pasteurizacion = { [Op.eq]: id_pasteurizacion };
  }

  if (tipo_de_leche) {
    condition.tipo_de_leche = { [Op.like]: `%${tipo_de_leche}%` };
  }

  // Usar findAndCountAll para paginación
  ControlDeLeche.findAndCountAll({
    where: condition,
    include: [
      {
        model: db.trabajo_de_pasteurizaciones,
        as: 'trabajo_de_pasteurizaciones',
        attributes: ['no_frasco', 'kcal_l', 'porcentaje_grasa', 'acidez'],
      },
    ],
    limit: limit,  // Límite por página
    offset: offset, // Desplazamiento basado en la página actual
    order: [['id_control_leche', 'ASC']], // Orden ascendente por id_control_leche
  })
    .then(result => {
      res.send({
        controlLeches: result.rows,         // Registros actuales
        totalRecords: result.count,           // Total de registros
        currentPage: parseInt(page, 10),      // Página actual
        totalPages: Math.ceil(result.count / limit), // Total de páginas
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
