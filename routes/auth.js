const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const User    = require('../models/User');

// Registro
router.post('/register', async (req, res) => {
  try {
    const { nombre, correo, telefono, contrasena } = req.body;
    const existe = await User.findOne({ correo });
    if (existe) return res.status(400).send('Usuario ya registrado');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contrasena, salt);

    const user = new User({ nombre, correo, telefono, contrasena: hash });
    await user.save();

    return res.send(`
      <script>
        alert("Registro exitoso 🎉");
        window.location.href = "/inicio_sesion.html";
      </script>
    `);
    
  } catch (err) {
    console.error("🔥 ERROR DETECTADO:", err);
    res.status(500).send(`Error: ${err.message}`);
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const user = await User.findOne({ correo });
    if (!user) return res.status(400).send('Credenciales inválidas');

    const match = await bcrypt.compare(contrasena, user.contrasena);
    if (!match) return res.status(400).send('Credenciales inválidas');

    return res.send(`
     <script>
       localStorage.setItem("usuario_id", "${user._id}");
       window.location.href = "/index.html";
     </script>
    `);

  } catch (err) {
    console.error("🔥 ERROR DETECTADO:", err);
    res.status(500).send(`Error: ${err.message}`);
  }
});

module.exports = router;

// Obtener datos del usuario por ID (para perfil)

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('nombre');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});