---
name: ui-modernizer
description: Audita y moderniza la capa visual de una interfaz existente sin tocar su lógica, respetando al 100% los colores de la marca. Úsala cuando pidan "modernizar", "pulir", "rediseñar" o "auditar el diseño" de una app o página ya construida.
---

# UI Modernizer

Moderniza cómo se ve una interfaz que ya funciona. La marca y la lógica son intocables; todo lo demás (jerarquía, espaciado, contraste, radios, sombras, estados interactivos) se puede mejorar.

## Reglas que no se negocian

1. **Identidad intacta.** Los colores de la marca se extraen del logo y de los tokens existentes, y se usan tal cual. Se pueden derivar tintes (más claros) y sombras (más oscuras) del mismo tono para fondos, bordes y estados, pero nunca se introduce un tono nuevo ni se reemplaza uno de la marca.
2. **Solo capa visual.** No cambiar nombres de funciones, ids, atributos `data-*`, `onclick`, estructura de datos, rutas, textos funcionales ni el orden de los pasos. Si un cambio visual requiere tocar el marcado, solo se agregan o cambian clases y envolturas neutras (`<div>`/`<span>`), y se verifica que ningún selector de JavaScript dependa de lo que se movió.
3. **Responsive y accesible.** Se valida en 390 px (móvil) y 1200 px (escritorio). Texto normal con contraste ≥ 4.5:1, texto grande y componentes ≥ 3:1. Áreas táctiles ≥ 44 px en móvil. Foco visible con teclado. `prefers-reduced-motion` respetado.
4. **Movimiento con propósito.** Solo transiciones que respondan a una acción (tocar, abrir, confirmar) o que marquen un cambio de estado. Duraciones de 120–300 ms. Nada de animaciones en bucle ni entradas en cada tarjeta al hacer scroll.

## Proceso

### 1. Extraer la marca
- Leer los colores del logo: agrupar los píxeles saturados por tono y tomar la mediana de cada grupo (ver `Anexo: extraer colores`). Anotar también el color de fondo del logo.
- Leer los tokens que ya existen en el CSS (`--variables`, clases utilitarias, colores sueltos).
- Comparar: si los tokens se desviaron del logo, se vuelven a alinear al logo.
- Definir los roles: primario, secundario, acento, fondo oscuro de marca, y los neutros. Los neutros se tiñen levemente hacia el tono primario en lugar de usar grises puros.
- Verificar contraste de cada combinación texto/fondo que se vaya a usar.

### 2. Auditar
Recorrer cada pantalla y anotar, con captura, problemas de:
- **Jerarquía:** ¿se distingue lo principal de lo secundario? ¿Cuántas acciones tienen el mismo peso visual?
- **Tipografía:** escala coherente (p. ej. 12 / 14 / 16 / 20 / 26 / 32), pesos, interlineado, largo de línea.
- **Espaciado:** escala de 4 px (4, 8, 12, 16, 24, 32, 48); márgenes y rellenos inconsistentes; estilos en línea que rompen la escala.
- **Contraste y color:** textos grises demasiado claros; colores fuera de marca.
- **Forma:** radios por jerarquía (contenedor > tarjeta > control > etiqueta), no uno solo para todo.
- **Profundidad:** sombras sutiles y teñidas con el color de marca, solo donde hay elevación real (menús, ventanas, barras fijas).
- **Estados:** hover, focus-visible, active, disabled, cargando, vacío, error.
- **Responsive:** desbordes, botones que se apilan en exceso, textos que se cortan.

### 3. Proponer el plan (antes de tocar código)
- Lista de colores de marca detectados, con su rol.
- Sistema de tokens propuesto: color, tipografía, espaciado, radios, sombras, movimiento.
- Mejoras por pantalla, en viñetas cortas.
- **Esperar la aprobación del usuario.**

### 4. Aplicar pantalla por pantalla
1. Primero los tokens globales (variables CSS) y los componentes base (botones, campos, etiquetas, tarjetas, ventanas).
2. Luego cada pantalla, en el orden de uso real.
3. Después de cada pantalla: captura en móvil y escritorio, revisión visual, y prueba de que sus acciones siguen funcionando.

### 5. Verificar
- Sin errores de JavaScript en consola.
- Las pruebas funcionales existentes siguen pasando (en este proyecto: sincronización, inicio de sesión, cierre de servicio, recibo PDF, candado de servicio abierto).
- Contraste comprobado con cálculo, no a ojo.
- `git diff` revisado: los cambios están en CSS, clases y envolturas visuales; no en la lógica.
- Si la app tiene service worker, subir su versión para que los equipos reciban el cambio.

## Anexo: extraer colores del logo

```python
from PIL import Image; import colorsys; from collections import Counter
im = Image.open("logo.png").convert("RGB").resize((200, 200))
hsv = lambda p: colorsys.rgb_to_hsv(*[x / 255 for x in p])
px = [p for p in im.getdata() if hsv(p)[1] > .55 and hsv(p)[2] > .45]
grupos = Counter(int(hsv(p)[0] * 12) for p in px)
for g, n in grupos.most_common(6):
    sel = sorted((p for p in px if int(hsv(p)[0] * 12) == g), key=sum)
    print(n, "#%02X%02X%02X" % sel[len(sel) // 2])
```

## Anexo: contraste

```js
const lum = h => { const c = h.match(/\w\w/g).map(x => parseInt(x, 16) / 255)
  .map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + .05) / (y + .05); };
```
