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
                                                 Supabase (datos)
```

- **GitHub**: guarda el código.
- **Vercel**: publica la app en una dirección como `acetec-servicios.vercel.app`. Cada cambio que se suba a GitHub se publica solo.
- **Supabase**: base de datos donde quedan los servicios, usuarios y recibos. Es lo que hace que el celular y el computador vean lo mismo.

---

## 1. Base de datos (Supabase) – una sola vez

1. Crea una cuenta en https://supabase.com → **New project** (`acetec`, región **São Paulo**). Guarda la clave de la base de datos.
2. **SQL Editor → New query**: pega el contenido de `base-de-datos.sql`.
   **Antes de ejecutarlo, cambia `CORREO_DE_JORGE@gmail.com` (al final) por el correo real de Jorge.** Luego **Run**.
3. **Authentication → Sign In / Providers → Email**: desactiva **Confirm email**.
4. **Authentication → Users → Add user**: correo de Jorge + clave, marca **Auto Confirm User**.
5. **Project Settings → API**: copia la **Project URL** y la **anon public key**.
   (Nunca uses la *service_role key*.)

## 2. Subir el código a GitHub

**Opción fácil (sin comandos):**
1. https://github.com/new → nombre `acetec-servicios` → **Private** → *Create repository*.
2. En la página del repo: **uploading an existing file** → arrastra **todo el contenido** de esta carpeta (incluida la carpeta `public` y `scripts`) → *Commit changes*.

**Opción con comandos (si tienes Git instalado):**
```bash
cd acetec-repo
git remote add origin https://github.com/TU_USUARIO/acetec-servicios.git
git push -u origin main
```
(La carpeta ya trae el primer commit hecho.)

## 3. Publicar con Vercel

1. https://vercel.com → entra con tu cuenta de **GitHub**.
2. **Add New → Project** → elige `acetec-servicios` → **Import**.
3. Despliega **Environment Variables** y agrega:
   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | la Project URL de Supabase |
   | `SUPABASE_ANON_KEY` | la anon public key |
4. **Deploy**. En un minuto queda en algo como `https://acetec-servicios.vercel.app`.

> Si cambias las variables después: Vercel → *Deployments* → ⋯ → **Redeploy**.

## 4. Instalar

- **Android (Chrome)**: abre la dirección → **Instalar app** (o menú ⋮ → *Instalar aplicación*).
- **iPhone (Safari)**: **Compartir → Agregar a inicio**.
- **Computador (Chrome/Edge)**: ícono de instalar en la barra de direcciones.

Entra con el correo y la clave de Jorge. Los demás usuarios (Usuario 2, Juliana, el muchacho del taller) se crean desde **⚙️ Usuarios** dentro de la app.

---

## Cómo funciona la sincronización

- Todo lo que se hace (servicio nuevo, cambio, cierre con fotos) se guarda **primero en el equipo**.
- Con señal, se sube a Supabase de inmediato; sin señal, queda en cola y arriba dice *"📴 Sin señal · N cambios guardados"*.
- Cada equipo baja los cambios de los demás al abrir la app, al volver la señal y cada 30 segundos mientras está abierta.
- Si dos personas editan el mismo servicio, queda la última versión guardada.
- La primera vez que se entra en un equipo se necesita señal.

## Hacer cambios a la app

Edita los archivos dentro de `public/` y súbelos a GitHub: Vercel publica solo.
**Importante:** sube el número en `public/sw.js` (`acetec-v1` → `acetec-v2`) para que los celulares reciban la nueva versión.

## Archivos

| Archivo | Para qué |
|---|---|
| `public/index.html` | La app completa |
| `public/sw.js` | Hace que la app abra sin señal |
| `public/manifest.webmanifest`, `icon-*.png` | Nombre e ícono al instalar |
| `public/vendor/supabase.js` | Conexión con la base de datos (incluida para que funcione sin internet) |
| `scripts/generar-config.mjs` | Vercel lo usa para poner las claves de Supabase |
| `base-de-datos.sql` | Crea las tablas y la seguridad en Supabase |
| `vercel.json` | Configuración de Vercel |
