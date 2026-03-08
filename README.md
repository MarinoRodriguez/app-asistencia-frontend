# App Asistencia - Frontend

Frontend web para gestión de asistencia (admin y staff). Construido con **React + Vite** y servido por **Nginx** en contenedor.

## Requisitos
- Node.js 20+
- npm
- Docker (opcional para contenedores)

## Desarrollo local
```bash
npm install
npm run dev
```

Por defecto el frontend apunta a `https://localhost:7224`. Puedes cambiarlo con:

```bash
VITE_API_URL=http://localhost:8080 npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Docker (runtime config)
El contenedor **inyecta** el API URL en runtime con `VITE_API_URL`:

```bash
docker run -p 80:80 \
  -e VITE_API_URL=http://localhost:8080 \
  repo/app-asistencia-frontend:1.0.0
```

## Compose de ejemplo
En el root del repo hay un ejemplo:

- `docker-compose.example.yml`

## Estructura
- `src/pages` vistas principales
- `src/components` componentes UI y layout
- `src/api` cliente HTTP

## Notas
- El frontend consume el backend via `window.__ENV__.VITE_API_URL` (runtime).
- Si estás dentro de `docker-compose`, usa `http://api:8080`.
- Desde el navegador local, usa el puerto publicado del host (ej. `http://localhost:8074`).
