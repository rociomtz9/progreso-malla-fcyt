/**
 * xlsx.js — Genera el Excel de "Seguimiento de materias" para el usuario actual.
 * Puro (sin DOM): arma los XML del formato OOXML y los empaqueta con zip.js.
 *
 * Replica la planilla personal: hoja "Plan de estudios" con la tabla de las 84
 * materias (con columnas amarillas editables: Estado, Nota 1, Nota 2, Observaciones),
 * validaciones (lista desplegable de estado; notas 1..5) y un bloque RESUMEN con
 * fórmulas (conteos, %, promedio y avance por curso).
 *
 * El estado del usuario en la app se vuelca a la columna "Estado":
 *   aprobada → "Aprobado" · regular → "A Final" · resto → "Por Cursar".
 * (El dropdown conserva "Cursando" para ajustarlo a mano en Excel si hace falta.)
 */

import { MATERIAS, CARRERA } from "../data/malla.js";
import { ESTADOS } from "./rules.js";
import { crearZip } from "./zip.js";

const HOJA = "Plan de estudios";
const FILA0 = 4; // primera fila de datos
const FILAN = FILA0 + MATERIAS.length - 1; // última fila de datos (87)

/** Mapea el progreso de la app al texto del dropdown de la planilla. */
function estadoTexto(codigo, progreso) {
  const e = progreso[codigo];
  if (e === ESTADOS.APROBADA) return "Aprobado";
  if (e === ESTADOS.REGULAR) return "A Final";
  return "Por Cursar";
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

  // Fila 1: título (merged A1:J1). Fila 2: instrucciones (merged A2:J2).
  txt(1, 1, `${CARRERA.carrera} · UNCA · FCyT · Seguimiento de materias`, 1);
  txt(
    1,
    2,
    "Completá solo las columnas amarillas: Estado (lista desplegable), Nota 1, Nota 2 y Observaciones.   " +
      "Nota 2 = segunda cursada/rendida cuando la primera fue aplazo.   Escala 1 a 5.   " +
      "Ejemplo: Estado = Aprobado · Nota 1 = 1 · Nota 2 = 4.",
    2
  );

  // Fila 3: encabezados de la tabla.
  ["Curso", "Sem.", "Código", "Materia", "Área", "Hs.", "Estado", "Nota 1", "Nota 2", "Observaciones"].forEach(
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
    txt(7, f, estadoTexto(m.codigo, progreso), 6); // Estado (amarillo, dropdown)
    txt(8, f, "", 6); // Nota 1 (amarillo)
    txt(9, f, "", 6); // Nota 2 (amarillo)
    txt(10, f, "", 6); // Observaciones (amarillo)
  });

  // ── Bloque RESUMEN (columnas L=12, M=13, N=14, O=15) ──────────────────────
  const G = `$G$${FILA0}:$G$${FILAN}`;
  const A = `$A$${FILA0}:$A$${FILAN}`;
  const C = `$C$${FILA0}:$C$${FILAN}`;
  const H = `$H$${FILA0}:$H$${FILAN}`;
  const I = `$I$${FILA0}:$I$${FILAN}`;

  txt(12, 3, "RESUMEN", 7); // L3:N3 merged
  txt(12, 4, "Estado", 8);
  txt(13, 4, "Cant.", 8);
  txt(14, 4, "%", 8);

  const estados = ["Aprobado", "A Final", "Cursando", "Por Cursar"];
  estados.forEach((e, i) => {
    const f = 5 + i;
    txt(12, f, e, 9);
    fx(13, f, `COUNTIF(${G},$L${f})`, 10);
    fx(14, f, `IFERROR($M${f}/$M$9,0)`, 11);
  });
  txt(12, 9, "TOTAL", 9);
  fx(13, 9, `COUNTA(${C})`, 10);
  fx(14, 9, "IFERROR(SUM(N5:N8),0)", 11);

  txt(12, 11, "PROMEDIO GENERAL", 7); // L11:N11 merged
  fx(
    12,
    12, // L12:N12 merged
    `IFERROR((SUMIF(${G},"Aprobado",${H})+SUMIF(${G},"Aprobado",${I}))/` +
      `(COUNTIFS(${G},"Aprobado",${H},">0")+COUNTIFS(${G},"Aprobado",${I},">0")),"—")`,
    9
  );
  txt(12, 13, "Notas computadas", 9);
  fx(13, 13, `COUNTIFS(${G},"Aprobado",${H},">0")+COUNTIFS(${G},"Aprobado",${I},">0")`, 10); // M13:N13 merged
  txt(12, 14, "Aplazos (notas 1)", 9);
  fx(13, 14, `COUNTIF(${H},1)+COUNTIF(${I},1)`, 10); // M14:N14 merged

  txt(12, 16, "AVANCE POR CURSO", 7); // L16:O16 merged
  txt(12, 17, "Curso", 8);
  txt(13, 17, "Aprob.", 8);
  txt(14, 17, "Total", 8);
  txt(15, 17, "%", 8);
  for (let curso = 1; curso <= 5; curso++) {
    const f = 17 + curso;
    num(12, f, curso, 10);
    fx(13, f, `COUNTIFS(${A},$L${f},${G},"Aprobado")`, 10);
    fx(14, f, `COUNTIF(${A},$L${f})`, 10);
    fx(15, f, `IFERROR($M${f}/$N${f},0)`, 11);
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

  const merges = [
    "A1:J1", "A2:J2",
    "L3:N3", "L11:N11", "L12:N12", "M13:N13", "M14:N14", "L16:O16",
  ]
    .map((r) => `<mergeCell ref="${r}"/>`)
    .join("");

  // Validaciones: dropdown de estado y notas 1..5.
  const validaciones =
    `<dataValidations count="2">` +
    `<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" sqref="G${FILA0}:G${FILAN}">` +
    `<formula1>"Aprobado,A Final,Cursando,Por Cursar"</formula1></dataValidation>` +
    `<dataValidation type="whole" allowBlank="1" showInputMessage="1" showErrorMessage="1" operator="between" sqref="H${FILA0}:I${FILAN}">` +
    `<formula1>1</formula1><formula2>5</formula2></dataValidation>` +
    `</dataValidations>`;

  const cols =
    `<cols>` +
    `<col min="1" max="1" width="7" customWidth="1"/>` +
    `<col min="2" max="2" width="6" customWidth="1"/>` +
    `<col min="3" max="3" width="11" customWidth="1"/>` +
    `<col min="4" max="4" width="44" customWidth="1"/>` +
    `<col min="5" max="5" width="7" customWidth="1"/>` +
    `<col min="6" max="6" width="6" customWidth="1"/>` +
    `<col min="7" max="7" width="13" customWidth="1"/>` +
    `<col min="8" max="9" width="9" customWidth="1"/>` +
    `<col min="10" max="10" width="46" customWidth="1"/>` +
    `<col min="11" max="11" width="3" customWidth="1"/>` +
    `<col min="12" max="12" width="18" customWidth="1"/>` +
    `<col min="13" max="13" width="10" customWidth="1"/>` +
    `<col min="14" max="15" width="8" customWidth="1"/>` +
    `</cols>`;

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<dimension ref="A1:O${FILAN}"/>` +
    `<sheetViews><sheetView workbookViewId="0"><pane ySplit="3" topLeftCell="A4" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` +
    `<sheetFormatPr defaultRowHeight="15"/>` +
    cols +
    `<sheetData>${filasXML}</sheetData>` +
    // OOXML exige este orden: mergeCells ANTES de dataValidations. Invertirlo hace
    // que Excel marque el archivo como dañado y lo "repare" (vaciándolo).
    `<mergeCells count="8">${merges}</mergeCells>` +
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
