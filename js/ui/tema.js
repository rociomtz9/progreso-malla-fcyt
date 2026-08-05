/**
 * tema.js — Alternar tema claro/oscuro y persistir la preferencia.
 *
 * El tema inicial ya lo fija theme-init.js (antes de pintar). Este módulo solo
 * maneja el botón de alternar en runtime: cambia el atributo data-theme en <html>,
 * guarda la elección y refleja el estado en el botón (aria-pressed).
 *
 * El ícono (sol/luna) lo dibuja el CSS según data-theme, así que el botón no
 * necesita reconstruirse al cambiar de tema.
 */

import { el } from "./dom.js";

const CLAVE = "malla-unca:tema:v1";
const SVG_NS = "http://www.w3.org/2000/svg";

/** Crea un nodo SVG con atributos (para íconos, sin innerHTML). */
function svg(tag, attrs, ...hijos) {
  const n = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  hijos.forEach((h) => n.append(h));
  return n;
}

const BASE_ICONO = {
  viewBox: "0 0 24 24",
  width: "18",
  height: "18",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
};

/** Ícono luna (se muestra en tema claro: "pasar a oscuro"). */
function iconoLuna() {
  const s = svg("svg", { ...BASE_ICONO, class: "icono-luna" });
  s.append(svg("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" }));
  return s;
}

/** Ícono sol (se muestra en tema oscuro: "pasar a claro"). */
function iconoSol() {
  const s = svg("svg", { ...BASE_ICONO, class: "icono-sol" });
  s.append(svg("circle", { cx: "12", cy: "12", r: "5" }));
  const rayos = [
    [12, 1, 12, 3], [12, 21, 12, 23], [1, 12, 3, 12], [21, 12, 23, 12],
    [4.2, 4.2, 5.6, 5.6], [18.4, 18.4, 19.8, 19.8],
    [4.2, 19.8, 5.6, 18.4], [18.4, 5.6, 19.8, 4.2],
  ];
  rayos.forEach(([x1, y1, x2, y2]) =>
    s.append(svg("line", { x1, y1, x2, y2 }))
  );
  return s;
}

function temaActual() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "oscuro" : "claro";
}

function aplicar(tema) {
  document.documentElement.setAttribute("data-theme", tema === "oscuro" ? "dark" : "light");
  try {
    localStorage.setItem(CLAVE, tema);
  } catch {
    /* incógnito: no se persiste, pero el tema igual cambia en esta sesión */
  }
}

/** Crea el botón de alternar tema (se monta una vez). */
export function crearToggleTema() {
  const boton = el(
    "button.tema-toggle",
    { type: "button", title: "Cambiar entre tema claro y oscuro" },
    iconoLuna(),
    iconoSol()
  );

  const sincronizar = () => {
    const oscuro = temaActual() === "oscuro";
    boton.setAttribute("aria-pressed", String(oscuro));
    boton.setAttribute("aria-label", oscuro ? "Activar tema claro" : "Activar tema oscuro");
  };

  boton.addEventListener("click", () => {
    aplicar(temaActual() === "oscuro" ? "claro" : "oscuro");
    sincronizar();
  });

  sincronizar();
  return boton;
}
