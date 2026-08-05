/**
 * malla.js — Datos de la malla curricular
 * Carrera: Ingeniería en Informática · UNCA · FCyT · Plan 2010
 *
 * REGLA DE ORO: las correlatividades se referencian SIEMPRE por `codigo`
 * (KTII0XX), nunca por nombre. El PDF original tiene nombres inconsistentes
 * ("Ingeniería de" vs "en" Software, etc.); por eso acá el nombre es solo
 * para mostrar, y la lógica usa el código.
 *
 * Campos de cada materia:
 *   codigo        string  — identificador único (KTII0XX)
 *   nombre        string  — texto para mostrar
 *   curso         number  — año de la carrera (1..5)
 *   semestre      number  — semestre global (1..10)
 *   area          string  — "CI" | "CB" | "AI" | "CO"
 *   condicion     string  — "OB" (obligatoria) | "OBC" (obligatoria complementaria)
 *   tchs          number  — total carga horaria semestral (horas)
 *   prerequisitos string[] — códigos que deben estar APROBADOS para cursar
 *   notaPrereq    string?  — prerrequisito especial no codificable (ej. reglamento de tesis)
 */

export const AREAS = {
  CI: { nombre: "Ciencias de la Ingeniería", color: "#C2622E" },
  CB: { nombre: "Ciencias Básicas", color: "#D99A28" },
  AI: { nombre: "Aplicaciones de la Ingeniería", color: "#2E7CC2" },
  CO: { nombre: "Complementos de la Formación", color: "#4E9A5A" },
};

export const CARRERA = {
  universidad: "Universidad Nacional de Caaguazú",
  facultad: "Facultad de Ciencias y Tecnologías",
  carrera: "Ingeniería en Informática",
  plan: "2010",
  cargaHorariaTotal: 4912, // hs académicas (sin pasantía)
  pasantia: 400,
  totalConPasantia: 5312,
};

