const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre:    { type: String, required: true },
  correo:    { type: String, required: true, unique: true },
  telefono:  { type: String, required: true },
  contrasena:{ type: String, required: true }
}, {
  timestamps: true,
  collection: 'c_usuarios'
});

module.exports = mongoose.model('User', userSchema);
