export const roles = [
  {
    id: 1,
    name: "Administrador",
    description: "Acceso total a la configuración y reportes.",
    users: 4,
  },
  {
    id: 2,
    name: "Staff",
    description: "Registro de asistencia y lectura básica.",
    users: 12,
  },
  {
    id: 3,
    name: "Auditor",
    description: "Acceso de solo lectura a reportes y exportaciones.",
    users: 2,
  },
];

export const users = [
  {
    id: 1,
    name: "Ana Martinez",
    email: "ana.martinez@iglesia.org",
    role: "Administrador",
    status: "Activo",
  },
  {
    id: 2,
    name: "Carlos Ruiz",
    email: "carlos.ruiz@iglesia.org",
    role: "Staff",
    status: "Activo",
  },
  {
    id: 3,
    name: "Maria Flores",
    email: "maria.flores@iglesia.org",
    role: "Auditor",
    status: "Pendiente",
  },
];

export const permissions = [
  "Gestionar personas",
  "Gestionar grupos",
  "Crear eventos",
  "Configurar reglas",
  "Exportar reportes",
  "Tomar asistencia",
];
