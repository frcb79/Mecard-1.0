# MeCard Multi-Agent Implementation Plan

## Phase 1: Automated Quick Fixes (12 tasks — assign to Copilot Coding Agent via GitHub Issues)

### B1: Consolidate Supabase Clients
- Delete `src/lib/supabase.ts`
- Fix `src/lib/supabaseClient.ts` to use `import.meta.env` instead of `process.env`
- Update all imports across the project that reference the deleted file

### B3: Fix require() → import() in AuthContext
- File: `src/contexts/AuthContext.tsx`
- Replace `require('../lib/supabase')` with dynamic `import()` or conditional ESM import

### B4: Memoize PlatformContext Value
- File: `src/contexts/PlatformContext.tsx`
- Wrap context value object with `useMemo` to prevent unnecessary re-renders of all consumers

### B10: Fix useTransactions.refresh()
- File: `src/hooks/useTransactions.ts`
- Current `refresh: () => setLoading(true)` is a no-op — add a counter/key to dependency array to trigger actual re-fetch

### B11: Fix Import Paths
- Files: `src/hooks/useNotifications.ts`, `src/hooks/useTransactions.ts`
- Change `'../../types'` → `'../types'` (currently imports from outside src/)

### B13: Remove `as any` Casts
- File: `src/hooks/useAuth.ts` — remove `useContext(AuthContext as any)`
- File: `src/contexts/ServiceContext.tsx` — fix `null as any` fallback with proper typing

### C4: Create 404 Page
- Create `src/components/NotFoundPage.tsx`
- Update `src/routes/index.tsx` catch-all route from silent redirect to 404 page

### C6: Eliminate Duplicate Entry Point
- Delete `src/index.tsx` (keep `src/main.tsx` as single entry)
- Update `vite.config.ts` if needed

### E2: Fix O(n²) Balance Calculation
- File: `src/hooks/useTransactions.ts`
- Replace nested loop balance reconstruction with single-pass O(n) accumulator

### E4: Remove Balance from findPotentialFriend
- File: `src/services/supabaseSocial.ts`
- Remove `balance` field from the query to prevent students seeing other students' balances

### E6: Delete Dead Files
- Delete `src/components/StudentDashboard_complex.tsx` (unused duplicate)
- Delete `src/views/home.tsx` (rudimentary placeholder)
- Delete `src/views/Students.tsx` (stub "Módulo en construcción")

### D2: Remove All console.log from Production
- Files: PosView.tsx, ParentPortalContainer.tsx, ParentLimitsView.tsx, SchoolTabs.tsx, LoginView.tsx, ParentWalletView.tsx, StudentDashboard.tsx, GiftSender.tsx, GiftInbox.tsx, StudentFavorites.tsx, SettlementsView.tsx, SchoolInvoiceDashboard.tsx, MeCardSocial.tsx
- Remove all `console.log`, `console.error`, `console.warn` statements (20+ instances)

---

## Stream A: Design System & Visual Excellence

### A1: Create Unified Design Token System
Create `tailwind.config.ts` with semantic tokens:
- 5 border-radius tokens replacing current 14 arbitrary values
- Unified color palette: `slate-*` everywhere (eliminate `gray-*`)
- Portal-specific accent colors as theme extensions
- Spacing scale standardization
- Shadow tokens for elevation system
- Delete `src/styles/parentTheme.css` (450 lines) — migrate to Tailwind

### A2: Reusable Card Component
Create `src/components/ui/Card.tsx`:
- Variants: glass, solid, gradient, dark, outlined
- Sizes: sm, md, lg, xl
- Optional header, footer, action slots
- Consistent border-radius from token system

### A3: Toast Notification Component
Create `src/components/ui/Toast.tsx`:
- Types: success, error, warning, info
- Auto-dismiss with configurable duration
- Stack multiple toasts
- Replace ALL 20+ `alert()` calls across the platform

### A4: Unified Form Components
Create `src/components/ui/Input.tsx`, `src/components/ui/Toggle.tsx`, `src/components/ui/Select.tsx`:
- Consistent styling across all forms
- Built-in validation display (error/success states)
- Accessibility: `htmlFor`, `aria-describedby`, `aria-invalid`
- Replace 3 competing InputField implementations
- Replace 3 competing ToggleSwitch implementations

### A5: Modal Component with Accessibility
Create `src/components/ui/Modal.tsx`:
- Focus trapping on open
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Escape key handler
- Backdrop click to close
- Animated enter/exit

