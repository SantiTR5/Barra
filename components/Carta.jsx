import { temaDe } from "@/lib/temas";
import { plata } from "@/lib/supabase";

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

export default function Carta({ carta, enFono }) {
  if (!carta) return null;
  const tema = temaDe(carta.tema);
  const cats = carta.categorias || [];

  const cuerpo = (
    <div className="b-menu" style={{ ...tema.v, padding: "26px 22px 34px", minHeight: "100%" }}>
      <Portada carta={carta} tema={tema} />

      {cats.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--m-suave)", fontSize: 13, marginTop: 30 }}>
          La carta todavía está vacía.
        </p>
      )}

      {cats.map((cat, i) => (
        <section key={i}>
          <h2 className="b-cat">{cat.nombre}</h2>
          {(cat.items || []).map((it, j) => (
            <div key={j}>
              <div className={`b-linea ${it.disponible ? "" : "b-agotado"}`}>
                <span className="n">{it.nombre}</span>
                <span className={`b-puntos ${tema.puntos ? "" : "sin"}`} />
                <span className="p">{it.disponible ? plata(it.precio) : "sin stock"}</span>
              </div>
              {it.desc && <p className="b-desc">{it.desc}</p>}
            </div>
          ))}
        </section>
      ))}

      {carta.direccion && (
        <p style={{ textAlign: "center", fontSize: 11.5, color: "var(--m-suave)", marginTop: 34 }}>{carta.direccion}</p>
      )}
      <p style={{ textAlign: "center", fontSize: 9, letterSpacing: ".2em", color: "var(--m-suave)", marginTop: 14, textTransform: "uppercase" }}>
        Carta digital · BARRA
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
