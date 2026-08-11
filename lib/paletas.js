// Paletas para la cartelería. Cada bar arranca con una distinta según
// su código, así dos stickers nunca salen iguales de fábrica. El
// administrador puede cambiarla a mano.
//
// El QR va siempre negro sobre blanco: eso no lo toca ninguna paleta.

export const PALETAS = {
  bronce:   { nombre: "Bronce",       bg: "#ECE7DB", tinta: "#0D1614", acento: "#7A5A18", suave: "#4A5B57" },
  bodega:   { nombre: "Bodega",       bg: "#F0E7E0", tinta: "#2A1512", acento: "#8E3B2F", suave: "#6B4A44" },
  ingles:   { nombre: "Verde inglés", bg: "#E9EDE7", tinta: "#14261E", acento: "#2E5D46", suave: "#4F6B5D" },
  marino:   { nombre: "Marino",       bg: "#E8ECF1", tinta: "#10203A", acento: "#2A4C7D", suave: "#566B87" },
  cobre:    { nombre: "Cobre",        bg: "#F3E9DC", tinta: "#2B1D12", acento: "#A45C2A", suave: "#6E5642" },
  vermut:   { nombre: "Vermut",       bg: "#2A1116", tinta: "#F2E4DF", acento: "#C98A4B", suave: "#B08A84" },
  nocturno: { nombre: "Nocturno",     bg: "#15121B", tinta: "#EFE9F2", acento: "#7FD1C4", suave: "#948CA0" },
  pizarra:  { nombre: "Pizarra",      bg: "#232726", tinta: "#F1EFE7", acento: "#E8C46A", suave: "#A2A9A3" },
};

export const CLAVES_PALETA = Object.keys(PALETAS);

/* Misma semilla, misma paleta: el sticker de un bar no cambia de color
   cada vez que abrís la pantalla. */
export function paletaDe(semilla = "") {
  let h = 2166136261;
  for (let i = 0; i < semilla.length; i++) {
    h ^= semilla.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return CLAVES_PALETA[h % CLAVES_PALETA.length];
}
