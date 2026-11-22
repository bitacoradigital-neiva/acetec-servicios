// Vercel ejecuta esto al publicar: crea public/config.js con las variables de entorno.
import { writeFileSync } from 'node:fs';
const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_ANON_KEY || '';
if (!url || !key) console.warn('⚠️  Faltan SUPABASE_URL o SUPABASE_ANON_KEY en Vercel → Settings → Environment Variables');
writeFileSync('public/config.js',
  `window.ACETEC_CONFIG = ${JSON.stringify({ SUPABASE_URL: url, SUPABASE_ANON_KEY: key })};\n`);
console.log('config.js generado');
