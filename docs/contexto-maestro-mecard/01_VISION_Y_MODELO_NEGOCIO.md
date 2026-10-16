# 01. Visión y Modelo de Negocio de MeCard

> **Fuentes de Evidencia:** [CommercialSimulator.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/SuperAdmin/CommercialSimulator.tsx), [BusinessModelConfiguration.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/BusinessModelConfiguration.tsx), [BillingService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/BillingService.ts), [BILLING_TESTING_GUIDE.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/BILLING_TESTING_GUIDE.md), [IDEAS_2026.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/IDEAS_2026.md) y [PROJECT_BRAIN.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/PROJECT_BRAIN.md).

---

## 1. Visión y Propósito Estratégico

**MeCard** es una plataforma tecnológica escolar y fintech verticalizada cuyo propósito principal es **digitalizar, centralizar y securitizar todos los flujos de interacción física y monetaria dentro de colegios e instituciones educativas privadas**.

### Problemas Estructurales que Resuelve

1. **Inseguridad y fuga por dinero en efectivo:** Riesgo de pérdida, robo o extorsión de dinero físico entre alumnos en patios y cafeterías escolares.
2. **Falta de visibilidad y control parental:** Los padres desconocen en qué gastan sus hijos, qué alimentos consumen, si tienen saldo o si se respetan sus alergias y restricciones dietéticas.
3. **Complejidad operativa y morosidad escolar:** Cobro manual y disperso de colegiaturas, inscripciones, uniformes, materiales y excursiones escolares, con altos niveles de retraso en pagos y conciliación bancaria tediosa.
4. **Falta de incentivos de ahorro y educación financiera:** Ausencia de herramientas prácticas en la infancia para aprender presupuesto, metas de ahorro y valor del dinero.
5. **Ineficiencia en concesionarios escolares:** Filas interminables durante los recesos (recreos de 20-30 minutos), mermas por alimentos no vendidos y cobros lentos en efectivo.

---

## 2. Propuesta de Valor por Segmento

```
                  ┌────────────────────────────────────────┐
                  │            MECARD PLATFORM             │
                  │   Ecosistema Escolar & Fintech Cerrado │
                  └──────┬────────────┬────────────┬───────┘
                         │            │            │
            ┌────────────▼──┐   ┌─────▼───────┐  ┌─▼─────────────┐
            │   COLEGIOS    │   │   FAMILIAS  │  │  ESTUDIANTES  │
            ├───────────────┤   ├─────────────┤  ├───────────────┤
            │ Cero morosidad│   │ Control apps│  │ Credencial QR │
            │ Automatización│   │ Topes gasto │  │ Gamificación  │
            │ Conciliación  │   │ Permisos    │  │ Cero efectivo │
            │ Ingresos extra│   │ Co-padres   │  │ Wishlists     │
            └───────────────┘   └─────────────┘  └───────────────┘
                         │
            ┌────────────▼────────────────┐
            │ CONCESIONARIOS / CAFETERÍAS │
            ├─────────────────────────────┤
            │ POS ultrarrápido (QR)       │
            │ Pre-órdenes sin filas       │
            │ Liquidaciones automáticas   │
            │ Pronóstico de demanda con IA│
            └─────────────────────────────┘
```

### A. Para Colegios e Instituciones Educativas
- **Control Centralizado:** Administración unificada de matrículas, alumnos, personal y sedes (*campuses*).
- **Gestión de Colegiaturas y Cobranza:** Desglose automatizado de cuotas, generación de facturas electrónicas, detección de morosidad con *aging buckets* (30, 60, 90+ días) y recordatorios automáticos.
- **Seguridad Perimetral y Accesos:** Control de accesos a torniquetes, control de salidas escolares autorizadas con firmas parentales y registro de inasistencias.
- **Nueva Fuente de Ingresos:** Participación porcentual en las ventas de cafeterías/papelerías y rendimiento financiero por dispersión de fondos.

### B. Para Padres y Tutores Legales
- **Billetera Prepago con Límites:** Asignación de presupuestos diarios o semanales, y bloqueo de categorías de productos no permitidas (ej. refrescos, comida chatarra).
- **Notificaciones en Tiempo Real:** Alertas inmediatas al momento en que el alumno consume en el POS o pasa el torniquete de entrada/salida.
- **Esquema Multi-Padre (Co-Padres):** Ambos padres pueden acceder con cuentas independientes y vinculadas mediante código de 6 dígitos, con visibilidad compartida en una bitácora auditada de movimientos ([IDEAS_2026.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/IDEAS_2026.md)).
- **Pagos de Servicios Escolares:** Pago directo de colegiaturas, excursiones con planes de pago fraccionados y seguros desde la misma interfaz.

