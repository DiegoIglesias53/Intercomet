const express = require('express');
const router = express.Router();
const Tarea = require('../models/Tarea');
const Logro = require('../models/Logro');

// Obtener tareas de un usuario
router.get('/:usuario_id', async (req, res) => {
  try {
    const tareas = await Tarea.find({ usuario_id: req.params.usuario_id });
    res.json({ tareas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agregar nueva tarea
router.post('/', async (req, res) => {
  try {
    const { usuario_id, texto } = req.body;
    const tarea = new Tarea({ usuario_id, texto });
    await tarea.save();
    res.json({ ok: true, tarea });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Marcar tarea como completada o no
router.put('/:tarea_id', async (req, res) => {
  try {
    const { completada } = req.body;
    const tarea = await Tarea.findByIdAndUpdate(req.params.tarea_id, { completada }, { new: true });

    let logroDesbloqueado = null;

    if (completada) {
      const totalCompletadas = await Tarea.countDocuments({
        usuario_id: tarea.usuario_id,
        completada: true
      });

      const codigoLogro = Math.floor(totalCompletadas / 2);

      if (codigoLogro >= 1 && codigoLogro <= 12) {
        const yaDesbloqueado = await Logro.findOne({
          usuario_id: tarea.usuario_id,
          codigo: codigoLogro,
          desbloqueado: true
        });

        if (!yaDesbloqueado) {
          logroDesbloqueado = await Logro.findOneAndUpdate(
            { usuario_id: tarea.usuario_id, codigo: codigoLogro },
            { desbloqueado: true },
            { new: true, upsert: true }
          );
        } else {
          logroDesbloqueado = yaDesbloqueado; 
        }
      }
    }

    res.json({ ok: true, logro: logroDesbloqueado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
