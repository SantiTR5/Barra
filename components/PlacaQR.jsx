"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { MARCA, BAJADA } from "@/lib/marca";
import { monograma } from "@/lib/logo";
import { PALETAS, CLAVES_PALETA, paletaDe } from "@/lib/paletas";

const FORMATOS = {
  redondo:   { nombre: "Sello redondo",   medida: "10 × 10 cm", px: 1400, alto: 1 },
  cuadrado:  { nombre: "Marco cuadrado",  medida: "10 × 10 cm", px: 1400, alto: 1 },
  doble:     { nombre: "Dos puertas",     medida: "10 × 10 cm", px: 1400, alto: 1 },
  posavasos: { nombre: "Posavasos",       medida: "10 × 10 cm", px: 1400, alto: 1 },
  tira:      { nombre: "Tira de barra",   medida: "10 × 5 cm",  px: 1400, alto: 0.5 },
  placa:     { nombre: "Placa de mesa",   medida: "10 × 15 cm", px: 1400, alto: 1.5 },
  codigo:    { nombre: "Solo el código",  medida: "6 × 6 cm",   px: 1000, alto: 1 },
};

const TIPO = "Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

function bajarArchivo(href, nombre) {
  const a = document.createElement("a");
  a.href = href;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* Ancho aproximado de un texto. Sin esto no hay forma de centrar un
   grupo que mezcla dibujo y letras: fue justo lo que salía corrido. */
const anchoTexto = (t, fs, ls = 0) => t.length * (fs * 0.58 + ls);

/* Cuerpo de letra más grande que entre en el ancho disponible.
   Sin esto, un bar de nombre largo se sale del sticker. */
const cuerpoPara = (t, ancho, fsMax, ls = 0) =>
  Math.min(fsMax, Math.max(1.6, (ancho / Math.max(t.length, 1) - ls) / 0.58));

/* Símbolo de lectura sin contacto. Se dibuja en una caja de 5.7 × 7.8
   y se escala a la altura de la letra que lo acompaña. */
function SimboloNfc({ x, y, color, escala }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`} stroke={color} fill="none"
       strokeWidth="0.55" strokeLinecap="round">
      <circle cx="-1.6" cy="0" r="0.55" fill={color} stroke="none" />
      <path d="M -0.4 -1.5 A 2 2 0 0 1 -0.4 1.5" />
      <path d="M 0.7 -2.7 A 3.6 3.6 0 0 1 0.7 2.7" />
      <path d="M 1.8 -3.9 A 5.2 5.2 0 0 1 1.8 3.9" />
    </g>
  );
}

/* Símbolo + texto, centrados como una sola pieza. */
function FilaNfc({ cx, desde, y, texto, fs, ls, color, escalaGlifo = 1 }) {
  const escala = (fs / 6) * escalaGlifo;   // alto del símbolo ≈ 1.3 × la letra
  const anchoGlifo = 5.7 * escala;
  const hueco = fs * 0.8;
  const total = anchoGlifo + hueco + anchoTexto(texto, fs, ls) - ls;
  const x0 = desde !== undefined ? desde : cx - total / 2;
  return (
    <g>
      <SimboloNfc x={x0 + anchoGlifo * 0.62} y={y - fs * 0.33} color={color} escala={escala} />
      <text x={x0 + anchoGlifo + hueco} y={y} fill={color} fontFamily={TIPO}
        fontSize={fs} letterSpacing={ls}>{texto}</text>
    </g>
  );
}

export default function PlacaQR({ local }) {
  const svgRef = useRef(null);
  const [origen, setOrigen] = useState("");
  const [paleta, setPaleta] = useState(() => paletaDe(local.codigo || local.nombre));
  const [formato, setFormato] = useState("redondo");
  const [conLogo, setConLogo] = useState(true);
  const [aviso, setAviso] = useState("");
  const [logoIncrustado, setLogoIncrustado] = useState(null);
  const [usarLogo, setUsarLogo] = useState(true);

  useEffect(() => setOrigen(window.location.origin), []);
  useEffect(() => setPaleta(paletaDe(local.codigo || local.nombre)), [local.codigo]);

  /* El logo se incrusta dentro del SVG como datos, no como enlace.
     Si quedara enlazado, el archivo que abre la imprenta mostraría un
     hueco: su computadora no tiene acceso a nuestro servidor. */
  useEffect(() => {
    let vivo = true;
    setLogoIncrustado(null);
    if (!local.logo_url) return;
    (async () => {
      try {
        const r = await fetch(local.logo_url);
        const blob = await r.blob();
        const lector = new FileReader();
        lector.onload = () => { if (vivo) setLogoIncrustado(lector.result); };
        lector.readAsDataURL(blob);
      } catch {
        if (vivo) setLogoIncrustado(null);
      }
    })();
    return () => { vivo = false; };
  }, [local.logo_url]);

  const url = origen ? `${origen}/q/${local.codigo}` : "";
  const enLaCompu = origen.includes("localhost") || origen.includes("127.0.0.1");
  const sigla = monograma(local.nombre);
  const uid = `s${local.codigo}`;

  const modulos = useMemo(() => {
    if (!url) return null;
    try {
      return QRCode.create(url, { errorCorrectionLevel: "H" }).modules;
    } catch {
      return null;
    }
  }, [url]);

  const p = PALETAS[paleta];
  const f = FORMATOS[formato];
  const limpio = local.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const archivo = `${formato}-${limpio}-${local.codigo}`;
  const marca = `${MARCA} · ${BAJADA}`.toUpperCase();

  const dibujarQR = (lado, ejeX, ejeY) => {
    if (!modulos) return null;
    const n = modulos.size;
    const celda = lado / n;
    const salida = [];
    for (let fi = 0; fi < n; fi++) {
      for (let c = 0; c < n; c++) {
        if (modulos.data[fi * n + c]) {
          salida.push(
            <rect key={`${fi}-${c}`} x={ejeX + c * celda} y={ejeY + fi * celda}
              width={celda * 1.02} height={celda * 1.02} fill="#000000" />
          );
        }
      }
    }
    return salida;
  };

  const hayLogo = Boolean(logoIncrustado) && usarLogo;

  /* Emblema del centro del código: el logo del local si lo cargó,
     y si no el monograma. Ocupa menos del 7% del área, así que con
     corrección de errores alta el celular reconstruye lo tapado. */
  const logoCentral = (cx, cy, r) => {
    if (!conLogo) return null;
    if (hayLogo)
      return (
        <g>
          <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" />
          <image href={logoIncrustado} x={cx - r * 0.78} y={cy - r * 0.78}
            width={r * 1.56} height={r * 1.56} preserveAspectRatio="xMidYMid meet" />
        </g>
      );
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" />
        <circle cx={cx} cy={cy} r={r * 0.87} fill="none" stroke="#0D1614" strokeWidth={r * 0.07} />
        <text x={cx} y={cy + r * 0.33} textAnchor="middle" fill="#0D1614"
          fontFamily={SERIF} fontSize={r * 0.88}>{sigla}</text>
      </g>
    );
  };

  /* El sello grande del cuadrado, la placa y la tira. El logo del local
     va sin aro: un logo suele traer su propia forma y encerrarlo en un
     círculo lo empeora. El monograma sí lo lleva. */
  const emblema = (cx, cy, r, cuerpo) => {
    if (hayLogo)
      return (
        <image href={logoIncrustado} x={cx - r} y={cy - r} width={r * 2} height={r * 2}
          preserveAspectRatio="xMidYMid meet" />
      );
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={p.acento} strokeWidth={r * 0.068} />
        <circle cx={cx} cy={cy} r={r * 0.84} fill="none" stroke={p.acento} strokeWidth={r * 0.022} />
        <text x={cx} y={cy + r * 0.39} textAnchor="middle" fill={p.tinta}
          fontFamily={SERIF} fontSize={cuerpo}>{sigla}</text>
      </g>
    );
  };

  const largo = local.nombre.length;
  const espNombre = largo > 16 ? 0.5 : 0.9;
  // 48 mm es el arco que el nombre puede ocupar arriba sin curvarse
  // tanto que sus puntas terminen pisando el código.
  const tamNombre = cuerpoPara(local.nombre.toUpperCase(), 48, 5.1, espNombre);
  const tamNombreRecto = cuerpoPara(local.nombre.toUpperCase(), 84, 5.1, espNombre);

  /* ── redondo · 10 × 10 cm ──────────────────────────────── */
  const stickerRedondo = (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg"
      width="100mm" height="100mm" viewBox="0 0 100 100">
      <defs>
        <path id={`${uid}-arriba`} d="M 14.29 37.00 A 38 38 0 0 1 85.71 37.00" />
        <path id={`${uid}-abajo`} d="M 9.59 64.71 A 43 43 0 0 0 90.41 64.71" />
      </defs>

      <circle cx="50" cy="50" r="50" fill={p.bg} />
      <circle cx="50" cy="50" r="46.6" fill="none" stroke={p.acento} strokeWidth="0.55" />
      <circle cx="50" cy="50" r="45" fill="none" stroke={p.acento} strokeWidth="0.18" />

      <text fill={p.tinta} fontFamily={SERIF} fontSize={tamNombre} letterSpacing={espNombre}>
        <textPath href={`#${uid}-arriba`} startOffset="50%" textAnchor="middle">
          {local.nombre.toUpperCase()}
        </textPath>
      </text>

      <rect x="28" y="21" width="44" height="44" rx="1.6" fill="#FFFFFF" />
      {dibujarQR(40, 30, 23)}
      {logoCentral(50, 43, 4.6)}

      <text x="50" y="72.6" textAnchor="middle" fill={p.acento}
        fontFamily={TIPO} fontSize="2.8" letterSpacing="1">
        ESCANEÁ Y MIRÁ LA CARTA
      </text>

      <FilaNfc cx={50} y={79.4} texto="O ACERCÁ EL CELULAR" fs={2.4} ls={0.7} color={p.suave} />

      <text fill={p.suave} fontFamily={TIPO} fontSize="1.9" letterSpacing="1">
        <textPath href={`#${uid}-abajo`} startOffset="50%" textAnchor="middle">{marca}</textPath>
      </text>
    </svg>
  );

  /* ── cuadrado · 10 × 10 cm ─────────────────────────────── */
  const stickerCuadrado = (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg"
      width="100mm" height="100mm" viewBox="0 0 100 100">
      <rect width="100" height="100" fill={p.bg} />
      <rect x="4" y="4" width="92" height="92" rx="2" fill="none" stroke={p.acento} strokeWidth="0.55" />
      <rect x="6" y="6" width="88" height="88" rx="1.4" fill="none" stroke={p.acento} strokeWidth="0.18" />

      {emblema(50, 17, 7.4, 7.4)}

      <text x="50" y="31.5" textAnchor="middle" fill={p.tinta}
        fontFamily={SERIF} fontSize={tamNombreRecto} letterSpacing={espNombre}>
        {local.nombre.toUpperCase()}
      </text>
      <line x1="40" y1="34.6" x2="60" y2="34.6" stroke={p.acento} strokeWidth="0.3" />

      <rect x="28" y="38" width="44" height="44" rx="1.6" fill="#FFFFFF" />
      {dibujarQR(40, 30, 40)}
      {logoCentral(50, 60, 4.6)}

      <text x="50" y="87.2" textAnchor="middle" fill={p.acento}
        fontFamily={TIPO} fontSize="2.6" letterSpacing="1">
        ESCANEÁ Y MIRÁ LA CARTA
      </text>

      <FilaNfc cx={50} y={91.4} texto="O ACERCÁ EL CELULAR" fs={2.2} ls={0.6} color={p.suave} />
    </svg>
  );


  /* ── DOS PUERTAS · 10 × 10 cm ──────────────────────────────
     Parte el sticker en dos mitades iguales: escanear y apoyar.
     El NFC deja de ser una nota al pie y ocupa la mitad de la
     superficie, que es exactamente lo que hace que la gente lo use. */
  const stickerDoble = (() => {
    const fsN = cuerpoPara(local.nombre.toUpperCase(), 74, 6.2, 0.6);
    return (
      <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg"
        width="100mm" height="100mm" viewBox="0 0 100 100">
        <rect width="100" height="100" fill={p.bg} />
        <rect x="3.5" y="3.5" width="93" height="93" rx="3" fill="none" stroke={p.acento} strokeWidth="0.6" />

        <text x="50" y="16" textAnchor="middle" fill={p.tinta}
          fontFamily={SERIF} fontSize={fsN} letterSpacing="0.6">
          {local.nombre.toUpperCase()}
        </text>
        <line x1="11" y1="21.5" x2="89" y2="21.5" stroke={p.acento} strokeWidth="0.3" />

        <line x1="50" y1="26" x2="50" y2="83" stroke={p.acento} strokeWidth="0.25" strokeDasharray="1.4 1.4" />

        {/* izquierda · escanear */}
        <text x="26" y="32" textAnchor="middle" fill={p.acento}
          fontFamily={TIPO} fontSize="3.4" letterSpacing="1.6">ESCANEÁ</text>
        <rect x="9" y="36" width="34" height="34" rx="1.4" fill="#FFFFFF" />
        {dibujarQR(30, 11, 38)}
        {logoCentral(26, 53, 3.5)}
        <text x="26" y="78" textAnchor="middle" fill={p.suave}
          fontFamily={TIPO} fontSize="2.3" letterSpacing="0.5">con la cámara</text>

        {/* derecha · apoyar */}
        <text x="74" y="32" textAnchor="middle" fill={p.acento}
          fontFamily={TIPO} fontSize="3.4" letterSpacing="1.6">APOYÁ</text>
        <circle cx="74" cy="53" r="17" fill="none" stroke={p.acento} strokeWidth="0.3" strokeDasharray="2 2" />
        <SimboloNfc x={70.5} y={53} color={p.acento} escala={2.9} />
        <text x="74" y="78" textAnchor="middle" fill={p.suave}
          fontFamily={TIPO} fontSize="2.3" letterSpacing="0.5">el celular acá</text>

        <line x1="11" y1="87" x2="89" y2="87" stroke={p.acento} strokeWidth="0.3" />
        <text x="50" y="92.5" textAnchor="middle" fill={p.suave}
          fontFamily={TIPO} fontSize="2.1" letterSpacing="1.5">{marca}</text>
      </svg>
    );
  })();

  /* ── POSAVASOS · 10 × 10 cm ────────────────────────────────
     Color pleno y ondas de NFC de fondo, como un posavasos de bar.
     Al invertir el fondo, el código blanco del centro se vuelve el
     punto más brillante del sticker y la mano va sola ahí. */
  const stickerPosavasos = (() => {
    const nom = local.nombre.toUpperCase();
    const fsN = cuerpoPara(nom, 50, 4.6, 0.8);
    return (
      <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg"
        width="100mm" height="100mm" viewBox="0 0 100 100">
        <defs>
          <path id={`${uid}-pvarr`} d="M 13.06 39.00 A 39 39 0 0 1 86.94 39.00" />
          <path id={`${uid}-pvaba`} d="M 8.02 65.20 A 44.5 44.5 0 0 0 91.98 65.20" />
          <clipPath id={`${uid}-disco`}><circle cx="50" cy="50" r="50" /></clipPath>
        </defs>

        <circle cx="50" cy="50" r="50" fill={p.acento} />

        {/* ondas de fondo: el gesto del NFC, en grande */}
        <g clipPath={`url(#${uid}-disco)`} stroke={p.bg} fill="none" opacity="0.16" strokeLinecap="round">
          <path d="M 6 8 A 46 46 0 0 1 6 92" strokeWidth="2.4" />
          <path d="M -6 16 A 38 38 0 0 1 -6 84" strokeWidth="2.4" />
          <path d="M -18 24 A 30 30 0 0 1 -18 76" strokeWidth="2.4" />
        </g>

        <circle cx="50" cy="50" r="47.4" fill="none" stroke={p.bg} strokeWidth="0.7" opacity="0.55" />

        <text fill={p.bg} fontFamily={SERIF} fontSize={fsN} letterSpacing="0.8">
          <textPath href={`#${uid}-pvarr`} startOffset="50%" textAnchor="middle">{nom}</textPath>
        </text>

        <circle cx="50" cy="42" r="22.5" fill="#FFFFFF" />
        {dibujarQR(30, 35, 27)}
        {logoCentral(50, 42, 4.2)}

        <SimboloNfc x={46.5} y={74} color={p.bg} escala={2.0} />

        <text x="50" y="87" textAnchor="middle" fill={p.bg}
          fontFamily={TIPO} fontSize="2.7" letterSpacing="1.2">APOYÁ O ESCANEÁ</text>

        <text fill={p.bg} fontFamily={TIPO} fontSize="1.8" letterSpacing="0.9" opacity="0.75">
          <textPath href={`#${uid}-pvaba`} startOffset="50%" textAnchor="middle">{marca}</textPath>
        </text>
      </svg>
    );
  })();

  /* ── TIRA DE BARRA · 10 × 5 cm ─────────────────────────────
     Apaisada, para el borde del mostrador o el frente de la barra,
     donde una mesa cuadrada no entra. */
  const stickerTira = (() => {
    // El nombre vive entre el monograma y el código: 33 mm, ni uno más.
    const fsN = cuerpoPara(local.nombre, 33, 5.6, 0.3);
    return (
      <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg"
        width="100mm" height="50mm" viewBox="0 0 100 50">
        <rect width="100" height="50" fill={p.bg} />
        <rect x="3" y="3" width="94" height="44" rx="2.4" fill="none" stroke={p.acento} strokeWidth="0.5" />

        {emblema(14, 15, 6.6, 6.6)}

        <text x="24" y="17.6" fill={p.tinta} fontFamily={SERIF} fontSize={fsN} letterSpacing="0.3">
          {local.nombre}
        </text>

        <line x1="7.5" y1="25" x2="57" y2="25" stroke={p.acento} strokeWidth="0.3" />

        <FilaNfc desde={7.5} y={34} texto="APOYÁ O ESCANEÁ" fs={3} ls={0.8}
          color={p.acento} escalaGlifo={1.3} />

        <text x="7.5" y="42.5" fill={p.suave} fontFamily={TIPO} fontSize="1.7" letterSpacing="1">{marca}</text>

        <rect x="62" y="8" width="34" height="34" rx="1.4" fill="#FFFFFF" />
        {dibujarQR(30, 64, 10)}
        {logoCentral(79, 25, 3.4)}
      </svg>
    );
  })();

  /* ── placa de mesa · 10 × 15 cm ────────────────────────── */
  const placaMesa = (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg"
      width="100mm" height="150mm" viewBox="0 0 100 150">
      <rect width="100" height="150" fill={p.bg} />
      <rect x="5" y="5" width="90" height="140" fill="none" stroke={p.acento} strokeWidth="0.35" />

      {emblema(50, 22, 8.4, 7.6)}

      <text x="50" y="41" textAnchor="middle" fill={p.tinta}
        fontFamily={SERIF} fontSize={largo > 17 ? 6.2 : 7.8} letterSpacing="0.4">
        {local.nombre}
      </text>

      {local.zona && (
        <text x="50" y="48" textAnchor="middle" fill={p.suave}
          fontFamily={TIPO} fontSize="2.7" letterSpacing="1.2">
          {local.zona.toUpperCase()}
        </text>
      )}

      <rect x="20" y="55" width="60" height="60" rx="1.6" fill="#FFFFFF" />
      {dibujarQR(54, 23, 58)}
      {logoCentral(50, 85, 6)}

      <text x="50" y="123" textAnchor="middle" fill={p.acento}
        fontFamily={TIPO} fontSize="3" letterSpacing="1.4">
        ESCANEÁ Y MIRÁ LA CARTA
      </text>

      <FilaNfc cx={50} y={129.5} texto="O ACERCÁ EL CELULAR" fs={2.6} ls={0.8} color={p.suave} />

      <line x1="38" y1="136" x2="62" y2="136" stroke={p.acento} strokeWidth="0.3" />
      <text x="50" y="141.5" textAnchor="middle" fill={p.suave}
        fontFamily={TIPO} fontSize="2.1" letterSpacing="1.4">{marca}</text>
    </svg>
  );

  /* ── solo el código · 6 × 6 cm ─────────────────────────── */
  const soloCodigo = (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg"
      width="60mm" height="60mm" viewBox="0 0 60 60">
      <rect width="60" height="60" fill="#FFFFFF" />
      {dibujarQR(52, 4, 4)}
      {logoCentral(30, 30, 5.6)}
    </svg>
  );

  const dibujo =
    formato === "redondo" ? stickerRedondo :
    formato === "cuadrado" ? stickerCuadrado :
    formato === "doble" ? stickerDoble :
    formato === "posavasos" ? stickerPosavasos :
    formato === "tira" ? stickerTira :
    formato === "placa" ? placaMesa : soloCodigo;

  /* ── descargas ─────────────────────────────────────────── */
  const serializar = () => new XMLSerializer().serializeToString(svgRef.current);

  const descargarSVG = () => {
    const blob = new Blob([serializar()], { type: "image/svg+xml;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    bajarArchivo(href, `${archivo}.svg`);
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  const descargarPNG = () => {
    setAviso("");
    const blob = new Blob([serializar()], { type: "image/svg+xml;charset=utf-8" });
    const fuente = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const ancho = f.px;
      const alto = Math.round(ancho * f.alto);
      const lienzo = document.createElement("canvas");
      lienzo.width = ancho;
      lienzo.height = alto;
      const ctx = lienzo.getContext("2d");
      ctx.drawImage(img, 0, 0, ancho, alto);
      try {
        bajarArchivo(lienzo.toDataURL("image/png"), `${archivo}.png`);
      } catch {
        setAviso("Tu navegador no dejó generar el PNG. Bajá el SVG, que además imprime mejor.");
      }
      URL.revokeObjectURL(fuente);
    };

    img.onerror = () => {
      setAviso("No se pudo generar el PNG. Usá el SVG.");
      URL.revokeObjectURL(fuente);
    };

    img.src = fuente;
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {enLaCompu && (
        <div className="b-alerta" style={{ borderLeftColor: "#A0463A" }}>
          <b style={{ color: "#E39184" }}>Estás en tu computadora.</b> El QR apunta a{" "}
          <span className="b-slug">localhost</span> y solo funciona acá adentro. Para que sirva de verdad,
          entrá al panel desde tu dirección pública.
        </div>
      )}

      <div className="b-panel" style={{ display: "flex", gap: 26, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "0 0 auto", background: "#0A100F", padding: 16, borderRadius: 3 }}>
          <div style={{ width: 250 }}>{dibujo}</div>
        </div>

        <div style={{ flex: "1 1 250px", display: "grid", gap: 18 }}>
          <div>
            <p className="b-eyebrow">Formato</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.entries(FORMATOS).map(([k, v]) => (
                <button key={k} className={`b-btn mini ${formato === k ? "oro" : ""}`} onClick={() => setFormato(k)}>
                  {v.nombre}
                </button>
              ))}
            </div>
            <p className="b-nota" style={{ marginTop: 8 }}>
              Se descarga en el tamaño físico exacto: <b style={{ color: "var(--hueso)" }}>{f.medida}</b>.
            </p>
          </div>

          <div>
            <p className="b-eyebrow">Paleta · {PALETAS[paleta].nombre}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CLAVES_PALETA.map((k) => {
                const v = PALETAS[k];
                const sel = paleta === k;
                return (
                  <button key={k} onClick={() => setPaleta(k)} title={v.nombre}
                    style={{
                      width: 38, height: 38, borderRadius: "50%", background: v.bg,
                      border: sel ? "2px solid var(--bronce2)" : "1px solid var(--linea)",
                      boxShadow: sel ? "0 0 0 3px rgba(199,154,75,.25)" : "none",
                      color: v.tinta, fontFamily: "var(--display)", fontSize: 13, padding: 0,
                      display: "grid", placeItems: "center",
                    }}>
                    <span style={{ borderBottom: `2px solid ${v.acento}`, lineHeight: 1.1 }}>{sigla}</span>
                  </button>
                );
              })}
            </div>
            <p className="b-nota" style={{ marginTop: 8 }}>
              Cada bar arranca con una paleta distinta según su código, así no salen dos stickers iguales.
              Podés cambiarla cuando quieras.
            </p>
          </div>

          <div>
            <p className="b-eyebrow">Emblema</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {logoIncrustado && (
                <button className={`b-btn mini ${usarLogo ? "oro" : ""}`} onClick={() => setUsarLogo(!usarLogo)}>
                  {usarLogo ? "Logo del local" : `Monograma “${sigla}”`}
                </button>
              )}
              <button className={`b-btn mini ${conLogo ? "oro" : ""}`} onClick={() => setConLogo(!conLogo)}>
                {conLogo ? "En el centro del código" : "Código limpio"}
              </button>
            </div>
            <p className="b-nota" style={{ marginTop: 8 }}>
              {logoIncrustado
                ? "Se está usando el logo que cargaste en Datos del local. Podés volver al monograma cuando quieras."
                : local.logo_url
                  ? "Cargando el logo del local…"
                  : `Este local no tiene logo cargado, así que se usa el monograma “${sigla}”. Podés subir un PNG desde Datos del local.`}
            </p>
          </div>

          <div>
            <p className="b-eyebrow">Descargar</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="b-btn oro" onClick={descargarSVG}>SVG · para la imprenta</button>
              <button className="b-btn" onClick={descargarPNG}>PNG · para probar</button>
            </div>
            {aviso && <p className="b-error" style={{ marginTop: 10 }}>{aviso}</p>}
          </div>

          <div>
            <p className="b-eyebrow">Dirección que lleva adentro</p>
            <p className="b-slug">{url || "…"}</p>
          </div>
        </div>
      </div>

      <div className="b-alerta">
        <b style={{ color: "var(--hueso)" }}>Antes de mandar a imprimir:</b> bajá el PNG, abrilo en la
        pantalla y escanealo con la cámara de tu propio celular. Si te abre la carta del bar correcto,
        recién ahí a la imprenta.
      </div>
    </div>
  );
}
