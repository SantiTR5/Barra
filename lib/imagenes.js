"use client";

import { supabase } from "@/lib/supabase";

export const LIMITE_KB = 1024;          // logos: PNG chico y liviano
export const LADO_FOTO = 900;           // píxeles del lado mayor de una foto

/* ── logos ─────────────────────────────────────────────────── */

export async function subirLogo(localId, archivo) {
  if (!archivo) return { url: null };

  if (archivo.type !== "image/png")
    return { error: "El logo tiene que ser un archivo PNG." };

  if (archivo.size > LIMITE_KB * 1024)
    return { error: `El PNG no puede pesar más de ${LIMITE_KB} KB. El tuyo pesa ${Math.round(archivo.size / 1024)} KB.` };

  const ruta = `${localId}/logo-${Date.now()}.png`;
  const { error } = await supabase.storage
    .from("logos")
    .upload(ruta, archivo, { contentType: "image/png", upsert: true });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from("logos").getPublicUrl(ruta);
  return { url: data.publicUrl };
}

/* ── fotos de platos ───────────────────────────────────────── */

/* Achica y recorta cuadrado antes de subir.
   Un celular saca fotos de 4 o 5 MB; sin esto, un bar con 60 platos
   sube 300 MB y la carta tarda una eternidad en abrir sobre el wifi
   del local. Acá queda en unos 100 KB por foto. */
function procesar(archivo) {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onerror = () => rechazar(new Error("No se pudo leer el archivo."));
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => rechazar(new Error("El archivo no parece una imagen."));
      img.onload = () => {
        const lado = Math.min(img.width, img.height);
        const sx = (img.width - lado) / 2;
        const sy = (img.height - lado) / 2;

        const lienzo = document.createElement("canvas");
        lienzo.width = LADO_FOTO;
        lienzo.height = LADO_FOTO;
        const ctx = lienzo.getContext("2d");
        ctx.drawImage(img, sx, sy, lado, lado, 0, 0, LADO_FOTO, LADO_FOTO);

        lienzo.toBlob(
          (blob) => (blob ? resolver(blob) : rechazar(new Error("No se pudo procesar la imagen."))),
          "image/jpeg",
          0.82
        );
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });
}

export async function subirFoto(localId, productoId, archivo) {
  if (!archivo) return { url: null };
  if (!archivo.type.startsWith("image/"))
    return { error: "Elegí una imagen (JPG o PNG)." };

  let blob;
  try {
    blob = await procesar(archivo);
  } catch (e) {
    return { error: e.message };
  }

  const ruta = `${localId}/plato-${productoId}-${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from("fotos")
    .upload(ruta, blob, { contentType: "image/jpeg", upsert: true });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from("fotos").getPublicUrl(ruta);
  return { url: data.publicUrl, peso: Math.round(blob.size / 1024) };
}
