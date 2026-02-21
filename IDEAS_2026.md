# IDEAS 2026 — MeCard Platform

## 1. Permisos de Salida Mejorados

### Campos nuevos
- **Camión original**: Ruta/camión donde normalmente se va el alumno
- **Camión destino**: Ruta/camión donde se subirá (con amigo, etc.)
- **Grado y grupo**: Visibles en la solicitud y en el dashboard del colegio
- **Tipo "No asiste"**: Reportar que el niño no va a la escuela ese día (alerta especial al colegio)

### Directorio de personas autorizadas
- 3 contactos permanentes por familia (abuela, tío, nana, etc.)
- Campos: nombre, parentesco, teléfono, email, identificación
- Selector rápido al crear permiso + opción "Otra persona" para captura ad-hoc
- Ambos padres ven y administran los mismos contactos

### Notificaciones
- Al colegio (siempre)
- A la familia que recoge (si el niño se va con otro alumno)
- A persona externa (abuelo, tío, etc.) por SMS/email
- Al co-padre (notificación cruzada automática)
- Nuevos tipos: `PERMISSION_REQUESTED`, `PERMISSION_APPROVED`, `PERMISSION_REJECTED`, `PERMISSION_CANCELLED`, `CHILD_NOT_ATTENDING`

### Configuración escolar de permisos
| Configuración | Descripción | Default |
|---|---|---|
| Horas de anticipación | Tiempo mínimo antes de la salida | 6 horas |
| Requiere ambos padres | Si se necesita aprobación de ambos padres o basta uno | No (uno basta) |
| Hora límite diaria | Última hora para solicitudes del mismo día | 14:00 |
| Requiere identificación | Si la persona debe presentar INE/ID | Sí |
| Permitir "no asiste" | Reportar inasistencia desde la app | Sí |
| Días permitidos | Días en que se aceptan permisos | Lunes a Viernes |
| Máximo permisos por semana | Límite por alumno por semana | Sin límite |
| Notificación a dirección | Dirección recibe copia de cada permiso | Sí |
| Requiere motivo | Si el motivo es obligatorio | Sí |
| Mensaje personalizado | Texto visible al padre al crear permiso | "" |
| Bloqueo en exámenes | No permitir permisos en fechas de examen | No |
| Validación de ruta | Verificar que la ruta destino sea válida | No |

---

## 2. Sistema de Viajes y Excursiones

### Vista Escuela (SchoolTripsView)
- CRUD de viajes: nombre, destino, descripción, fechas, costo por alumno, cupo máximo
- Grados permitidos para cada viaje
- Status: borrador → abierto → cerrado → completado / cancelado
- Dashboard por viaje: inscritos vs cupo, pagos recibidos vs esperados, documentos pendientes
- Lista final exportable con status de pago y documentos
- Configurar y enviar recordatorios (pago, documentos, general)
- Vista de pagos parciales: quién ha pagado cuánto, parcialidades atrasadas

### Vista Padre (ParentTripsView)
- Lista de viajes disponibles con cards (nombre, destino, fecha, costo, cupo)
- Inscripción: seleccionar hijo(s), aceptar términos, elegir plan de pago
- Pagos: completo o en parcialidades con fechas límite
- Barra de progreso de pago
- Checklist de documentos entregados (carta responsiva, etc.)
- Detalle: itinerario, contacto de emergencia, compañeros inscritos

### Tipos de datos
- `SchoolTrip`: id, schoolId, nombre, destino, descripcion, fechaSalida, fechaRegreso, costoTotal, costoPorAlumno, cupoMaximo, cupoDisponible, gradosPermitidos, status, fechaLimitePago, fechaLimiteInscripcion, requiereDocumentos, documentosRequeridos, itinerario, contactoEmergencia
- `TripEnrollment`: id, tripId, studentId, parentId, status (inscrito/pagado/cancelado/lista_espera), totalPagado, saldoPendiente, documentosEntregados
- `TripPayment`: id, enrollmentId, tripId, monto, parcialidad, totalParcialidades, fechaPago, status
- `TripReminder`: id, tripId, tipo (pago/documento/general), mensaje, fechaEnvio, enviado
- Notificaciones: `TRIP_CREATED`, `TRIP_PAYMENT_DUE`, `TRIP_PAYMENT_CONFIRMED`, `TRIP_REMINDER`

### Rutas nuevas
- `/parent/trips` → ParentTripsView
- `/school/trips` → SchoolTripsView

---

## 3. Multi-Padre (Mamá y Papá)

### Enfoque: Cuentas separadas iguales (estilo Brightwheel/ClassDojo)
- Cada padre tiene su propio login
- Ambos se vinculan a los mismos hijos mediante **código de invitación de 6 dígitos**
- Sin jerarquía en V1 — ambos padres iguales
- Toda acción queda en **bitácora** (quién, qué, cuándo, desde qué dispositivo)

### Comportamiento
- **Depósitos**: Ambos pueden depositar, ambos reciben notificación
- **Restricciones/límites**: Ambos pueden modificar, el otro recibe notificación del cambio
- **Permisos**: Ambos pueden crear/cancelar. Si el colegio requiere 2 aprobaciones, se espera a ambos
- **Conflictos**: Última acción gana + notificación cruzada. Evolucionar a roles si se necesita

### Cambios técnicos
- `StudentProfile`: agregar `parentIds: string[]` (mantener `parentId` para compatibilidad)
- `ParentProfile`: agregar `linkedParentId?: string`
- Nueva tabla `parent_student_links`: (parent_id, student_id, role, linked_at, invitation_code, status)
- Nueva tabla `activity_log`: (id, userId, userName, action, entityType, entityId, details, deviceInfo, timestamp)
- `ParentPortal`: mostrar bitácora, badge "Vinculado con: [co-padre]"
- Botón "Invitar co-padre" en perfil → genera código → el otro padre lo ingresa

### Notificaciones
- `COPARENT_ACTION`: cuando el co-padre hace cualquier acción relevante

---

## 4. Tablas Supabase necesarias

1. `parent_student_links` — Junction multi-padre
2. `authorized_contacts` — Directorio personas autorizadas
3. `exit_permissions` — Permisos de salida completos
4. `permission_approvals` — Aprobaciones por padre
5. `school_permission_config` — Configuración permisos por colegio
6. `school_trips` — Viajes/excursiones
7. `trip_enrollments` — Inscripciones
8. `trip_payments` — Pagos parcialidades
9. `trip_reminders` — Recordatorios
10. `activity_log` — Bitácora multi-padre
11. `notifications` — (ya referenciada en código pero no existe en schema)

---

## 5. Decisiones tomadas

- **Co-padres**: Cuentas separadas iguales, sin jerarquía. Evolucionar a roles si se necesita.
- **Camiones**: MeCard NO gestiona rutas. Solo registra la info como texto libre. El colegio puede cargar lista de rutas como referencia.
- **"No asiste"**: Tipo especial de permiso — importante para que el colegio sepa quién falta.
- **Contactos autorizados**: 3 permanentes + ad-hoc por permiso. A nivel familia (ambos padres los ven).
- **Viajes**: Módulo completo con parcialidades, documentos, recordatorios, listas.