### A6: Skeleton Loading Component
Create `src/components/ui/Skeleton.tsx`:
- Animated placeholder for cards, text, avatars, tables
- Composable: `<Skeleton.Card>`, `<Skeleton.Text>`, `<Skeleton.Avatar>`

### A7: Empty State Component
Create `src/components/ui/EmptyState.tsx`:
- Icon + title + description + optional CTA button
- Pre-built variants: no-data, no-results, error, coming-soon

### A8: Redesign LoginView.tsx
- Unify palette to match platform identity
- Premium entry animations (fade-in, slide-up)
- Form validation with inline errors (use A4 Input components)
- Replace `alert()` with Toast (A3)
- Mobile-responsive login cards

### A9: Redesign PosView.tsx (530 lines)
- Add mobile/tablet responsive breakpoints (currently desktop-only)
- Consistent palette with token system
- Touch-optimized targets (min 44px)
- Replace `console.log` with proper logging
- Replace `alert()` with Toast

### A10: Redesign StudentPortal.tsx + StudentDashboard.tsx
- Delete `StudentDashboard_complex.tsx` (655 lines, unused)
- Make mobile-first (currently uses `text-9xl`, `p-20`, `rounded-[64px]` with zero breakpoints)
- Unify color palette with token system
- Add responsive grid layouts

### A11: Redesign SuperAdminDashboard.tsx
- Add responsive breakpoints (currently `text-7xl` header overflows mobile)
- Consistent palette with design tokens
- Functional buttons (connect handlers)

### A12: Redesign SchoolAdminView.tsx
- Add responsive breakpoints (`text-6xl`, `p-12` currently)
- Fix non-functional "Gestionar Terminales" button
- Consistent tab button styling

### A13: Redesign ConcessionaireDashboard.tsx
- Fix tab bar wrapping on mobile
- Connect "Solicitar Adelanto" and "Guardar Preferencias" buttons
- Consistent orange accent within unified palette

### A14: Unify Sidebar Components
- Consolidate `Sidebar.tsx` (white, 354 lines) + `AdminLayout.tsx` (dark, separate) into one
- Single sidebar with theme variants (light/dark)
- Consistent nav item styling
- Delete `AdminLayout.tsx` after consolidation

### A15: Accessibility Pass (All Components)
- Add `aria-label` to ALL icon-only buttons (Bell, Close, Plus, Toggle)
- Add `role="switch"` + `aria-checked` to all toggle switches
- Add `htmlFor`/`id` linkage to all form labels
- Add `<nav>` landmarks to all sidebars
- Minimum touch target 44px on all interactive elements
- WCAG AA contrast validation on small text (`text-[8px]` through `text-[10px]`)

---

## Stream B: Architecture & Data Layer

### B2: Unify Authentication (HIGH)
- Remove `PlatformContext.login()` and `PlatformContext.logout()`
- Make `AuthContext` the single source of truth
- Update all components that call `PlatformContext.login` to use `AuthContext`

### B5: Wire Supabase Services into Factory
- Implement `PaymentServiceInterface` using `supabasePos.ts`
- Implement `InventoryServiceInterface` using `supabaseInventory.ts`
- Update `factory.ts` to return real services when `useMock === false`

### B6: Standardize Error Handling
- Adopt Result pattern: `{ success: boolean, data?: T, error?: string }`
- Apply consistently across all 15 services
- Replace mix of throw/return-null/console.error patterns

### B7: Consolidate Duplicate Types
- Single `CartItem`, `InventoryItem`, `Student` definition in `src/types.ts`
- Remove duplicates from `src/services/types.ts` and `usePos.ts`
- Update all imports

### B8: Move Gemini API Key Server-Side
- Create Vercel serverless function or Supabase Edge Function as proxy
- Remove `VITE_GEMINI_API_KEY` from client bundle

### B9: Add Error Boundary
- Create `src/components/ErrorBoundary.tsx`
- Wrap providers and route sections
- Graceful fallback UI instead of white screen

### B12: Add useCallback to Hooks
- Files: usePos.ts, useNotifications.ts, useRewards.ts, useProductSearch.ts
- Wrap handler functions to prevent unnecessary re-renders

---

## Stream C: Routing & Navigation

### C1: Fix 6 TypeScript Errors in Routes
Create wrapper containers for components needing props:
- `SmartStaffManagerRoute.tsx` (provides `currentUserRole`, `operatingUnits`)
- `StudentImportWizardRoute.tsx` (provides `schoolId`, `stpCostCenter`, etc.)
- `ConcessionaireDashboardRoute.tsx` (provides `unit`)
- `InventoryManagementRoute.tsx` (provides `products`, `onUpdateProducts`, etc.)
- `CashierViewRoute.tsx` (provides `student`, `onDeposit`)

