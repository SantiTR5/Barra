// Monograma automático para cada local.
// "Bar Don José" → DJ · "Café Ituzaingó" → CI · "La Esquina" → LE
//
// Descarta las palabras que describen el rubro, porque si no todos los
// bares tendrían la misma inicial y ningún monograma serviría.

const RELLENO = new Set([
  "bar", "cafe", "café", "resto", "restaurant", "restaurante", "cerveceria",
  "cervecería", "pizzeria", "pizzería", "parrilla", "bodegon", "bodegón",
  "el", "la", "los", "las", "de", "del", "y", "&", "don", "doña",
]);

export function monograma(nombre = "") {
  const palabras = String(nombre)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

  const fuertes = palabras.filter((p) => !RELLENO.has(p.toLowerCase()));
  const elegidas = fuertes.length ? fuertes : palabras;

  const letras = elegidas.slice(0, 2).map((p) => p[0].toUpperCase());
  if (letras.length === 1 && elegidas[0].length > 1) letras.push(elegidas[0][1].toUpperCase());
  return letras.join("") || "·";
}
