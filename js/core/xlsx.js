/**
 * xlsx.js — Genera el Excel de "Seguimiento de materias" para el usuario actual.
 * Puro (sin DOM): arma los XML del formato OOXML y los empaqueta con zip.js.
 *
 * Hoja "Plan de estudios" con la tabla de las 84 materias y una columna Estado que
 * refleja el estado calculado por la app (Aprobada / Habilitada p/ final /
 * Disponible / Bloqueada), coloreada por formato condicional. Más una columna libre
 * de Observaciones y un bloque RESUMEN con conteos, % y avance por curso.
 */

import { MATERIAS, CARRERA } from "../data/malla.js";
import { estadoVisual, ESTADOS_VISUALES } from "./rules.js";
import { crearZip } from "./zip.js";

const HOJA = "Plan de estudios";
const FILA0 = 4; // primera fila de datos
const FILAN = FILA0 + MATERIAS.length - 1; // última fila de datos (87)

// Etiquetas visibles de los 4 estados (mismo modelo que la app).
const ESTADO_ETIQUETA = {
  [ESTADOS_VISUALES.APROBADA]: "Aprobada",
  [ESTADOS_VISUALES.REGULAR]: "Habilitada p/ final",
  [ESTADOS_VISUALES.DISPONIBLE]: "Disponible",
  [ESTADOS_VISUALES.BLOQUEADA]: "Bloqueada",
};
// Orden para el resumen y los colores del formato condicional.
const ESTADOS_ORDEN = [
  ESTADOS_VISUALES.APROBADA,
  ESTADOS_VISUALES.REGULAR,
  ESTADOS_VISUALES.DISPONIBLE,
  ESTADOS_VISUALES.BLOQUEADA,
].map((e) => ESTADO_ETIQUETA[e]);

/** Estado calculado (visual) de una materia, como texto para la planilla. */
function estadoTexto(codigo, progreso) {
  return ESTADO_ETIQUETA[estadoVisual(codigo, progreso)];
}

