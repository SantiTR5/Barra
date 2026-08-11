"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { plata } from "@/lib/formato";
import { IDIOMAS, BASE, CLAVES, texto } from "@/lib/idiomas";
import { subirLogo, LIMITE_KB } from "@/lib/logo-archivo";
import { PALETAS_CARTA, TIPOGRAFIAS, CLAVES_PALETA_CARTA, CLAVES_TIPOGRAFIA, estiloDe } from "@/lib/estilo-carta";
import Carta from "./Carta";
import PlacaQR from "./PlacaQR";

/* Guarda recién cuando la persona deja de escribir.
   Sin esto, cada tecla sería un pedido a la base. */
function useGuardadoDiferido(setEstado) {
  const relojes = useRef({});

  const diferir = (clave, fn, ms = 800) => {
    setEstado("guardando");
    clearTimeout(relojes.current[clave]);
    relojes.current[clave] = setTimeout(async () => {
      try {
        const { error } = await fn();
        setEstado(error ? "mal" : "al-dia");
      } catch {
        setEstado("mal");
      }
    }, ms);
  };

  useEffect(() => () => Object.values(relojes.current).forEach(clearTimeout), []);
  return diferir;
}

export default function EditorCarta({ local, esAdmin, volver }) {
  const [tab, setTab] = useState("carta");
  const [datos, setDatos] = useState(local);
  const [cats, setCats] = useState([]);
  const [prods, setProds] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [estado, setEstado] = useState("al-dia");
  const [cargando, setCargando] = useState(true);
  const [nuevaCat, setNuevaCat] = useState("");
  const [editando, setEditando] = useState(BASE);   // idioma que se está escribiendo
  const [subiendo, setSubiendo] = useState(false);
  const [errLogo, setErrLogo] = useState("");

  const diferir = useGuardadoDiferido(setEstado);

  useEffect(() => {
    (async () => {
      setCargando(true);
      const [c, p, h] = await Promise.all([
        supabase.from("categorias").select("*").eq("local_id", local.id).order("orden"),
        supabase.from("productos").select("*").eq("local_id", local.id).order("orden"),
        supabase.from("historial").select("*").eq("local_id", local.id).order("creado_en", { ascending: false }).limit(50),
      ]);
      setCats(c.data || []);
      setProds(p.data || []);
      setHistorial(h.data || []);
      setCargando(false);
    })();
  }, [local.id]);

  /* ── acciones sobre el local ───────────────────────────── */
  const idiomas = datos.idiomas?.length ? datos.idiomas : [BASE];

  /* Habilitar o deshabilitar un idioma. El español no se puede sacar:
     es la base sobre la que caen las traducciones que falten. */
  const cambiarIdioma = (clave) => {
    if (clave === BASE) return;
    const siguiente = idiomas.includes(clave)
      ? idiomas.filter((x) => x !== clave)
      : [...CLAVES.filter((k) => idiomas.includes(k) || k === clave)];
    setDatos((d) => ({ ...d, idiomas: siguiente }));
    if (!siguiente.includes(editando)) setEditando(BASE);
    diferir("local:idiomas", () => supabase.from("locales").update({ idiomas: siguiente }).eq("id", local.id), 0);
  };

  /* Escribir una traducción. Si el campo queda vacío, se borra la clave
     y ese texto vuelve a mostrarse en español. */
  const cambiarTraduccion = (tabla, fila, campo, valor) => {
    const previas = fila.traducciones || {};
    const delIdioma = { ...(previas[editando] || {}) };
    if (valor.trim()) delIdioma[campo] = valor;
    else delete delIdioma[campo];
    const traducciones = { ...previas, [editando]: delIdioma };

    const aplicar = (lista) => lista.map((x) => (x.id === fila.id ? { ...x, traducciones } : x));
    if (tabla === "categorias") setCats(aplicar);
    else setProds(aplicar);

    diferir(
      `trad:${tabla}:${fila.id}:${campo}`,
      () => supabase.from(tabla).update({ traducciones }).eq("id", fila.id)
    );
  };

  const cambiarLogo = async (archivo) => {
    setErrLogo("");
    if (!archivo) return;
    setSubiendo(true);
    const r = await subirLogo(local.id, archivo);
    if (r.error) {
      setErrLogo(r.error);
    } else {
      setDatos((d) => ({ ...d, logo_url: r.url }));
      await supabase.from("locales").update({ logo_url: r.url }).eq("id", local.id);
    }
    setSubiendo(false);
  };

  const quitarLogo = async () => {
    setErrLogo("");
    setDatos((d) => ({ ...d, logo_url: null }));
    await supabase.from("locales").update({ logo_url: null }).eq("id", local.id);
  };

  const cambiarLocal = (campo, valor, inmediato) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    diferir(
      `local:${campo}`,
      () => supabase.from("locales").update({ [campo]: valor }).eq("id", local.id),
      inmediato ? 0 : 800
    );
  };

  /* ── categorías ────────────────────────────────────────── */
  const agregarCat = async () => {
    const nombre = nuevaCat.trim();
    if (!nombre) return;
    setNuevaCat("");
    setEstado("guardando");
    const { data, error } = await supabase
      .from("categorias")
      .insert({ local_id: local.id, nombre, orden: cats.length + 1 })
      .select()
      .single();
    if (!error && data) setCats((c) => [...c, data]);
    setEstado(error ? "mal" : "al-dia");
  };

  const renombrarCat = (id, nombre) => {
    setCats((c) => c.map((x) => (x.id === id ? { ...x, nombre } : x)));
    diferir(`cat:${id}`, () => supabase.from("categorias").update({ nombre }).eq("id", id));
  };

  const borrarCat = async (cat) => {
    const cuantos = prods.filter((p) => p.categoria_id === cat.id).length;
    if (!confirm(`¿Borrar "${cat.nombre}" y sus ${cuantos} productos?`)) return;
    setEstado("guardando");
    const { error } = await supabase.from("categorias").delete().eq("id", cat.id);
    if (!error) {
      setCats((c) => c.filter((x) => x.id !== cat.id));
      setProds((p) => p.filter((x) => x.categoria_id !== cat.id));
    }
    setEstado(error ? "mal" : "al-dia");
  };

  /* ── productos ─────────────────────────────────────────── */
  const agregarProd = async (cat) => {
    setEstado("guardando");
    const orden = prods.filter((p) => p.categoria_id === cat.id).length + 1;
    const { data, error } = await supabase
      .from("productos")
      .insert({ local_id: local.id, categoria_id: cat.id, nombre: "Producto nuevo", precio: 0, orden })
      .select()
      .single();
    if (!error && data) setProds((p) => [...p, data]);
    setEstado(error ? "mal" : "al-dia");
  };

  const cambiarProd = (id, campo, valor, inmediato) => {
    setProds((p) => p.map((x) => (x.id === id ? { ...x, [campo]: valor } : x)));
    diferir(
      `prod:${id}:${campo}`,
      () => supabase.from("productos").update({ [campo]: valor }).eq("id", id),
      inmediato ? 0 : 800
    );
  };

  const borrarProd = async (id) => {
    setEstado("guardando");
    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (!error) setProds((p) => p.filter((x) => x.id !== id));
    setEstado(error ? "mal" : "al-dia");
  };

  /* ── vista previa: se arma con la misma forma que devuelve la base ── */
  const vistaPrevia = {
    nombre: datos.nombre, zona: datos.zona, direccion: datos.direccion,
    lema: datos.lema, logo: datos.logo_url, paleta: datos.paleta, tipografia: datos.tipografia, idiomas,
    categorias: cats.map((c) => ({
      nombre: c.nombre,
      t: c.traducciones || {},
      items: prods
        .filter((p) => p.categoria_id === c.id)
        .map((p) => ({
          nombre: p.nombre, desc: p.descripcion, precio: p.precio,
          disponible: p.disponible, t: p.traducciones || {},
        })),
    })),
  };

  const etiquetaEstado =
    estado === "al-dia" ? "Guardado" : estado === "guardando" ? "Guardando…" : "No se pudo guardar";

  return (
    <div className="b-wrap" style={{ padding: "26px 20px 60px" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <p className="b-eyebrow">Panel del local</p>
          <h1 className="b-h1">{datos.nombre}</h1>
          <p className="b-slug">/q/{datos.codigo}</p>
        </div>
        <div className="b-spacer" />
        <span className={`b-guardado ${estado === "al-dia" ? "" : estado === "mal" ? "mal" : "act"}`}>{etiquetaEstado}</span>
        <a className="b-btn" href={`/q/${datos.codigo}`} target="_blank" rel="noreferrer">Ver como cliente</a>
        {volver && <button className="b-btn" onClick={volver}>Volver</button>}
      </div>

      <div className="b-tabs">
        {[["carta", "Carta"], ["diseno", "Diseño"], ...(esAdmin ? [["qr", "QR y cartelería"]] : []), ["local", "Datos del local"], ["historial", "Historial"]].map(([k, l]) => (
          <button key={k} className={`b-tab ${tab === k ? "sel" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 26, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 420px", minWidth: 0 }}>
          {cargando && <p className="b-sub">Cargando la carta…</p>}

          {!cargando && tab === "carta" && (
            <div style={{ display: "grid", gap: 14 }}>
              {idiomas.length > 1 && (
                <div className="b-panel" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--tiza)" }}>
                    Escribiendo en
                  </span>
                  {idiomas.map((k) => (
                    <button key={k} className={`b-btn mini ${editando === k ? "oro" : ""}`} onClick={() => setEditando(k)}>
                      {IDIOMAS[k].nombre}
                    </button>
                  ))}
                  {editando !== BASE && (
                    <span className="b-nota" style={{ flex: "1 1 100%", margin: 0 }}>
                      Escribí acá las categorías y las descripciones en {IDIOMAS[editando].nombre.toLowerCase()}.
                      Los nombres de los platos son los mismos en todos los idiomas y no se editan desde acá:
                      “Provoleta” se explica en la descripción, no se cambia por otra palabra. Lo que dejes
                      vacío se muestra en español.
                    </span>
                  )}
                </div>
              )}

              <div className="b-panel" style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                <label className="b-campo" style={{ flex: "1 1 220px", margin: 0 }}>
                  <span>Nueva categoría</span>
                  <input className="b-in" value={nuevaCat} placeholder="Ej: Tapas, Vinos, Postres"
                    onChange={(e) => setNuevaCat(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && agregarCat()} />
                </label>
                <button className="b-btn oro" onClick={agregarCat}>Agregar categoría</button>
              </div>

              {cats.map((cat) => (
                <div className="b-panel" key={cat.id}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                    <input className="b-in" style={{ flex: "1 1 180px", fontFamily: "var(--display)", fontSize: 18 }}
                      value={editando === BASE ? cat.nombre : (cat.traducciones?.[editando]?.nombre || "")}
                      placeholder={editando === BASE ? "Nombre de la categoría" : cat.nombre}
                      onChange={(e) => editando === BASE
                        ? renombrarCat(cat.id, e.target.value)
                        : cambiarTraduccion("categorias", cat, "nombre", e.target.value)} />
                    <button className="b-btn mini rojo" onClick={() => borrarCat(cat)}>Borrar</button>
                  </div>

                  {prods.filter((p) => p.categoria_id === cat.id).map((it) => (
                    <div className="b-fila" key={it.id}>
                      <div style={{ flex: "1 1 auto", minWidth: 0, display: "grid", gap: 6 }}>
                        {editando === BASE ? (
                          <input className="b-in" value={it.nombre} placeholder="Nombre del producto"
                            onChange={(e) => cambiarProd(it.id, "nombre", e.target.value)} />
                        ) : (
                          /* El nombre del plato es uno solo para los tres idiomas.
                             Se muestra para saber de qué producto es la descripción
                             de abajo, pero no se edita ni se traduce. */
                          <div className="b-in" style={{ opacity: 0.65, background: "transparent",
                            borderStyle: "dashed", display: "flex", alignItems: "center",
                            justifyContent: "space-between", gap: 8 }}>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {it.nombre}
                            </span>
                            <span style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase",
                              color: "var(--tiza)", flex: "0 0 auto" }}>igual en todos</span>
                          </div>
                        )}
                        <input className="b-in" style={{ fontSize: 12.5 }}
                          value={editando === BASE ? (it.descripcion || "") : (it.traducciones?.[editando]?.desc || "")}
                          placeholder={editando === BASE
                            ? "Descripción (opcional)"
                            : (it.descripcion || `Descripción en ${IDIOMAS[editando].nombre.toLowerCase()}`)}
                          onChange={(e) => editando === BASE
                            ? cambiarProd(it.id, "descripcion", e.target.value)
                            : cambiarTraduccion("productos", it, "desc", e.target.value)} />
                      </div>
                      <div style={{ display: "grid", gap: 6, flex: "0 0 128px" }}>
                        <input className="b-in num" type="number" min="0" value={it.precio}
                          onChange={(e) => cambiarProd(it.id, "precio", Number(e.target.value))} />
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="b-btn mini" style={{ flex: 1, color: it.disponible ? "var(--bronce2)" : "var(--tiza)" }}
                            onClick={() => cambiarProd(it.id, "disponible", !it.disponible, true)}>
                            {it.disponible ? "En carta" : "Sin stock"}
                          </button>
                          <button className="b-btn mini rojo" onClick={() => borrarProd(it.id)}>✕</button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button className="b-btn mini" style={{ marginTop: 12 }} onClick={() => agregarProd(cat)}>
                    + Agregar producto
                  </button>
                </div>
              ))}

              {cats.length === 0 && (
                <p className="b-sub">Empezá creando una categoría, por ejemplo “Hamburguesas”.</p>
              )}
            </div>
          )}

          {!cargando && tab === "diseno" && (
            <div style={{ display: "grid", gap: 14 }}>

              <div className="b-panel">
                <p className="b-eyebrow">Colores de la carta</p>
                <p className="b-sub" style={{ marginBottom: 16 }}>
                  El fondo, el color del texto y el de los acentos. Mirá el celular de la derecha.
                </p>
                <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>
                  {CLAVES_PALETA_CARTA.map((k) => {
                    const t = PALETAS_CARTA[k];
                    const sel = (datos.paleta || "papel") === k;
                    return (
                      <button key={k} className={`b-tema ${sel ? "sel" : ""}`}
                        onClick={() => cambiarLocal("paleta", k, true)}>
                        <span className="b-swatch" style={{ background: t.v["--m-bg"], color: t.v["--m-tinta"] }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13 }}>
                            Aa
                            <span style={{ width: 22, height: 4, borderRadius: 2, background: t.v["--m-acento"] }} />
                            <span style={{ color: t.v["--m-suave"], fontSize: 11 }}>$12.500</span>
                          </span>
                        </span>
                        <span style={{ fontSize: 14, color: sel ? "var(--bronce2)" : "var(--hueso)" }}>{t.nombre}</span>
                        <span style={{ fontSize: 11.5, color: "var(--tiza)", lineHeight: 1.45 }}>{t.para}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="b-panel">
                <p className="b-eyebrow">Tipografía de la carta</p>
                <p className="b-sub" style={{ marginBottom: 16 }}>
                  Las letras y cómo se arma la portada. Se elige aparte de los colores: un bodegón puede
                  tener letras de cartel, y una cervecería puede ir en claro.
                </p>
                <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>
                  {CLAVES_TIPOGRAFIA.map((k) => {
                    const t = TIPOGRAFIAS[k];
                    const sel = (datos.tipografia || "clasica") === k;
                    const previa = estiloDe(datos.paleta, k).v;
                    return (
                      <button key={k} className={`b-tema ${sel ? "sel" : ""}`}
                        onClick={() => cambiarLocal("tipografia", k, true)}>
                        <span className="b-swatch" style={{ background: previa["--m-bg"], color: previa["--m-tinta"],
                          fontFamily: previa["--m-display"], fontSize: 17 }}>
                          Doble cheddar
                        </span>
                        <span style={{ fontSize: 14, color: sel ? "var(--bronce2)" : "var(--hueso)" }}>{t.nombre}</span>
                        <span style={{ fontSize: 11.5, color: "var(--tiza)", lineHeight: 1.45 }}>{t.para}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="b-panel">
                <p className="b-eyebrow">Idiomas de la carta</p>
                <p className="b-sub" style={{ marginBottom: 14 }}>
                  Marcá los que quieras ofrecer. Si hay más de uno, el cliente ve unos botones arriba de la
                  carta para cambiar de idioma, y al escanear se abre directo en el de su celular.
                </p>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {CLAVES.map((k) => (
                    <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14,
                      cursor: k === BASE ? "default" : "pointer" }}>
                      <input type="checkbox" checked={idiomas.includes(k)} disabled={k === BASE}
                        onChange={() => cambiarIdioma(k)}
                        style={{ width: 16, height: 16, accentColor: "#C79A4B" }} />
                      <span style={{ color: idiomas.includes(k) ? "var(--hueso)" : "var(--tiza)" }}>
                        {IDIOMAS[k].nombre}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="b-nota" style={{ marginTop: 14 }}>
                  El español no se puede desmarcar: es la base. Lo que no traduzcas se muestra en español.
                  Las traducciones se escriben en la solapa Carta.
                </p>
              </div>

            </div>
          )}

          {!cargando && tab === "qr" && esAdmin && <PlacaQR local={datos} />}

          {!cargando && tab === "local" && (
            <div className="b-panel">
              {[["nombre", "Nombre del local"], ["lema", "Frase de la portada"], ["zona", "Zona"], ["direccion", "Dirección"]].map(([k, et]) => (
                <label className="b-campo" key={k}>
                  <span>{et}</span>
                  <input className="b-in" value={datos[k] || ""} onChange={(e) => cambiarLocal(k, e.target.value)} />
                </label>
              ))}
              <div style={{ marginTop: 22, borderTop: "1px solid var(--linea)", paddingTop: 20 }}>
                <p className="b-eyebrow">Logo del local</p>
                <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ width: 74, height: 74, borderRadius: 3, border: "1px solid var(--linea)",
                    background: "#ECE7DB", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                    {datos.logo_url
                      ? <img src={datos.logo_url} alt="Logo" style={{ maxWidth: 62, maxHeight: 62, objectFit: "contain" }} />
                      : <span style={{ fontSize: 10, color: "#8A9491", textAlign: "center", lineHeight: 1.3 }}>sin<br />logo</span>}
                  </div>
                  <div style={{ flex: "1 1 200px", display: "grid", gap: 8 }}>
                    <input className="b-in" type="file" accept="image/png" disabled={subiendo}
                      style={{ padding: 8, fontSize: 12 }}
                      onChange={(e) => cambiarLogo(e.target.files?.[0] || null)} />
                    {datos.logo_url && (
                      <button className="b-btn mini rojo" style={{ justifySelf: "start" }} onClick={quitarLogo}>
                        Quitar el logo
                      </button>
                    )}
                  </div>
                </div>
                {subiendo && <p className="b-nota" style={{ marginTop: 10 }}>Subiendo…</p>}
                {errLogo && <p className="b-error" style={{ marginTop: 10 }}>{errLogo}</p>}
                <p className="b-nota" style={{ marginTop: 10 }}>
                  Solo PNG, hasta {LIMITE_KB} KB. Aparece chico en la esquina de arriba a la derecha de la
                  carta, así que un logo simple se lee mejor que uno con mucho detalle. Con fondo
                  transparente queda bien sobre cualquier color.
                </p>
              </div>

              <p className="b-nota" style={{ marginTop: 18 }}>
                El código del QR ({datos.codigo}) no se puede cambiar. Es lo que está impreso en los acrílicos de las mesas.
              </p>
            </div>
          )}

          {!cargando && tab === "historial" && (
            <div className="b-panel">
              <p className="b-eyebrow">Todo lo que se tocó en esta carta</p>
              {historial.length === 0 && <p className="b-sub">Todavía no hay movimientos registrados.</p>}
              {historial.map((h) => (
                <div key={h.id} style={{ fontSize: 12.5, color: "var(--tiza)", borderLeft: "2px solid var(--linea)", padding: "6px 0 6px 12px", marginBottom: 8, lineHeight: 1.5 }}>
                  <time style={{ fontFamily: "var(--mono)", fontSize: 11, display: "block", color: "#61756F" }}>
                    {new Date(h.creado_en).toLocaleString("es-AR")}
                  </time>
                  <span className={`b-chip ${h.rol === "plataforma" ? "on" : ""}`} style={{ marginRight: 8 }}>
                    {h.rol === "plataforma" ? "Plataforma" : "Local"}
                  </span>
                  {h.texto}
                  {h.desde && <span style={{ color: "#61756F" }}> (antes {h.desde})</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: "0 0 auto", position: "sticky", top: 20 }}>
          <p className="b-eyebrow" style={{ textAlign: "center" }}>Lo que ve el cliente</p>
          <Carta carta={vistaPrevia} enFono />
        </div>
      </div>
    </div>
  );
}
