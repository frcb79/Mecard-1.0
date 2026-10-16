# 04. Arquitectura Técnica y de Datos de MeCard

> **Fuentes de Evidencia:** [package.json](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/package.json), [vite.config.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/vite.config.ts), [tsconfig.json](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/tsconfig.json), [SUPABASE_SCHEMA.sql](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SUPABASE_SCHEMA.sql), [SECURITY_FIXES_PHASE1.sql](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SECURITY_FIXES_PHASE1.sql) y [src/services/factory.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/factory.ts).

---

## 1. Stack Tecnológico y Dependencias

```
┌────────────────────────────────────────────────────────────────────────┐
│                        STACK TECNOLÓGICO MECARD                        │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ CAPA               │ TECNOLOGÍA         │ VERSIÓN EXACTA EN REPOSITORIO│
├────────────────────┼────────────────────┼──────────────────────────────┤
│ Entorno / Runtime  │ Node.js            │ 20.x (definido en package/nvm)│
│ Gestor de Paquetes │ npm                │ >=10 <12                     │
│ Bundler / Build    │ Vite               │ ^6.0.11                      │
│ Lenguaje           │ TypeScript         │ ^5.7.3 (Strict Mode)         │
│ Core UI            │ React              │ ^19.0.0                      │
│ Router             │ React Router DOM   │ ^7.13.0                      │
│ Estilos / CSS      │ Tailwind CSS       │ ^3.4.17 + PostCSS ^8.5.1     │
│ Componentes Visual │ Lucide React       │ ^0.474.0                     │
│ Gráficas / Charts  │ Recharts           │ ^2.15.1                      │
│ QR Code Generator  │ qrcode.react       │ ^4.2.0                       │
│ CSV Parser         │ PapaParse          │ ^5.5.2                       │
│ Base de Datos / BaaS│ Supabase JS        │ ^2.48.2                      │
│ Inteligencia Art.  │ Google GenAI SDK   │ ^1.3.0                       │
│ Unit Testing       │ Vitest             │ ^1.0.4 + jsdom ^23.0.1       │
│ Testing Library    │ Testing Library    │ React ^14.1.2, DOM ^6.1.5    │
│ Hosting Frontend   │ Vercel             │ Node 20 Production Edge      │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

---

## 2. Diagrama de Arquitectura por Capas

```mermaid
graph TD
    subgraph Capa_Presentacion ["1. Capa de Presentación (Frontend SPA)"]
        UI_Login["Login & Gateways (/login)"]
        UI_Admin["Super Admin Console (/admin/*)"]
        UI_School["School Portal & Colegiaturas (/school/*)"]
        UI_POS["POS Terminal Táctil (/pos/*)"]
        UI_Parent["Parent Portal & Wallet (/parent/*)"]
        UI_Student["Student Bento Grid (/student/*)"]
        Layout["RoleBasedLayout + Sidebar + ToastContainer"]
    end

    subgraph Capa_Contextos ["2. Estado Global y Contextos"]
        AuthCtx["AuthContext (Gestión de Sesión & Role Gate)"]
        PlatformCtx["PlatformContext (Escuela activa & Estado global)"]
        ServiceCtx["ServiceContext (Inyección de Servicios vía Factory)"]
    end

    subgraph Capa_Servicios ["3. Capa de Servicios & Lógica de Negocio"]
        Factory["ServiceFactory (src/services/factory.ts)"]
        Svc_Payment["PaymentService (Mock vs Supabase)"]
        Svc_Inventory["InventoryService (Mock vs Supabase)"]
        Svc_CLABE["CLABEService (Banxico STP 646 180)"]
        Svc_Billing["BillingService (Cálculo de fees, rentas y bloqueos)"]
        Svc_Fees["SchoolFeeService (Colegiaturas, becas y recargos)"]
        Svc_Rewards["RewardsService (Puntos, tiers y marketplace)"]
        Svc_AI["GeminiService (@google/genai)"]
    end

    subgraph Capa_Datos_Seguridad ["4. Capa de Datos y Persistencia (Supabase)"]
        Client["SupabaseClient (src/lib/supabaseClient.ts)"]
        RLS["Políticas Row-Level Security (Aislamiento por school_id)"]
        RPC_Atomic["Funciones RPC Atómicas (FOR UPDATE - Bloqueo de Saldos)"]
        DB_Tables["52 Tablas PostgreSQL"]
    end

    UI_Login & UI_Admin & UI_School & UI_POS & UI_Parent & UI_Student --> Layout
    Layout --> AuthCtx & PlatformCtx & ServiceCtx
    ServiceCtx --> Factory
    Factory --> Svc_Payment & Svc_Inventory & Svc_CLABE & Svc_Billing & Svc_Fees & Svc_Rewards & Svc_AI
    Svc_Payment & Svc_Inventory & Svc_Rewards --> Client
    Client --> RLS --> RPC_Atomic --> DB_Tables