/** Escapa texto para XML. */
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Índice de columna (1→A, 27→AA). */
function colLetra(n) {
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// ── Celdas ────────────────────────────────────────────────────────────────
// Cada celda: { texto } | { num } | { formula } con estilo `s` (índice en cellXfs).
const cellsPorFila = new Map();
function poner(col, fila, cell) {
  if (!cellsPorFila.has(fila)) cellsPorFila.set(fila, new Map());
  cellsPorFila.get(fila).set(col, cell);
}
function txt(col, fila, texto, s = 0) {
  poner(col, fila, { ref: colLetra(col) + fila, texto, s });
}
function num(col, fila, valor, s = 0) {
  poner(col, fila, { ref: colLetra(col) + fila, num: valor, s });
}
function fx(col, fila, formula, s = 0) {
  poner(col, fila, { ref: colLetra(col) + fila, formula, s });
}

/** Serializa una celda a XML. */
function celdaXML(c) {
  if (c.texto !== undefined) {
    return `<c r="${c.ref}" s="${c.s}" t="inlineStr"><is><t xml:space="preserve">${esc(c.texto)}</t></is></c>`;
  }
  if (c.formula !== undefined) {
    return `<c r="${c.ref}" s="${c.s}"><f>${esc(c.formula)}</f></c>`;
  }
  return `<c r="${c.ref}" s="${c.s}"><v>${c.num}</v></c>`;
}

/**
 * Construye el contenido de la hoja (sheet1.xml) volcando el progreso.
 * Estilos (índices en cellXfs, ver stylesXML):
 *   0 base · 1 título · 2 instrucciones · 3 encabezado tabla · 4 centro c/borde
 *   5 texto c/borde · 6 amarillo editable · 7 sección resumen · 8 encabezado resumen
 *   9 etiqueta resumen · 10 valor resumen (centro) · 11 porcentaje
 */
function construirHoja(progreso) {
  cellsPorFila.clear();

  // Fila 1: título (merged A1:H1). Fila 2: instrucciones (merged A2:H2).
  txt(1, 1, `${CARRERA.carrera} · UNCA · FCyT · Seguimiento de materias`, 1);
  txt(
    1,
    2,
    "El Estado refleja tu avance en la app y se colorea solo: Aprobada (verde), " +
      "Habilitada p/ final (violeta), Disponible (azul), Bloqueada (rojo). " +
      "Podés ajustarlo con la lista desplegable. Observaciones es texto libre.",
    2
  );

  // Fila 3: encabezados de la tabla.
  ["Curso", "Sem.", "Código", "Materia", "Área", "Hs.", "Estado", "Observaciones"].forEach(
    (h, i) => txt(i + 1, 3, h, 3)
  );

  // Filas 4..87: materias.
  MATERIAS.forEach((m, i) => {
    const f = FILA0 + i;
    num(1, f, m.curso, 4);
    num(2, f, m.semestre, 4);
    txt(3, f, m.codigo, 4);
    txt(4, f, m.nombre, 5);
    txt(5, f, m.area, 4);
    num(6, f, m.tchs, 4);
    txt(7, f, estadoTexto(m.codigo, progreso), 5); // Estado (color por formato condicional + dropdown)
    txt(8, f, "", 6); // Observaciones (amarillo, libre)
  });

  // ── Bloque RESUMEN (columnas J=10, K=11, L=12, M=13) ──────────────────────
  const G = `$G$${FILA0}:$G$${FILAN}`;
  const A = `$A$${FILA0}:$A$${FILAN}`;
  const C = `$C$${FILA0}:$C$${FILAN}`;

  txt(10, 3, "RESUMEN", 7); // J3:L3 merged
  txt(10, 4, "Estado", 8);
  txt(11, 4, "Cant.", 8);
  txt(12, 4, "%", 8);

  ESTADOS_ORDEN.forEach((e, i) => {
    const f = 5 + i;
    txt(10, f, e, 9); // etiqueta (coloreada por formato condicional, ver J5:J8)
    fx(11, f, `COUNTIF(${G},$J${f})`, 10);
    fx(12, f, `IFERROR($K${f}/$K$9,0)`, 11);
  });
  txt(10, 9, "TOTAL", 9);
  fx(11, 9, `COUNTA(${C})`, 10);
  fx(12, 9, "IFERROR(SUM(L5:L8),0)", 11);

  txt(10, 11, "AVANCE POR CURSO", 7); // J11:M11 merged
  txt(10, 12, "Curso", 8);
  txt(11, 12, "Aprob.", 8);
  txt(12, 12, "Total", 8);
  txt(13, 12, "%", 8);
  for (let curso = 1; curso <= 5; curso++) {
    const f = 12 + curso;
    num(10, f, curso, 10);
    fx(11, f, `COUNTIFS(${A},$J${f},${G},"Aprobada")`, 10);
    fx(12, f, `COUNTIF(${A},$J${f})`, 10);
    fx(13, f, `IFERROR($K${f}/$L${f},0)`, 11);
  }

  // ── Serializar filas ──────────────────────────────────────────────────────
  const filas = [...cellsPorFila.keys()].sort((a, b) => a - b);
  const filasXML = filas
    .map((f) => {
      const cols = [...cellsPorFila.get(f).keys()].sort((a, b) => a - b);
      const celdas = cols.map((col) => celdaXML(cellsPorFila.get(f).get(col))).join("");
      return `<row r="${f}">${celdas}</row>`;
    })
    .join("");

  const mergeRefs = ["A1:H1", "A2:H2", "J3:L3", "J11:M11"];
  const merges = mergeRefs.map((r) => `<mergeCell ref="${r}"/>`).join("");

  // Formato condicional: colorea cada estado (en la columna Estado y en la leyenda
  // del resumen J5:J8) según su valor. dxfId 0..3 = Aprobada/Habilitada/Disponible/Bloqueada.
  const cfSqref = `G${FILA0}:G${FILAN} J5:J8`;
  const conditional =
    `<conditionalFormatting sqref="${cfSqref}">` +
    ESTADOS_ORDEN.map(
      (e, i) =>
        `<cfRule type="cellIs" dxfId="${i}" priority="${i + 1}" operator="equal">` +
        `<formula>"${e}"</formula></cfRule>`
    ).join("") +
    `</conditionalFormatting>`;

  // Validación: solo la lista de estados en la columna Estado.
  const validaciones =
    `<dataValidations count="1">` +
    `<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" sqref="G${FILA0}:G${FILAN}">` +
    `<formula1>"${ESTADOS_ORDEN.join(",")}"</formula1></dataValidation>` +
    `</dataValidations>`;

  const cols =
    `<cols>` +
    `<col min="1" max="1" width="7" customWidth="1"/>` +
    `<col min="2" max="2" width="6" customWidth="1"/>` +
    `<col min="3" max="3" width="11" customWidth="1"/>` +
    `<col min="4" max="4" width="44" customWidth="1"/>` +
    `<col min="5" max="5" width="7" customWidth="1"/>` +
    `<col min="6" max="6" width="6" customWidth="1"/>` +
    `<col min="7" max="7" width="20" customWidth="1"/>` + // Estado
    `<col min="8" max="8" width="40" customWidth="1"/>` + // Observaciones
    `<col min="9" max="9" width="3" customWidth="1"/>` + // separador
    `<col min="10" max="10" width="20" customWidth="1"/>` + // RESUMEN etiqueta
    `<col min="11" max="11" width="9" customWidth="1"/>` +
    `<col min="12" max="13" width="8" customWidth="1"/>` +
    `</cols>`;

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<dimension ref="A1:M${FILAN}"/>` +
    `<sheetViews><sheetView workbookViewId="0"><pane ySplit="3" topLeftCell="A4" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` +
    `<sheetFormatPr defaultRowHeight="15"/>` +
    cols +
    `<sheetData>${filasXML}</sheetData>` +
    // OOXML exige este orden: mergeCells → conditionalFormatting → dataValidations.
    `<mergeCells count="${mergeRefs.length}">${merges}</mergeCells>` +
    conditional +
    validaciones +
    `</worksheet>`
  );
}

// ── Archivos fijos del paquete OOXML ────────────────────────────────────────
const CONTENT_TYPES =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
  `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
  `<Default Extension="xml" ContentType="application/xml"/>` +
  `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
  `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
  `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
  `</Types>`;

const RELS =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
  `</Relationships>`;

const WORKBOOK =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ` +
  `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
  `<sheets><sheet name="${esc(HOJA)}" sheetId="1" r:id="rId1"/></sheets>` +
  `</workbook>`;

const WORKBOOK_RELS =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
  `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
  `</Relationships>`;

/**
 * Hoja de estilos. Fuentes, rellenos, bordes y formatos combinados en cellXfs,
 * cuyos índices usan las celdas vía el atributo `s`.
 */
const STYLES =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
  // Fuentes (0..6)
  `<fonts count="7">` +
  `<font><sz val="10"/><name val="Arial"/></font>` + // 0 base
  `<font><b/><sz val="10"/><name val="Arial"/></font>` + // 1 negrita
  `<font><b/><sz val="13"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>` + // 2 título
  `<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>` + // 3 encabezado
  `<font><sz val="9"/><color rgb="FF444444"/><name val="Arial"/></font>` + // 4 instrucciones
  `<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>` + // 5 sección resumen
  `<font><b/><sz val="10"/><color rgb="FF000000"/><name val="Arial"/></font>` + // 6 encabezado resumen
  `</fonts>` +
  // Rellenos (0,1 reservados; 2..5)
  `<fills count="6">` +
  `<fill><patternFill patternType="none"/></fill>` +
  `<fill><patternFill patternType="gray125"/></fill>` +
  `<fill><patternFill patternType="solid"><fgColor rgb="FF1F3864"/></patternFill></fill>` + // 2 título
  `<fill><patternFill patternType="solid"><fgColor rgb="FF2E5C8A"/></patternFill></fill>` + // 3 encabezado
  `<fill><patternFill patternType="solid"><fgColor rgb="FFFFF9E0"/></patternFill></fill>` + // 4 amarillo
  `<fill><patternFill patternType="solid"><fgColor rgb="FFEFEFEF"/></patternFill></fill>` + // 5 gris
  `</fills>` +
  // Bordes (0 ninguno, 1 fino)
  `<borders count="2">` +
  `<border><left/><right/><top/><bottom/><diagonal/></border>` +
  `<border>` +
  `<left style="thin"><color rgb="FFD0D0D0"/></left><right style="thin"><color rgb="FFD0D0D0"/></right>` +
  `<top style="thin"><color rgb="FFD0D0D0"/></top><bottom style="thin"><color rgb="FFD0D0D0"/></bottom><diagonal/>` +
  `</border>` +
  `</borders>` +
  `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
  // cellXfs (índices usados por `s`)
  `<cellXfs count="12">` +
  `<xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>` + // 0 base
  `<xf numFmtId="0" fontId="2" fillId="2" borderId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>` + // 1 título
  `<xf numFmtId="0" fontId="4" fillId="0" borderId="0" applyFont="1" applyAlignment="1"><alignment wrapText="1" vertical="center"/></xf>` + // 2 instrucciones
  `<xf numFmtId="0" fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>` + // 3 encabezado
  `<xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf>` + // 4 centro c/borde
  `<xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyBorder="1"/>` + // 5 texto c/borde
  `<xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyFill="1" applyBorder="1"/>` + // 6 amarillo
  `<xf numFmtId="0" fontId="5" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>` + // 7 sección
  `<xf numFmtId="0" fontId="6" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf>` + // 8 encabezado resumen
  `<xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyBorder="1"/>` + // 9 etiqueta resumen
  `<xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf>` + // 10 valor centro
  `<xf numFmtId="9" fontId="0" fillId="0" borderId="1" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf>` + // 11 porcentaje
  `</cellXfs>` +
  `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>` +
  // dxfs: colores del formato condicional por estado (0..3).
  // En dxf el relleno se define con <bgColor>. Aprobada/Habilitada/Disponible/Bloqueada.
  `<dxfs count="4">` +
  `<dxf><font><color rgb="FF2E6E66"/></font><fill><patternFill><bgColor rgb="FFE3EFED"/></patternFill></fill></dxf>` +
  `<dxf><font><color rgb="FF5B53C9"/></font><fill><patternFill><bgColor rgb="FFE7E5F7"/></patternFill></fill></dxf>` +
  `<dxf><font><color rgb="FF2E7CC2"/></font><fill><patternFill><bgColor rgb="FFDCEAF6"/></patternFill></fill></dxf>` +
  `<dxf><font><color rgb="FFB0413E"/></font><fill><patternFill><bgColor rgb="FFF7E4E4"/></patternFill></fill></dxf>` +
  `</dxfs>` +
  `</styleSheet>`;

/**
 * Genera el .xlsx del seguimiento para el progreso dado.
 * Devuelve un Blob listo para descargar (o Uint8Array en entornos sin Blob).
 */
export function generarSeguimientoXlsx(progreso) {
  const sheet = construirHoja(progreso || {});
  const zip = crearZip([
    { nombre: "[Content_Types].xml", contenido: CONTENT_TYPES },
    { nombre: "_rels/.rels", contenido: RELS },
    { nombre: "xl/workbook.xml", contenido: WORKBOOK },
    { nombre: "xl/_rels/workbook.xml.rels", contenido: WORKBOOK_RELS },
    { nombre: "xl/styles.xml", contenido: STYLES },
    { nombre: "xl/worksheets/sheet1.xml", contenido: sheet },
  ]);
  if (typeof Blob !== "undefined") {
    return new Blob([zip], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }
  return zip;
}
