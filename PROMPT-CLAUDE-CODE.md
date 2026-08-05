# Prompt para Claude Code

Copiá y pegá esto en Claude Code, parado dentro de la carpeta `malla-unca/`.

---

Estoy trabajando en un tracker de mi malla curricular (Ingeniería en Informática, UNCA,
Plan 2010). Ya está construida la base, funcionando y probada. Es **HTML + CSS + JavaScript
puro con ES modules**, sin frameworks, sin build, sin backend. Se publica en GitHub Pages y
guarda el progreso de cada usuario en `localStorage`. Quiero que **mantengas estas
restricciones** (nada de React, ni bundlers, ni dependencias nuevas, ni servidor).

Antes de tocar nada, leé estos archivos para entender la arquitectura:
- `PLAN.md` — visión, decisiones, modelo de datos y estados, y la lista de tareas pendientes.
- `js/data/malla.js` — las 84 materias (correlatividades por código KTII0XX).
- `js/core/rules.js`, `js/core/state.js`, `js/core/storage.js` — la lógica (no toca el DOM).
- `js/ui/*.js` — la interfaz (se redibuja desde el estado).

Reglas que quiero que respetes:
1. La capa de **lógica** (`js/core/`) no debe importar nada de la UI ni tocar el DOM.
2. Las correlatividades se referencian **siempre por código**, nunca por nombre.
3. Mantené el estilo modular: una responsabilidad por archivo. Si agregás una feature nueva,
   creá su propio módulo en lugar de inflar `main.js`.
4. Usá las variables de `css/tokens.css` para cualquier color/medida nueva (nada hardcodeado).
5. No rompas la accesibilidad existente (foco por teclado, Enter/Espacio, `prefers-reduced-motion`).

Tareas que quiero hacer en este orden (confirmá conmigo antes de cada una):

1. **Buscador + filtros**: una barra para buscar materia por nombre o código, y chips para
   filtrar por área (CI/CB/AI/CO) y por estado (aprobada/habilitada/disponible/bloqueada).
   Las tarjetas que no matchean se atenúan (reusá el estilo `.atenuada` que ya existe).

2. **Menú de estado explícito** por tarjeta: en vez de solo ciclar con click, que al
   hacer click se abra un mini menú con las opciones (Pendiente / Habilitada p/ final /
   Aprobada). Dejá el ciclo con click como alternativa si querés, pero el menú es lo principal.

3. **Modo oscuro**: un botón que alterne tema. Aprovechá que casi todo está en `tokens.css`;
   definí los valores oscuros y alterná con un atributo en `<html>`. Guardá la preferencia.

Después de cada cambio, levantá un server local (`python3 -m http.server`) y verificá que no
haya errores de consola antes de pasar a la siguiente tarea.

---