### C. Para Alumnos y Estudiantes
- **Experiencia sin Efectivo:** Pago rápido en cafetería y papelería mediante credencial plástica con código QR o credencial digital en móvil.
- **Gamificación y Programa de Recompensas (Rewards):** Cada compra acumula puntos según su nivel (*Tier Bronze, Silver, Gold, Platinum*) canjeables en un marketplace escolar por premios autorizados.
- **Vaquitas y Regalos de Cumpleaños:** Sistema social para crear "vaquitas" colectivas de cumpleaños entre amigos y compañeros de grado, con canje supervisado en la escuela.
- **Educación Financiera y Nutricional:** Retos diarios impulsados por IA (Gemini) sobre balance nutricional y consejos de presupuesto.

### D. Para Concesionarios y Operadores de Cafetería
- **Cobro Ultrarrápido en POS:** Terminal táctil especializada que reduce el tiempo de atención a menos de 5 segundos por alumno.
- **Sistema de Pre-Órdenes:** Los alumnos o padres pueden ordenar comida antes del receso con horarios de recolección programados (*pickup slots*), reduciendo desperdicios.
- **Conciliación Transparente:** Monitoreo diario de ventas brutas, comisiones de plataforma retenidas y saldos netos por liquidar vía transferencia bancaria.

---

## 3. Modelos de Monetización Documentados

El análisis de [CommercialSimulator.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/SuperAdmin/CommercialSimulator.tsx) y [BillingService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/BillingService.ts) demuestra que MeCard no depende de una sola fuente de ingresos, sino de una estructura multicapa:

### Tabla Comparativa de Modelos Comerciales

| Parámetro | Modelo A (Renta Fija) | Modelo B (SaaS por Alumno) | Modelo C (Comisión Pura) | Modelo Híbrido ([BusinessModelConfig](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/BusinessModelConfiguration.tsx)) |
|---|:---:|:---:|:---:|:---:|
| **Perfil Objetivo** | Colegios grandes con alto volumen | Colegios medianos / estables | Colegios reacios al costo fijo | Esquema estándar por defecto |
| **Costo de Setup Inicial** | $25,000 MXN | $15,000 MXN | $0 MXN | Parametrizable |
| **Renta Mensual Fija** | $5,000 MXN/mes | $0 MXN | $0 MXN | Renta variable |
| **Costo SaaS por Alumno** | $0 MXN | $45 MXN/mes | $0 MXN | $0 MXN |
| **Comisión Ventas Cafetería** | 3.0% bruto | 3.0% bruto | 8.0% bruto | 4.5% plataforma |
| **Margen Neto MeCard en POS** | 5.0% de la comisión | 5.0% de la comisión | 10.0% de la comisión | 30% del fee total |
| **Participación del Colegio** | 95.0% remanente | 95.0% remanente | 90.0% remanente | 30% del fee total |
| **Participación Concesionario** | Depende propiedad POS | Depende propiedad POS | Depende propiedad POS | 40% del fee total |
| **Comisión Recarga Tarjeta** | 3.5% | 3.5% | 5.0% | 3.5% |
| **Comisión Recarga SPEI** | $8.00 MXN flat | $8.00 MXN flat | $8.00 MXN flat | $8.00 MXN flat |
| **Comisión Recarga OXXO** | $10.50 MXN flat | $10.50 MXN flat | $10.50 MXN flat | N/A |
| **Costo Anual Credencial PVC** | $140 MXN / alumno | $140 MXN / alumno | $140 MXN / alumno | $50 emisión inicial |
| **Reposición por Extravío** | $80 MXN (tasa 8%) | $80 MXN (tasa 8%) | $80 MXN (tasa 8%) | $30 MXN reposición |

---

## 4. Fuentes de Ingresos Financieros y Float