### C2: Implement Nested Routes with Outlet
- Refactor flat route structure to use parent `<Route>` with `<Outlet>`
- Eliminate duplicated `<RoleBasedLayout>` wrapper on every route

### C3: Add React.lazy() Code Splitting
- Lazy-load all portal views (Parent, Student, Admin, SuperAdmin, POS, Concessionaire)
- Add `<Suspense>` with skeleton fallbacks
- Target: reduce initial bundle from 1.5MB to <500KB per role

### C5: Add Missing Routes
- RewardsMarketplace → `/student/rewards`
- SchoolOnboardingDashboard → `/admin/onboarding`
- SchoolInvoiceDashboard → `/admin/invoices`

### C7: Eliminate Duplicate MeCardPlatform
- Evaluate `src/MeCardPlatform.tsx` (161 lines) vs `src/components/MeCardPlatform.tsx` (473 lines)
- Keep the actively-used one, delete the other

---

## Stream D: UX Polish & Functionality

### D1: Replace All alert() with Toast System
- 20+ instances across: LoginView, ParentPortal, CashierView, PosView, SchoolAdminView, BusinessModelConfiguration, ReportsView, ParentLimitsView, SchoolOnboardingDashboard

### D3: Connect All Non-Functional Buttons (12+)
- ConcessionaireDashboard: "Solicitar Adelanto", "Guardar Preferencias"
- SchoolAdminView: "Gestionar Terminales"
- ParentReportsView: "Exportar CSV", "PDF", "CSV" export buttons
- ParentLimitsView: "Cancelar" button
- StudentDashboard: "Completar Reto" button

### D4: Form Validation with Zod
- LoginView (4 login forms): email format, required fields
- CashierView: min/max amount, UI error states
- InventoryManagementView: price validation, image URL
- ParentWalletView: amount validation
- SmartStaffManager: email, phone, required fields
- StudentImportWizard: file size limit

### D5: Loading Skeletons for Data Views
- ParentReportsView, ParentLimitsView, SchoolAdminView, ConcessionaireDashboard, DashboardView

### D6: Empty States for Lists
- TransactionHistory, NotificationCenter, ReportsView, InventoryManagementView, ParentReportsView

### D7: Complete SchoolManagement Wizard
- Steps 2-4 currently show "Fase N de Configuración" placeholder
- Implement actual configuration forms

### D8: Fix ParentPortal View Routing
- All sub-views except PARENT_DASHBOARD show only placeholder text
- Connect to actual component rendering

### D9: Pagination
- TransactionHistory: paginated list with load-more
- NotificationCenter: paginated notifications

---

## Stream E: Performance & Quality

### E1: Eliminate All `: any` Types (44 instances)
- Type all sub-component props: ActionCard, NavCard, GatewayCard, MetricCard, StatCard, TabButton, KpiCard, InputField, MarginSlider, SplitItem, FeatureCard, CheckListItem, ValidationCard
- Replace `catch (err: any)` with proper error typing
- Fix `const colorClasses: any` patterns

### E3: Chunk Splitting in Vite Config
- Configure `build.rollupOptions.output.manualChunks` for vendor splitting
- Separate chunks per role (admin, parent, student, pos)

### E5: Validate Env Vars at Startup
- Graceful fallback with clear error message if Supabase vars missing
- Remove `!` non-null assertions

### E7: Setup ESLint + Prettier
- Create `.eslintrc.js` with TypeScript + React rules
- Create `.prettierrc` for consistent formatting
- Add lint scripts to `package.json`

### E8: Basic Test Suite (Vitest)
- Setup Vitest configuration
- Unit tests for critical hooks: useTransactions, useAuth, usePos
- Unit tests for critical services: MockPaymentService, BillingService, CLABEService

---

## Dependency Graph & Execution Order

```
Day 1-2: Phase 1 (12 automated fixes) + A1-A7 (Design System foundations)
Day 2-3: B2 (Auth unify) + C1-C3 (Routing fixes) + E1-E3 (Performance)
Day 3-4: A8-A15 (Portal redesigns using new design system)
Day 4-5: D1-D9 (UX Polish using new Toast/Modal/Input components)
Day 5:   E7-E8 (Quality tooling + tests)
```

### Parallel Safety Rules
- Stream A and D both touch UI components → assign SPECIFIC files to each, never overlap
- Stream B and C both touch routes/contexts → C waits for B2 (auth unification) to complete
- Stream E can run fully in parallel (touches config, types, tests only)
