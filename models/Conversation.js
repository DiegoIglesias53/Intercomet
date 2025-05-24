const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['privado', 'grupal'],
    required: true,
    default: 'privado'
  },
  nombre: {           // sólo para grupos
    type: String,
    default: ''
  },
  participantes: [{   // array de ObjectId de usuarios
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  creadoPor: {        // quién creó el chat (privado o grupo)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  collection: 'c_chats',
  timestamps: true
});

module.exports = mongoose.model('Conversation', ConversationSchema);
