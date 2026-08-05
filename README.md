# Malla UNCA — Seguimiento de avance

Tracker de la malla curricular de **Ingeniería en Informática** (UNCA · FCyT · Plan 2010).
Permite marcar materias como **aprobadas** o **habilitadas para final**, y muestra
automáticamente qué materias quedan **disponibles** o **bloqueadas** según las correlatividades.

Sin login, sin base de datos, sin servidor. Cada persona guarda su progreso en su
propio navegador (`localStorage`). Pensado para publicarse en **GitHub Pages**.

## Cómo usarlo

- **Click en una tarjeta** → cambia su estado: pendiente → habilitada p/ final → aprobada → pendiente.
- **Click en ⤳** (esquina de la tarjeta) → resalta sus correlativas: lo que necesita y lo que desbloquea.
- **Exportar / Importar progreso** → mové tu avance entre dispositivos con un archivo `.json`.
- **Reiniciar** → borra todo el progreso.

## Ver el proyecto en tu compu

Como usa módulos de JavaScript (ES modules), **no funciona abriendo el `index.html`
con doble click** (protocolo `file://`). Hay que servirlo por http. La forma más simple:

```bash
# Parado en la carpeta del proyecto:
python3 -m http.server 8000
# Después abrí http://localhost:8000 en el navegador
```

O en VS Code: instalá la extensión **Live Server** y hacé click en "Go Live".

## Publicar en GitHub Pages

1. Subí esta carpeta a un repositorio de GitHub.
2. En el repo: **Settings → Pages**.
3. En "Source" elegí la rama `main` y carpeta `/ (root)`.
4. Guardá. En 1–2 minutos queda online en
   `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO`.

(En GitHub Pages los módulos funcionan sin configurar nada, porque ya se sirve por https.)

## Estructura

```
malla-unca/
├── index.html              Punto de entrada (estructura vacía + carga de CSS/JS)
├── css/
│   ├── tokens.css          Variables de diseño (cambiar acá para retemear)
│   ├── base.css            Reset y tipografía
│   ├── layout.css          Cabecera, tablero, columnas, responsive
│   └── components.css      Tarjetas, estados, leyenda, botones
└── js/
    ├── data/malla.js       LAS 84 MATERIAS con prerrequisitos por código
    ├── core/
    │   ├── rules.js        Lógica de correlatividades (sin UI)
    │   ├── state.js        Estado central + observador
    │   └── storage.js      localStorage + exportar/importar
    ├── ui/
    │   ├── dom.js          Helper para crear elementos
    │   ├── card.js         Tarjeta de materia
    │   ├── board.js        Tablero (columnas por semestre)
    │   ├── header.js       Cabecera con progreso
    │   └── toolbar.js      Leyenda + acciones
    └── main.js             Conecta estado y UI

```

## Modificar los datos

Toda la malla está en `js/data/malla.js`. Cada materia referencia sus prerrequisitos
**por código** (`KTII0XX`), nunca por nombre. Si cambia el plan, se edita solo ese archivo.
