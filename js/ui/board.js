/**
 * board.js — Dibuja el tablero completo: una columna por semestre.
 * Si hay una materia seleccionada, resalta su cadena de correlativas
 * (prerrequisitos hacia arriba + lo que desbloquea hacia abajo) y atenúa el resto.
 */

import { el, limpiar } from "./dom.js";
import { MATERIAS } from "../data/malla.js";
import { ancestros, descendientes } from "../core/rules.js";
import { coincide, hayFiltrosActivos } from "../core/filter.js";
import { crearCard } from "./card.js";

const SEMESTRES = [...new Set(MATERIAS.map((m) => m.semestre))].sort((a, b) => a - b);

function calcularCadena(seleccion) {
  if (!seleccion) return null;
  const set = new Set([seleccion]);
  ancestros(seleccion).forEach((c) => set.add(c));
  descendientes(seleccion).forEach((c) => set.add(c));
  return set;
}

export function renderBoard(contenedor, { progreso, seleccion, filtros }) {
  limpiar(contenedor);
  const cadena = calcularCadena(seleccion);
  const filtrando = hayFiltrosActivos(filtros);

  for (const sem of SEMESTRES) {
    const materias = MATERIAS.filter((m) => m.semestre === sem);
    const curso = materias[0].curso;

    const columna = el(
      "section.columna",
      {},
      el(
        "header.columna-head",
        {},
        el("span.columna-sem", {}, `Semestre ${sem}`),
        el("span.columna-curso", {}, `${curso}.º curso`)
      )
    );

    for (const m of materias) {
      const enCadena = cadena ? cadena.has(m.codigo) : false;
      // Se atenúa si queda fuera de la cadena resaltada, o si no coincide con los filtros.
      const fueraCadena = cadena ? !cadena.has(m.codigo) : false;
      const noCoincide = filtrando ? !coincide(m, filtros, progreso) : false;
      const atenuada = fueraCadena || noCoincide;
      columna.append(
        crearCard(m, progreso, {
          enCadena,
          atenuada,
          seleccionada: m.codigo === seleccion,
        })
      );
    }
    contenedor.append(columna);
  }
}
