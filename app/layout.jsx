import "./globals.css";
import { MARCA, BAJADA } from "@/lib/marca";

export const metadata = {
  title: `${MARCA} · ${BAJADA}`,
  description: "Cartas digitales para bares y restaurantes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
