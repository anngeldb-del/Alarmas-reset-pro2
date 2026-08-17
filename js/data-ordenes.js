// ═══════════════════════════════════════
// MÓDULO: data/ordenes.js
// Extraído de index.html (ago-2026) — misma lógica, mismo comportamiento.
// Como es un módulo ES6, no comparte el scope léxico del <script> clásico
// donde vive el resto de la app. Por eso todo lo que antes se llamaba "a
// pelo" (ordenes, IDB, renderAll, toast, colOrdenes, etc.) aquí se llama
// con prefijo window. — son las mismas funciones/variables globales de
// siempre, solo que accedidas explícitamente vía el objeto global que sí
// comparten todos los scripts de la página.
//
// fsListenerStarted / _unsubOrdenes quedan como estado privado de este
// módulo (antes eran variables del <script> principal, pero solo las usaba
// cargarOrdenes(), así que viven mejor aquí).
// ═══════════════════════════════════════

let fsListenerStarted = false;
let _unsubOrdenes = null;

async function cargarOrdenesLocal() {
  await window.IDB.init();
  try {
    if (window.IDB.db) {
      const data = await window.IDB.getAll();
      if (data && data.length > 0) {
        window.ordenes = data.sort((a,b)=>(b.fecha_creacion||0)-(a.fecha_creacion||0));
        window.renderAll(); return;
      }
      const ls = localStorage.getItem('alarmas_ordenes');
      if (ls) {
        try { window.ordenes = JSON.parse(ls); await window.IDB.putAll(window.ordenes); } catch(e) { window.ordenes = []; }
        window.renderAll(); return;
      }
    }
    const data = localStorage.getItem('alarmas_ordenes');
    window.ordenes = data ? JSON.parse(data) : [];
  } catch(e) {
    window.ordenes = [];
    console.error(e);
  }
  window.renderAll();
}

async function cargarOrdenes() {
  if (window._useFirebase && window._firebaseDb && window._firebaseModules && window._uid) {
    try {
      const { onSnapshot, orderBy, query, limit } = window._firebaseModules;
      // Tope de seguridad: con el archivado mensual ya reparado, la colección
      // activa debería quedarse chica siempre. Este limit() es solo una red
      // de protección para que el listener nunca vuelva a leer una colección
      // sin control si el archivado falla por cualquier otra razón futura.
      const q = query(window.colOrdenes(), orderBy('fecha_creacion','desc'), limit(window.ORDENES_LIMIT_SEGURIDAD));
      if (!fsListenerStarted) {
        fsListenerStarted = true;
        _unsubOrdenes = onSnapshot(q, snap => {
          window.ordenes = snap.docs.map(d=>({id:d.id,...d.data()}));
          window.renderAll();
        }, err => {
          console.error(err);
          if (!window._uid) return; // sesión ya cerrada — listener obsoleto, ignorar
          window.toast('⚠️ Firestore no disponible — modo local');
          window._useFirebase = false;
          fsListenerStarted = false;
          window.updateFirebaseBadge();
          cargarOrdenesLocal();
        });
      }
      return;
    } catch(e) { console.error(e); }
  }
  cargarOrdenesLocal();
}

async function guardarOrden(orden) {
  if (window._useFirebase && window._firebaseDb && window._uid) {
    try {
      const { addDoc, updateDoc } = window._firebaseModules;
      if (orden.id) {
        const id = orden.id;
        const data = {...orden};
        delete data.id;
        await updateDoc(window.docOrden(id), data);
      } else {
        orden.fecha_creacion = Date.now();
        await addDoc(window.colOrdenes(), orden);
      }
      return;
    } catch(e) {
      console.error(e);
      window.toast('⚠️ Firebase no disponible — guardando local');
      window._useFirebase = false;
      window.updateFirebaseBadge();
      window._addToOfflineQueue({ tipo: 'guardar', orden: {...orden} });
    }
  }
  if (orden.id) {
    const idx = window.ordenes.findIndex(o=>o.id===orden.id);
    if (idx >= 0) window.ordenes[idx] = orden;
    else window.ordenes.unshift(orden);
  } else {
    orden.id = 'local_'+Date.now();
    orden.fecha_creacion = Date.now();
    window.ordenes.unshift(orden);
  }
  window.guardarLocal();
  window.renderAll();
}

async function eliminarOrden(id) {
  const ok = await window.confirmarAccion('Eliminar orden', '¿Eliminar esta orden? Esta acción no se puede deshacer.', '🗑️', 'Eliminar');
  if (!ok) return;
  if (window._useFirebase && window._firebaseDb && window._uid) {
    try {
      const { deleteDoc } = window._firebaseModules;
      await deleteDoc(window.docOrden(id));
      window.toast('Orden eliminada');
      return;
    } catch(e) {
      console.error(e);
      window.toast('⚠️ Error al eliminar: ' + (e.message || e));
      return;
    }
  }
  window.ordenes = window.ordenes.filter(o => o.id !== id);
  window.guardarLocal();
  window.renderAll();
  window.toast('Orden eliminada');
}

// Exponer en window para que index.html (script clásico) y los onclick
// inline del HTML (ej. onclick="eliminarOrden('${o.id}')") las sigan
// llamando exactamente igual que antes.
window.cargarOrdenesLocal = cargarOrdenesLocal;
window.cargarOrdenes = cargarOrdenes;
window.guardarOrden = guardarOrden;
window.eliminarOrden = eliminarOrden;
