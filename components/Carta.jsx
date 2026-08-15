"use client";

import { useEffect, useState } from "react";
import { estiloDe } from "@/lib/estilo-carta";
import { plata } from "@/lib/formato";
import { MARCA } from "@/lib/marca";
import { IDIOMAS, BASE, texto, idiomaDelCelular } from "@/lib/idiomas";

function Portada({ carta, tema }) {
  const t = tema.v;
  const zona = carta.zona || "";
  const titulo = {
    fontFamily: t["--m-display"], fontSize: t["--m-titulo"],
    letterSpacing: t["--m-titulo-track"], margin: 0, lineHeight: 1.12,
    fontWeight: tema.portada === "minimo" ? 700 : 400,
  };
  const lema = { fontSize: 12, color: "var(--m-suave)", margin: "9px 0 0", lineHeight: 1.5 };
  const alto = { fontSize: 9, letterSpacing: ".3em", textTransform: "uppercase", color: "var(--m-acento)", margin: "0 0 9px" };

  if (tema.portada === "tiza")
    return (
      <header style={{ borderBottom: "1px solid var(--m-linea)", paddingBottom: 18 }}>
        {zona && <p style={alto}>{zona}</p>}
        <h1 style={{ ...titulo, textTransform: "uppercase" }}>{carta.nombre}</h1>
        {carta.lema && <p style={{ ...lema, fontFamily: "'Caveat',cursive", fontSize: 18, color: "var(--m-acento)" }}>{carta.lema}</p>}
      </header>
    );

  if (tema.portada === "caja")
    return (
      <header style={{ border: "1px solid var(--m-linea)", padding: "20px 16px", textAlign: "center" }}>
        <h1 style={{ ...titulo, textTransform: "uppercase" }}>{carta.nombre}</h1>
        {zona && <p style={{ ...alto, margin: "12px 0 0" }}>{zona}</p>}
        {carta.lema && <p style={lema}>{carta.lema}</p>}
      </header>
    );

  if (tema.portada === "centro")
    return (
      <header style={{ textAlign: "center", paddingBottom: 14 }}>
        {zona && <p style={alto}>{zona}</p>}
        <h1 style={titulo}>{carta.nombre}</h1>
        {carta.lema && <p style={lema}>{carta.lema}</p>}
        <p style={{ color: "var(--m-acento)", letterSpacing: ".6em", margin: "14px 0 0", fontSize: 11 }}>◆◆◆</p>
      </header>
    );

  if (tema.portada === "minimo")
    return (
      <header style={{ paddingBottom: 20 }}>
        <h1 style={{ ...titulo, textTransform: "uppercase" }}>{carta.nombre}</h1>
        {carta.lema && <p style={{ ...lema, marginTop: 6 }}>{carta.lema}</p>}
        {zona && <p style={{ ...alto, margin: "18px 0 0" }}>{zona}</p>}
      </header>
    );

  return (
    <header style={{ textAlign: "center", borderBottom: "2px solid var(--m-tinta)", paddingBottom: 16 }}>
      {zona && <p style={alto}>{zona}</p>}
      <h1 style={titulo}>{carta.nombre}</h1>
      {carta.lema && <p style={{ ...lema, fontStyle: "italic" }}>{carta.lema}</p>}
    </header>
  );
}

/* Los circulitos de idioma. Solo aparecen si el bar ofrece más de uno. */
function SelectorIdioma({ idiomas, actual, elegir }) {
  if (!idiomas || idiomas.length < 2) return null;
  return (
    <nav style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", margin: "18px 0 4px" }}>
      {idiomas.map((k) => {
        const sel = k === actual;
        return (
          <button key={k} onClick={() => elegir(k)} aria-pressed={sel}
            style={{
              border: "1px solid var(--m-acento)",
              background: sel ? "var(--m-acento)" : "transparent",
              color: sel ? "var(--m-bg)" : "var(--m-acento)",
              borderRadius: 99, padding: "5px 13px", fontSize: 11,
              fontFamily: "var(--m-texto)", letterSpacing: ".06em", lineHeight: 1.2, cursor: "pointer",
            }}>
            {IDIOMAS[k]?.nombre || k}
          </button>
        );
      })}
    </nav>
  );
}

/* Las solapas de la carta. Quedan pegadas arriba mientras el cliente
   baja, así puede saltar a otra sección sin volver al principio.
   Con una sola solapa no se muestran: serían un adorno inútil. */
