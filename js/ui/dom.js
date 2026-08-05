/**
 * dom.js — Helper mínimo para crear elementos sin innerHTML.
 * el("button.clase", { onclick }, "texto", otroHijo, ...)
 */
export function el(selector, props = {}, ...hijos) {
  const [tag, ...clases] = selector.split(".");
  const node = document.createElement(tag || "div");
  if (clases.length) node.className = clases.join(" ");

  for (const [k, v] of Object.entries(props || {})) {
    if (k === "onclick") node.addEventListener("click", v);
    else if (k === "dataset") Object.assign(node.dataset, v);
    else if (k === "aria") for (const [a, val] of Object.entries(v)) node.setAttribute(`aria-${a}`, val);
    else if (k in node) node[k] = v;
    else node.setAttribute(k, v);
  }

  for (const h of hijos.flat()) {
    if (h == null || h === false) continue;
    node.append(h.nodeType ? h : document.createTextNode(String(h)));
  }
  return node;
}

/** Vacía un contenedor. */
export function limpiar(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}
