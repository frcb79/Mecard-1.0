# Day 2: Auth E2E + Permissions Smoke Tests

**Date**: March 30, 2026
**Sprint**: 10-Day Execution Plan (Day 2/10)
**Goal**: Validate auth flow + role-based access control across 5 roles

---

## 📋 Test Matrix

### Test Credentials

| Role | Email | Password | Master Key |
|------|-------|----------|-----------|
| SUPER_ADMIN | admin@mecard.mx | Mecard2025! | (N/A) |
| SCHOOL_ADMIN | admin@escuela.mx | Mecard2025! | (N/A) |
| UNIT_MANAGER | [seed data] | Mecard2025! | (N/A) |
| PARENT | [demo] | 0000 | (N/A) |
| STUDENT | [demo] | 0000 | (N/A) |

---

## ✅ Test Cases

### Automated Coverage Implemented
- File: src/components/ProtectedRoute.test.tsx
- Command: npm run test:auth-smoke
- Status: PASS (6/6)
- Covered scenarios:
	- Loading state rendering
	- Unauthenticated redirect to /login
	- Allowed role access
	- Denied role redirect to /unauthorized
	- Denied permission redirect to /unauthorized
	- Public route when requireAuth=false

### TC-01: SUPER_ADMIN Login + Route Access
**Steps**:
1. Navigate to `/login`
2. Click "CORPORATIVO"
3. Enter: `admin@mecard.mx` / `Mecard2025!`
4. Click Login
5. Verify redirect to `/admin`
6. Verify sidebar shows "Gestión Global" menu
7. Access all admin routes: `/admin/schools`, `/admin/settlement`, `/admin/reports`

**Expected Results**:
- ✅ Login succeeds
- ✅ Redirect to `/admin` (user.role = 'SUPER_ADMIN')
- ✅ All `/admin/*` routes accessible
- ✅ Non-admin routes return 403 (Unauthorized)

---

### TC-02: SCHOOL_ADMIN Login + Route Access
**Steps**:
1. Navigate to `/login`
2. Click "COLEGIOS"
3. Enter: `admin@escuela.mx` / `Mecard2025!`
4. Click Login
5. Verify redirect to `/school`
6. Verify sidebar shows "Gestión de Colegio" menu
7. Access: `/school/students`, `/school/staff`, `/school/import`

**Expected Results**:
- ✅ Login succeeds
- ✅ Redirect to `/school` (user.role = 'SCHOOL_ADMIN')
- ✅ All `/school/*` routes accessible
- ✅ `/admin/*` routes return 403

---

### TC-03: PARENT Login + Route Access (Demo Mode)
**Steps**:
1. Navigate to `/login`
2. Click "PADRES"
3. Enter: Email `padre@test.mx` / PIN `0000`
4. Click Login
5. Verify redirect to `/parent`
6. Verify can access `/parent/wallet`, `/parent/limits`

**Expected Results**:
- ✅ Demo mode login succeeds
- ✅ Redirect to `/parent` (user.role = 'PARENT')
- ✅ Can see family data (linked students)
- ✅ `/school/*` routes return 403

---

### TC-04: STUDENT Login + Route Access (Demo Mode)
**Steps**:
1. Navigate to `/login`
2. Click "ALUMNOS"
3. Enter: Student ID `12345` / PIN `0000`
4. Click Login
5. Verify redirect to `/student`
6. Verify can access `/student/wallet`, `/student/rewards`

**Expected Results**:
- ✅ Demo mode login succeeds
- ✅ Redirect to `/student` (user.role = 'STUDENT')
- ✅ Student dashboard loads
- ✅ Cannot access `/parent/*` or `/admin/*` routes

---

### TC-05: Logout + Redirect to Login
**Steps** (from any authenticated state):
1. Click Logo/Avatar → Menu
2. Click "Logout"
3. Verify redirect to `/login`
4. Try accessing `/admin` directly
5. Verify redirect to `/login` with state

**Expected Results**:
- ✅ User logged out
- ✅ AuthContext.user = null
- ✅ Protected routes redirect to `/login`
- ✅ Query params preserved: `?from=/admin`

---

### TC-06: ProtectedRoute Enforcement
**Steps**:
1. Login as STUDENT
2. Direct URL access: `/admin/schools`
3. Verify redirect behavior

**Expected Results**:
- ✅ Redirect to `/unauthorized` page
- ✅ Error message: "No tienes permisos para acceder a esta página"
- ✅ Back button returns to previous route
- ✅ Can return to `/student` safely

---

### TC-07: Permission Granularity (SCHOOL_ADMIN)
**Steps**:
1. Login as SCHOOL_ADMIN
2. Access `/school/students` → Should work
3. Access `/school/fees` → Should work (has FEES_VIEW)
4. Access `/admin/reports` → Should fail

**Expected Results**:
- ✅ Role-based access control enforced
- ✅ Can see only permitted screens
- ✅ Sidebar only shows allowed menu items
- ✅ 403 responses for unauthorized routes

---

### TC-08: Session Persistence (Optional)
**Steps** (if localStorage configured):
1. Login as SCHOOL_ADMIN
2. Refresh browser (F5)
3. Verify user still authenticated
4. Verify can navigate to `/school/students`

**Expected Results**:
- ✅ Session persists across refreshes
- ✅ No need to re-login
- ✅ AuthContext hydrated from localStorage/sessionStorage

---

## 🎯 Success Criteria

**All 8 test cases must PASS**:
- [ ] TC-01: Super Admin auth + access
- [ ] TC-02: School Admin auth + access
- [ ] TC-03: Parent auth + access
- [ ] TC-04: Student auth + access
- [ ] TC-05: Logout flow
- [ ] TC-06: Protected route enforcement
- [ ] TC-07: Permission granularity
- [ ] TC-08: Session persistence (if applicable)

**Performance**:
- Login response time < 2s
- Route protection check < 500ms
- No console errors

**Code Quality**:
- [x] Type-check passes
- [ ] No unhandled errors
- [ ] No console.log leaks

---

## 🚀 Execution Notes

### Environment: localhost
```bash
npm run dev
# Navigate to Vite local URL shown in terminal (currently http://localhost:5174/login)
```

### Environment: Vercel
```
https://mecard-network-staging.vercel.app/login
# Uses real Supabase (no demo mode)
# Credentials: Same as above
```

### If Tests Fail
1. Check browser console for errors
2. Verify AuthContext.tsx imports correct table (profiles, not users)
3. Check ProtectedRoute.tsx allowedRoles logic
4. Verify user.role matches UserRole enum values

---

## 📝 Test Results

| Test Case | Status | Time | Notes |
|-----------|--------|------|-------|
| TC-01 | 🟡 | - | Manual pending / route guard automated ✅ |
| TC-02 | 🟡 | - | Manual pending / route guard automated ✅ |
| TC-03 | 🟡 | - | Manual pending / route guard automated ✅ |
| TC-04 | 🟡 | - | Manual pending / route guard automated ✅ |
| TC-05 | ⏳ | - | Pending |
| TC-06 | ✅ | < 2s | Automated in ProtectedRoute.test.tsx |
| TC-07 | 🟡 | - | Manual pending / permission denial automated ✅ |
| TC-08 | ⏳ | - | Optional |

---

## 📞 Sign-Off

**Date**: ________
**Tester**: ________
**Result**: ⏳ PENDING

**Go/No-Go for Day 3**: ⏳ PENDING
