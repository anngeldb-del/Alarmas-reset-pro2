# Alarmas-reset-pro2
Esta es la nueva versión

## Sincronización sin inicio de sesión

Por decisión explícita del dueño de los datos, esta app **ya no pide iniciar sesión con Google**. Todos los dispositivos leen y escriben la misma ruta compartida en Firestore (`usuarios/compartido/...`), protegida únicamente por las reglas del proyecto — no hay control de acceso por cuenta.

**Importante:** con esto, cualquier persona que conozca la configuración de Firebase de este proyecto puede leer y editar los datos. Se optó por esto deliberadamente para evitar los problemas de inicio de sesión (ventana emergente que se cerraba sola sin completar el login en el celular). Si en algún momento se quiere recuperar la protección por cuenta, se puede reactivar el flujo de login que ya existía antes de este cambio.

### Si alguna vez lograste iniciar sesión antes de este cambio

Si guardaste órdenes, clientes o citas con tu cuenta de Google en algún momento, sigue este orden para no perder nada (si nunca lograste entrar, no hay nada que copiar y puedes saltarte esto):

1. **Abre `migrar-compartido.html`** en el navegador.
2. **Inicia sesión con la cuenta de Google** que hayas usado antes en esta app.
3. Pulsa **"Copiar mis datos a modo sin login"**. Copia (no borra el original) tus órdenes, clientes, citas y registros de exportación a la ruta compartida `usuarios/compartido/...`.
4. En Firebase Console → tu proyecto → **Firestore Database → Reglas**, pega las reglas abiertas (ver `firestore.rules` en este repositorio, ya actualizado).
5. Abre la app normalmente — ya no pedirá iniciar sesión, en ningún dispositivo.

## Correcciones incluidas en esta actualización

- Se quitó el inicio de sesión obligatorio (ver arriba) — decisión explícita para evitar bloqueos de login en algunos dispositivos.
- Corregido: doble toque en "Iniciar sesión con Google" cancelaba el intento de login (`auth/cancelled-popup-request`).
- Corregido: el login con ventana emergente se abría y cerraba solo sin completarse en la app instalada; ahora usa redirección de página completa.
