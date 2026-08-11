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

/* Los circulitos de idioma. Solo aparecen si el bar habilitó más de uno:
   una carta en un solo idioma no debe mostrar un selector de una opción. */
function SelectorIdioma({ idiomas, actual, elegir }) {
  if (!idiomas || idiomas.length < 2) return null;
  return (
    <nav style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", margin: "18px 0 4px" }}>
      {idiomas.map((k) => {
        const sel = k === actual;
        return (
          <button
            key={k}
            onClick={() => elegir(k)}
            aria-pressed={sel}
            style={{
              border: "1px solid var(--m-acento)",
              background: sel ? "var(--m-acento)" : "transparent",
              color: sel ? "var(--m-bg)" : "var(--m-acento)",
              borderRadius: 99,
              padding: "5px 13px",
              fontSize: 11,
              fontFamily: "var(--m-texto)",
              letterSpacing: ".06em",
              lineHeight: 1.2,
              cursor: "pointer",
            }}
          >
            {IDIOMAS[k]?.nombre || k}
          </button>
        );
      })}
    </nav>
  );
}

export default function Carta({ carta, enFono }) {
  const idiomas = ((carta?.idiomas?.length ? carta.idiomas : [BASE]) || []).filter((k) => IDIOMAS[k]);
  const [idioma, setIdioma] = useState(BASE);

  // Se resuelve en el navegador para no romper el dibujado del servidor.
  useEffect(() => {
    if (idiomas.length > 1) setIdioma(idiomaDelCelular(idiomas));
    else setIdioma(BASE);
  }, [carta?.nombre, idiomas.join(",")]);

  if (!carta) return null;
  const tema = estiloDe(carta.paleta, carta.tipografia);
  const cats = carta.categorias || [];
  const vocab = IDIOMAS[idioma] || IDIOMAS[BASE];

  const cuerpo = (
    <div className="b-menu" style={{ ...tema.v, padding: "22px 22px 34px", minHeight: "100%" }}>
      {/* El logo va arriba a la derecha, pero en su propia fila: si lo
          dejáramos flotando encima, un nombre largo y centrado se le
          metería abajo. Así puede ser grande sin pisar nada. */}
      {carta.logo && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <img src={carta.logo} alt=""
            style={{ width: 86, height: 86, objectFit: "contain", display: "block" }} />
        </div>
      )}

      <Portada carta={carta} tema={tema} />

      <SelectorIdioma idiomas={idiomas} actual={idioma} elegir={setIdioma} />

      {cats.length === 0 && (
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
                  {/* El nombre del plato no se traduce nunca: es el mismo en las
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
