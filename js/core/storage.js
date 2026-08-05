/**
 * storage.js — Persistencia del progreso en el navegador (sin login, sin servidor)
 *
 * El progreso vive en localStorage, separado por usuario/navegador automáticamente.
 * No sale del dispositivo: el único egreso de datos es el Excel que el usuario
 * descarga a mano.
 */

import { generarSeguimientoXlsx } from "./xlsx.js";

const CLAVE = "malla-unca:progreso:v1";

/** Carga el progreso guardado. Devuelve {} si no hay nada o si está corrupto. */
export function cargar() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return {};
    const datos = JSON.parse(crudo);
    return datos && typeof datos === "object" ? datos : {};
  } catch {
    return {};
  }
}

/** Guarda el progreso completo. */
export function guardar(progreso) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(progreso));
    return true;
  } catch {
    return false; // ej. modo incógnito con storage deshabilitado
  }
}

/** Borra todo el progreso. */
export function reiniciar() {
  try {
    localStorage.removeItem(CLAVE);
    return true;
  } catch {
    return false;
  }
}

/** Dispara la descarga de un Blob con el nombre dado. */
function descargar(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

/** Genera y descarga el Excel de seguimiento de materias del usuario. */
export function exportarExcel(progreso) {
  const blob = generarSeguimientoXlsx(progreso);
  descargar(blob, `Seguimiento_Materias_UNCA_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
