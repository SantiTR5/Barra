// El estilo de la carta se arma con dos piezas independientes:
// los COLORES y la TIPOGRAFÍA. Antes venían pegadas en un solo "tema",
// y eso obligaba a un bodegón que quería letras de cartel a llevarse
// también los colores de pizarra.

export const PALETAS_CARTA = {
  papel:    { nombre: "Papel",    para: "Bodegón, parrilla, bar de barrio",
              v: { "--m-bg": "#ECE7DB", "--m-tinta": "#0D1614", "--m-suave": "#4A5B57",
                   "--m-acento": "#7A5A18", "--m-linea": "rgba(13,22,20,.32)" } },
  azulejo:  { nombre: "Azulejo",  para: "Café de barrio, panadería",
              v: { "--m-bg": "#F3F6F5", "--m-tinta": "#16323F", "--m-suave": "#5D7480",
                   "--m-acento": "#2E6E8E", "--m-linea": "rgba(22,50,63,.26)" } },
  blanco:   { nombre: "Blanco",   para: "Especialidad, brunch, local nuevo",
              v: { "--m-bg": "#FFFFFF", "--m-tinta": "#1B1B19", "--m-suave": "#8C8A84",
                   "--m-acento": "#B08968", "--m-linea": "rgba(27,27,25,.14)" } },
  bodega:   { nombre: "Bodega",   para: "Cantina, tabernas, cocina italiana",
              v: { "--m-bg": "#F0E7E0", "--m-tinta": "#2A1512", "--m-suave": "#6B4A44",
                   "--m-acento": "#8E3B2F", "--m-linea": "rgba(42,21,18,.26)" } },
  pizarra:  { nombre: "Pizarra",  para: "Cervecería, barra de tiradores",
              v: { "--m-bg": "#232726", "--m-tinta": "#F1EFE7", "--m-suave": "#A2A9A3",
                   "--m-acento": "#E8C46A", "--m-linea": "rgba(241,239,231,.28)" } },
  nocturno: { nombre: "Nocturno", para: "Coctelería, bar de noche",
              v: { "--m-bg": "#15121B", "--m-tinta": "#EFE9F2", "--m-suave": "#948CA0",
                   "--m-acento": "#7FD1C4", "--m-linea": "rgba(239,233,242,.16)" } },
  vermut:   { nombre: "Vermut",   para: "Vinoteca, vermutería",
              v: { "--m-bg": "#2A1116", "--m-tinta": "#F2E4DF", "--m-suave": "#B08A84",
                   "--m-acento": "#C98A4B", "--m-linea": "rgba(242,228,223,.22)" } },
};

export const TIPOGRAFIAS = {
  clasica: {
    nombre: "Clásica", para: "Serif de menú de toda la vida",
    puntos: true, portada: "regla",
    v: { "--m-display": "'Bodoni Moda',Didot,Georgia,serif",
         "--m-texto": "'Karla',Helvetica,sans-serif",
         "--m-precio": "'Roboto Mono',monospace",
         "--m-cat-size": "13px", "--m-cat-track": ".28em", "--m-cat-caja": "uppercase", "--m-cat-peso": "400",
         "--m-item-size": "17px", "--m-item-peso": "600", "--m-item-track": "0", "--m-item-caja": "none",
         "--m-align": "left", "--m-titulo": "30px", "--m-titulo-track": "0" },
  },
  cartel: {
    nombre: "Cartel", para: "Condensada, grande, tipo pizarrón",
    puntos: false, portada: "tiza",
    v: { "--m-display": "'Bebas Neue',Impact,sans-serif",
         "--m-texto": "'Karla',Helvetica,sans-serif",
         "--m-precio": "'Roboto Mono',monospace",
         "--m-cat-size": "17px", "--m-cat-track": ".2em", "--m-cat-caja": "uppercase", "--m-cat-peso": "400",
         "--m-item-size": "22px", "--m-item-peso": "400", "--m-item-track": ".02em", "--m-item-caja": "none",
         "--m-align": "left", "--m-titulo": "40px", "--m-titulo-track": ".04em" },
  },
  moderna: {
    nombre: "Moderna", para: "Sans geométrica, seca y actual",
    puntos: false, portada: "caja",
    v: { "--m-display": "'Space Grotesk',Helvetica,sans-serif",
         "--m-texto": "'Space Grotesk',Helvetica,sans-serif",
         "--m-precio": "'Space Grotesk',monospace",
         "--m-cat-size": "11px", "--m-cat-track": ".34em", "--m-cat-caja": "uppercase", "--m-cat-peso": "500",
         "--m-item-size": "16px", "--m-item-peso": "500", "--m-item-track": "0", "--m-item-caja": "none",
         "--m-align": "left", "--m-titulo": "26px", "--m-titulo-track": ".1em" },
  },
  editorial: {
    nombre: "Editorial", para: "Serif con remates, todo centrado",
    puntos: true, portada: "centro",
    v: { "--m-display": "'DM Serif Display',Georgia,serif",
         "--m-texto": "'Karla',Helvetica,sans-serif",
         "--m-precio": "'Roboto Mono',monospace",
         "--m-cat-size": "15px", "--m-cat-track": ".14em", "--m-cat-caja": "uppercase", "--m-cat-peso": "400",
         "--m-item-size": "18px", "--m-item-peso": "400", "--m-item-track": "0", "--m-item-caja": "none",
         "--m-align": "center", "--m-titulo": "32px", "--m-titulo-track": "0" },
  },
  minima: {
    nombre: "Mínima", para: "Sans chica, mucho aire, sin adornos",
    puntos: false, portada: "minimo",
    v: { "--m-display": "'Karla',Helvetica,sans-serif",
         "--m-texto": "'Karla',Helvetica,sans-serif",
         "--m-precio": "'Karla',sans-serif",
         "--m-cat-size": "10px", "--m-cat-track": ".3em", "--m-cat-caja": "uppercase", "--m-cat-peso": "700",
         "--m-item-size": "15px", "--m-item-peso": "700", "--m-item-track": "0", "--m-item-caja": "none",
         "--m-align": "left", "--m-titulo": "22px", "--m-titulo-track": ".16em" },
  },
};

export const CLAVES_PALETA_CARTA = Object.keys(PALETAS_CARTA);
export const CLAVES_TIPOGRAFIA = Object.keys(TIPOGRAFIAS);

/* Junta las dos piezas en el juego de variables que usa la carta. */
export function estiloDe(paleta, tipografia) {
  const p = PALETAS_CARTA[paleta] || PALETAS_CARTA.papel;
  const t = TIPOGRAFIAS[tipografia] || TIPOGRAFIAS.clasica;
  return { v: { ...p.v, ...t.v }, puntos: t.puntos, portada: t.portada };
}
