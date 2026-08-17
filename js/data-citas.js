// ═══════════════════════════════════════
// MÓDULO: data/citas.js
// Extraído de index.html (ago-2026) — misma lógica, mismo comportamiento.
// Mismo patrón que data-ordenes.js / data-clientes.js.
// ═══════════════════════════════════════

let citasListenerStarted = false;
let _unsubCitas = null;

async function cargarCitasLocal() {
  try {
    const data = localStorage.getItem('alarmas_citas');
    window.citas = data ? JSON.parse(data) : [];
  } catch(e) { window.citas = []; }
  window.renderAgenda();
}

function guardarCitasLocal() {
  try { localStorage.setItem('alarmas_citas', JSON.stringify(window.citas)); } catch(e) {}
}

async function cargarCitas() {
  if (window._useFirebase && window._firebaseDb && window._firebaseModules && window._uid) {
    try {
      const { onSnapshot, orderBy, query } = window._firebaseModules;
      const q = query(window.colCitas(), orderBy('fecha','asc'));
      if (!citasListenerStarted) {
        citasListenerStarted = true;
        _unsubCitas = onSnapshot(q, snap => {
          window.citas = snap.docs.map(d=>({id:d.id,...d.data()}));
          window.renderAgenda();
        }, err => {
          console.error(err);
          if (!window._uid) return; // sesión ya cerrada — listener obsoleto, ignorar
          citasListenerStarted = false;
          cargarCitasLocal();
        });
      }
      return;
    } catch(e) { console.error(e); }
  }
  cargarCitasLocal();
}

async function guardarCita(cita) {
  const data = {...cita};
  if (window._useFirebase && window._firebaseDb && window._uid) {
    try {
      const { addDoc, updateDoc } = window._firebaseModules;
      if (data.id) {
        const id = data.id; delete data.id;
        await updateDoc(window.docCita(id), data);
        return id;
      } else {
        const ref = await addDoc(window.colCitas(), data);
        return ref.id;
      }
    } catch(e) {
      console.error(e);
      window.toast('⚠️ No se pudo guardar la cita en Firebase');
      return null;
    }
  }
  if (data.id) {
    const idx = window.citas.findIndex(c=>c.id===data.id);
    if (idx>=0) window.citas[idx] = data;
  } else {
    data.id = 'local_cita_'+Date.now();
    window.citas.push(data);
  }
  guardarCitasLocal();
  window.renderAgenda();
  return data.id;
}

async function eliminarCita(id) {
  const ok = await window.confirmarAccion('Eliminar cita', '¿Eliminar esta cita?', '🗑️', 'Eliminar');
  if (!ok) return;
  if (window._useFirebase && window._firebaseDb && window._uid) {
    try {
      const { deleteDoc } = window._firebaseModules;
      await deleteDoc(window.docCita(id));
      window.toast('Cita eliminada');
      window.cerrarModalCita();
      return;
    } catch(e) {
      console.error(e);
      window.toast('⚠️ Error al eliminar: ' + (e.message || e));
      return;
    }
  }
  window.citas = window.citas.filter(c => c.id !== id);
  guardarCitasLocal();
  window.renderAgenda();
  window.toast('Cita eliminada');
  window.cerrarModalCita();
}

// Exponer en window — código clásico (cambiarEstadoCita, onclick inline del
// HTML, etc.) sigue llamando estas funciones sin cambios.
window.cargarCitasLocal = cargarCitasLocal;
window.guardarCitasLocal = guardarCitasLocal;
window.cargarCitas = cargarCitas;
window.guardarCita = guardarCita;
window.eliminarCita = eliminarCita;