export const MATERIAS = [
  // ── CURSO 1 · SEMESTRE 1 ──────────────────────────────────────────
  { codigo: "KTII001", nombre: "Computación I", curso: 1, semestre: 1, area: "CI", condicion: "OB", tchs: 64, prerequisitos: [] },
  { codigo: "KTII002", nombre: "Electrónica I", curso: 1, semestre: 1, area: "CB", condicion: "OB", tchs: 64, prerequisitos: [] },
  { codigo: "KTII003", nombre: "Física I", curso: 1, semestre: 1, area: "CB", condicion: "OB", tchs: 80, prerequisitos: [] },
  { codigo: "KTII004", nombre: "Álgebra I", curso: 1, semestre: 1, area: "CB", condicion: "OB", tchs: 64, prerequisitos: [] },
  { codigo: "KTII005", nombre: "Cálculo I", curso: 1, semestre: 1, area: "CB", condicion: "OB", tchs: 96, prerequisitos: [] },
  { codigo: "KTII006", nombre: "Geometría Analítica y Vectorial", curso: 1, semestre: 1, area: "CB", condicion: "OB", tchs: 80, prerequisitos: [] },
  { codigo: "KTII007", nombre: "Diseño Técnico", curso: 1, semestre: 1, area: "CB", condicion: "OB", tchs: 48, prerequisitos: [] },
  { codigo: "KTII008", nombre: "Química", curso: 1, semestre: 1, area: "CB", condicion: "OBC", tchs: 48, prerequisitos: [] },
  { codigo: "KTII009", nombre: "Inglés I", curso: 1, semestre: 1, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: [] },
  { codigo: "KTII010", nombre: "Eventos y Deportes I", curso: 1, semestre: 1, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: [] },

  // ── CURSO 1 · SEMESTRE 2 ──────────────────────────────────────────
  { codigo: "KTII011", nombre: "Computación II", curso: 1, semestre: 2, area: "CI", condicion: "OB", tchs: 64, prerequisitos: ["KTII004"] },
  { codigo: "KTII012", nombre: "Informática I", curso: 1, semestre: 2, area: "CI", condicion: "OB", tchs: 64, prerequisitos: [] },
  { codigo: "KTII013", nombre: "Laboratorio I", curso: 1, semestre: 2, area: "CI", condicion: "OB", tchs: 64, prerequisitos: [] },
  { codigo: "KTII014", nombre: "Física II", curso: 1, semestre: 2, area: "CB", condicion: "OB", tchs: 80, prerequisitos: ["KTII003"] },
  { codigo: "KTII015", nombre: "Cálculo II", curso: 1, semestre: 2, area: "CB", condicion: "OB", tchs: 96, prerequisitos: ["KTII005"] },
  { codigo: "KTII016", nombre: "Álgebra II", curso: 1, semestre: 2, area: "CB", condicion: "OB", tchs: 64, prerequisitos: ["KTII004"] },
  { codigo: "KTII017", nombre: "Administración y Mercadotecnia", curso: 1, semestre: 2, area: "CO", condicion: "OBC", tchs: 48, prerequisitos: [] },
  { codigo: "KTII018", nombre: "Inglés II", curso: 1, semestre: 2, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: ["KTII009"] },
  { codigo: "KTII019", nombre: "Eventos y Deportes II", curso: 1, semestre: 2, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: ["KTII010"] },

  // ── CURSO 2 · SEMESTRE 3 ──────────────────────────────────────────
  { codigo: "KTII020", nombre: "Estructura de Datos I", curso: 2, semestre: 3, area: "CI", condicion: "OB", tchs: 64, prerequisitos: ["KTII012"] },
  { codigo: "KTII021", nombre: "Lenguaje de Programación I", curso: 2, semestre: 3, area: "AI", condicion: "OB", tchs: 80, prerequisitos: ["KTII011", "KTII013"] },
  { codigo: "KTII022", nombre: "Computación III", curso: 2, semestre: 3, area: "CI", condicion: "OB", tchs: 64, prerequisitos: ["KTII011"] },
  { codigo: "KTII023", nombre: "Física III", curso: 2, semestre: 3, area: "CB", condicion: "OB", tchs: 64, prerequisitos: ["KTII014"] },
  { codigo: "KTII024", nombre: "Probabilidades y Estadísticas", curso: 2, semestre: 3, area: "CB", condicion: "OB", tchs: 64, prerequisitos: ["KTII004"] },
  { codigo: "KTII025", nombre: "Cálculo III", curso: 2, semestre: 3, area: "CB", condicion: "OB", tchs: 96, prerequisitos: ["KTII015"] },
  { codigo: "KTII026", nombre: "Metodología de la Investigación I", curso: 2, semestre: 3, area: "CO", condicion: "OBC", tchs: 48, prerequisitos: [] },
  { codigo: "KTII027", nombre: "Expresión Oral y Escrita", curso: 2, semestre: 3, area: "CO", condicion: "OBC", tchs: 48, prerequisitos: [] },
  { codigo: "KTII028", nombre: "Eventos y Deportes III", curso: 2, semestre: 3, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: ["KTII019"] },

  // ── CURSO 2 · SEMESTRE 4 ──────────────────────────────────────────
  { codigo: "KTII029", nombre: "Bases de Datos I", curso: 2, semestre: 4, area: "CI", condicion: "OB", tchs: 80, prerequisitos: ["KTII004"] },
  { codigo: "KTII030", nombre: "Diseño de Sistemas Informáticos I", curso: 2, semestre: 4, area: "CI", condicion: "OB", tchs: 64, prerequisitos: [] },
  { codigo: "KTII031", nombre: "Lenguaje de Programación II", curso: 2, semestre: 4, area: "AI", condicion: "OB", tchs: 80, prerequisitos: ["KTII021"] },
  { codigo: "KTII032", nombre: "Taller de Hardware I", curso: 2, semestre: 4, area: "AI", condicion: "OB", tchs: 80, prerequisitos: ["KTII012"] },
  { codigo: "KTII033", nombre: "Contabilidad I", curso: 2, semestre: 4, area: "CO", condicion: "OB", tchs: 48, prerequisitos: [] },
  { codigo: "KTII034", nombre: "Derecho Intelectual y Laboral", curso: 2, semestre: 4, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: [] },
  { codigo: "KTII035", nombre: "Emprendedorismo", curso: 2, semestre: 4, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: [] },
  { codigo: "KTII036", nombre: "Inglés III", curso: 2, semestre: 4, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: ["KTII018"] },
  { codigo: "KTII037", nombre: "Eventos y Deportes IV", curso: 2, semestre: 4, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: ["KTII028"] },

  // ── CURSO 3 · SEMESTRE 5 ──────────────────────────────────────────
  { codigo: "KTII038", nombre: "Ingeniería de Software I", curso: 3, semestre: 5, area: "AI", condicion: "OB", tchs: 64, prerequisitos: ["KTII031"] },
  { codigo: "KTII039", nombre: "Investigación de Operaciones I", curso: 3, semestre: 5, area: "CB", condicion: "OB", tchs: 48, prerequisitos: ["KTII004"] },
  { codigo: "KTII040", nombre: "Lenguaje de Programación III", curso: 3, semestre: 5, area: "AI", condicion: "OB", tchs: 80, prerequisitos: ["KTII031", "KTII029"] },
  { codigo: "KTII041", nombre: "Redes de Computadoras I", curso: 3, semestre: 5, area: "CI", condicion: "OB", tchs: 64, prerequisitos: ["KTII012"] },
  { codigo: "KTII042", nombre: "Sistemas Operativos I", curso: 3, semestre: 5, area: "CI", condicion: "OB", tchs: 64, prerequisitos: ["KTII012"] },
  { codigo: "KTII043", nombre: "Taller de Hardware II", curso: 3, semestre: 5, area: "AI", condicion: "OB", tchs: 80, prerequisitos: ["KTII032"] },
  { codigo: "KTII044", nombre: "Matemática Aplicada", curso: 3, semestre: 5, area: "CB", condicion: "OB", tchs: 64, prerequisitos: ["KTII004"] },
  { codigo: "KTII045", nombre: "Idiomas I", curso: 3, semestre: 5, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: ["KTII036"] },
  { codigo: "KTII046", nombre: "Eventos y Deportes V", curso: 3, semestre: 5, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: ["KTII037"] },

  // ── CURSO 3 · SEMESTRE 6 ──────────────────────────────────────────
  { codigo: "KTII047", nombre: "Bases de Datos II", curso: 3, semestre: 6, area: "CI", condicion: "OB", tchs: 80, prerequisitos: ["KTII029"] },
  { codigo: "KTII048", nombre: "Estructuras de los Lenguajes", curso: 3, semestre: 6, area: "CI", condicion: "OB", tchs: 64, prerequisitos: ["KTII020"] },
  { codigo: "KTII049", nombre: "Lenguaje de Programación IV", curso: 3, semestre: 6, area: "AI", condicion: "OB", tchs: 80, prerequisitos: ["KTII040"] },
  { codigo: "KTII050", nombre: "Redes de Computadoras II", curso: 3, semestre: 6, area: "CI", condicion: "OB", tchs: 64, prerequisitos: ["KTII041"] },
  { codigo: "KTII051", nombre: "Sistemas Operativos II", curso: 3, semestre: 6, area: "CI", condicion: "OB", tchs: 64, prerequisitos: ["KTII042"] },
  { codigo: "KTII052", nombre: "Métodos Numéricos", curso: 3, semestre: 6, area: "CB", condicion: "OB", tchs: 64, prerequisitos: ["KTII016", "KTII025"] },
  { codigo: "KTII053", nombre: "Ética Profesional", curso: 3, semestre: 6, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: [] },
  { codigo: "KTII054", nombre: "Laboratorio de Idiomas I", curso: 3, semestre: 6, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: ["KTII045"] },
  { codigo: "KTII055", nombre: "Eventos y Deportes VI", curso: 3, semestre: 6, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: ["KTII046"] },

  // ── CURSO 4 · SEMESTRE 7 ──────────────────────────────────────────
  { codigo: "KTII056", nombre: "Ingeniería de Software II", curso: 4, semestre: 7, area: "AI", condicion: "OB", tchs: 80, prerequisitos: ["KTII038"] },
  { codigo: "KTII057", nombre: "Lenguaje de Programación V", curso: 4, semestre: 7, area: "AI", condicion: "OB", tchs: 80, prerequisitos: ["KTII049"] },
  { codigo: "KTII058", nombre: "Programación Web I", curso: 4, semestre: 7, area: "AI", condicion: "OB", tchs: 64, prerequisitos: ["KTII040", "KTII047"] },
  { codigo: "KTII059", nombre: "Seguridad en Redes", curso: 4, semestre: 7, area: "AI", condicion: "OB", tchs: 64, prerequisitos: ["KTII050"] },
  { codigo: "KTII060", nombre: "Gestión Gubernamental", curso: 4, semestre: 7, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: [] },
  { codigo: "KTII061", nombre: "Metodología de la Investigación II", curso: 4, semestre: 7, area: "CO", condicion: "OBC", tchs: 48, prerequisitos: ["KTII026"] },
  { codigo: "KTII062", nombre: "Idiomas II", curso: 4, semestre: 7, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: ["KTII045"] },
  { codigo: "KTII063", nombre: "Eventos y Deportes VII", curso: 4, semestre: 7, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: ["KTII055"] },

  // ── CURSO 4 · SEMESTRE 8 ──────────────────────────────────────────
  { codigo: "KTII064", nombre: "Ingeniería de Software III", curso: 4, semestre: 8, area: "AI", condicion: "OB", tchs: 80, prerequisitos: ["KTII056"] },
  { codigo: "KTII065", nombre: "Modelado de Datos", curso: 4, semestre: 8, area: "CI", condicion: "OB", tchs: 64, prerequisitos: ["KTII030"] },
  { codigo: "KTII066", nombre: "Programación Web II", curso: 4, semestre: 8, area: "AI", condicion: "OB", tchs: 64, prerequisitos: ["KTII058"] },
  { codigo: "KTII067", nombre: "Sistemas Distribuidos", curso: 4, semestre: 8, area: "CI", condicion: "OB", tchs: 64, prerequisitos: ["KTII051", "KTII050"] },
  { codigo: "KTII068", nombre: "Investigación de Operaciones II", curso: 4, semestre: 8, area: "CB", condicion: "OB", tchs: 48, prerequisitos: ["KTII039"] },
  { codigo: "KTII069", nombre: "Técnicas de Organización y Métodos", curso: 4, semestre: 8, area: "CO", condicion: "OB", tchs: 64, prerequisitos: [] },
  { codigo: "KTII070", nombre: "Laboratorio de Idiomas II", curso: 4, semestre: 8, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: ["KTII054"] },
  { codigo: "KTII071", nombre: "Eventos y Deportes VIII", curso: 4, semestre: 8, area: "CO", condicion: "OBC", tchs: 32, prerequisitos: ["KTII063"] },

  // ── CURSO 5 · SEMESTRE 9 ──────────────────────────────────────────
  { codigo: "KTII072", nombre: "Diseño de Algoritmos Paralelos", curso: 5, semestre: 9, area: "AI", condicion: "OB", tchs: 64, prerequisitos: ["KTII057", "KTII048", "KTII059"] },
  { codigo: "KTII073", nombre: "Evaluación de Rendimientos de Sistemas Informáticos", curso: 5, semestre: 9, area: "AI", condicion: "OB", tchs: 64, prerequisitos: ["KTII047", "KTII051", "KTII066", "KTII057"] },
  { codigo: "KTII074", nombre: "Gestión de Centros de Cómputos", curso: 5, semestre: 9, area: "AI", condicion: "OB", tchs: 64, prerequisitos: ["KTII064"] },
  { codigo: "KTII075", nombre: "Ingeniería de Software IV", curso: 5, semestre: 9, area: "AI", condicion: "OB", tchs: 64, prerequisitos: ["KTII064"] },
  { codigo: "KTII076", nombre: "Inteligencia Artificial", curso: 5, semestre: 9, area: "AI", condicion: "OB", tchs: 64, prerequisitos: ["KTII048", "KTII057"] },
  { codigo: "KTII077", nombre: "Gestión de Calidad y Productividad", curso: 5, semestre: 9, area: "CO", condicion: "OBC", tchs: 48, prerequisitos: [] },
  { codigo: "KTII078", nombre: "Metodología de la Investigación III", curso: 5, semestre: 9, area: "CO", condicion: "OBC", tchs: 48, prerequisitos: ["KTII061"] },

  // ── CURSO 5 · SEMESTRE 10 ─────────────────────────────────────────
  { codigo: "KTII079", nombre: "Gestión de Proyectos Informáticos", curso: 5, semestre: 10, area: "AI", condicion: "OB", tchs: 80, prerequisitos: ["KTII057", "KTII065"] },
  { codigo: "KTII080", nombre: "Diseño de Compiladores", curso: 5, semestre: 10, area: "AI", condicion: "OB", tchs: 64, prerequisitos: ["KTII048", "KTII057"] },
  { codigo: "KTII081", nombre: "Auditoría en Informática", curso: 5, semestre: 10, area: "AI", condicion: "OB", tchs: 64, prerequisitos: ["KTII073", "KTII074", "KTII075"] },
  { codigo: "KTII082", nombre: "Tecnología en Redes y Telecomunicaciones", curso: 5, semestre: 10, area: "AI", condicion: "OB", tchs: 64, prerequisitos: ["KTII050"] },
  { codigo: "KTII083", nombre: "Proyecto Final de Grado", curso: 5, semestre: 10, area: "AI", condicion: "OB", tchs: 64, prerequisitos: [], notaPrereq: "Según reglamento de tesis" },
  { codigo: "KTII084", nombre: "Contratos y Licitaciones", curso: 5, semestre: 10, area: "CO", condicion: "OBC", tchs: 48, prerequisitos: [] },
];

// Índice por código para acceso O(1) desde el resto de los módulos.
export const POR_CODIGO = Object.fromEntries(MATERIAS.map((m) => [m.codigo, m]));
