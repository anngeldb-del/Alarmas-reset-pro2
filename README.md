# Alarmas-reset-pro2
Esta es la nueva versión

## Sincronización sin inicio de sesión

Por decisión explícita del dueño de los datos, esta app **ya no pide iniciar sesión con Google**. Todos los dispositivos leen y escriben la misma ruta compartida en Firestore (`usuarios/compartido/...`), protegida únicamente por las reglas del proyecto — no hay control de acceso por cuenta.

**Importante:** con esto, cualquier persona que conozca la configuración de Firebase de este proyecto puede leer y editar los datos. Se optó por esto deliberadamente para evitar los problemas de inicio de sesión (ventana emergente que se cerraba sola sin completar el login en el celular). El código de Firebase Authentication (Google Sign-In) fue eliminado por completo del proyecto — no queda ningún rastro de esa integración.

## Modo offline

La app funciona normalmente sin internet: lee la última copia conocida de los datos guardada en el dispositivo (persistencia offline nativa de Firestore, además de la cola de sincronización propia para las escrituras). Los cambios hechos sin conexión se suben solos en cuanto vuelve la señal.

## Correcciones incluidas en esta actualización

- Se quitó el inicio de sesión obligatorio y todo el código de Firebase Authentication que quedaba — decisión explícita para evitar bloqueos de login en algunos dispositivos.
- Se activó la persistencia offline de Firestore — antes, si no había red al abrir la app, la lista de órdenes/clientes/citas se quedaba vacía indefinidamente.
- Corregido un hueco de seguridad (XSS) en el nombre y garantía de producto al imprimir/compartir una boleta.
- Se agregó un límite contra doble envío al guardar una orden nueva (evitaba duplicados).
- Si falla el guardado de una cita, la pantalla ahora revierte al estado real en vez de quedar desincronizada.
