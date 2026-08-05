/**
 * main.js — Punto de entrada. Conecta el estado con la interfaz.
 * Estrategia simple: re-render completo en cada cambio (84 tarjetas, es instantáneo).
 */

import { suscribir, getProgreso, getSeleccion, getFiltros, setSeleccion } from "./core/state.js";
import { renderHeader } from "./ui/header.js";
import { renderToolbar } from "./ui/toolbar.js";
import { renderFiltros } from "./ui/filtros.js";
import { renderBoard } from "./ui/board.js";

const $header = document.getElementById("header");
const $toolbar = document.getElementById("toolbar");
const $filtros = document.getElementById("filtros");
const $board = document.getElementById("board");

// La barra de herramientas y los filtros no se re-dibujan: se montan una vez.
// (Si los filtros se re-renderizaran, el input perdería el foco al escribir.)
renderToolbar($toolbar);
renderFiltros($filtros);

function render() {
  const ctx = { progreso: getProgreso(), seleccion: getSeleccion(), filtros: getFiltros() };
  renderHeader($header, ctx);
  renderBoard($board, ctx);
}

// Re-render en cada cambio de estado.
suscribir(render);

// Click fuera de una tarjeta deselecciona (quita el resaltado).
document.addEventListener("click", (e) => {
  if (getSeleccion() && !e.target.closest(".card")) setSeleccion(null);
});

// Primer render.
render();
