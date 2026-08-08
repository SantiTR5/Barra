import { redirect } from "next/navigation";

// La raíz del sitio no muestra nada: quien llega acá es del equipo.
// El cliente del bar entra siempre por /q/CODIGO desde el QR.
export default function Inicio() {
  redirect("/panel");
}
