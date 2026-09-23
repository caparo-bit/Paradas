# TaxiDiario

Aplicación web sencilla para taxistas: controla tus jornadas de trabajo, registra servicios (carreras), gastos, consulta paradas y revisa un panel con tus estadísticas del día, la semana o el total. Todo se guarda en el navegador (localStorage) — no necesita servidor ni base de datos.

Inspirada en la idea de ParadaMaya, pero reescrita como un proyecto 100% independiente (sin autenticación, sin backend, sin dependencias de ninguna plataforma) para que puedas subirla a tu propio GitHub y desplegarla donde quieras (Vercel, Netlify, GitHub Pages...).

## Funciones

- 🕒 **Jornada**: inicia y cierra tu turno, con kilómetros de inicio y fin.
- 🚕 **Servicios**: registra origen, destino, importe, propina, forma de pago y pasajeros.
- ⛽ **Gastos**: combustible, peajes, comida, parking, lavado, otros.
- 📍 **Paradas**: listado consultable de paradas de taxi (edítalo con las tuyas en `src/data/paradas.ts`).
- 📊 **Panel**: ingresos, gastos, neto, número de servicios y media por servicio (hoy / semana / total).

## Requisitos

- Node.js 18+
- npm 9+

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Se abre en `http://localhost:8080`.

## Compilar para producción

```bash
npm run build
npm run preview
```

## Publicar en GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/taxidiario.git
git push -u origin main
```

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (con persistencia en localStorage)

## Personalizar

- Colores de marca: `tailwind.config.js`
- Tipos de gasto / pago: `src/lib/types.ts` y `src/lib/format.ts`
- Paradas: `src/data/paradas.ts`