```

---

## 3. Modelo de Aislamiento Multi-Tenant (Seguridad Escolar)

La plataforma está diseñada con una arquitectura **Single-Database, Multi-Tenant con Partición Lógica** mediante la columna `school_id` y políticas estrictas de **Row-Level Security (RLS)** en PostgreSQL:

```mermaid
graph LR
    subgraph Peticion_Cliente ["Petición Autenticada"]
        Token["JWT Token (auth.uid)"]
    end

    subgraph RLS_PostgreSQL ["Motor de Seguridad PostgreSQL (RLS)"]
        PolicyCheck{"¿user_roles contiene<br/>school_id coincidente?"}
        Allow["Acceso Concedido<br/>(Datos del Colegio Autorizado)"]
        Deny["Acceso Denegado (403 / 0 filas)<br/>Aislamiento Total"]
    end

    subgraph Colegios_Separados ["Datos Aislados en Tablas"]
        School_A["Colegio A (Alumnos, POS, Saldos)"]
        School_B["Colegio B (Alumnos, POS, Saldos)"]
        SuperAdmin["Super Admin (Bypass Multi-Tenant Global)"]
    end

    Token --> PolicyCheck
    PolicyCheck -- "Sí (Mismo school_id)" --> Allow --> School_A
    PolicyCheck -- "No (Diferente school_id)" --> Deny
    PolicyCheck -- "Rol = SUPER_ADMIN" --> Allow --> SuperAdmin
```

### Reglas RLS Implementadas en [SECURITY_FIXES_PHASE1.sql](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SECURITY_FIXES_PHASE1.sql):
- **Cláusulas `WITH CHECK`:** Todas las operaciones `INSERT` y `UPDATE` exigen la cláusula `WITH CHECK` para impedir que un usuario inyecte registros pertenecientes a otra institución educativa.
- **Validación no nula de `school_id`:** Ninguna transacción o saldo puede tener `school_id IS NULL`, evitando registros huérfanos o con fuga global de visibilidad.
- **Jerarquía Familiar:** Un padre (`PARENT`) únicamente puede leer registros en `students`, `wallet_transactions` y `exit_permissions` si existe una relación activa en la tabla de unión `parent_student_links` donde `parent_id = auth.uid()`.

---

## 4. Concurrencia y Transacciones Financieras Atómicas

Uno de los mayores logros técnicos del proyecto fue la erradicación del riesgo de **doble gasto (*double-spending*)** en el POS mediante transacciones atómicas con bloqueo pesimista a nivel de fila (`SELECT ... FOR UPDATE`):

```mermaid
sequenceDiagram
    autonumber
    participant POS as Terminal POS
    participant RPC as RPC process_pos_sale_atomic()
    participant Lock as Fila 'students' (Pessimistic Lock)
    participant Ledger as Tabla 'transactions'

    POS->>RPC: Ejecuta venta con idempotency_key único
    RPC->>RPC: Valida idempotencia (¿clave ya fue procesada?)
    alt Clave duplicada encontrada
        RPC-->>POS: Retorna transacción existente (evita doble cobro)
    else Nueva venta
        RPC->>Lock: SELECT balance FROM students WHERE id = studentId FOR UPDATE
        Note over Lock: Fila bloqueada exclusivamente.<br/>Cualquier otra compra concurrente debe esperar.
        RPC->>RPC: Valida: balance >= monto_venta
        alt Saldo Insuficiente
            RPC-->>POS: ERROR: Fondos insuficientes (Rollback inmediato)
        else Saldo Suficiente
            RPC->>Lock: UPDATE students SET balance = balance - monto_venta
            RPC->>Ledger: INSERT INTO transactions (id, student_id, amount, items, ...)
            RPC-->>POS: SUCCESS (Retorna balance anterior, balance nuevo y folio)
        end
    end
```

---

## 5. Pipeline de CI/CD e Infraestructura de Despliegues

El despliegue está automatizado mediante **GitHub Actions** conectado a **Vercel** y **Supabase**:

```mermaid
graph TD
    subgraph Git_Triggers ["Git Workflow"]
        PR["Pull Request hacia 'main'"]
        PushMain["Push directo a 'main'"]
    end

    subgraph CI_Pipeline ["GitHub Actions: .github/workflows/deploy.yml"]
        Job1["1. Setup Node.js 20 con cache de npm"]
        Job2["2. npm ci --legacy-peer-deps"]
        Job3["3. npm run type-check (tsc --noEmit)"]
        Job4["4. npm run test -- --run (Vitest)"]
        Job5["5. npm run test:coverage (Umbral 40%)"]
        Job6["6. npm run build (Vite producción)"]
    end

    subgraph CD_Deploy ["Despliegue a Producción"]
        VercelAction["Vercel Action v6 (Secrets: VERCEL_TOKEN, ORG_ID, PROJECT_ID)"]
        VercelEdge["Vercel Production URL: mecard-network-staging.vercel.app"]
        SupabaseCron["GitHub Action Cron (06:00 UTC): Conversión de Vaquitas a Puntos"]
    end

    PR --> Job1 --> Job2 --> Job3 --> Job4 --> Job5 --> Job6
    PushMain --> Job1
    Job6 -- "Si es Push a main" --> VercelAction --> VercelEdge
    SupabaseCron --> VercelEdge
```

### Factores Críticos de Infraestructura
1. **Node 20 Lock:** Alineación estricta de versión en [package.json:L6-L9](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/package.json#L6-L9) (`"engines": { "node": "20.x" }`), [.nvmrc](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/.nvmrc) y workflows de GitHub.
2. **Dependabot Groups:** Configurado en [.github/dependabot.yml](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/.github/dependabot.yml) para agrupar actualizaciones acopladas de React y librerías de prueba, ignorando *major updates* arriesgadas de Tailwind y Node types.
3. **Manejo de Peer Dependencies:** Inclusión sistemática de `--legacy-peer-deps` en los comandos de instalación de Vercel y CI para resolver diferencias entre React 19 y librerías periféricas.
