# Malla UNCA — Seguimiento de avance académico

Aplicación web para seguir el avance en la carrera de **Ingeniería en Informática**
(UNCA · FCyT · Plan 2010). Marcás las materias que aprobaste o tenés habilitadas para
final, y la app calcula sola —según las correlatividades— qué podés **cursar** y qué está
**bloqueado**. Además genera un **Excel** con tu seguimiento personalizado.

**▶ Demo en vivo: https://malla-unca.vercel.app**

Sin login, sin base de datos, sin servidor: cada persona guarda su progreso en su propio
navegador. Los datos **nunca salen del dispositivo**.

---

## ✨ Características

- **Tablero por semestres** con las 84 materias del plan, coloreadas por área (CI/CB/AI/CO).
- **Correlatividades automáticas:** al marcar materias aprobadas, la app recalcula qué queda
  disponible o bloqueado, y muestra qué falta aprobar para desbloquear cada una.
- **Resaltado del grafo:** al elegir una materia se ilumina toda su cadena de correlativas
  (lo que necesita hacia atrás y lo que habilita hacia adelante).
- **Buscador y filtros** por nombre, código, área y estado; lo que no coincide se atenúa.
- **Menú de estado por materia**, accesible por teclado, para fijar el estado sin equivocarse.
- **Exportación a Excel (.xlsx)** generada íntegramente en el navegador, con la columna de
  estado coloreada por formato condicional, lista desplegable y un bloque de resumen con fórmulas.
- **Modo claro / oscuro** con preferencia recordada y sin parpadeo al cargar.
- **Accesible:** navegación por teclado (Tab, Enter/Espacio, flechas, Escape), foco visible y
  respeto por `prefers-reduced-motion`.
- **Responsive:** en móvil las columnas se apilan.

## 🧱 Arquitectura

El código está separado en tres capas que no se mezclan, lo que mantiene la lógica testeable
y la interfaz simple:

```
datos  →  lógica  →  interfaz
```

- **Datos** (`js/data/malla.js`): las 84 materias. Única fuente de verdad. Las correlatividades
  se referencian **siempre por código** (`KTII0XX`), nunca por nombre (el PDF original tiene
  nombres inconsistentes; comparar por código elimina esa clase de bugs).
- **Lógica** (`js/core/`): reglas de correlatividades, estado y persistencia. **No conoce el
  DOM**, así que se puede probar con Node y reutilizar.
- **Interfaz** (`js/ui/`): se dibuja a partir del estado y no toma decisiones de negocio.

El estado central sigue un patrón *store + observer*: cuando cambia, la UI se vuelve a dibujar.
Cada feature vive en su propio módulo (una responsabilidad por archivo).

```
malla-unca/
├── index.html
├── vercel.json                Cabeceras de seguridad (CSP, HSTS, etc.)
├── css/
│   ├── tokens.css             Variables de diseño + tema oscuro
│   ├── base.css · layout.css · components.css · fonts.css
├── fonts/                     Tipografías auto-alojadas (sin terceros)
└── js/
    ├── data/malla.js          Las 84 materias (correlatividades por código)
    ├── core/                  Lógica pura, sin DOM
    │   ├── rules.js           Correlatividades y estados
    │   ├── state.js           Store + observer + filtros
    │   ├── storage.js         localStorage + descarga
    │   ├── filter.js          Búsqueda y filtrado
    │   ├── zip.js             Escritor ZIP (para el .xlsx)
    │   └── xlsx.js            Generador de Excel (OOXML)
    ├── ui/                    Interfaz (se redibuja desde el estado)
    │   ├── dom.js · card.js · board.js · header.js
    │   ├── toolbar.js · filtros.js · menu.js · tema.js
    ├── theme-init.js          Aplica el tema antes de pintar (anti-parpadeo)
    └── main.js                Conecta estado e interfaz
```

## 🔍 Puntos técnicos destacados

- **Generación de Excel sin dependencias.** Un `.xlsx` es un ZIP de archivos XML (formato
  OOXML). El proyecto lo arma desde cero en el navegador: `zip.js` escribe el contenedor ZIP
  (método *store* con checksum CRC32) y `xlsx.js` genera el XML de la hoja, los estilos, las
  celdas combinadas, el formato condicional y las validaciones —respetando el orden que exige
  el esquema (`mergeCells → conditionalFormatting → dataValidations`)—. Cero librerías.
- **Sin build ni bundler.** HTML + CSS + JavaScript con ES modules nativos. Se despliega tal
  cual, sin paso de compilación.
- **Privacidad y seguridad por diseño.** Los datos viven solo en `localStorage`; no hay backend
  ni analítica. Las tipografías están auto-alojadas (ninguna petición a terceros) y se aplica
  una **Content-Security-Policy** estricta (`default-src 'none'`, sin conexiones salientes ni
  scripts inline) junto con cabeceras de seguridad (HSTS, `X-Frame-Options`, `nosniff`,
  `Referrer-Policy`, `Permissions-Policy`) configuradas en `vercel.json`.
- **Lógica testeable.** Al no tocar el DOM, `js/core/` se ejecuta y valida con Node.

## 🛠️ Tecnologías

JavaScript (ES modules) · HTML · CSS · sin frameworks · sin dependencias · sin backend.
Desplegado en Vercel.

## 💻 Correrlo localmente

Al usar ES modules, **no funciona abriendo `index.html` con doble click** (protocolo
`file://`): hay que servirlo por http.

```bash
python3 -m http.server 8000
# luego abrir http://localhost:8000
```

(O en VS Code, la extensión **Live Server** → "Go Live".)

## ✏️ Modificar los datos

Toda la malla está en `js/data/malla.js`. Cada materia referencia sus prerrequisitos **por
código** (`KTII0XX`). Si cambia el plan de estudios, se edita solo ese archivo.
