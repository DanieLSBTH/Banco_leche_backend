const db = require('../models');
const ChatRespuestas = db.chat_1respuestas;

exports.addResponse = (req, res) => {
  const { keyword, reply } = req.body;

  if (!keyword || !reply) {
    return res.status(400).send({ message: 'Keyword and reply are required' });
  }

  ChatRespuestas.create({ keyword, reply })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({ message: err.message || 'Some error occurred while adding the response.' });
    });
};
