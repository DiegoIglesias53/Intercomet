const express = require('express');
const router = express.Router();
const Logro = require('../models/Logro');


// Obtener logros de un usuario
router.get('/:usuario_id', async (req, res) => {
  try {
    const logros = await Logro.find({ usuario_id: req.params.usuario_id });
    res.json({ logros });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Marcar logro como desbloqueado
router.put('/:usuario_id/:codigo', async (req, res) => {
  try {
    const logro = await Logro.findOneAndUpdate(
      { usuario_id: req.params.usuario_id, codigo: req.params.codigo },
      { desbloqueado: true },
      { new: true, upsert: true } // Crea si no existe
    );
    res.json({ ok: true, logro });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear todos los logros por default al registrar usuario (opcional)
router.post('/crear-por-defecto/:usuario_id', async (req, res) => {
  try {
    const nombres = ["Campeón", "Explorador", "Maestro", "Viajero", "Conquistador", "Estratega", "Inventor", "Genio", "Líder", "Héroe", "Misterioso", "Leyenda"];
    const logros = nombres.map((nombre, i) => ({
      usuario_id: req.params.usuario_id,
      nombre,
      codigo: i + 1
    }));
    await Logro.insertMany(logros);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