El código en [CommercialSimulator.tsx:L214-L222](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/SuperAdmin/CommercialSimulator.tsx#L214-L222) modela tres flujos financieros de alta rentabilidad que complementan los cobros operativos:

1. **Rendimiento Financiero sobre Saldo Cautivo (*Float Income*):**
   - **Mecánica:** Los padres recargan fondos por adelantado. En un colegio de 500 alumnos con saldo promedio de $120 MXN, existe una masa monetaria cautiva constante de $60,000 MXN (o significativamente mayor en temporadas de inicio de ciclo).
   - **Tasa Modelada:** Tasa anual del **10.5%** (referencia equivalente a Cetes / cuentas fintech remuneradas en México).
   - **Fórmula de Código:** `totalFloat = students * avgBalancePerStudent; floatIncome = totalFloat * (annualYieldRate / 100)`.

2. **Saldos No Reclamados / Expirados (*Breakage*):**
   - **Mecánica:** Porcentajes de saldo prepago que nunca se ejercen al final del ciclo escolar por graduación, bajas o redondeos residuales.
   - **Tasa Modelada:** **6.0%** sobre las ventas brutas anuales de cafetería.
   - **Fórmula de Código:** `breakage = annualCafeteriaSales * (profile.breakagePercent / 100)`.

3. **Margen por Red de Regalos Sociales (*Gift Margin*):**
   - **Mecánica:** Margen de comisión obtenido de los productos canjeados como regalos dentro del ecosistema.
   - **Tasa Modelada:** **20.0%** de margen sobre un volumen estimado de regalos del **5.0%** del consumo total.
   - **Fórmula de Código:** `giftMargin = (annualCafeteriaSales * 0.05) * 0.20`.

---

## 5. Auditoría de la Hipótesis Comercial Reciente: Reducción de Costos de Procesamiento

### Descripción de la Hipótesis
Recientemente surgió una hipótesis de negocio:
> *"Negociar tasas reducidas de adquirencia bancaria (procesamiento de tarjetas de crédito/débito y dispersiones SPEI) por volumen agregado de la red MeCard, y compartir el margen de ahorro obtenido entre el colegio y MeCard como argumento comercial irresistible de venta."*

### Evidencia Encontrada y Clasificación Rigurosa

| Elemento | Evidencia en Repositorio | Clasificación |
|---|---|---|
| **Tasas Actuales en Código** | Tarjeta: 3.5% fija; SPEI: $8.00 MXN fija; OXXO: $10.50 MXN fija ([BillingService.ts:L35-L37](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/BillingService.ts#L35-L37)). | **Decisión Aprobada en Mock** |
| **Simulador de Reparto** | El simulador ([CommercialSimulator.tsx:L207-L210](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/SuperAdmin/CommercialSimulator.tsx#L207-L210)) ya permite calcular la partición de comisiones brutas entre Colegio, Concesionario y MeCard. | **Implementado a Nivel UI** |
| **Acuerdos Cerrados con Adquirentes** | No existen contratos, API Keys de producción ni convenios firmados con agregadores (Stripe, Conekta, Clip, MercadoPago, STP) en el código ni en la documentación. | **No Existe / Vacío** |
| **Lógica de "Sharing de Ahorro"** | No existe una función que compare una tasa base previa del colegio vs la tasa MeCard para liquidar el diferencial automáticamente. | **Hipótesis sin Programar** |

> [!IMPORTANT]
> **Dictamen del Equipo:** La reducción de costos para compartir beneficios debe tratarse como una **HIPÓTESIS COMERCIAL A VALIDAR**, no como una funcionalidad implementada ni como un acuerdo formalizado. Requiere:
> 1. Cotizar formalmente con un agregador/adquirente (ej. STP, Kushki o Stripe) qué tasa ofrecen según volumen proyectado (ej. 2.2% + $2 en lugar de 3.5%).
> 2. Diseñar en el backend el libro mayor (*ledger*) de reparto del diferencial de tasa.

---

## 6. Canales de Distribución y Estrategia de Adquisición

### Canales Identificados
1. **Venta Directa B2B a Directores y Dueños de Colegios:** Presentación ejecutiva enfocada en **cero morosidad en colegiaturas** y eliminación de dinero en efectivo.
2. **Concesionarios de Alimentos (Operadores de Cafetería):** Aliados clave; sufren por lentitud de cobro y mermas. Un operador de cafetería que opera en varios colegios puede referir la plataforma.
3. **Estrategia "Trojan Horse" (Caballo de Troya):**
   - Entrar al colegio primero ofreciendo únicamente el **POS de Cafetería y Credenciales Digitales** (baja fricción, no altera la contabilidad del colegio).
   - Una vez que los padres usan la app diariamente para recargar la cafetería, ofrecer el módulo de **Pago de Colegiaturas y Excursiones** con un solo clic.

### Paisaje Competitivo Identificado en la Documentación
- **Sistemas de Control Escolar Tradicionales (School Control, Saeko, Educamos):** Fuertes en calificaciones y trámites SEP, pero con interfaces obsoletas, sin experiencia de billetera móvil moderna para alumnos y nula gamificación.
- **Fintechs Escolares / Billeteras Emergentes:** Proyectos aislados de recargas para cafeterías, pero que carecen de la suite integral de colegiaturas, bloqueos por impago y sistema de excursiones.

---

## 7. Registro de Clasificación de Conceptos Comerciales

Para evitar distorsiones en las futuras etapas con GPT-6:

- **Decisión Aprobada:** Modelo de 6 roles de usuario, cobro de $140 anuales por credencial en modelo base, 3.5% de comisión en tarjeta prepago, y 48 horas de dunning timeline para colegios morosos.
- **Hipótesis a Validar:** Compartición del ahorro de adquirencia bancaria con colegios; adopción voluntaria de "vaquitas" de cumpleaños por parte de los padres en un 30% del padrón.
- **Dato sin Validar:** Costo real de emisión de tarjetas plásticas con proveedor local mexicano (se asume $25-$50 MXN de costo para vender a $140 MXN).
- **Idea Futura:** Marketplace abierto multi-colegio e intercambio de regalos entre distintas escuelas (marcado expresamente en `PLATFORM_READINESS.md` como diferido a Fase 3).
