# BARRA · Cómo poner la web a andar

Seguí los pasos en orden. No saltees ninguno. Si algo falla, frená ahí y avisá:
seguir adelante con un paso roto solo hace más difícil encontrar el problema.

---

## Antes de empezar

Necesitás tener hecho lo de Supabase:

- El archivo `barra-supabase.sql` ejecutado (las 6 tablas creadas).
- Tu usuario creado en Authentication → Users y cargado en la tabla `admins`.

Si eso no está, hacelo primero.

---

## Paso 1 · Instalar Node.js

Entrá a **nodejs.org** y descargá la versión que dice **LTS**. Instalala como
cualquier programa, apretando Siguiente.

Para confirmar que quedó bien, abrí una terminal:

- **Windows:** menú Inicio → escribí `PowerShell` → Enter
- **Mac:** Spotlight (Cmd + Espacio) → escribí `Terminal` → Enter

Escribí esto y apretá Enter:

```
node -v
```

Tiene que responderte algo como `v22.11.0`. Si dice "no se reconoce el comando",
cerrá la terminal, abrila de nuevo y probá otra vez.

---

## Paso 2 · Abrir la carpeta del proyecto

Descomprimí `barra-web.zip` en algún lugar cómodo, por ejemplo el Escritorio.

En la terminal, entrá a esa carpeta:

```
cd Desktop/barra-web
```

(Si la pusiste en otro lado, cambiá la ruta. En Windows también podés abrir la
carpeta en el Explorador, hacer clic derecho en un espacio vacío y elegir
"Abrir en Terminal".)

---

## Paso 3 · Instalar lo que la web necesita

```
npm install
```

Tarda uno o dos minutos y escribe muchas líneas. Es normal. Se crea una carpeta
`node_modules` que no hay que tocar.

---

## Paso 4 · Cargar tus claves de Supabase

En Supabase, andá a **Settings → API** y copiá dos valores:

- **Project URL**
- **anon public** (la clave larga)

En la carpeta del proyecto vas a ver un archivo `.env.local.example`.
Hacé una copia y renombrala a **`.env.local`** (sin `.example`). Abrila con el
Bloc de notas y pegá tus dos valores:

```
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Guardá y cerrá.

> Esa clave puede verse desde el navegador sin riesgo. La seguridad no está en
> esconderla: está en las reglas de la base de datos. Sin sesión iniciada, esa
> clave no abre nada.

---

## Paso 5 · Arrancar

```
npm run dev
```

Cuando diga `Ready`, abrí el navegador en:

```
http://localhost:3000
```

Te va a llevar a la pantalla de acceso. Entrá con el email y la contraseña del
usuario que creaste en Supabase.

- Si tu usuario está en la tabla `admins` → ves el panel con todos los locales.
- Si es el usuario de un bar → entrás directo a la carta de ese bar.

Para ver la carta como el cliente en la mesa:

```
http://localhost:3000/q/CODIGO
```

Donde `CODIGO` es el que te devolvió Supabase al crear el local (algo como
`A7K2M9`). También está el botón "Ver como cliente" dentro del panel.

Para frenar el servidor: `Ctrl + C` en la terminal.

---

## Paso 6 · Publicarlo en internet

Mientras uses `npm run dev`, la web solo existe en tu computadora. Para que la
vean los clientes:

1. Creá una cuenta en **github.com** y subí esta carpeta a un repositorio.
2. Creá una cuenta en **vercel.com** y elegí "Import Project" → tu repositorio.
3. Vercel detecta Next.js solo. Antes de darle Deploy, cargá las dos variables
   del paso 4 en **Environment Variables** (el archivo `.env.local` no se sube).
4. Deploy. En un par de minutos tenés una dirección pública.
5. Cuando tengas dominio propio, se conecta desde Settings → Domains.

**Recién con el dominio final andando generá los QR definitivos.** Cada QR
apunta a `tudominio.com/q/` más el código del bar. Es lo único de todo el
sistema que no se puede editar después de impreso.

---

## Cómo dar de alta un bar nuevo

1. En el panel de plataforma, "Dar de alta un local". Anotá el código que queda.
2. En Supabase → Authentication → Users → Add user, creá el usuario del dueño
   (tildá "Auto Confirm User").
3. En el SQL Editor, vinculá al dueño con su bar:

```sql
insert into public.miembros (local_id, user_id, nombre)
select l.id, u.id, 'Nombre del dueño'
from public.locales l, auth.users u
where l.codigo = 'CODIGO-DEL-BAR'
  and u.email = 'email-del-dueño@ejemplo.com';
```

Ese paso queda a mano a propósito: dar acceso a un local es una decisión
comercial, no un botón que conviene tener suelto en una pantalla.

---

## Si algo no funciona

| Qué ves | Qué pasa |
|---|---|
| `npm: command not found` | Node no quedó instalado. Volvé al paso 1. |
| La página carga en blanco | Falta el archivo `.env.local` o tiene las claves mal pegadas. |
| "Email o contraseña incorrectos" | El usuario no existe en Supabase o no está confirmado. |
| Entrás pero no ves ningún local | Tu usuario no está en `admins` ni en `miembros`. |
| "Carta no disponible" en /q/CODIGO | El código está mal, o el local está suspendido. |

Cuando algo falle, copiá el texto completo del error antes de tocar nada. Ese
texto es lo que permite resolverlo rápido.
