// Los cinco estilos de carta. Cada uno es un juego de variables CSS
// que se aplica al contenedor del menú; el resto del código no cambia.

export const TEMAS = {
  papel: {
    nombre: "Papel",
    para: "Bar notable, parrilla, restaurante de barrio",
    puntos: true,
    portada: "regla",
    v: {
      "--m-bg": "#ECE7DB", "--m-tinta": "#0D1614", "--m-suave": "#4A5B57",
      "--m-acento": "#7A5A18", "--m-linea": "rgba(13,22,20,.32)",
      "--m-display": "'Bodoni Moda',Didot,Georgia,serif",
      "--m-texto": "'Karla',Helvetica,sans-serif",
      "--m-precio": "'Roboto Mono',monospace",
      "--m-cat-size": "13px", "--m-cat-track": ".28em", "--m-cat-peso": "400",
      "--m-item-size": "17px", "--m-item-peso": "600",
      "--m-align": "left", "--m-titulo": "30px", "--m-titulo-track": "0",
    },
  },
  pizarra: {
    nombre: "Pizarra",
    para: "Cervecería, barra de tiradores, food hall",
    puntos: false,
    portada: "tiza",
    v: {
      "--m-bg": "#232726", "--m-tinta": "#F1EFE7", "--m-suave": "#A2A9A3",
      "--m-acento": "#E8C46A", "--m-linea": "rgba(241,239,231,.28)",
      "--m-display": "'Bebas Neue',Impact,sans-serif",
      "--m-texto": "'Karla',Helvetica,sans-serif",
      "--m-precio": "'Roboto Mono',monospace",
      "--m-cat-size": "17px", "--m-cat-track": ".2em", "--m-cat-peso": "400",
      "--m-item-size": "22px", "--m-item-peso": "400",
      "--m-align": "left", "--m-titulo": "40px", "--m-titulo-track": ".04em",
    },
  },
  nocturno: {
    nombre: "Nocturno",
    para: "Coctelería, vinoteca, bar de noche",
    puntos: false,
    portada: "caja",
    v: {
      "--m-bg": "#15121B", "--m-tinta": "#EFE9F2", "--m-suave": "#948CA0",
      "--m-acento": "#7FD1C4", "--m-linea": "rgba(239,233,242,.16)",
      "--m-display": "'Space Grotesk',Helvetica,sans-serif",
      "--m-texto": "'Space Grotesk',Helvetica,sans-serif",
      "--m-precio": "'Space Grotesk',monospace",
      "--m-cat-size": "11px", "--m-cat-track": ".34em", "--m-cat-peso": "500",
      "--m-item-size": "16px", "--m-item-peso": "500",
      "--m-align": "left", "--m-titulo": "26px", "--m-titulo-track": ".1em",
    },
  },
  azulejo: {
    nombre: "Azulejo",
    para: "Café de barrio, bodegón, panadería",
    puntos: true,
    portada: "centro",
    v: {
      "--m-bg": "#F3F6F5", "--m-tinta": "#16323F", "--m-suave": "#5D7480",
      "--m-acento": "#2E6E8E", "--m-linea": "rgba(22,50,63,.26)",
      "--m-display": "'DM Serif Display',Georgia,serif",
      "--m-texto": "'Karla',Helvetica,sans-serif",
      "--m-precio": "'Roboto Mono',monospace",
      "--m-cat-size": "15px", "--m-cat-track": ".14em", "--m-cat-peso": "400",
      "--m-item-size": "18px", "--m-item-peso": "400",
      "--m-align": "center", "--m-titulo": "32px", "--m-titulo-track": "0",
    },
  },
  blanco: {
    nombre: "Blanco",
    para: "Café de especialidad, brunch, local nuevo",
    puntos: false,
    portada: "minimo",
    v: {
      "--m-bg": "#FFFFFF", "--m-tinta": "#1B1B19", "--m-suave": "#8C8A84",
      "--m-acento": "#B08968", "--m-linea": "rgba(27,27,25,.14)",
      "--m-display": "'Karla',Helvetica,sans-serif",
      "--m-texto": "'Karla',Helvetica,sans-serif",
      "--m-precio": "'Karla',sans-serif",
      "--m-cat-size": "10px", "--m-cat-track": ".3em", "--m-cat-peso": "700",
      "--m-item-size": "15px", "--m-item-peso": "700",
      "--m-align": "left", "--m-titulo": "22px", "--m-titulo-track": ".16em",
    },
  },
};

export const temaDe = (clave) => TEMAS[clave] || TEMAS.papel;
