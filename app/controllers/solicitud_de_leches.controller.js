const db = require('../models');
const SolicitudDeLeches = db.solicitud_de_leches;
const ControlDeLeche = db.control_de_leches;
const TrabajoDePasteurizacion = db.trabajo_de_pasteurizaciones;
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const sequelize = db.sequelize;
const Op = Sequelize.Op;

exports.create = async (req, res) => {
 
  // Extraer los datos del cuerpo
  const {
    registro_medico,
    nombre_recien_nacido,
    fecha_nacimiento,
    edad_de_ingreso,
    tipo_paciente,
    peso_al_nacer,
    peso_actual,
    kcal_o,
    volumen_toma_cc,
    numero_tomas,
    total_vol_solicitado,
    id_control_leche,
    servicio,
    fecha_entrega,
    solicita,
    onzas
  } = req.body;

  try {
    // Validación simple
    if (!registro_medico || !nombre_recien_nacido || !fecha_nacimiento || !edad_de_ingreso || !tipo_paciente || 
        !peso_al_nacer || !peso_actual || !kcal_o || !volumen_toma_cc || !numero_tomas || 
        !total_vol_solicitado || !id_control_leche || !servicio || !fecha_entrega || !solicita || !onzas) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    // Calcular litros y costos
    const litros = onzas * 0.03;
    const costos = onzas * 3.49;

    // Crear la solicitud
    const nuevaSolicitud = await SolicitudDeLeches.create({
      registro_medico,
      nombre_recien_nacido,
      fecha_nacimiento,
      edad_de_ingreso,
      tipo_paciente,
      peso_al_nacer,
      peso_actual,
      kcal_o,
      volumen_toma_cc,
      numero_tomas,
      total_vol_solicitado,
      id_control_leche,
      servicio,
      fecha_entrega,
      solicita,
      onzas,
      litros,
      costos
    });

    res.status(201).json(nuevaSolicitud);
  } catch (error) {
    console.error("Error al crear la solicitud:", error);
    res.status(500).json({ message: "Error al crear la solicitud." });
  }
};
  

// Recuperar todos los registros de solicitud_de_leches de la base de datos con paginación
exports.findAll = async (req, res) => {
  // Obtener los parámetros de paginación de los query params
  const { page = 1, pageSize = 10 } = req.query; // Valores predeterminados: página 1, 10 registros por página
  const id_control_leche = req.query.id_control_leche;
  const tipo_paciente = req.query.tipo_paciente;

  // Calcular el desplazamiento y el límite
  const offset = (page - 1) * pageSize; // Desplazamiento
  const limit = parseInt(pageSize, 10); // Límite de registros por página

  // Inicializar la condición de búsqueda
  let condition = {};

  // Filtros condicionales
  if (id_control_leche) {
    condition.id_control_leche = { [Op.eq]: id_control_leche };
  }

  if (tipo_paciente) {
    condition.tipo_paciente = { [Op.like]: `%${tipo_paciente}%` };
  }

  try {
    // Usar findAndCountAll para obtener los datos paginados y el total de registros
    const result = await SolicitudDeLeches.findAndCountAll({
      where: condition,
      include: [
        {
          model: ControlDeLeche,
          as: 'control_de_leches',
          attributes: ['no_frascoregistro','fecha_almacenamiento', 'volumen_ml_onza'],
          include: [
            {
              model: db.trabajo_de_pasteurizaciones,
              as: 'trabajo_de_pasteurizaciones',
              attributes: ['no_frasco', 'kcal_l', 'porcentaje_grasa', 'acidez']
            }
          ]
        }
      ],
      limit: limit,      // Límite por página
      offset: offset,    // Desplazamiento según la página actual
      order: [['id_solicitud', 'DESC']] // Ordenar por id_solicitud en orden ascendente
    });

    // Responder con los datos paginados y el total de registros
    res.send({
      solicitudes: result.rows,       // Registros actuales
      totalRecords: result.count,     // Número total de registros
      currentPage: parseInt(page, 10), // Página actual
      totalPages: Math.ceil(result.count / limit) // Total de páginas
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Ocurrió un error al recuperar los registros de solicitud_de_leches.'
    });
  }
};

// Recuperar un registro de solicitud_de_leches por su ID
exports.findOne = async (req, res) => {
  const id_solicitud = req.params.id_solicitud;

  try {
    const solicitud = await SolicitudDeLeches.findByPk(id_solicitud, {
      include: [
        {
          model: ControlDeLeche,
          as: 'control_de_leches',
          attributes: ['fecha_almacenamiento','volumen_ml_onza'],
          include: [
            {
              model: db.trabajo_de_pasteurizaciones,
              as: 'trabajo_de_pasteurizaciones',
              attributes: ['no_frasco', 'kcal_l', 'porcentaje_grasa', 'acidez']
            }
          ]
        }
      ]
    });

    if (!solicitud) {
      return res.status(404).send({
        message: `No se encontró el registro con id=${id_solicitud}.`
      });
    }
    data.fecha_almacenamiento = data.fecha_nacimiento.toISOString().split('T')[0];
    data.fecha_entrega = data.fecha_entrega.toISOString().split('T')[0];
    res.send(solicitud);
  } catch (err) {
    res.status(500).send({
      message: `Error al recuperar el registro con id=${id_solicitud}.`
    });
  }
};

