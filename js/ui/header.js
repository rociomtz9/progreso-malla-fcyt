/**
 * header.js — Cabecera con el resumen de avance y la barra de progreso.
 */

import { el, limpiar } from "./dom.js";
import { CARRERA } from "../data/malla.js";
import { calcularProgreso } from "../core/rules.js";

export function renderHeader(contenedor, { progreso }) {
  limpiar(contenedor);
  const p = calcularProgreso(progreso);

  const stat = (n, etiqueta, clase) =>
    el("div.stat." + clase, {}, el("span.stat-num", {}, n), el("span.stat-lbl", {}, etiqueta));

  contenedor.append(
    el(
      "div.head-top",
      {},
      el(
        "div.head-titulo",
        {},
        el("h1", {}, "Mi avance en la malla"),
        el("p.head-sub", {}, `${CARRERA.carrera} · Plan ${CARRERA.plan} · UNCA`)
      ),
      el(
        "div.head-pct",
        {},
        el("span.pct-num", {}, `${p.porcentaje}%`),
        el("span.pct-lbl", {}, `${p.aprobadas}/${p.total} materias`)
      )
    ),
    el(
      "div.barra",
      { title: `${p.porcentajeHoras}% de la carga horaria` },
      el("div.barra-fill", { style: `width:${p.porcentaje}%` })
    ),
    el(
      "div.stats",
      {},
      stat(p.aprobadas, "Aprobadas", "s-aprobada"),
      stat(p.regulares, "Habilitadas", "s-regular"),
      stat(p.disponibles, "Disponibles", "s-disponible"),
      stat(p.bloqueadas, "Bloqueadas", "s-bloqueada")
    )
  );
}
