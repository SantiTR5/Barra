// Los idiomas que puede ofrecer una carta.
// El español es la base: lo que no esté traducido se muestra en español.

export const IDIOMAS = {
  es: { nombre: "Español",    corto: "ES", sinStock: "sin stock", etiqueta: "Carta digital" },
  en: { nombre: "English",    corto: "EN", sinStock: "sold out",  etiqueta: "Digital menu" },
  pt: { nombre: "Português",  corto: "PT", sinStock: "esgotado",  etiqueta: "Cardápio digital" },
};

export const BASE = "es";
export const CLAVES = Object.keys(IDIOMAS);

/* Devuelve el texto en el idioma pedido, y si no existe cae al español.
   Esa caída es la función, no una falla: un bar puede traducir solo las
   descripciones y dejar los nombres de los platos en castellano. */
export function texto(fila, campo, idioma) {
  if (!fila) return "";
  const base = campo === "desc" ? fila.desc ?? fila.descripcion : fila[campo];
  if (idioma === BASE) return base || "";
  const t = fila.t || fila.traducciones || {};
  const traducido = t?.[idioma]?.[campo];
  return (traducido && String(traducido).trim()) || base || "";
}

/* Idioma sugerido según el celular de quien escanea.
   Un brasileño abre la carta y ya está en portugués, sin tocar nada. */
export function idiomaDelCelular(disponibles) {
  if (typeof navigator === "undefined") return BASE;
  const preferidos = navigator.languages || [navigator.language || ""];
  for (const p of preferidos) {
    const dos = String(p).slice(0, 2).toLowerCase();
    if (disponibles.includes(dos)) return dos;
  }
  return BASE;
}
