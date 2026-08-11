"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { MARCA } from "@/lib/marca";

/* Paletas de la placa. Ojo: el QR va SIEMPRE oscuro sobre blanco,
   sin importar el fondo elegido. Un QR invertido o de bajo contraste
   falla en la mitad de los celulares, y eso no se descubre hasta que
   ya están pegados los acrílicos. */
const PALETAS = {
  clara:  { nombre: "Clara",  bg: "#ECE7DB", tinta: "#0D1614", acento: "#7A5A18", suave: "#4A5B57" },
  oscura: { nombre: "Oscura", bg: "#16302B", tinta: "#ECE7DB", acento: "#C79A4B", suave: "#8FA39D" },
};

function bajarArchivo(href, nombre) {
  const a = document.createElement("a");
  a.href = href;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function PlacaQR({ local }) {
  const svgRef = useRef(null);
  const [origen, setOrigen] = useState("");
  const [paleta, setPaleta] = useState("clara");
  const [soloCodigo, setSoloCodigo] = useState(false);
  const [aviso, setAviso] = useState("");

  useEffect(() => setOrigen(window.location.origin), []);

  const url = origen ? `${origen}/q/${local.codigo}` : "";
  const enLaCompu = origen.includes("localhost") || origen.includes("127.0.0.1");

  // Nivel de corrección "H": el código sigue leyéndose aunque se
  // manche o se raye. En una mesa de bar eso pasa.
  const modulos = useMemo(() => {
    if (!url) return null;
    try {
      const { modules } = QRCode.create(url, { errorCorrectionLevel: "H" });
      return modules;
    } catch {
      return null;
    }
  }, [url]);

  const p = PALETAS[paleta];
  const archivo = `qr-${local.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${local.codigo}`;

  /* ── dibujo del QR ─────────────────────────────────────── */
  const dibujarQR = (lado, ejeX, ejeY) => {
    if (!modulos) return null;
    const n = modulos.size;
    const celda = lado / n;
    const puntos = [];
    for (let f = 0; f < n; f++) {
      for (let c = 0; c < n; c++) {
        if (modulos.data[f * n + c]) {
          puntos.push(
            <rect
              key={`${f}-${c}`}
              x={ejeX + c * celda}
              y={ejeY + f * celda}
              width={celda + 0.02}
              height={celda + 0.02}
              fill="#000000"
            />
          );
        }
      }
    }
    return puntos;
  };

  const tamNombre = local.nombre.length > 20 ? 10 : local.nombre.length > 14 ? 12.5 : 16;

  /* ── descargas ─────────────────────────────────────────── */
  const descargarSVG = () => {
    const texto = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([texto], { type: "image/svg+xml;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    bajarArchivo(href, `${archivo}.svg`);
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  const descargarPNG = () => {
    setAviso("");
    const texto = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([texto], { type: "image/svg+xml;charset=utf-8" });
    const fuente = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const escala = 6; // suficiente resolución para imprimir
      const lienzo = document.createElement("canvas");
      lienzo.width = img.width * escala || (soloCodigo ? 140 : 200) * escala;
      lienzo.height = img.height * escala || (soloCodigo ? 140 : 300) * escala;
      const ctx = lienzo.getContext("2d");
      ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height);
      try {
        bajarArchivo(lienzo.toDataURL("image/png"), `${archivo}.png`);
      } catch {
        setAviso("Tu navegador no dejó generar el PNG. Descargá el SVG, que además imprime mejor.");
      }
      URL.revokeObjectURL(fuente);
    };

    img.onerror = () => {
      setAviso("No se pudo generar el PNG. Usá el SVG.");
      URL.revokeObjectURL(fuente);
    };

    img.src = fuente;
  };

  /* ── la placa ──────────────────────────────────────────── */
  const placa = soloCodigo ? (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="240" height="240">
      <rect width="140" height="140" fill="#FFFFFF" />
      {dibujarQR(116, 12, 12)}
    </svg>
  ) : (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="240" height="360">
      <rect width="200" height="300" fill={p.bg} />
      <rect x="8" y="8" width="184" height="284" fill="none" stroke={p.acento} strokeWidth="0.6" />

      <text x="100" y="42" textAnchor="middle" fill={p.acento}
        fontFamily="Helvetica, Arial, sans-serif" fontSize="6.5" letterSpacing="3.2">
        ESCANEÁ Y PEDÍ
      </text>

      <text x="100" y={62 + (16 - tamNombre) / 2} textAnchor="middle" fill={p.tinta}
        fontFamily="Georgia, 'Times New Roman', serif" fontSize={tamNombre}>
        {local.nombre}
      </text>

      {local.zona && (
        <text x="100" y="76" textAnchor="middle" fill={p.suave}
          fontFamily="Helvetica, Arial, sans-serif" fontSize="5.5" letterSpacing="1.6">
          {local.zona.toUpperCase()}
        </text>
      )}

      <rect x="30" y="88" width="140" height="140" rx="3" fill="#FFFFFF" />
      {dibujarQR(120, 40, 98)}

      <text x="100" y="248" textAnchor="middle" fill={p.suave}
        fontFamily="'Courier New', monospace" fontSize="5.4">
        {url.replace(/^https?:\/\//, "")}
      </text>

      <line x1="70" y1="262" x2="130" y2="262" stroke={p.acento} strokeWidth="0.5" />

      <text x="100" y="277" textAnchor="middle" fill={p.suave}
        fontFamily="Helvetica, Arial, sans-serif" fontSize="5" letterSpacing="2.4">
        CARTA DIGITAL · {MARCA.toUpperCase()}
      </text>
    </svg>
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {enLaCompu && (
        <div className="b-alerta" style={{ borderLeftColor: "#A0463A" }}>
          <b style={{ color: "#E39184" }}>No imprimas este código.</b> Estás trabajando en tu computadora,
          así que el QR apunta a <span className="b-slug">localhost</span> y solo funciona acá adentro.
          Para generar los definitivos, entrá al panel desde tu dirección pública.
        </div>
      )}

      <div className="b-panel" style={{ display: "flex", gap: 26, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "0 0 auto" }}>{placa}</div>

        <div style={{ flex: "1 1 240px", display: "grid", gap: 16 }}>
          <div>
            <p className="b-eyebrow">Diseño</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.entries(PALETAS).map(([k, v]) => (
                <button key={k} className={`b-btn mini ${paleta === k && !soloCodigo ? "oro" : ""}`}
                  onClick={() => { setPaleta(k); setSoloCodigo(false); }}>
                  Placa {v.nombre.toLowerCase()}
                </button>
              ))}
              <button className={`b-btn mini ${soloCodigo ? "oro" : ""}`} onClick={() => setSoloCodigo(true)}>
                Solo el código
              </button>
            </div>
          </div>

          <div>
            <p className="b-eyebrow">Descargar</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="b-btn oro" onClick={descargarSVG}>SVG · para la imprenta</button>
              <button className="b-btn" onClick={descargarPNG}>PNG · para el celular</button>
            </div>
            {aviso && <p className="b-error" style={{ marginTop: 10 }}>{aviso}</p>}
            <p className="b-nota" style={{ marginTop: 10 }}>
              El SVG no pierde calidad por más que lo agrandes: es el que le mandás al que imprime los
              acrílicos. El PNG es para mandar por WhatsApp o subir a Instagram.
            </p>
          </div>

          <div>
            <p className="b-eyebrow">Dirección que lleva adentro</p>
            <p className="b-slug">{url || "…"}</p>
            <p className="b-nota" style={{ marginTop: 8 }}>
              Este código apunta a <b style={{ color: "var(--hueso)" }}>{local.codigo}</b>, no al nombre del
              bar. Si el local se renombra o se muda, cambiás el destino desde el panel y los acrílicos
              ya impresos siguen funcionando.
            </p>
          </div>
        </div>
      </div>

      <div className="b-alerta">
        <b style={{ color: "var(--hueso)" }}>Antes de mandar a imprimir, hacé siempre esto:</b> descargá el
        PNG, abrilo en la pantalla y escanealo con la cámara de tu propio celular. Si te abre la carta del
        bar correcto, está listo. Es el único paso de todo el sistema que no se puede corregir después.
      </div>
    </div>
  );
}
