/**
 * card.js — Dibuja una tarjeta de materia.
 *
 * Interacción:
 *   - Click en la tarjeta (o Enter/Espacio) → abre el menú de estado explícito.
 *   - Click en el botón ⤳                    → resalta correlativas (prereqs + lo que desbloquea)
 */

import { el } from "./dom.js";
import { POR_CODIGO } from "../data/malla.js";
import { estadoVisual, prereqsFaltantes, ESTADOS, ESTADOS_VISUALES } from "../core/rules.js";
import { setSeleccion, getProgreso } from "../core/state.js";
import { abrirMenu } from "./menu.js";

const ETIQUETA_ESTADO = {
  [ESTADOS_VISUALES.APROBADA]: "Aprobada",
  [ESTADOS_VISUALES.REGULAR]: "Habilitada p/ final",
  [ESTADOS_VISUALES.DISPONIBLE]: "Disponible",
  [ESTADOS_VISUALES.BLOQUEADA]: "Bloqueada",
};

export function crearCard(materia, progreso, { enCadena, atenuada, seleccionada } = {}) {
  const ev = estadoVisual(materia.codigo, progreso);
  const faltantes = ev === ESTADOS_VISUALES.BLOQUEADA ? prereqsFaltantes(materia.codigo, progreso) : [];

  const clases = ["card", `area-${materia.area.toLowerCase()}`, `estado-${ev}`];
  if (enCadena) clases.push("en-cadena");
  if (atenuada) clases.push("atenuada");
  if (seleccionada) clases.push("seleccionada");

  const abrir = () => {
    const estadoActual = getProgreso()[materia.codigo] || ESTADOS.PENDIENTE;
    abrirMenu(materia.codigo, estadoActual, card);
  };

  const card = el(
    `article.${clases.join(".")}`,
    {
      dataset: { codigo: materia.codigo },
      onclick: abrir,
      aria: {
        label: `${materia.nombre}. Estado: ${ETIQUETA_ESTADO[ev]}. Click para cambiar el estado.`,
        haspopup: "menu",
      },
      role: "button",
      tabindex: "0",
    },
    el("span.card-area-bar", { title: materia.area }),
    el(
      "header.card-head",
      {},
      el("span.card-codigo", {}, materia.codigo),
      el(
        "button.card-link",
        {
          title: "Ver correlativas",
          onclick: (e) => {
            e.stopPropagation();
            setSeleccion(materia.codigo);
          },
        },
        "⤳"
      )
    ),
    el("h3.card-nombre", {}, materia.nombre),
    el("span.card-estado", {}, ETIQUETA_ESTADO[ev]),
    faltantes.length
      ? el(
          "p.card-faltantes",
          {},
          "Falta aprobar: ",
          faltantes.map((c) => POR_CODIGO[c]?.nombre).join(", ")
        )
      : materia.notaPrereq
      ? el("p.card-faltantes", {}, materia.notaPrereq)
      : null
  );

  // Soporte de teclado: Enter/Espacio abre el menú de estado.
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrir();
    }
  });

  return card;
}