// Actualizar un registro de solicitud_de_leches por su ID
exports.update = async (req, res) => {
  const id_solicitud = req.params.id_solicitud;

  // Calcular litros y costos si se actualiza el campo onzas
  if (req.body.onzas) {
    req.body.litros = req.body.onzas * 0.03;
    req.body.costos = req.body.onzas * 3.49;
  }

  try {
    const [updated] = await SolicitudDeLeches.update(req.body, {
      where: { id_solicitud: id_solicitud }
    });

    if (updated) {
      const updatedSolicitud = await SolicitudDeLeches.findByPk(id_solicitud);
      return res.send({
        message: 'Registro de solicitud_de_leches actualizado con éxito.',
        data: updatedSolicitud
      });
    }

    res.send({
      message: `No se puede actualizar el registro de solicitud_de_leches con id=${id_solicitud}.`
    });
  } catch (err) {
    res.status(500).send({
      message: `Error al actualizar el registro de solicitud_de_leches con id=${id_solicitud}.`
    });
  }
};

// Eliminar un registro de solicitud_de_leches por su ID
exports.delete = async (req, res) => {
  const id_solicitud = req.params.id_solicitud;

  try {
    const deleted = await SolicitudDeLeches.destroy({
      where: { id_solicitud: id_solicitud }
    });

    if (deleted) {
      return res.send({
        message: 'Registro de solicitud_de_leches eliminado con éxito.'
      });
    }

    res.send({
      message: `No se puede eliminar el registro de solicitud_de_leches con id=${id_solicitud}.`
    });
  } catch (err) {
    res.status(500).send({
      message: `Error al eliminar el registro de solicitud_de_leches con id=${id_solicitud}.`
    });
  }
};

// Eliminar todos los registros de solicitud_de_leches de la base de datos
exports.deleteAll = async (req, res) => {
  try {
    const numDeleted = await SolicitudDeLeches.destroy({
      where: {},
      truncate: false
    });

    res.send({
      message: `${numDeleted} registros de solicitud_de_leches eliminados con éxito.`
    });
  } catch (err) {
    res.status(500).send({
      message: 'Error al eliminar los registros de solicitud_de_leches.'
    });
  }
};

exports.getResumenPorMes = async (req, res) => {
  try {
    // Obtén todas las solicitudes de leche agrupadas por mes
    const solicitudes = await SolicitudDeLeches.findAll({
      attributes: [
        [Sequelize.literal('EXTRACT(MONTH FROM "fecha_entrega")'), 'mes'],
        [Sequelize.literal('EXTRACT(YEAR FROM "fecha_entrega")'), 'año'],
        [Sequelize.fn('COUNT', Sequelize.col('registro_medico')), 'totalBeneficiados'],
        [Sequelize.fn('SUM', Sequelize.col('litros')), 'totalLitrosDistribuidos']
      ],
      group: ['mes', 'año'],
      order: [[Sequelize.literal('EXTRACT(YEAR FROM "fecha_entrega")'), 'ASC'], [Sequelize.literal('EXTRACT(MONTH FROM "fecha_entrega")'), 'ASC']]
    });

    // Inicializar variables para el resumen
    let totalBeneficiados = 0;
    let totalLitrosDistribuidos = 0;

    // Crear el objeto final que va a contener el resumen
    const asistencia = [];

    // Recorrer las solicitudes agrupadas por mes
    solicitudes.forEach(solicitud => {
      const mes = solicitud.get('mes');
      const año = solicitud.get('año');
      const totalMesBeneficiados = solicitud.get('totalBeneficiados');
      const totalMesLitros = solicitud.get('totalLitrosDistribuidos');

      // Sumar al total general
      totalBeneficiados += parseInt(totalMesBeneficiados);
      totalLitrosDistribuidos += parseFloat(totalMesLitros);

      // Obtener el nombre del mes
      const nombreDelMes = nombreMes(mes) + ` ${año}`;
      
      // Añadir los datos al arreglo
      asistencia.push({
        tipo: "recien nacidos beneficiados",
        [nombreDelMes]: totalMesBeneficiados,
        total: totalBeneficiados,
        promedio: "100%"
      });

      asistencia.push({
        tipo: "leche distribuida litros",
        [nombreDelMes]: totalMesLitros,
        total: totalLitrosDistribuidos,
        promedio: "100%"
      });
    });

    // Enviar la respuesta en formato JSON
    res.json({ asistencia });

  } catch (error) {
    console.error("Error al obtener el resumen por mes:", error);
    res.status(500).json({
      message: "Ocurrió un error al obtener el resumen por mes."
    });
  }
};

