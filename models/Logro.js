const mongoose = require('mongoose');

const logroSchema = new mongoose.Schema({
    
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nombre:     { type: String, required: true }, 
  codigo:     { type: Number, required: true }, 
  desbloqueado: { type: Boolean, default: false }

}, {
  timestamps: true,
  collection: 'c_logros'
});

module.exports = mongoose.model('Logro', logroSchema);