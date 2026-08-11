"use client";

import { supabase } from "@/lib/supabase";

export const LIMITE_KB = 1024;

/* Sube el PNG al depósito, dentro de la carpeta del local.
   La carpeta es el id del local a propósito: es lo que le permite a
   la base comprobar el permiso sin confiar en el navegador. */
export async function subirLogo(localId, archivo) {
  if (!archivo) return { url: null };

  if (archivo.type !== "image/png")
    return { error: "El logo tiene que ser un archivo PNG." };

  if (archivo.size > LIMITE_KB * 1024)
    return { error: `El PNG no puede pesar más de ${LIMITE_KB} KB. El tuyo pesa ${Math.round(archivo.size / 1024)} KB.` };

  // El momento en el nombre evita que el navegador muestre la imagen
  // vieja guardada en su memoria después de cambiarla.
  const ruta = `${localId}/logo-${Date.now()}.png`;

  const { error } = await supabase.storage
    .from("logos")
    .upload(ruta, archivo, { contentType: "image/png", upsert: true });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from("logos").getPublicUrl(ruta);
  return { url: data.publicUrl };
}
