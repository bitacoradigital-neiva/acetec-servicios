// ACETEC – programa que conecta la app con esta hoja de cálculo.
// Va en la hoja: Extensiones → Apps Script. Se publica como «Aplicación web».
// La pestaña «Ajustes» guarda el correo (B1) y la clave (B2) para entrar a la app.

const HOJA_SERVICIOS = 'Servicios';
const HOJA_CONFIG = 'Config';
const HOJA_AJUSTES = 'Ajustes';
const CARPETA_FOTOS = 'ACETEC – fotos de servicios';
const COLS_SERVICIOS = ['id', 'modificado', 'updated_at', 'borrado', 'fecha', 'cliente', 'telefono',
  'direccion', 'producto', 'falla', 'estado', 'tecnico', 'total', 'datos (no editar)'];
const COLS_CONFIG = ['id', 'modificado', 'updated_at', 'datos (no editar)'];

function doGet() {
  return salida({ ok: true, app: 'ACETEC' });
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (x) { return salida({ ok: false, error: 'formato' }); }
  const cache = CacheService.getScriptCache();
  const fallos = Number(cache.get('fallos') || 0);
  if (fallos >= 15) return salida({ ok: false, error: 'bloqueado' });
  const ss = SpreadsheetApp.getActive();
  preparar(ss);
  const aj = ss.getSheetByName(HOJA_AJUSTES);
  const correo = String(aj.getRange('B1').getDisplayValue()).trim().toLowerCase();
  const clave = String(aj.getRange('B2').getDisplayValue());
  if (!correo || !clave || String(req.correo || '').trim().toLowerCase() !== correo || String(req.clave || '') !== clave) {
    cache.put('fallos', String(fallos + 1), 600);
    return salida({ ok: false, error: 'codigo' });
  }
  try {
    if (req.accion === 'probar') return salida({ ok: true });
    if (req.accion === 'bajar') return salida(Object.assign({ ok: true }, bajar(ss, Number(req.desde || 0))));
    if (req.accion === 'foto') return salida({ ok: true, dato: fotoComoDato(String(req.id || '')) });
    if (req.accion === 'subir') {
      const lock = LockService.getScriptLock();
      lock.waitLock(25000);
      try { return salida(Object.assign({ ok: true }, subir(ss, req.filas || []))); }
      finally { lock.releaseLock(); }
    }
    return salida({ ok: false, error: 'accion' });
  } catch (err) {
    return salida({ ok: false, error: 'servidor', detalle: String(err) });
  }
}