exports.getResumenPorServicioYFechas = async (req, res) => { 
  const { fechaInicio, fechaFin } = req.query;

  try {
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ message: "Las fechas de inicio y fin son obligatorias." });
    }

    // Consulta única que obtiene todos los datos necesarios
    const solicitudes = await SolicitudDeLeches.findAll({
      attributes: [
        'servicio',
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'totalsolicitudes'],
        [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('registro_medico'))), 'totalregistrosunicos'],
        [Sequelize.fn('SUM', Sequelize.col('onzas')), 'totalonzas'],
        [Sequelize.fn('SUM', Sequelize.col('litros')), 'totallitros'],
        [Sequelize.literal('EXTRACT(MONTH FROM "fecha_entrega")'), 'mes'],
        [Sequelize.literal('EXTRACT(YEAR FROM "fecha_entrega")'), 'año']
      ],
      where: {
        fecha_entrega: {
          [Sequelize.Op.between]: [fechaInicio, fechaFin]
        }
      },
      group: ['servicio', 'mes', 'año'],
      order: [
        ['servicio', 'ASC'],
        [Sequelize.literal('EXTRACT(YEAR FROM "fecha_entrega")'), 'ASC'],
        [Sequelize.literal('EXTRACT(MONTH FROM "fecha_entrega")'), 'ASC']
      ]
    });

    // Consulta adicional para obtener el total general de registros únicos
    const totalGeneralUnicos = await SolicitudDeLeches.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('registro_medico'))), 'totalregistrosunicos'],
        [Sequelize.fn('SUM', Sequelize.col('onzas')), 'totalonzas'],
        [Sequelize.fn('SUM', Sequelize.col('litros')), 'totallitros'],
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'totalsolicitudes']
      ],
      where: {
        fecha_entrega: {
          [Sequelize.Op.between]: [fechaInicio, fechaFin]
        }
      }
    });

    // Inicializar el objeto para el resumen
    const asistencia = {};
    
    // Procesar los datos por servicio
    solicitudes.forEach(solicitud => {
      const servicio = solicitud.get('servicio');
      const mes = solicitud.get('mes');
      const año = solicitud.get('año');
      const nombreDelMes = nombreMes(mes) + ` ${año}`;

      if (!asistencia[servicio]) {
        asistencia[servicio] = {
          totalBeneficiados: 0,
          totalRegistrosUnicos: 0,
          totalLitrosDistribuidos: 0,
          totalOnzas: 0,
          meses: {}
        };
      }

      // Actualizar los totales por servicio
      const totalMesRegistrosUnicos = parseInt(solicitud.get('totalregistrosunicos')) || 0;
      const totalMesOnzas = parseFloat(solicitud.get('totalonzas')) || 0;
      const totalMesLitros = parseFloat(solicitud.get('totallitros')) || 0;
      const totalSolicitudes = parseInt(solicitud.get('totalsolicitudes')) || 0;

      // Actualizar los totales del servicio
      asistencia[servicio].totalBeneficiados = 
        (asistencia[servicio].totalBeneficiados || 0) + totalSolicitudes;
      asistencia[servicio].totalRegistrosUnicos = 
        Math.max(asistencia[servicio].totalRegistrosUnicos || 0, totalMesRegistrosUnicos);
      asistencia[servicio].totalLitrosDistribuidos = 
        (asistencia[servicio].totalLitrosDistribuidos || 0) + totalMesLitros;
      asistencia[servicio].totalOnzas = 
        (asistencia[servicio].totalOnzas || 0) + totalMesOnzas;

      // Guardar los datos del mes
      asistencia[servicio].meses[nombreDelMes] = {
        totalBeneficiados: totalSolicitudes,
        totalRegistrosUnicos: totalMesRegistrosUnicos,
        totalLitrosDistribuidos: totalMesLitros,
        totalOnzas: totalMesOnzas
      };
    });

    // Obtener los totales generales de la consulta adicional
    const totalGeneral = {
      totalBeneficiados: parseInt(totalGeneralUnicos[0].get('totalsolicitudes')) || 0,
      totalRegistrosUnicos: parseInt(totalGeneralUnicos[0].get('totalregistrosunicos')) || 0,
      totalLitrosDistribuidos: parseFloat(totalGeneralUnicos[0].get('totallitros')) || 0,
      totalOnzas: parseFloat(totalGeneralUnicos[0].get('totalonzas')) || 0
    };

    res.json({
      asistencia,
      totalGeneral
    });

  } catch (error) {
    console.error("Error al obtener el resumen por servicio y fechas:", error);
    res.status(500).json({
      message: "Ocurrió un error al obtener el resumen por servicio y fechas."
    });
  }
};

// Función para obtener el nombre del mes a partir de su número
function nombreMes(mes) {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return meses[mes - 1];  // Restar 1 porque los meses empiezan desde 0 en el arreglo
}