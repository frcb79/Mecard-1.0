# 🧪 MECARD - COMPREHENSIVE TEST PLAN

**Status**: Ready for Platform Demonstration
**Date**: 2026-02-16
**Build**: 2312 modules - ✅ PASSING

---

## 📋 TEST SCOPE

This document defines comprehensive testing scenarios to validate all platform features across:
- ✅ Student Role (Estudiante)
- ✅ Parent Role (Padre/Madre)
- ✅ School Admin Role (Administrador Escuela)
- ✅ Super Admin Role (Administrador Plataforma)

---

## 🎯 PHASE 1: STUDENT FEATURES TEST

### 1.1 Student Registration & Onboarding
**Scenario**: New student joins the platform
- [ ] Navigate to `/student` login page
- [ ] Enter student credentials (ID, PIN)
- [ ] System displays welcome message with school name
- [ ] Dashboard shows student name, grade, section
- [ ] Balance displays correctly ($0 for new student)
- [ ] Profile image loads from system

**Expected Result**: ✅ Student dashboard loads with correct data

### 1.2 Student Profile & Balance Management
**Scenario**: Student views and manages profile
- [ ] Open student profile view
- [ ] Display student name, email, phone, grade
- [ ] Show current balance (e.g., $850.00)
- [ ] Show last transaction (if any)
- [ ] Profile edit button available
- [ ] Photo/avatar displays correctly

**Expected Result**: ✅ Profile information accurate and complete

### 1.3 POS Purchase - Regular Transaction
**Scenario**: Student makes direct purchase at cafeteria
- [ ] Log in to POS terminal with student ID
- [ ] Select products from product grid (e.g., Sándwich $45, Jugo $20)
- [ ] View selected items in cart sidebar
- [ ] Total calculates correctly ($65.00)
- [ ] Student balance shown ($850 → eligible for purchase)
- [ ] Click "Procesar Pago"
- [ ] Payment processes successfully
- [ ] Inventory decrements (verify in admin panel)
- [ ] Transaction appears in student history
- [ ] Student receives "Transacción Exitosa" message
- [ ] Balance updates ($850 → $785)

**Expected Result**: ✅ Payment processes, balance updates, inventory decrements

### 1.4 Reward Points Calculation
**Scenario**: Verify Gemini AI rewards integration
- [ ] Make purchase of $100
- [ ] System calculates markup (e.g., 8% = $8)
- [ ] Points generated shown in success message
- [ ] Check student rewards dashboard for new points
- [ ] Verify points added to student tier

**Expected Result**: ✅ Points calculation correct, rewards tracked

### 1.5 Social Features - Gift System (Phase 1)
**Scenario**: Student A sends gift to Student B (same school)
- [ ] Student A logs in
- [ ] Navigate to `/student/social` route
- [ ] Click "Enviar Regalo" tab
- [ ] Search for Student B by ID or name
- [ ] View Student B's public favorite products
- [ ] Select product to gift
- [ ] Add optional message (up to 200 characters)
- [ ] Click "Enviar Regalo"
- [ ] Confirmation shows unique 6-character redemption code
- [ ] **CRITICAL**: Verify Student A balance NOT charged yet (deferred)
- [ ] Verify gift created in database with status='pending'

**Expected Result**: ✅ Gift sent, code generated, sender not charged

### 1.6 Social Features - Gift Inbox
**Scenario**: Student B receives and manages gifts
- [ ] Student B logs in
- [ ] Navigate to `/student/social` → "Mis Regalos" tab
- [ ] See gift from Student A with:
  - [ ] Sender name "Student A"
  - [ ] Product image and name
  - [ ] Optional message displayed
  - [ ] Unique 6-character redemption code visible
- [ ] Copy redemption code
- [ ] Click "Ir al POS a Canjear" (optional button)

**Expected Result**: ✅ Gift appears with full details, code visible

### 1.7 Social Features - Gift Favorites/Wishlist
**Scenario**: Student manages favorite products
- [ ] Navigate to `/student/social` → "Mis Favoritos" tab
- [ ] Click heart icon on product to add to favorites
- [ ] Verify product appears in favorites list
- [ ] Toggle public/private visibility
- [ ] When public, friends can see in "Enviar Regalo" flow
- [ ] Remove favorite with delete button

**Expected Result**: ✅ Favorites management works, private/public toggle active

