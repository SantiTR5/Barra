import Carta from "@/components/Carta";
import { supabase } from "@/lib/supabase";

// Se regenera cada 30 segundos: un cambio de precio se ve casi al
// instante, y el celular del cliente recibe una página ya armada.
export const revalidate = 30;

export async function generateMetadata({ params }) {
  const { codigo } = await params;
  const { data } = await supabase.rpc("carta", { p_codigo: codigo });
  return { title: data?.nombre ? `${data.nombre} · Carta` : "Carta" };
}

export default async function PaginaCarta({ params }) {
  const { codigo } = await params;
  const { data, error } = await supabase.rpc("carta", { p_codigo: codigo });

  if (error || !data) {
    return (
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 26, margin: 0 }}>Carta no disponible</h1>
        <p className="b-sub" style={{ marginTop: 12 }}>
          Puede que el local esté dado de baja. Pedile la carta al mozo.
        </p>
      </div>
    );
  }

  return <Carta carta={data} />;
}
