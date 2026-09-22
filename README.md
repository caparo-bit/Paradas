# ParadaMaya

Aplicación web para gestionar jornadas, servicios, paradas, gastos y el panel de actividad de ParadaMaya.

## Requisitos

- Node.js 20+
- npm 10+

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación se inicia en `http://localhost:8080`.

## Comandos útiles

```bash
npm run build       # Compilar para producción
npm run preview     # Previsualizar la compilación
npm run typecheck   # Comprobar TypeScript
npm run lint        # Ejecutar ESLint
npm test            # Ejecutar tests
```

## Publicar en GitHub

1. Crea un repositorio nuevo en GitHub llamado `paradamaya`.
2. Descomprime este proyecto.
3. Desde la carpeta del proyecto ejecuta:

```bash
git init
git add .
git commit -m "Initial ParadaMaya release"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/paradamaya.git
git push -u origin main
```

> Sustituye `TU_USUARIO` por tu usuario de GitHub.

## Despliegue

El proyecto está preparado para un despliegue basado en Vite. Antes de publicar una instancia real, configura las variables de entorno y la base de datos que utilice tu entorno.