### 1.8 Gift Redemption at POS Terminal
**Scenario**: Student B redeems gift at cafeteria POS
- [ ] Student B goes to POS terminal
- [ ] Scans credential (student ID) to open POS
- [ ] In cart sidebar, find "Canjear Regalo" section
- [ ] Enter 6-character gift redemption code (e.g., "ABC123")
- [ ] Click checkmark button
- [ ] **CRITICAL**: System charges Student A's wallet
- [ ] **CRITICAL**: Adds transaction GIFT_SENT to Student A's history
- [ ] **CRITICAL**: Adds transaction GIFT_RECEIVED to Student B's history
- [ ] Show success: "¡Regalo canjeado! Recibiste [Product Name]"
- [ ] Redemption code becomes invalid (can't reuse)
- [ ] Gift status changes to 'redeemed' in database
- [ ] Inventory decrements for product

**Expected Result**: ✅ Sender charged, receiver credited, gift marked redeemed

### 1.9 Student Restrictions & Daily Limits
**Scenario**: Verify spending limits are enforced
- [ ] View student's spending limit ($50/day)
- [ ] Attempt to purchase $30 (under limit) → ✅ Success
- [ ] Attempt to purchase $25 (total $55, over limit) → ❌ Blocked
- [ ] Error message shows: "Límite diario excedido"
- [ ] Transaction history shows only successful $30 purchase

**Expected Result**: ✅ Spending limits enforced correctly

### 1.10 Transaction History
**Scenario**: Student views complete transaction history
- [ ] Navigate to history/statement view
- [ ] See all transactions in chronological order:
  - [ ] PURCHASE: -$45 "Sándwich"
  - [ ] GIFT_SENT: -$60 "Regalaste Jugo a compañero"
  - [ ] GIFT_RECEIVED: +$0 "Recibiste Bebida como regalo"
  - [ ] TRANSFER_IN: +$100 "Depósito de padre"
- [ ] Each transaction shows date, amount, description
- [ ] Running balance updates correctly

**Expected Result**: ✅ All transactions logged correctly

---

## 👨‍👩‍👧 PHASE 2: PARENT FEATURES TEST

### 2.1 Parent Portal - Dashboard
**Scenario**: Parent views children and spending overview
- [ ] Log in to `/parent` with parent credentials
- [ ] Dashboard shows:
  - [ ] List of linked children (grid view)
  - [ ] Current date showing
  - [ ] Total household daily spending
- [ ] Click on child → open child's details:
  - [ ] Child name and photo
  - [ ] Current balance ($XXX.XX)
  - [ ] Today's spending (e.g., $65.50 / $100 limit)
  - [ ] Daily spending bar chart
  - [ ] Transaction timeline (5 most recent)

**Expected Result**: ✅ Parent view shows all family data correctly

### 2.2 Parent Wallet - Deposit Methods
**Scenario**: Parent deposits money into wallet
- [ ] Navigate to `/parent/wallet` → "Depositar" tab
- [ ] View deposit options:
  - [ ] SPEI (standard method)
  - [ ] Credit Card (Visa/Mastercard)
- [ ] Select SPEI
- [ ] Enter amount: $500
- [ ] View fee calculation:
  - [ ] Base amount: $500.00
  - [ ] Bank fee (0.5%): $2.50
  - [ ] Platform fee (1%): $5.00
  - [ ] **Total with fees: $507.50**
- [ ] Click "Proceder al Pago"
- [ ] Process payment (mock: click confirm)
- [ ] See success: "Depósito procesado exitosamente"
- [ ] Wallet balance increases: $0 → $507.50

**Expected Result**: ✅ Deposit processes, fees calculated correctly

### 2.3 Parent Money Allocation
**Scenario**: Parent distributes money to children
- [ ] Navigate to `/parent/wallet` → "Asignar" tab
- [ ] Select child "Juan" from dropdown
- [ ] View Juan's current balance: $100
- [ ] Enter allocation amount: $50
- [ ] Click "Asignar a Juan"
- [ ] Confirmation shows:
  - [ ] Parent wallet: $507.50 → $457.50
  - [ ] Juan's balance: $100 → $150
- [ ] See transaction in both wallets

**Expected Result**: ✅ Money transfers to child, balances update

### 2.4 AI Spending Insights (Gemini)
**Scenario**: Parent receives spending analysis
- [ ] Navigate to `/parent/wallet` → "Insights" tab
- [ ] View Gemini AI analysis showing:
  - [ ] "Your child spent $65 in snacks this week - up 20%"
  - [ ] "Recommendation: Set lower limit or add healthier options"
  - [ ] Smart alerts: "Daily limit reached on Tuesday"
- [ ] Insights based on actual transaction data

**Expected Result**: ✅ AI insights display reasonable analysis

### 2.5 Student Linking/Management
**Scenario**: Parent links new student or manages existing
- [ ] Click "Link Student" button
- [ ] Modal appears: "Link Student"
- [ ] Enter student ID: "12345"
- [ ] Enter verification PIN
- [ ] System validates and links
- [ ] Student appears in dashboard
- [ ] Can toggle access on/off with switches
- [ ] Can view detailed spending for each child

**Expected Result**: ✅ Student linking works, multi-child management functional

### 2.6 Spending History & Statements
**Scenario**: Parent views detailed spending history
- [ ] View all children's combined spending
- [ ] Filter by:
  - [ ] Date range (past week, month)
  - [ ] Child (select specific child)
  - [ ] Category (meals, items, gifts)
- [ ] See transaction list:
  - Date | Student | Description | Amount | Balance
  - 2/15 | Juan | Sándwich | -$45 | $150
  - 2/14 | María | Bebida | -$20 | $170
- [ ] Export option (CSV/PDF) for records

**Expected Result**: ✅ History accurate, export functionality available

### 2.7 Restrictions & Controls
**Scenario**: Parent sets spending limits and categories
- [ ] Navigate to settings/restrictions
- [ ] Set daily limit: $100
- [ ] Set weekly limit: $500
- [ ] Toggle category access:
  - [ ] Meals: ✅ ON
  - [ ] Snacks: ✅ ON
  - [ ] Drinks: ❌ OFF
  - [ ] Supplies: ✅ ON
- [ ] Save restrictions
- [ ] Verify student can't purchase from disabled categories

**Expected Result**: ✅ Restrictions enforce correctly at POS

---

## 🏫 PHASE 3: SCHOOL ADMIN FEATURES TEST

### 3.1 School Dashboard
**Scenario**: School admin views platform statistics
- [ ] Log in to `/school` with admin credentials
- [ ] Dashboard displays KPIs:
  - [ ] Total Students: 450
  - [ ] Network Balance: $15,234.50
  - [ ] Today's Sales: $3,456.78
  - [ ] Health Alerts: 5 (allergy notifications)
- [ ] Chart shows daily/weekly sales trend
- [ ] Operating units performance:
  - [ ] Cafeteria: 3,456 transactions
  - [ ] Stationery: 234 transactions
- [ ] Settlement info shows next disbursement date

**Expected Result**: ✅ Dashboard displays accurate real-time data

### 3.2 Student Management - View & Search
**Scenario**: Admin manages student directory
- [ ] Navigate to `/school/students`
- [ ] View student list in table:
  - Columns: ID | Nombre | Email | CURP | Grado | Saldo | Estado | Matrícula
- [ ] Search by:
  - [ ] Name: type "Juan" → filters correctly
  - [ ] Email: "juan@escuela.mx"
  - [ ] CURP: "LOJC980415"
- [ ] Filter by status:
  - [ ] All (450 students)
  - [ ] Active (448 students)
  - [ ] Inactive (2 students)
- [ ] Sort by columns (name, balance, enrollment date)

**Expected Result**: ✅ Search/filter/sort all working

### 3.3 Student Management - Add Student
**Scenario**: Admin adds new student to system
- [ ] Click "Agregar Estudiante" button
- [ ] Modal appears with form fields:
  - [ ] Nombre: "Carlos Rivera" (required)
  - [ ] Email: "carlos@escuela.mx" (required)
  - [ ] CURP: "RIVE990315HDFRNN08" (required, 18 chars)
  - [ ] Teléfono: "5551234567" (optional)
  - [ ] CLABE: "002341234567890123" (optional)
  - [ ] Saldo Inicial: "500" (optional)
- [ ] Click "Agregar"
- [ ] Modal closes
- [ ] New student appears in list
- [ ] Student gets unique ID

**Expected Result**: ✅ Student added successfully with validation

### 3.4 Student Management - Edit Student
**Scenario**: Admin modifies existing student data
- [ ] Find student "Juan Carlos López" in list
- [ ] Click "Edit" (pencil icon) or double-click row
- [ ] Modal opens with current data:
  - [ ] Nombre: "Juan Carlos López"
  - [ ] Email: "juan.lopez@escuela.mx"
  - [ ] Current balance shown
- [ ] Change phone: "5551234567" → "5559876543"
- [ ] Click "Guardar"
- [ ] Modal closes
- [ ] List updates with new phone number
- [ ] Transaction history shows edit timestamp (optional)

**Expected Result**: ✅ Student data updated correctly

### 3.5 Student Management - Delete Student
**Scenario**: Admin removes inactive student
- [ ] Find student "Pedro Rodríguez" (status: inactive)
- [ ] Click delete (trash icon)
- [ ] Confirmation dialog: "¿Eliminar este estudiante?"
- [ ] Click confirm
- [ ] Student removed from list
- [ ] System logs deletion (optional audit trail)
- [ ] Number of students decreases on dashboard

**Expected Result**: ✅ Student deleted, count updated

### 3.6 Student Management - Status Toggle
**Scenario**: Admin activates/deactivates student
- [ ] Find student status toggle in list or details
- [ ] Current status: "Activo" (active)
- [ ] Click toggle → "Inactivo" (inactive)
- [ ] Student can no longer access POS
- [ ] Click toggle again → "Activo"
- [ ] Student can access again
- [ ] Changes reflected immediately

**Expected Result**: ✅ Status toggle immediate and functional

### 3.7 Student Management - CSV Export
**Scenario**: Admin exports student list
- [ ] Click "Exportar CSV" button
- [ ] File downloads: "estudiantes_2026-02-16.csv"
- [ ] Open CSV in Excel
- [ ] Verify columns: ID,Nombre,Email,CURP,Teléfono,Balance,Estado,FechaMatrícula
- [ ] All student data present
- [ ] Date format correct (YYYY-MM-DD)

**Expected Result**: ✅ CSV export complete and properly formatted

### 3.8 Staff Management
**Scenario**: Admin manages cafeteria and POS staff
- [ ] Navigate to `/school/staff`
- [ ] View current staff list (e.g., 12 staff members)
- [ ] View staff details:
  - [ ] Name, Email, Role, Unit Assigned
- [ ] Add new staff:
  - [ ] Name: "Rosa García"
  - [ ] Email: "rosa@escuela.mx"
  - [ ] Role: "CAFETERIA_STAFF" (dropdown)
  - [ ] Unit: "Cafetería Principal"
- [ ] Click "Agregar Staff"
- [ ] Rosa appears in list
- [ ] Remove staff with delete button

**Expected Result**: ✅ Staff CRUD functional

### 3.9 Bulk Student Import
**Scenario**: Admin imports students via CSV
- [ ] Navigate to `/school/import`
- [ ] Step 1: Download CSV template
  - Columns: nombre,email,curp,telefono,saldo_inicial
- [ ] Fill template with 50 new students
- [ ] Upload CSV file
- [ ] Step 2: System validates
  - Checks for duplicates
  - Validates email format
  - Checks CURP format
  - Shows any errors (red rows)
- [ ] Step 3: Preview & Confirm
  - Shows "50 students ready to import"
  - Summary: "50 new, 0 duplicates"
- [ ] Step 4: Complete
  - "Importación exitosa: 50 estudiantes agregados"
- [ ] Students appear in main list

**Expected Result**: ✅ CSV import multi-step wizard functional

### 3.10 School Configuration
**Scenario**: Admin configures billing and settings
- [ ] Navigate to `/school/config`
- [ ] View/modify settings:
  - [ ] **Fee Configuration**:
    - Platform fee: 2% ✎ (editable)
    - Bank fee: 0.5% ✎
  - [ ] **Daily Limits**:
    - Default student limit: $100 ✎
    - Default weekly: $500 ✎
  - [ ] **Operating Units**:
    - Cafetería Principal (active)
    - Tienda Escolar (active)
  - [ ] **Billing**:
    - Settlement frequency: Weekly
    - Next settlement: 2026-02-21
- [ ] Save changes
- [ ] Settings persist on reload

**Expected Result**: ✅ Configuration saved and applied

---

## 🔐 PHASE 4: SUPER ADMIN TEST

### 4.1 Platform Dashboard
**Scenario**: Super admin views platform metrics
- [ ] Navigate to `/admin`
- [ ] View aggregate statistics:
  - [ ] Total Schools: 12
  - [ ] Total Students: 5,420
  - [ ] Total Parents: 3,200
  - [ ] Network Balance: $234,567.89
  - [ ] Today's Transactions: 8,456
  - [ ] Revenue (platform): $12,345.67
- [ ] School performance ranking table

**Expected Result**: ✅ Platform metrics accurate

### 4.2 School Management
**Scenario**: Super admin manages multiple schools
- [ ] Navigate to `/admin/schools`
- [ ] View all schools:
  - IPEP (Mexico City) - 450 students - Active
  - Roosevelt (Monterrey) - 320 students - Active
  - San Diego (Guadalajara) - 280 students - Pending
- [ ] Click school → detail view
- [ ] Edit school billing model
- [ ] Approve pending school
- [ ] Deactivate underperforming school

**Expected Result**: ✅ Multi-school management works

### 4.3 Billing & Settlement
**Scenario**: Super admin processes school settlements
- [ ] View settlement dashboard
- [ ] Schools ready for settlement (weekly):
  - IPEP: $8,456.23 accumulated
  - Roosevelt: $5,234.56 accumulated
- [ ] Process settlements
- [ ] View payment history
- [ ] Generate reports (PDF/CSV)

**Expected Result**: ✅ Settlement processing works

---

## ⚠️ CRITICAL PATH TESTS

These must all pass before showing platform:

### Test A: Student Gift Flow (End-to-End)
**Actors**: Student A, Student B, POS Operator

1. Student A (balance: $1000) sends gift from Student B's favorites
2. **VERIFY**: Student A balance still $1000 (deferred charge)
3. Student B sees gift in inbox with code
4. Student B goes to POS terminal
5. POS operator enters gift code
6. **VERIFY**: Student A charged ($1000 → $940)
7. **VERIFY**: Transaction recorded in both wallets
8. **VERIFY**: Gift status = 'redeemed'

**Pass Criteria**: ✅ All 5 verify points pass

### Test B: Parent Deposit → Child Spending → Balance Tracking
**Actors**: Parent, Child (Student)

1. Parent deposits $500 (with fees: $507.50 charged)
2. Parent allocates $200 to child
3. Child has $200 balance
4. Child purchases $50 at POS
5. **VERIFY**: Child balance = $150
6. **VERIFY**: Parent can see $150 in child details
7. Child receives gift ($30)
8. **VERIFY**: Child balance = $180 (gift doesn't charge)
9. Child redeems gift at POS
10. **VERIFY**: Gift sender charged, balances adjust

**Pass Criteria**: ✅ All balance changes correct

### Test C: Admin Lifecycle (Create → Manage → Report)
**Actors**: School Admin

1. Admin adds 10 students via CSV import
2. Students appear in list with correct data
3. Admin edits one student's contact info
4. Admin exports updated list (CSV)
5. **VERIFY**: Export contains 10 students
6. **VERIFY**: Edit is present in export
7. Admin views dashboardstats
8. **VERIFY**: Student count = original + 10

**Pass Criteria**: ✅ All data consistent

---

## 🧩 INTEGRATION TESTS

### API Layer Tests
- [ ] Supabase connection working
- [ ] All RPC procedures callable
- [ ] Authentication tokens valid
- [ ] Row-level security (RLS) policies enforced

### UI/UX Tests
- [ ] All routes accessible with proper role
- [ ] Navigation menus correct per role
- [ ] Forms validate input correctly
- [ ] Error messages user-friendly (Spanish)
- [ ] Success messages clear and helpful
- [ ] Mobile responsiveness (if applicable)

### Performance Tests
- [ ] Dashboard loads < 2 seconds
- [ ] Student list renders with 500 entries smoothly
- [ ] POS transaction completes < 5 seconds
- [ ] No console errors (F12 dev tools)
- [ ] Memory usage reasonable

### Security Tests
- [ ] Students can't access other students' data
- [ ] Parents can't access other families' data
- [ ] Admins can't access other schools' data
- [ ] Super admins have appropriate controls
- [ ] No logged passwords/secrets in console

---

## 📊 TEST EXECUTION CHECKLIST

### Before Demo:
- [ ] All critical path tests pass
- [ ] Build: `npm run build` ✅
- [ ] No TypeScript errors
- [ ] No console errors (F12)
- [ ] All routes work
- [ ] Mock data loaded correctly

### During Demo:
- [ ] Walk through each critical path test
- [ ] Show real transaction flow
- [ ] Demonstrate AI insights (Gemini)
- [ ] Show multi-role functionality
- [ ] Highlight social features (gifts)

### After Demo (if issues found):
- [ ] Document bug
- [ ] Prioritize fix
- [ ] Test fix before next demo
- [ ] Create regression test

---

## 📝 NOTES

- All tests use mock data (Supabase local/staging)
- Timestamps regenerate for each test run
- Balance calculations use real algorithms
- Gift redemption uses real deferred charging logic
- No production data accessed

---

**Test Plan Version**: 1.0
**Last Updated**: 2026-02-16
**Next Review**: After first demo

