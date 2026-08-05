/**
 * filtros.js — Barra de búsqueda + chips de filtro (área y estado).
 *
 * Se dibuja UNA sola vez (como el toolbar): si se re-renderizara en cada cambio
 * de estado, el input perdería el foco mientras se escribe. Escribe en el store
 * vía setFiltros; el tablero reacciona y atenúa lo que no coincide.
 */

import { el } from "./dom.js";
import { AREAS } from "../data/malla.js";
import { ESTADOS_VISUALES } from "../core/rules.js";
import { getFiltros, setFiltros } from "../core/state.js";

const ESTADOS_FILTRO = [
  [ESTADOS_VISUALES.APROBADA, "Aprobada"],
  [ESTADOS_VISUALES.REGULAR, "Habilitada"],
  [ESTADOS_VISUALES.DISPONIBLE, "Disponible"],
  [ESTADOS_VISUALES.BLOQUEADA, "Bloqueada"],
];

/** Alterna un valor dentro de un grupo de filtros (areas | estados) y persiste en el store. */
function alternar(grupo, valor) {
  const actuales = getFiltros()[grupo];
  const nuevos = actuales.includes(valor)
    ? actuales.filter((v) => v !== valor)
    : [...actuales, valor];
  setFiltros({ [grupo]: nuevos });
}

/** Crea un chip-botón con estado aria-pressed sincronizado. */
function chip(grupo, valor, etiqueta, claseExtra = "") {
  const activo = getFiltros()[grupo].includes(valor);
  const boton = el(
    `button.chip${claseExtra ? "." + claseExtra : ""}`,
    {
      type: "button",
      aria: { pressed: String(activo) },
      onclick: () => {
        const ahoraActivo = !getFiltros()[grupo].includes(valor);
        boton.setAttribute("aria-pressed", String(ahoraActivo));
        boton.classList.toggle("chip-activo", ahoraActivo);
        alternar(grupo, valor);
      },
    },
    etiqueta
  );
  if (activo) boton.classList.add("chip-activo");
  return boton;
}

export function renderFiltros(contenedor) {
  const input = el("input.buscador-input", {
    type: "search",
    id: "buscador",
    placeholder: "Buscar por nombre o código…",
    autocomplete: "off",
    oninput: (e) => setFiltros({ texto: e.target.value }),
  });
  // keydown no necesario: input ya soporta teclado nativamente. Escape limpia.
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      input.value = "";
      setFiltros({ texto: "" });
    }
  });

  const buscador = el(
    "div.buscador",
    {},
    el("label.sr-only", { for: "buscador" }, "Buscar materia"),
    input
  );

  const grupoAreas = el(
    "div.filtro-grupo",
    {},
    el("span.filtro-titulo", {}, "Área"),
    ...Object.entries(AREAS).map(([cod]) => chip("areas", cod, cod, `chip-area-${cod.toLowerCase()}`))
  );

  const grupoEstados = el(
    "div.filtro-grupo",
    {},
    el("span.filtro-titulo", {}, "Estado"),
    ...ESTADOS_FILTRO.map(([valor, etiqueta]) => chip("estados", valor, etiqueta))
  );

  contenedor.append(buscador, grupoAreas, grupoEstados);
}
