"use client";

import { useEffect, useState } from "react";
import { supabase, direccionar } from "@/lib/supabase";
import EditorCarta from "@/components/EditorCarta";
import { MARCA, BAJADA } from "@/lib/marca";
import { subirLogo, LIMITE_KB } from "@/lib/imagenes";

/* ── acceso ──────────────────────────────────────────────── */
function Acceso() {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [err, setErr] = useState("");
  const [yendo, setYendo] = useState(false);

  const entrar = async () => {
    setYendo(true);
    setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: clave });
    if (error) setErr("Email o contraseña incorrectos.");
    setYendo(false);
  };

  return (
    <div className="b-wrap" style={{ padding: "72px 20px 90px", maxWidth: 460 }}>
      <p className="b-eyebrow">Acceso para locales</p>
      <h1 className="b-h1" style={{ fontSize: 42 }}>Entrá a tu carta.</h1>
      <p className="b-sub" style={{ marginTop: 12 }}>
        Cambiá precios, sacá lo que se terminó y agregá platos nuevos. Lo que guardes acá
        aparece al instante en el celular de tus clientes.
      </p>

      <div className="b-panel" style={{ marginTop: 28 }}>
        <label className="b-campo"><span>Email</span>
          <input className="b-in" type="email" autoComplete="username" value={email}
            onChange={(e) => { setEmail(e.target.value); setErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && entrar()} /></label>
        <label className="b-campo"><span>Contraseña</span>
          <input className="b-in" type="password" autoComplete="current-password" value={clave}
            onChange={(e) => { setClave(e.target.value); setErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && entrar()} /></label>
        {err && <p className="b-error">{err}</p>}
        <button className="b-btn oro" style={{ width: "100%" }} disabled={yendo} onClick={entrar}>
          {yendo ? "Entrando…" : "Entrar"}
        </button>
      </div>

      <p className="b-nota" style={{ marginTop: 34, borderTop: "1px solid var(--linea)", paddingTop: 18 }}>
        ¿Viniste a ver la carta de un bar? Escaneá el QR de tu mesa o apoyá el celular sobre el
        sticker si tiene NFC: se abre sola, sin usuario ni contraseña. Esta pantalla es solo para
        los locales y para la plataforma.
      </p>
    </div>
  );
}

/* ── panel de la plataforma ──────────────────────────────── */
function PanelPlataforma({ locales, recargar, abrir }) {
  const [alta, setAlta] = useState(null);
  const [err, setErr] = useState("");
  const [creando, setCreando] = useState(false);

  const crear = async () => {
    const nombre = (alta.nombre || "").trim();
    if (!nombre) return;
    setErr("");
    setCreando(true);

    const { data, error } = await supabase.from("locales").insert({
      nombre,
      slug: direccionar(nombre),
      zona: alta.zona || "",
    }).select().single();

    if (error) {
      setCreando(false);
      return setErr(error.message.includes("duplicate") ? "Ya existe un local con esa dirección." : error.message);
    }

    // El logo se sube después de crear el local: recién ahí existe la
    // carpeta donde guardarlo y el permiso que la protege.
    if (alta.logo && data) {
      const r = await subirLogo(data.id, alta.logo);
      if (r.error) {
        setCreando(false);
        setAlta(null);
        recargar();
        return setErr(`El local se creó, pero el logo no se pudo subir: ${r.error} Podés cargarlo después desde “Datos del local”.`);
      }
      await supabase.from("locales").update({ logo_url: r.url }).eq("id", data.id);
    }

    setCreando(false);
    setAlta(null);
    recargar();
  };

  const suspender = async (l) => {
    await supabase.from("locales").update({ activo: !l.activo }).eq("id", l.id);
    recargar();
  };

  const eliminar = async (l) => {
    if (!confirm(`¿Eliminar ${l.nombre} y toda su carta? No se puede deshacer.`)) return;
    await supabase.from("locales").delete().eq("id", l.id);
    recargar();
  };

  return (
    <div className="b-wrap" style={{ padding: "26px 20px 60px" }}>
      <p className="b-eyebrow">Plataforma</p>
      <h1 className="b-h1">{locales.length} {locales.length === 1 ? "local" : "locales"} en el sistema</h1>
      <p className="b-sub" style={{ maxWidth: "58ch" }}>
        Una cuenta por bar. Cada uno entra a la suya y toca solamente su carta. Vos entrás a todas.
      </p>

      {err && <p className="b-error" style={{ marginTop: 16 }}>{err}</p>}

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", marginTop: 24 }}>
        {locales.map((l) => (
          <div className="b-card" key={l.id}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                <h2 className="b-h2">{l.nombre}</h2>
                <span className={`b-chip ${l.activo ? "on" : "off"}`}>{l.activo ? "Activo" : "Suspendido"}</span>
              </div>
              <p className="b-slug" style={{ marginTop: 6 }}>/q/{l.codigo}</p>
            </div>
            <p className="b-sub" style={{ fontSize: 12.5 }}>{l.zona || "Sin zona"}</p>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto" }}>
              <button className="b-btn mini oro" onClick={() => abrir(l)}>Editar carta</button>
              <a className="b-btn mini" href={`/q/${l.codigo}`} target="_blank" rel="noreferrer">Ver menú</a>
              <button className="b-btn mini" onClick={() => suspender(l)}>{l.activo ? "Suspender" : "Reactivar"}</button>
              <button className="b-btn mini rojo" onClick={() => eliminar(l)}>Eliminar</button>
            </div>
          </div>
        ))}

        {alta ? (
          <div className="b-card">
            <h2 className="b-h2">Nuevo local</h2>
            <label className="b-campo"><span>Nombre</span>
              <input className="b-in" autoFocus value={alta.nombre}
                onChange={(e) => setAlta({ ...alta, nombre: e.target.value })} /></label>
            <label className="b-campo"><span>Zona</span>
              <input className="b-in" value={alta.zona} placeholder="Morón, Haedo, Castelar…"
                onChange={(e) => setAlta({ ...alta, zona: e.target.value })} /></label>

            <label className="b-campo">
              <span>Logo del local · PNG (opcional)</span>
              <input className="b-in" type="file" accept="image/png"
                style={{ padding: 8, fontSize: 12 }}
                onChange={(e) => setAlta({ ...alta, logo: e.target.files?.[0] || null })} />
            </label>
            {alta.logo && (
              <p className="b-nota" style={{ marginTop: -6 }}>
                {alta.logo.name} · {Math.round(alta.logo.size / 1024)} KB
              </p>
            )}
            <p className="b-nota" style={{ marginTop: -4 }}>
              Solo PNG, hasta {LIMITE_KB} KB. Con fondo transparente queda mejor sobre cualquier carta.
              Si no cargás ninguno, la carta sale sin logo.
            </p>

            <p className="b-slug">/{direccionar(alta.nombre) || "…"}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="b-btn oro" onClick={crear} disabled={creando}>
                {creando ? "Creando…" : "Crear local"}
              </button>
              <button className="b-btn" onClick={() => setAlta(null)} disabled={creando}>Cancelar</button>
            </div>
          </div>
        ) : (
          <button className="b-card" style={{ alignItems: "center", justifyContent: "center", color: "var(--tiza)", fontSize: 14, borderStyle: "dashed", minHeight: 180 }}
            onClick={() => setAlta({ nombre: "", zona: "", logo: null })}>
            + Dar de alta un local
          </button>
        )}
      </div>

      <div className="b-alerta" style={{ marginTop: 30 }}>
        <b style={{ color: "var(--hueso)" }}>Recordatorio interno:</b> después de crear un local,
        el dueño todavía no puede entrar. Hay que crearle el usuario en Supabase y vincularlo a su
        bar. Está explicado en el LEEME, en “Cómo dar de alta un bar nuevo”.
      </div>
    </div>
  );
}

/* ── ruteo ───────────────────────────────────────────────── */
export default function Panel() {
  const [sesion, setSesion] = useState(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [locales, setLocales] = useState([]);
  const [abierto, setAbierto] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargar = async (usuario) => {
    if (!usuario) { setCargando(false); return; }
    const [adm, locs] = await Promise.all([
      supabase.from("admins").select("user_id").eq("user_id", usuario.id).maybeSingle(),
      // Esta consulta no filtra por local: la base devuelve solo los
      // que esta persona tiene permitido ver. Ahí vive la seguridad.
      supabase.from("locales").select("*").order("nombre"),
    ]);
    setEsAdmin(Boolean(adm.data));
    setLocales(locs.data || []);
    setCargando(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      cargar(data.session?.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSesion(s);
      setAbierto(null);
      setCargando(true);
      cargar(s?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const recargar = async () => {
    const { data } = await supabase.from("locales").select("*").order("nombre");
    setLocales(data || []);
  };

  const salir = () => supabase.auth.signOut();

  if (!sesion) return <Acceso />;

  // Un dueño con un solo bar entra directo a su carta.
  const unico = !esAdmin && locales.length === 1 ? locales[0] : null;
  const local = abierto || unico;

  return (
    <>
      <header className="b-top">
        <div className="b-topin">
          <div className="b-marca">{MARCA}<small>{BAJADA}</small></div>
          <div className="b-spacer" />
          <span className="b-quien">
            {esAdmin ? "Cuenta de plataforma" : "Local"} · <b>{sesion.user.email}</b>
          </span>
          <button className="b-btn mini" onClick={salir}>Salir</button>
        </div>
      </header>

      {cargando && <p className="b-sub b-wrap" style={{ padding: 40 }}>Cargando…</p>}

      {!cargando && local && (
        <EditorCarta
          local={local}
          esAdmin={esAdmin}
          volver={esAdmin || locales.length > 1 ? () => setAbierto(null) : null}
        />
      )}

      {!cargando && !local && esAdmin && (
        <PanelPlataforma locales={locales} recargar={recargar} abrir={setAbierto} />
      )}

      {!cargando && !local && !esAdmin && locales.length === 0 && (
        <div className="b-wrap" style={{ padding: 40 }}>
          <div className="b-alerta">
            Tu usuario todavía no está vinculado a ningún local. Escribinos y lo activamos.
          </div>
        </div>
      )}

      {!cargando && !local && !esAdmin && locales.length > 1 && (
        <div className="b-wrap" style={{ padding: "26px 20px" }}>
          <p className="b-eyebrow">Tus locales</p>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
            {locales.map((l) => (
              <button key={l.id} className="b-card" style={{ textAlign: "left" }} onClick={() => setAbierto(l)}>
                <h2 className="b-h2">{l.nombre}</h2>
                <span className="b-slug">/q/{l.codigo}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