function salida(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Crea las pestañas y encabezados si no existen. También se puede ejecutar a mano.
function preparar(ss) {
  ss = ss || SpreadsheetApp.getActive();
  const crear = (nombre, cols) => {
    let h = ss.getSheetByName(nombre);
    if (!h) {
      h = ss.insertSheet(nombre);
      h.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold').setBackground('#020C22').setFontColor('#ffffff');
      h.setFrozenRows(1);
      h.getRange('A:Z').setNumberFormat('@');
    }
    return h;
  };
  crear(HOJA_SERVICIOS, COLS_SERVICIOS);
  crear(HOJA_CONFIG, COLS_CONFIG);
  let a = ss.getSheetByName(HOJA_AJUSTES);
  if (!a) {
    a = ss.insertSheet(HOJA_AJUSTES);
    a.getRange('A1:A3').setValues([['Correo para entrar a la app'], ['Clave para entrar a la app'], ['Escribe la clave en B2. Usa una clave propia de la app, no la de Gmail. Si la cambias, cada equipo la pedirá de nuevo.']]);
    a.getRange('B1:B2').setNumberFormat('@');
    a.getRange('B1').setValue(Session.getEffectiveUser().getEmail() || '');
    a.setColumnWidth(1, 220);
  }
}

function filasDe(h) {
  const n = h.getLastRow();
  if (n < 2) return [];
  return h.getRange(2, 1, n - 1, h.getLastColumn()).getValues();
}

function bajar(ss, desde) {
  let ahora = desde;
  const leer = (nombre, colDatos) => {
    const out = [];
    for (const f of filasDe(ss.getSheetByName(nombre))) {
      const mod = Number(f[1]) || 0;
      if (mod > desde) {
        try { out.push(JSON.parse(f[colDatos])); } catch (x) {}
        if (mod > ahora) ahora = mod;
      }
    }
    return out;
  };
  const config = leer(HOJA_CONFIG, 3);
  const servicios = leer(HOJA_SERVICIOS, 13);
  return { config, servicios, ahora };
}

function subir(ss, filas) {
  const hs = ss.getSheetByName(HOJA_SERVICIOS), hc = ss.getSheetByName(HOJA_CONFIG);
  const ahora = Date.now();
  const indice = h => { const m = {}; filasDe(h).forEach((f, i) => { m[String(f[0])] = { fila: i + 2, upd: Number(f[2]) || 0 }; }); return m; };
  const is = indice(hs), ic = indice(hc);
  const cfg = filasDe(hc).map(f => { try { return JSON.parse(f[3]); } catch (x) { return null; } }).find(x => x) || {};
  const nombreTec = id => ((cfg.users || []).find(u => u.id === id) || {}).nombre || '';
  const guardados = [];
  for (const f of filas) {
    const id = String(f.id || '');
    if (!id || !f.data) continue;
    const upd = Number(f.updated_at) || 0;
    if (f.tabla === 'config') {
      const actual = ic[id];
      if (actual && actual.upd > upd) { guardados.push({ id, tabla: 'config' }); continue; }
      const fila = [id, String(ahora), String(upd), JSON.stringify(f.data)];
      if (actual) hc.getRange(actual.fila, 1, 1, 4).setValues([fila]); else { hc.appendRow(fila); ic[id] = { fila: hc.getLastRow(), upd }; }
      guardados.push({ id, tabla: 'config' });
      continue;
    }
    const d = f.data;
    d.fotos = (d.fotos || []).map((x, i) => guardarFoto(x, id + '-antes-' + i));
    d.fotosFin = (d.fotosFin || []).map((x, i) => guardarFoto(x, id + '-fin-' + i));
    const actual = is[id];
    if (actual && actual.upd > upd) { guardados.push({ id, tabla: 'servicios', fotos: d.fotos, fotosFin: d.fotosFin }); continue; }
    const json = JSON.stringify(d);
    if (json.length > 49000) throw new Error('Servicio demasiado grande: ' + id);
    const total = (Number(d.mo) || 0) + (Number(d.vr) || 0);
    const fila = [id, String(ahora), String(upd), d.borrado ? 'sí' : '', d.fecha || '', d.cliente || '', d.tel || '',
      d.dir || '', d.producto || '', d.falla || '', d.borrado ? 'eliminado' : (d.estado || ''), nombreTec(d.tecnico),
      total ? String(total) : '', json];
    if (actual) hs.getRange(actual.fila, 1, 1, fila.length).setValues([fila]); else { hs.appendRow(fila); is[id] = { fila: hs.getLastRow(), upd }; }
    guardados.push({ id, tabla: 'servicios', fotos: d.fotos, fotosFin: d.fotosFin });
  }
  return { guardados, ahora };
}

function carpeta() {
  const it = DriveApp.getFoldersByName(CARPETA_FOTOS);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CARPETA_FOTOS);
}

// Las fotos se guardan en Google Drive; en la hoja queda solo el enlace.
function guardarFoto(valor, nombre) {
  const m = String(valor || '').match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
  if (!m) return valor;
  const blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], nombre + '.jpg');
  const archivo = carpeta().createFile(blob);
  archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://lh3.googleusercontent.com/d/' + archivo.getId() + '=w1000';
}

function fotoComoDato(url) {
  const m = url.match(/\/d\/([\w-]+)/);
  if (!m) return '';
  const b = DriveApp.getFileById(m[1]).getBlob();
  return 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes());
}
