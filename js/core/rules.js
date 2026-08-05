/**
 * rules.js — Lógica de correlatividades (independiente de la UI y del guardado)
 *
 * Distingue dos tipos de estado:
 *   1. Estado que marca el usuario (progreso): "pendiente" | "regular" | "aprobada"
 *      - "regular" = habilitada para rendir el final (regularizó la cursada).
 *      - "aprobada" = aprobó el final.
 *   2. Estado DERIVADO por la malla: "disponible" | "bloqueada"
 *      - Una materia "pendiente" está "disponible" solo si TODOS sus
 *        prerrequisitos están "aprobada"; si no, está "bloqueada".
 *
 * El estado visual final combina ambos: "aprobada" | "regular" | "disponible" | "bloqueada".
 */

import { MATERIAS, POR_CODIGO } from "../data/malla.js";

export const ESTADOS = {
  PENDIENTE: "pendiente",
  REGULAR: "regular", // habilitada para final
  APROBADA: "aprobada",
};

export const ESTADOS_VISUALES = {
  APROBADA: "aprobada",
  REGULAR: "regular",
  DISPONIBLE: "disponible",
  BLOQUEADA: "bloqueada",
};

/** Grafo inverso: para cada código, qué materias lo tienen como prerrequisito. */
export const DESBLOQUEA = (() => {
  const mapa = {};
  MATERIAS.forEach((m) => (mapa[m.codigo] = []));
  MATERIAS.forEach((m) =>
    m.prerequisitos.forEach((p) => mapa[p]?.push(m.codigo))
  );
  return mapa;
})();

/** ¿La materia está aprobada según el progreso actual? */
export function estaAprobada(codigo, progreso) {
  return progreso[codigo] === ESTADOS.APROBADA;
}

/** Prerrequisitos que todavía NO están aprobados (devuelve códigos). */
export function prereqsFaltantes(codigo, progreso) {
  const m = POR_CODIGO[codigo];
  if (!m) return [];
  return m.prerequisitos.filter((p) => !estaAprobada(p, progreso));
}

/** ¿Se puede cursar? (todos los prereqs aprobados). Sin prereqs = siempre true. */
export function puedeCursar(codigo, progreso) {
  return prereqsFaltantes(codigo, progreso).length === 0;
}

/** Estado visual combinado de una materia. */
export function estadoVisual(codigo, progreso) {
  const estado = progreso[codigo] || ESTADOS.PENDIENTE;
  if (estado === ESTADOS.APROBADA) return ESTADOS_VISUALES.APROBADA;
  if (estado === ESTADOS.REGULAR) return ESTADOS_VISUALES.REGULAR;
  return puedeCursar(codigo, progreso)
    ? ESTADOS_VISUALES.DISPONIBLE
    : ESTADOS_VISUALES.BLOQUEADA;
}

/** Todos los prerrequisitos transitivos (cadena hacia arriba). */
export function ancestros(codigo, vistos = new Set()) {
  const m = POR_CODIGO[codigo];
  if (!m) return vistos;
  for (const p of m.prerequisitos) {
    if (!vistos.has(p)) {
      vistos.add(p);
      ancestros(p, vistos);
    }
  }
  return vistos;
}

/** Todo lo que esta materia habilita transitivamente (cadena hacia abajo). */
export function descendientes(codigo, vistos = new Set()) {
  for (const hijo of DESBLOQUEA[codigo] || []) {
    if (!vistos.has(hijo)) {
      vistos.add(hijo);
      descendientes(hijo, vistos);
    }
  }
  return vistos;
}

/** Resumen de avance para la cabecera. */
export function calcularProgreso(progreso) {
  let aprobadas = 0,
    regulares = 0,
    disponibles = 0,
    bloqueadas = 0,
    hsAprobadas = 0,
    hsTotal = 0;

  for (const m of MATERIAS) {
    hsTotal += m.tchs;
    switch (estadoVisual(m.codigo, progreso)) {
      case ESTADOS_VISUALES.APROBADA:
        aprobadas++;
        hsAprobadas += m.tchs;
        break;
      case ESTADOS_VISUALES.REGULAR:
        regulares++;
        break;
      case ESTADOS_VISUALES.DISPONIBLE:
        disponibles++;
        break;
      default:
        bloqueadas++;
    }
  }

  return {
    aprobadas,
    regulares,
    disponibles,
    bloqueadas,
    total: MATERIAS.length,
    hsAprobadas,
    hsTotal,
    porcentaje: Math.round((aprobadas / MATERIAS.length) * 100),
    porcentajeHoras: Math.round((hsAprobadas / hsTotal) * 100),
  };
}
