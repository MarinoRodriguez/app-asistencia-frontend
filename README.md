# ClientReact

Frontend React para `app-asistencia`, replicando los flujos del cliente Blazor (`AssistantApp.Client`) y consumiendo la API de `AssistantApp.API`.

## Setup

1. Copia variables de entorno:

```bash
cp .env.example .env
```

2. Instala dependencias y ejecuta:

```bash
npm install
npm run dev
```

## Variables

- `VITE_API_URL`: URL base del backend API (ej: `https://localhost:7224`).

## Rutas

- `/` Inicio (eventos activos + accesos admin)
- `/attendance/:eventId` Toma de asistencia (staff mobile)
- `/admin/people` CRUD de personas
- `/admin/groups` CRUD de grupos
- `/admin/events` CRUD de eventos + invitaciones
