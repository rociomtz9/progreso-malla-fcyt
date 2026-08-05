/**
 * toolbar.js — Leyenda de estados/áreas y acciones de progreso.
 */

import { el } from "./dom.js";
import { AREAS } from "../data/malla.js";
import { getProgreso, reiniciar } from "../core/state.js";
import { exportarExcel } from "../core/storage.js";

const LEYENDA_ESTADOS = [
  ["aprobada", "Aprobada"],
  ["regular", "Habilitada p/ final"],
  ["disponible", "Disponible"],
  ["bloqueada", "Bloqueada"],
];

export function renderToolbar(contenedor) {
  // Se dibuja una sola vez (no depende del estado).
  const leyendaEstados = el(
    "div.leyenda",
    {},
    el("span.leyenda-titulo", {}, "Estados"),
    ...LEYENDA_ESTADOS.map(([clase, txt]) =>
      el("span.leyenda-item", {}, el(`span.swatch.estado-${clase}`, {}), txt)
    )
  );

  const leyendaAreas = el(
    "div.leyenda",
    {},
    el("span.leyenda-titulo", {}, "Áreas"),
    ...Object.entries(AREAS).map(([cod, a]) =>
      el(
        "span.leyenda-item",
        { title: a.nombre },
        el("span.swatch", { style: `background:${a.color}` }),
        cod
      )
    )
  );

  const acciones = el(
    "div.acciones",
    {},
    el(
      "button.btn.btn-excel",
      { onclick: () => exportarExcel(getProgreso()), title: "Descargar tu seguimiento como planilla Excel (.xlsx)" },
      "Descargar Excel"
    ),
    el(
      "button.btn.btn-ghost",
      {
        onclick: () => {
          if (confirm("¿Borrar todo tu progreso? Esta acción no se puede deshacer.")) reiniciar();
        },
      },
      "Reiniciar"
    )
  );

  contenedor.append(leyendaEstados, leyendaAreas, acciones);
}