function Solapas({ secciones, actual, elegir, idioma, bg }) {
  if (secciones.length < 2) return null;
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 5, background: bg,
      margin: "18px -22px 0", padding: "10px 22px 0",
      borderBottom: "1px solid var(--m-linea)",
      display: "flex", gap: 4, overflowX: "auto", WebkitOverflowScrolling: "touch",
    }}>
      {secciones.map((s, i) => {
        const sel = i === actual;
        return (
          <button key={i} onClick={() => elegir(i)} aria-pressed={sel}
            style={{
              flex: "0 0 auto", border: 0, background: "transparent",
              borderBottom: `2px solid ${sel ? "var(--m-acento)" : "transparent"}`,
              color: sel ? "var(--m-acento)" : "var(--m-suave)",
              fontFamily: "var(--m-texto)", fontSize: 12.5, letterSpacing: ".1em",
              textTransform: "uppercase", padding: "8px 12px 10px",
              whiteSpace: "nowrap", cursor: "pointer",
            }}>
            {texto(s, "nombre", idioma)}
          </button>
        );
      })}
    </nav>
  );
}

export default function Carta({ carta, enFono }) {
  const idiomas = ((carta?.idiomas?.length ? carta.idiomas : [BASE]) || []).filter((k) => IDIOMAS[k]);
  const [idioma, setIdioma] = useState(BASE);
  const [solapa, setSolapa] = useState(0);

  useEffect(() => {
    if (idiomas.length > 1) setIdioma(idiomaDelCelular(idiomas));
    else setIdioma(BASE);
  }, [carta?.nombre, idiomas.join(",")]);

  const secciones = carta?.secciones || [];

  // Si se borra una solapa mientras alguien la está mirando, no queda en blanco.
  useEffect(() => {
    if (solapa > secciones.length - 1) setSolapa(0);
  }, [secciones.length, solapa]);

  if (!carta) return null;
  const tema = estiloDe(carta.paleta, carta.tipografia);
  const vocab = IDIOMAS[idioma] || IDIOMAS[BASE];
  const activa = secciones[solapa] || secciones[0];
  const cats = activa?.categorias || [];
  const vacia = secciones.every((s) => (s.categorias || []).length === 0);

  const cuerpo = (
    <div className="b-menu" style={{ ...tema.v, padding: "22px 22px 34px", minHeight: "100%" }}>
      <Portada carta={carta} tema={tema} />

      <SelectorIdioma idiomas={idiomas} actual={idioma} elegir={setIdioma} />

      <Solapas secciones={secciones} actual={solapa} elegir={setSolapa}
        idioma={idioma} bg={tema.v["--m-bg"]} />

      {(secciones.length === 0 || vacia) && (
        <p style={{ textAlign: "center", color: "var(--m-suave)", fontSize: 13, marginTop: 30 }}>
          La carta todavía está vacía.
        </p>
      )}

      {cats.map((cat, i) => (
        <section key={i}>
          <h2 className="b-cat">{texto(cat, "nombre", idioma)}</h2>
          {(cat.items || []).map((it, j) => {
            const desc = texto(it, "desc", idioma);
            return (
              <div key={j}>
                <div className={`b-linea ${it.disponible ? "" : "b-agotado"}`}>
                  {/* El nombre del plato no se traduce: es el mismo en las
                      tres cartas. Lo que cambia es la descripción de abajo. */}
                  <span className="n">{it.nombre}</span>
                  <span className={`b-puntos ${tema.puntos ? "" : "sin"}`} />
                  <span className="p">{it.disponible ? plata(it.precio) : vocab.sinStock}</span>
                </div>
                {desc && <p className="b-desc">{desc}</p>}
              </div>
            );
          })}
        </section>
      ))}

      {carta.direccion && (
        <p style={{ textAlign: "center", fontSize: 11.5, color: "var(--m-suave)", marginTop: 34 }}>{carta.direccion}</p>
      )}
      <p style={{ textAlign: "center", fontSize: 9, letterSpacing: ".2em", color: "var(--m-suave)", marginTop: 14, textTransform: "uppercase" }}>
        {vocab.etiqueta} · {MARCA}
      </p>
    </div>
  );

  if (enFono)
    return (
      <div className="b-fono">
        <div className="b-scroll">{cuerpo}</div>
      </div>
    );

  return <div style={{ maxWidth: 460, margin: "0 auto", minHeight: "100vh", background: tema.v["--m-bg"] }}>{cuerpo}</div>;
}
