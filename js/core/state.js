/**
 * state.js — Estado central de la aplicación (patrón store + observer)
 *
 * Mantiene el progreso en memoria, lo persiste al cambiar, y avisa a quien
 * esté suscripto (la UI) para que vuelva a dibujar. La UI nunca toca
 * localStorage directamente: pasa siempre por acá.
 */

import { ESTADOS } from "./rules.js";
import { FILTROS_VACIOS } from "./filter.js";
import { cargar, guardar, reiniciar as borrarStorage } from "./storage.js";

const ORDEN_CICLO = [ESTADOS.PENDIENTE, ESTADOS.REGULAR, ESTADOS.APROBADA];

let progreso = cargar();
let seleccion = null; // código de la materia enfocada (para resaltar correlativas)
let filtros = { ...FILTROS_VACIOS }; // búsqueda/filtros activos (efímeros, no se persisten)
const oyentes = new Set();

function notificar() {
  oyentes.forEach((fn) => fn({ progreso, seleccion, filtros }));
}

/** Suscribe una función que se ejecuta en cada cambio. Devuelve la función para desuscribir. */
export function suscribir(fn) {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}

export function getProgreso() {
  return progreso;
}

export function getSeleccion() {
  return seleccion;
}

export function getFiltros() {
  return filtros;
}

/** Actualiza los filtros (merge parcial) y notifica para re-dibujar el tablero. */
export function setFiltros(parcial) {
  filtros = { ...filtros, ...parcial };
  notificar();
}

/** Fija el estado de una materia explícitamente. */
export function setEstado(codigo, estado) {
  if (estado === ESTADOS.PENDIENTE) delete progreso[codigo];
  else progreso[codigo] = estado;
  guardar(progreso);
  notificar();
}

/** Avanza una materia al siguiente estado: pendiente → regular → aprobada → pendiente. */
export function ciclarEstado(codigo) {
  const actual = progreso[codigo] || ESTADOS.PENDIENTE;
  const i = ORDEN_CICLO.indexOf(actual);
  const siguiente = ORDEN_CICLO[(i + 1) % ORDEN_CICLO.length];
  setEstado(codigo, siguiente);
}

/** Selecciona/deselecciona una materia para resaltar su cadena de correlativas. */
export function setSeleccion(codigo) {
  seleccion = seleccion === codigo ? null : codigo;
  notificar();
}

/** Borra todo el progreso. */
export function reiniciar() {
  progreso = {};
  borrarStorage();
  seleccion = null;
  notificar();
}
