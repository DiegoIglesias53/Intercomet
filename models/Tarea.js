const mongoose = require('mongoose');

const tareaSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  texto: String,
  completada: { type: Boolean, default: false }
});

module.exports = mongoose.model('Tarea', tareaSchema);
