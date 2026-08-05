/**
 * menu.js — Menú de estado explícito por tarjeta (popover singleton).
 *
 * Al hacer click (o Enter/Espacio) sobre una tarjeta se abre un menú con las
 * tres opciones de progreso; elegir una fija el estado con setEstado (sin ciclar,
 * para no "pasarse" sin querer). Se monta en <body>, no dentro de la tarjeta, así
 * el re-render del tablero no lo borra mientras está abierto.
 *
 * Accesibilidad: role="menu" + "menuitemradio", flechas para navegar,
 * Enter/Espacio elige, Escape cierra y devuelve el foco a la tarjeta,
 * click afuera o Tab cierra.
 */

import { el } from "./dom.js";
import { ESTADOS } from "../core/rules.js";
import { setEstado } from "../core/state.js";

const OPCIONES = [
  [ESTADOS.PENDIENTE, "Pendiente"],
  [ESTADOS.REGULAR, "Habilitada p/ final"],
  [ESTADOS.APROBADA, "Aprobada"],
];

let menuAbierto = null; // { nodo, codigo, anchor, onCerrar }

/** Cierra el menú activo (si hay). devolverFoco=false cuando el ancla ya no existe. */
export function cerrarMenu(devolverFoco = true) {
  if (!menuAbierto) return;
  const { nodo, anchor, onCerrar } = menuAbierto;
  document.removeEventListener("click", onCerrar, true);
  document.removeEventListener("keydown", alTeclearGlobal, true);
  nodo.remove();
  menuAbierto = null;
  if (devolverFoco && anchor && anchor.isConnected) anchor.focus();
}

function alTeclearGlobal(e) {
  if (e.key === "Escape") {
    e.preventDefault();
    cerrarMenu(true);
  } else if (e.key === "Tab") {
    cerrarMenu(false);
  }
}

/** Mueve el foco entre las opciones con las flechas. */
function navegar(items, actual, delta) {
  const i = items.indexOf(actual);
  const siguiente = (i + delta + items.length) % items.length;
  items[siguiente].focus();
}

/** Coloca el menú pegado al ancla, sin salirse del viewport. */
function posicionar(nodo, anchor) {
  const r = anchor.getBoundingClientRect();
  nodo.style.visibility = "hidden";
  document.body.append(nodo);
  const ancho = nodo.offsetWidth;
  const alto = nodo.offsetHeight;
  const margen = 6;

  let left = r.left;
  if (left + ancho > window.innerWidth - margen) left = window.innerWidth - ancho - margen;
  if (left < margen) left = margen;

  // Debajo de la tarjeta; si no entra, arriba.
  let top = r.bottom + margen;
  if (top + alto > window.innerHeight - margen) top = r.top - alto - margen;
  if (top < margen) top = margen;

  nodo.style.left = `${left}px`;
  nodo.style.top = `${top}px`;
  nodo.style.visibility = "";
}

/**
 * Abre el menú de estado para una materia.
 * @param codigo   código de la materia
 * @param estadoActual  estado de progreso actual ("pendiente"|"regular"|"aprobada")
 * @param anchor   elemento tarjeta (para posicionar y devolver el foco)
 */
export function abrirMenu(codigo, estadoActual, anchor) {
  cerrarMenu(false); // sólo un menú a la vez

  const items = [];
  const menu = el("div.estado-menu", {
    role: "menu",
    aria: { label: "Cambiar estado de la materia" },
  });

  OPCIONES.forEach(([valor, etiqueta]) => {
    const activo = valor === estadoActual;
    const item = el(
      "button.estado-menu-item",
      {
        type: "button",
        role: "menuitemradio",
        tabindex: "-1",
        aria: { checked: String(activo) },
        onclick: () => {
          setEstado(codigo, valor); // dispara re-render del tablero
          // El menú vive en <body>, sigue existiendo tras el re-render: lo cerramos.
          // El ancla original quedó reemplazada; enfocamos la tarjeta nueva por código.
          cerrarMenu(false);
          const nueva = document.querySelector(`.card[data-codigo="${codigo}"]`);
          if (nueva) nueva.focus();
        },
      },
      el("span.estado-menu-check", { "aria-hidden": "true" }, activo ? "✓" : ""),
      etiqueta
    );
    item.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); navegar(items, item, 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); navegar(items, item, -1); }
      else if (e.key === "Home") { e.preventDefault(); items[0].focus(); }
      else if (e.key === "End") { e.preventDefault(); items[items.length - 1].focus(); }
    });
    items.push(item);
    menu.append(item);
  });

  // Cierra al hacer click fuera del menú (en fase de captura para adelantarse a otros handlers).
  const onCerrar = (e) => {
    if (!menu.contains(e.target)) cerrarMenu(true);
  };

  menuAbierto = { nodo: menu, codigo, anchor, onCerrar };
  posicionar(menu, anchor);

  // Listeners globales en fase de captura. Se pueden enganchar ya mismo: el click
  // que abrió el menú se procesa en burbuja, cuando la captura en document ya pasó,
  // así que onCerrar no se dispara con su propio click de apertura.
  document.addEventListener("keydown", alTeclearGlobal, true);
  document.addEventListener("click", onCerrar, true);

  // Foco inicial: la opción activa (o la primera).
  (items.find((_, i) => OPCIONES[i][0] === estadoActual) || items[0]).focus();
}
