// app.js
const express      = require('express');
const mongoose     = require('mongoose');
const path         = require('path');
const http         = require('http');
const socketIo     = require('socket.io');

// Rutas de negocio
const authRouter   = require('./routes/auth');
const tareaRoutes  = require('./routes/tareas');
const logrosRoutes = require('./routes/logros');
const Logro = require('./models/Logro');

// Modelos de chat
const User         = require('./models/User');
const Conversation = require('./models/Conversation');
const Message      = require('./models/Message');

// Modelos de tareas/logros (solo por si los necesitas directamente)
// const Tarea     = require('./models/Tarea');
// const Logro     = require('./models/Logro');

const app    = express();
const server = http.createServer(app);
const io     = socketIo(server, { cors: { origin: '*' } });

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB conectado a Intercomet_v1'))
.catch(err => console.error(err));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// — RUTAS DE AUTENTICACIÓN, TAREAS Y LOGROS — 
app.use('/api/auth', authRouter);
app.use('/auth',        authRouter);     // si lo usas así
app.use('/api/tareas',  tareaRoutes);
app.use('/api/logros',  logrosRoutes);
app.use('/api/usuarios', authRouter);    // perfil usuario

// — RUTAS DE CHAT —
// Usuarios para selects
app.get('/api/users', async (_, res) => {
  try {
    const users = await User.find({}, '_id nombre');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener usuarios');
  }
});

// Obtener logros de un usuario
app.get('/api/logros/user/:userId', async (req, res) => {
  try {
    const logros = await Logro.find({ usuario_id: req.params.userId });
    // Mapeamos solo lo que sea útil: nombre y desbloqueado
    res.json(logros.map(l => ({
      nombre:      l.nombre,
      codigo:      l.codigo,
      desbloqueado:l.desbloqueado
    })));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener logros');
  }
});

// Privado
app.post('/api/conversations', async (req, res) => {
  const { user1, user2 } = req.body;
  let conv = await Conversation.findOne({
    tipo: 'privado',
    participantes: { $all: [user1, user2], $size: 2 }
  });
  if (!conv) {
    conv = new Conversation({ tipo:'privado', participantes:[user1,user2], creadoPor:user1 });
    await conv.save();
  }
  res.json({ convId: conv._id });
});

// Grupal
app.post('/api/conversations/group', async (req, res) => {
  try {
    const { participantes, creadoPor, nombre } = req.body;
    if (!Array.isArray(participantes) || participantes.length < 2) {
      return res.status(400).json({ error:'Se requieren al menos 2 participantes' });
    }
    const conv = new Conversation({ tipo:'grupal', nombre, participantes, creadoPor });
    await conv.save();
    res.status(201).json({ convId: conv._id });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// Listar conversaciones de un usuario
app.get('/api/conversations/user/:userId', async (req, res) => {
  try {
    const convs = await Conversation.find({ participantes: req.params.userId });
    res.json(convs);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// Historial (privado o grupal)
app.get('/api/conversations/:convId/messages', async (req, res) => {
  try {
    const msgs = await Message.find({ conversationId: req.params.convId })
                              .sort({ timestamp: 1 })
                              .populate('from', 'nombre');
    res.json(msgs.map(m => ({ from:m.from.nombre, text:m.text, timestamp:m.timestamp })));
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// — SOCKET.IO — 
io.on('connection', socket => {
  console.log('Cliente conectado:', socket.id);

  // Registro para chat privado
  socket.on('register', ({ userId }) => socket.userId = userId);

  // Chat privado
  socket.on('private message', async ({ from, to, text, conversationId }) => {
    const msg = await new Message({ conversationId, from, to, text }).save();
    const user = await User.findById(from, 'nombre');
    const nombre = user.nombre;
    // Destinatario
    const target = [...io.sockets.sockets.values()].find(s => s.userId === to);
    if (target) target.emit('private message', { from:nombre, text });
    // Emisor
    socket.emit('private message', { from:nombre, text });
  });

  // Chat grupal: unirse a sala
  socket.on('joinRoom', convId => socket.join(convId));

  // Chat grupal: enviar mensaje
  socket.on('group message', async ({ conversationId, from, text }) => {
    const msg = await new Message({ conversationId, from, text }).save();
    const user = await User.findById(from, 'nombre');
    const nombre = user.nombre;
    io.to(conversationId).emit('group message', { from:nombre, text, timestamp:msg.timestamp });
  });
  // Oferta de llamada (peer A)
socket.on('webrtc-offer', ({ to, offer }) => {
  const target = [...io.sockets.sockets.values()].find(s => s.userId === to);
  if (target) target.emit('webrtc-offer', { from: socket.userId, offer });
});

// Respuesta de llamada (peer B)
socket.on('webrtc-answer', ({ to, answer }) => {
  const target = [...io.sockets.sockets.values()].find(s => s.userId === to);
  if (target) target.emit('webrtc-answer', { answer });
});

// Candidatos ICE
socket.on('webrtc-candidate', ({ to, candidate }) => {
  const target = [...io.sockets.sockets.values()].find(s => s.userId === to);
  if (target) target.emit('webrtc-candidate', { candidate });
});


  socket.on('disconnect', () => console.log('Cliente desconectado:', socket.id));
});

// Arrancar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Servidor en ejecución en el puerto ${PORT}`));


