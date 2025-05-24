const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  from: {   // emisor
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {     // receptor (solo para privado; en grupal puede quedar null)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'c_mensajes'
});

module.exports = mongoose.model('Message', MessageSchema);
