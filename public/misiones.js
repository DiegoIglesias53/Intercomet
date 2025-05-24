const usuario_id = localStorage.getItem('usuario_id');
const listaTareas = document.querySelector('.lista_tareas');
const inputTarea = document.getElementById('nueva_tarea');
const botonAgregar = document.getElementById('boton_agregar_tarea');
const logrosMostrados = new Set();

// Cargar tareas del usuario al iniciar
window.addEventListener('DOMContentLoaded', () => {
  if (!usuario_id) {
    alert('No has iniciado sesión');
    //window.location.href = '/inicio_sesion.html';
    return;
  }
  cargarTareas();
});

function cargarTareas() {
  fetch(`/api/tareas/${usuario_id}`)
    .then(res => res.json())
    .then(data => {
      listaTareas.innerHTML = '';
      data.tareas.forEach(tarea => {
        const li = document.createElement('li');
        li.innerHTML = `
          <label class="item_tarea">
            <input type="checkbox" ${tarea.completada ? 'checked' : ''} onchange="marcarTarea('${tarea._id}', this.checked)" />
            <span>${tarea.texto}</span>
          </label>`;
        listaTareas.appendChild(li);
      });
    });
}

function agregarTarea() {
  const texto = inputTarea.value.trim();
  if (!texto) return;

  fetch('/api/tareas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id, texto })
  })
    .then(() => {
      inputTarea.value = '';
      cargarTareas();
    });
}

function marcarTarea(tareaId, completada) {
  fetch(`/api/tareas/${tareaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completada })
  })
    .then(res => res.json())
    .then(res => {
      cargarTareas();

      // Mostrar alerta solo si viene un logro nuevo
      if (completada && res.logro && !logrosMostrados.has(res.logro.codigo)) {
         logrosMostrados.add(res.logro.codigo);
          mostrarAlertaLogro(res.logro.nombre || 'Nuevo logro');
      }
    });
}



function mostrarAlertaLogro(nombre) {
  const div = document.createElement('div');
  div.className = 'alerta-logro';
  div.innerHTML = `🏆 ¡Logro desbloqueado: <strong>${nombre}</strong>!`;
  Object.assign(div.style, {
    position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
    backgroundColor: '#222', color: 'white', padding: '15px 25px',
    borderRadius: '10px', fontFamily: 'monospace', fontSize: '1rem',
    zIndex: 9999, boxShadow: '0 0 20px #0f0', opacity: 0, transition: 'opacity 0.5s'
  });
  document.body.appendChild(div);
  setTimeout(() => div.style.opacity = 1, 100);
  setTimeout(() => {
    div.style.opacity = 0;
    setTimeout(() => div.remove(), 1000);
  }, 3000);
}

botonAgregar.addEventListener('click', agregarTarea);