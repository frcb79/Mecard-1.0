# 🧪 Testing Rápido - Parent Portal Redesign

**Duración estimada**: 5-10 minutos  
**Versión**: 1.0  
**Fecha**: 2026-02-17

---

## 🔧 Setup

```bash
# 1. Ir al workspace
cd /workspaces/Mecard-1.0

# 2. Instalar dependencias (si es necesario)
npm install

# 3. Iniciar servidor dev
npm run dev

# 4. Abrir navegador
http://localhost:5173/login
```

---

## 🚀 Testing Rápido (5 min)

### 1️⃣ Login Parents
1. Click en **"PADRES"** en la página de login
2. Ingresa:
   - **Parent Email**: `padre@escuela.mx`
   - **PIN**: `0000`
3. Click **"Acceder"**

### 2️⃣ Verificar Dashboard
- [ ] Página carga sin errores
- [ ] Header dice "Mi Familia"
- [ ] Ves tarjetas de 2 hijos (Juan, María)
- [ ] Ves balance en verde grande
- [ ] Sidebar está a la izquierda

### 3️⃣ Verificar Sidebar Colapsable
- [ ] Click hamburguesa en mobile (o botón < en sidebar)
- [ ] Sidebar se hace pequeño (colapsa)
- [ ] Vuelve a expandirse
- [ ] Items: Mi Familia, Billetera, Límites, Reportes, Notificaciones, Config

### 4️⃣ Prueba Cada Botón
| Botón | Esperar |
|-------|---------|
| **Recargar Ya** | Va a `/parent/wallet` con tab "Depósito" |
| **Alergias** | Va a `/parent/settings` |
| **Límites** | Va a `/parent/limits` con sliders |
| **Reportes** | Va a `/parent/reports` con gráficos |
| **Ver Historial** | Va a `/parent/reports` |

### 5️⃣ Prueba Billetera
1. Click en "Recargar Ya" o vía Sidebar "Billetera"
2. Deberías ver 3 tabs: **Depósito | Asignar | Análisis**
3. Verifica que SOLO UNA tab está con color verde/azul activo
4. Click en tab "Asignar"
5. Deberías ver lista de hijos (Juan, María) con botones
6. Selecciona un hijo → se destaca en verde
7. Ingresa monto → resumen se actualiza

### 6️⃣ Prueba Límites
1. Click "Límites" en sidebar o dashboard
2. Deberías ver sliders y toggles
3. Mueve slider diario: 100 → 1000 → 500
4. Activa/desactiva "Alerta de saldo bajo"
5. Clickando "Guardar Límites" → alert success

### 7️⃣ Prueba Reportes
1. Click "Reportes" en sidebar o dashboard
2. Deberías ver:
   - Filtros de período y estudiante arriba
   - 4 KPI cards: Total, Transacciones, Promedio
   - Gráfico de barras por categoría
   - Tabla de transacciones
3. Cambia filtro de período: Diario → Semanal → Mensual
4. Verifica que datos se actualizan

### 8️⃣ Prueba Notificaciones
1. Click "Notificaciones" en sidebar
2. Deberías ver:
   - 3 toggles de canales: Email, Push, SMS
   - 3 tipos de alertas con toggles
   - Horario silencioso con rango (22:00 - 08:00)
   - Resúmenes (Diario, Semanal)
3. Activa/desactiva algunos toggles
4. Click "Guardar Preferencias" → alert success

### 9️⃣ Prueba Mobile (375px)
1. Abre DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Selecciona "iPhone SE" (375px)
4. Verifica:
   - [ ] Sidebar colapsado por defecto (hamburguesa visible)
   - [ ] Botón hamburguesa funciona
   - [ ] Cards en 1 columna
   - [ ] Texto legible
   - [ ] Botones grandes (48px+)
   - [ ] No hay scroll horizontal

### 🔟 Prueba Tablet (768px)
1. En DevTools, selecciona "iPad" (768px)
2. Verifica:
   - [ ] Sidebar a 80px (iconos solos)
   - [ ] Grid 2 columnas
   - [ ] Transiciones suave

---

## 🎨 Verificaciones Visuales

### Paleta de Colores ✅
- [ ] **Verde**: `rgba(16, 185, 129)` - Botones primarios
- [ ] **Azul**: `rgba(14, 165, 233)` - Secundario
- [ ] **Fondo**: Blanco limpio + gradientes suaves
- [ ] **Texto**: Gris oscuro profesional

### Espaciado Consistente ✅
- [ ] Padding interno cards: 20-32px
- [ ] Gap entre elementos: 16-24px
- [ ] Margen entre secciones: 32-48px

### Tipografía ✅
- [ ] Headers: Font-weight black (900)
- [ ] Labels: Font-weight bold (700)
- [ ] Body: Regular (400)
- [ ] Tamaños responsive (text-sm en mobile)

---

## ❌ Problemas Comunes & Fixes

| Problema | Fix |
|----------|-----|
| Sidebar no se ve | Refresh F5 |
| Botones no responden | Abre Console (F12), revisa errors |
| Tab billetera no cambia color | Refresh + hard cache (Ctrl+Shift+R) |
| Hijos no aparecen en "Asignar" | Verifica MOCK_STUDENTS_LIST en constants.ts |
| Texto cortado en mobile | Reduce zoom browser a 75% |

---

## ✅ Checklist Final

- [ ] todos los botones navegan
- [ ] Sidebar collapsa/expande
- [ ] Paleta verde/azul aplicada
- [ ] Tab billetera solo  1 color activo
- [ ] Hijos aparecen en "Asignar"
- [ ] Responsive 375px-1440px
- [ ] Sin errores en Console
- [ ] Sin warnings críticos

---

## 📸 Screenshots útiles

Para documentación:
1. Desktop view (1440px) - Dashboard
2. Mobile view (375px) - Sidebar colapsado
3. Tab Billetera - "Asignar" con hijos
4. Límites - Sliders visibles
5. Reportes - Gráfico + tabla

---

## 🔗 URLs Importantes

| Sección | URL |
|---------|-----|
| Dashboard | `http://localhost:5173/parent` |
| Billetera | `http://localhost:5173/parent/wallet` |
| Límites | `http://localhost:5173/parent/limits` |
| Reportes | `http://localhost:5173/parent/reports` |
| Notificaciones | `http://localhost:5173/parent/notifications` |
| Configuración | `http://localhost:5173/parent/settings` |

---

**¡Listo para Testing!** 🚀  
Si encuentras problemas, consulta `PARENT_PORTAL_REDESIGN_COMPLETE.md`
