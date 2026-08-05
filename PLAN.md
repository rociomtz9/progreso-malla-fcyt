# PLAN — Tracker de Malla UNCA

Documento de trabajo del proyecto. Resume **qué decidimos**,
**qué quedó hecho hoy** y **qué falta / se puede agregar**.

---

## 1. Qué es y para quién

Una página web donde vos y tus compañeros de Ingeniería en Informática (UNCA, Plan 2010)
llevan el control de su avance en la carrera: marcan materias aprobadas y habilitadas
para final, y la página calcula sola qué pueden cursar y qué está bloqueado por
correlatividades.

Una sola página pública en GitHub Pages; cada visitante tiene su progreso privado en su navegador.

## 2. Decisiones técnicas (y por qué)

| Decisión | Por qué |
|---|---|
| **HTML + CSS + JavaScript puro** (sin React ni frameworks) | Cero build, despliega directo en GitHub Pages, fácil de leer y modificar para vos y tus compañeros. Si algún día crece mucho, se puede migrar; hoy no hace falta. |
| **ES modules** (import/export) | Modularidad real sin herramientas de compilación. Cada pieza en su archivo. |
| **`localStorage`, sin login ni base de datos** | Cada usuario guarda su progreso en su propio navegador. GitHub Pages solo sirve archivos estáticos, así que login implicaría un servicio externo (Firebase/Supabase) que no necesitamos. |
| **Exportar/Importar JSON** | Resuelve la portabilidad entre dispositivos sin cuentas. |
| **Correlatividades por código (KTII0XX)** | El PDF original tiene nombres inconsistentes ("Ingeniería de" vs "en" Software). Comparar por código elimina esos bugs. |

## 3. Arquitectura: datos → lógica → UI

La app está separada en tres capas que no se mezclan:

- **Datos** (`js/data/malla.js`): las 84 materias. Es la única fuente de verdad de la malla.
- **Lógica** (`js/core/`): reglas de correlatividades, estado y guardado. **No conoce el DOM.**
  Esto permite testearla con Node (como ya hicimos) y reusarla.
- **UI** (`js/ui/`): dibuja todo a partir del estado. **No toma decisiones de negocio.**

`main.js` los conecta: cuando el estado cambia, la UI se vuelve a dibujar.

## 4. Modelo de datos de una materia

```js
{
  codigo: "KTII040",
  nombre: "Lenguaje de Programación III",
  curso: 3, semestre: 5,
  area: "AI",            // CI | CB | AI | CO
  condicion: "OB",       // OB | OBC
  tchs: 80,              // carga horaria semestral
  prerequisitos: ["KTII031", "KTII029"], // por código
}
```

## 5. Estados de una materia

Hay dos clases de estado, y esto es clave:

**Estado que marca el usuario** (se guarda):
- `pendiente` → `regular` (habilitada para final) → `aprobada`

**Estado que calcula la app** (derivado de la malla, no se guarda):
- Una materia `pendiente` está **`disponible`** si todos sus prerrequisitos están `aprobada`;
  si no, está **`bloqueada`**.

El estado visual final que ve el usuario combina ambos:
`aprobada` · `regular` · `disponible` · `bloqueada`.

## 6. Qué quedó HECHO hoy ✅

- [x] Las **84 materias** cargadas y **validadas**: códigos únicos, todos los prerrequisitos
      existen, **sin ciclos**, y la carga horaria suma exactamente **4912 hs** (coincide con el plan).
- [x] Lógica de correlatividades completa (disponible/bloqueada, prereqs faltantes,
      cadena hacia arriba y hacia abajo, resumen de avance por materias y por horas).
- [x] Guardado en `localStorage` + exportar/importar JSON.
- [x] Interfaz completa: cabecera con % y barra de progreso, leyenda, tablero por semestres.
- [x] **Marcar estados** con click (cicla los tres estados).
- [x] **Resaltado de correlativas**: al tocar ⤳ se ilumina la cadena de una materia.
- [x] **Responsive** (móvil apila columnas) + accesibilidad (foco por teclado, Enter/Espacio,
      `prefers-reduced-motion`).
- [x] Probado en navegador real (sin errores de consola) y en vista móvil.

### Agregado después (features nuevas)

- [x] **Buscador + filtros** (`js/core/filter.js`, `js/ui/filtros.js`): barra de búsqueda por
      nombre o código (sin distinción de acentos/mayúsculas) y chips por área (CI/CB/AI/CO) y
      por estado. Las tarjetas que no coinciden se atenúan (`.atenuada`), combinándose con el
      resaltado de correlativas. La lógica de coincidencia es pura y testeable.
- [x] **Menú de estado explícito por tarjeta** (`js/ui/menu.js`): el click (o Enter/Espacio)
      abre un popover con Pendiente / Habilitada p/ final / Aprobada y fija el estado sin ciclar
      (evita "pasarse"). Accesible: `role=menu`/`menuitemradio`, flechas, Escape, click afuera,
      foco devuelto a la tarjeta. El ⤳ de correlativas sigue intacto.
- [x] **Exportar a Excel** (`js/core/zip.js`, `js/core/xlsx.js`): genera **en el navegador**
      (sin dependencias ni servidor) un `.xlsx` con el seguimiento: hoja "Plan de estudios",
      84 materias, columna **Estado** con los 4 estados de la app (Aprobada / Habilitada p/ final
      / Disponible / Bloqueada) **coloreados por formato condicional** (verde/violeta/azul/rojo),
      lista desplegable para ajustarlos, columna libre de Observaciones, y bloque RESUMEN con
      conteos, % y avance por curso. Un `.xlsx` es un ZIP de XML: `zip.js` escribe el ZIP (store +
      CRC32) y `xlsx.js` arma el OOXML (orden de esquema: mergeCells → conditionalFormatting →
      dataValidations). La columna Estado refleja el estado calculado (`estadoVisual`). Botón
      "Descargar Excel" en el toolbar.

## 7. Qué falta / ideas a futuro 🔜

Ordenadas por valor. No es obligatorio hacer todas; elegí según el tiempo.

1. **Modo oscuro** (ya está casi todo en variables CSS, sería rápido).  ← siguiente
2. **Líneas/flechas de correlatividad** dibujadas entre tarjetas (SVG) al seleccionar una materia,
   para que se vea el grafo como en la malla original.
3. **Vista por curso** (agrupar los 2 semestres de cada año) además de la vista por semestre.
4. **Sugerencia "qué cursar"**: resaltar automáticamente las disponibles del próximo semestre.
5. **Compartir avance por URL** (codificar el progreso en el link) como alternativa al JSON.
6. **PWA / offline**: que se pueda "instalar" y usar sin internet.

## 8. Cosas a verificar con la facultad (no técnico)

Estas correlatividades salieron del PDF del Plan 2010. Antes de difundirla entre compañeros,
conviene confirmar dos puntos con secretaría/reglamento:

- Si "habilitado para final" exige tener el prerrequisito **aprobado** o solo **regularizado**
  (la app hoy asume: para *cursar* se necesita el prereq **aprobado**).
- Proyecto Final de Grado figura "según reglamento de tesis"; quedó sin prereq codificado.
