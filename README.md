# ACETEC – Servicios técnicos

App para agendar servicios, ver la ruta del día, cerrar visitas con fotos y enviar el comprobante por WhatsApp o correo.
Se instala en el celular y en el computador, **funciona sin señal** y **sincroniza** entre todos los equipos cuando vuelve la conexión.
Todos los usuarios ven la agenda y el historial de visitas ya hechas, con el nombre del técnico que las hizo.

## Qué hace la app

- **Mi ruta**: servicios del día en orden, con *Cómo llegar* (Google Maps o Waze), llamada directa, aviso *En camino* por WhatsApp y *Cerrar servicio*.
- **Ubicación exacta**: pegando la ubicación que manda el cliente por WhatsApp, con el botón *Estoy aquí* o al cerrar el servicio.
- **Agenda** de 14 días con cupo de 6 servicios por técnico y barra de ocupación.
- **Nuevo servicio**: se pega el mensaje de WhatsApp y se llenan los datos solos; fotos del equipo.
- **Recibo en PDF** con logo y fotos, para enviar por WhatsApp o correo (Gmail / Outlook).
- **Avisos**: servicio que más lleva esperando, servicios realizados por el equipo (para el usuario principal), *va en camino*, *lo tiene abierto* (candado de 30 min) y *hecho por*.
- **Repuestos**, **Historial** y **Usuarios** (con correo y clave propios).
- Funciona **sin señal** y sincroniza entre celular y computador.

```
GitHub (código)  ──►  Vercel (publica la app)  ──►  celular / computador
                                                     │   ▲
                                                     ▼   │  sincroniza
                                     Google Sheets del cliente (datos) + Drive (fotos)
```

- **GitHub**: guarda el código.
- **Vercel**: publica la app en `https://acetec-servicios.vercel.app`. Cada cambio que se suba a GitHub se publica solo.
- **Google Sheets**: la hoja «ACETEC – Datos de la app» en la cuenta del cliente guarda los servicios (pestaña *Servicios*) y la configuración. Las fotos quedan en la carpeta de Drive «ACETEC – fotos de servicios».
- La app entra **sin clave**. Si algún día se quiere clave, se escribe en la pestaña *Ajustes* de la hoja (B1 correo, B2 clave).

---

## Conexión con Google Sheets

1. En la hoja: **Extensiones → Apps Script**, pegar `google/Codigo.gs` y guardar.
2. **Ejecutar** una vez y dar **Permitir** con la cuenta dueña de la hoja (si el Chrome tiene varias cuentas, hacerlo en una ventana de incógnito).
3. **Implementar → Nueva implementación → App web**, *Ejecutar como: Yo*, *Acceso: Cualquiera* → copiar la URL que termina en `/exec`.
4. En Vercel → *Settings → Environment Variables*: `SHEETS_URL` = esa URL → **Redeploy**.

Si se cambia el código del programa, hay que hacer **Implementar → Administrar implementaciones → editar → Nueva versión** para que la app use el cambio.

## Instalar

- **Android (Chrome)**: abre la dirección → **Instalar app** (o menú ⋮ → *Instalar aplicación*).
- **iPhone (Safari)**: **Compartir → Agregar a inicio**.
- **Computador (Chrome/Edge)**: ícono de instalar en la barra de direcciones.

---

## Cómo funciona la sincronización

- Todo lo que se hace (servicio nuevo, cambio, cierre con fotos) se guarda **primero en el equipo**.
- Con señal, se sube a la hoja de Google de inmediato; sin señal, queda en cola y arriba dice *"📴 Sin señal · N cambios guardados"*.
- Cada equipo baja los cambios de los demás al abrir la app, al volver la señal y cada 30 segundos mientras está abierta.
- Las fotos se suben a Drive y en el celular solo queda el enlace, así no se llena la memoria.
- Si dos personas editan el mismo servicio, queda la última versión guardada.
- La primera vez que se entra en un equipo se necesita señal.

## Hacer cambios a la app

Edita los archivos dentro de `public/` y súbelos a GitHub: Vercel publica solo.
**Importante:** sube el número en `public/sw.js` (por ejemplo `acetec-v12` → `acetec-v13`) para que los celulares reciban la nueva versión.

## Archivos

| Archivo | Para qué |
|---|---|
| `public/index.html` | La app completa |
| `public/sw.js` | Hace que la app abra sin señal |
| `public/manifest.webmanifest`, `icon-*.png` | Nombre e ícono al instalar |
| `scripts/generar-config.mjs` | Vercel lo usa para poner la dirección del programa de Google (`SHEETS_URL`) |
| `google/Codigo.gs` | Programa que va en la hoja de Google (Apps Script) |
| `vercel.json` | Configuración de Vercel |
