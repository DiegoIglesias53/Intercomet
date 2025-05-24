const usuarioId = localStorage.getItem('usuario_id');

if (!usuarioId) {
  alert('No has iniciado sesión');
  window.location.href = '/inicio_sesion.html';
} else {
  // Obtener nombre del usuario
  fetch(`/api/usuarios/${usuarioId}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('nombre_usuario').textContent = data.nombre || '[USUARIO]';
    });

  // Obtener logros desbloqueados
  fetch(`/api/logros/${usuarioId}`)
    .then(res => res.json())
    .then(data => {
      data.logros.forEach(logro => {
        const el = document.querySelector(`.trofeo[data-logro='${logro.codigo.toString()}']`);
        if (logro.desbloqueado && el) {
          el.classList.add('desbloqueado'); 
        }
      });
    });
}
