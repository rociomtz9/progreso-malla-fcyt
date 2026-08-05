/**
 * filter.js — Lógica de búsqueda y filtrado (pura, sin DOM ni storage).
 *
 * Un criterio de filtro tiene tres partes que se combinan con AND:
 *   - texto:   subcadena a buscar en nombre o código (sin distinción de may/min ni acentos).
 *   - areas:   conjunto de áreas a incluir ("CI" | "CB" | "AI" | "CO"). Vacío = todas.
 *   - estados: conjunto de estados visuales a incluir. Vacío = todos.
 *
 * Dentro de un mismo grupo (áreas, estados) los valores suman con OR.
 * Una materia "coincide" si pasa los tres grupos.
 */

import { estadoVisual } from "./rules.js";

/** Criterio vacío: no filtra nada (todo coincide). */
export const FILTROS_VACIOS = { texto: "", areas: [], estados: [] };

/** Normaliza para comparar: minúsculas y sin acentos. */
function normalizar(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** ¿Hay algún criterio activo? (sirve para decidir si atenuar o no). */
export function hayFiltrosActivos({ texto, areas, estados } = FILTROS_VACIOS) {
  return Boolean(texto?.trim()) || (areas?.length ?? 0) > 0 || (estados?.length ?? 0) > 0;
}

/** ¿La materia coincide con el criterio, dado el progreso actual? */
export function coincide(materia, criterios, progreso) {
  const { texto, areas, estados } = criterios || FILTROS_VACIOS;

  if (texto?.trim()) {
    const q = normalizar(texto);
    const enNombre = normalizar(materia.nombre).includes(q);
    const enCodigo = normalizar(materia.codigo).includes(q);
    if (!enNombre && !enCodigo) return false;
  }

  if (areas?.length && !areas.includes(materia.area)) return false;

  if (estados?.length) {
    const ev = estadoVisual(materia.codigo, progreso);
    if (!estados.includes(ev)) return false;
  }

  return true;
}
