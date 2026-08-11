// Formato de precios. Vive aparte para que la carta pública no tenga
// que cargar el cliente de la base de datos solo para mostrar un número.

export const plata = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);
