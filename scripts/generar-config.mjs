// Vercel ejecuta esto al publicar: crea public/config.js con la dirección del programa de Google Sheets.
import { writeFileSync } from 'node:fs';
const url = process.env.SHEETS_URL || '';
if (!url) console.warn('⚠️  Falta SHEETS_URL en Vercel → Settings → Environment Variables');
writeFileSync('public/config.js', `window.ACETEC_CONFIG = ${JSON.stringify({ SHEETS_URL: url })};\n`);
console.log('config.js generado');
