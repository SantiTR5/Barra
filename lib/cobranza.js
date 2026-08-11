// Semáforo de la suscripción. Solo lee fechas: no cobra ni corta nada.

export const plataMes = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0,
  }).format(Number(n) || 0);

/* Las fechas se arman a mano en horario local. Si usáramos new Date("2026-09-12")
   el navegador la lee como UTC y en Argentina puede mostrar el día anterior. */
const aFecha = (iso) => {
  if (!iso) return null;
  const [a, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  return new Date(a, m - 1, d);
};

const hoy = () => {
  const h = new Date();
  return new Date(h.getFullYear(), h.getMonth(), h.getDate());
};

export const aISO = (f) =>
  `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;

/* Suma un mes a la fecha de vencimiento. Si el bar estaba vencido,
   corre desde hoy: no se le regalan los días que estuvo sin pagar. */
export function sumarMes(iso) {
  const base = aFecha(iso);
  const desde = !base || base < hoy() ? hoy() : base;
  const f = new Date(desde.getFullYear(), desde.getMonth() + 1, desde.getDate());
  return aISO(f);
}

export function estadoCobranza(iso) {
  const f = aFecha(iso);
  if (!f) return { clave: "sin", texto: "Sin fecha", detalle: "Cargá el vencimiento", color: "var(--tiza)", borde: "var(--linea)" };

  const dias = Math.round((f - hoy()) / 86400000);
  const cuando = f.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });

  if (dias < 0)
    return {
      clave: "vencido", dias,
      texto: dias === -1 ? "Vencido ayer" : `Vencido hace ${Math.abs(dias)} días`,
      detalle: `Venció el ${cuando}`, color: "#E39184", borde: "var(--vermut)",
    };

  if (dias === 0)
    return { clave: "hoy", dias, texto: "Vence hoy", detalle: `Vence el ${cuando}`, color: "#E39184", borde: "var(--vermut)" };

  if (dias <= 7)
    return {
      clave: "pronto", dias,
      texto: dias === 1 ? "Vence mañana" : `Vence en ${dias} días`,
      detalle: `Vence el ${cuando}`, color: "var(--bronce2)", borde: "var(--bronce)",
    };

  return { clave: "aldia", dias, texto: "Al día", detalle: `Vence el ${cuando}`, color: "var(--bronce2)", borde: "var(--linea)" };
}

export function resumen(locales) {
  const cuenta = { vencido: 0, pronto: 0, aldia: 0, sin: 0 };
  let porCobrar = 0;
  for (const l of locales) {
    const e = estadoCobranza(l.vence_el);
    const c = e.clave === "hoy" ? "vencido" : e.clave;
    cuenta[c] = (cuenta[c] || 0) + 1;
    if (c === "vencido") porCobrar += Number(l.precio_mensual) || 0;
  }
  return { ...cuenta, porCobrar };
}
