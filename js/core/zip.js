/**
 * zip.js — Escritor ZIP mínimo (método "store", sin compresión). Puro, sin DOM.
 *
 * Suficiente para empaquetar un .xlsx (que no es más que un ZIP de archivos XML).
 * No comprime: los .xlsx admiten entradas "stored" y Excel/LibreOffice los abren igual.
 * Trabaja con bytes (Uint8Array); no depende del navegador salvo TextEncoder (estándar).
 */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const utf8 = (s) => new TextEncoder().encode(s);

/** Concatena varios Uint8Array en uno. */
function concat(chunks) {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out;
}

/** Escribe enteros little-endian de 2 y 4 bytes. */
function u16(n) {
  return new Uint8Array([n & 0xff, (n >>> 8) & 0xff]);
}
function u32(n) {
  return new Uint8Array([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
}

/**
 * Construye un ZIP a partir de una lista de { nombre, contenido }.
 * `contenido` puede ser string (se codifica UTF-8) o Uint8Array.
 * Devuelve un Uint8Array con el ZIP completo.
 */
export function crearZip(archivos) {
  const locales = [];
  const centrales = [];
  let offset = 0;

  for (const { nombre, contenido } of archivos) {
    const nombreBytes = utf8(nombre);
    const datos = typeof contenido === "string" ? utf8(contenido) : contenido;
    const crc = crc32(datos);
    const tam = datos.length;

    // Cabecera local (sin fecha real: 0). Bit 11 (0x800) marca nombre en UTF-8.
    const cabeceraLocal = concat([
      u32(0x04034b50),
      u16(20), // versión necesaria
      u16(0x0800), // flags: UTF-8
      u16(0), // método: store
      u16(0), u16(0), // hora, fecha
      u32(crc),
      u32(tam), // comprimido
      u32(tam), // sin comprimir
      u16(nombreBytes.length),
      u16(0), // extra
      nombreBytes,
    ]);

    locales.push(cabeceraLocal, datos);

    // Registro en el directorio central.
    centrales.push(
      concat([
        u32(0x02014b50),
        u16(20), // versión creador
        u16(20), // versión necesaria
        u16(0x0800), // flags: UTF-8
        u16(0), // método: store
        u16(0), u16(0), // hora, fecha
        u32(crc),
        u32(tam),
        u32(tam),
        u16(nombreBytes.length),
        u16(0), // extra
        u16(0), // comentario
        u16(0), // disco
        u16(0), // atributos internos
        u32(0), // atributos externos
        u32(offset), // desplazamiento a la cabecera local
        nombreBytes,
      ])
    );

    offset += cabeceraLocal.length + datos.length;
  }

  const dirCentral = concat(centrales);
  const inicioDir = offset;

  const fin = concat([
    u32(0x06054b50),
    u16(0), u16(0), // disco, disco del dir
    u16(archivos.length),
    u16(archivos.length),
    u32(dirCentral.length),
    u32(inicioDir),
    u16(0), // comentario
  ]);

  return concat([...locales, dirCentral, fin]);
}
