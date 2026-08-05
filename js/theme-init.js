/**
 * theme-init.js — Aplica el tema ANTES de pintar, para evitar el parpadeo.
 *
 * Es un script clásico (no módulo) cargado de forma síncrona en el <head>: corre
 * antes de que se renderice el body. No es inline (lo prohíbe la CSP): vive en su
 * propio archivo servido desde el mismo origen.
 *
 * Preferencia: si el usuario eligió un tema, se respeta; si no, se usa el del sistema.
 * La clave y la lógica se comparten conceptualmente con ui/tema.js.
 */
(function () {
  try {
    var guardado = localStorage.getItem("malla-unca:tema:v1");
    var oscuro =
      guardado === "oscuro" ||
      (guardado === null &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.setAttribute("data-theme", oscuro ? "dark" : "light");
  } catch (e) {
    /* si localStorage falla (incógnito), se queda con el tema claro por defecto */
  }
})();
