# 🚀 Supabase Setup Guide - MeCard Platform

**Status:** ⏳ Ready for local development with mock data  
**Target Date:** Week 2 - Integration con Supabase real

---

## 📋 1. Prerequisitos

Before starting, ensure you have:

- [ ] Node.js v18+ installed
- [ ] npm or yarn package manager
- [ ] Supabase account (free tier at https://supabase.com)
- [ ] Git configured
- [ ] VS Code or preferred editor

---

## 🔧 2. Local Development Setup (MOCK MODE - Ready Now)

### A. Clone y Install

```bash
# Clone repository
git clone https://github.com/frcb79/Mecard-1.0.git
cd Mecard-1.0

# Install dependencies
npm install
```

### B. Create .env.local

```bash
# Copy template
cp .env.example .env.local

# Edit .env.local with mock values:
cat > .env.local << 'EOF'
# Supabase (can be empty for mock mode)
VITE_SUPABASE_URL=https://placeholder.supabase.co
VITE_SUPABASE_ANON_KEY=placeholder_key

# Gemini AI (you already have this)
VITE_GEMINI_API_KEY=AIzaSyAOl2GxEpRy9fMxx7oKMDPMnmAY1i6ULZQ

# App
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:5173

# Features
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_REWARDS_SYSTEM=true
VITE_ENABLE_POS=true
VITE_ENABLE_SCHOOL_ADMIN=true
VITE_ENABLE_SUPER_ADMIN=true
EOF
```

### C. Start Dev Server

```bash
npm run dev

# Output should show:
#   VITE v6.4.1  ready in 1234 ms
#   ➜  Local:   http://localhost:5173/
#   ➜  press h to show help
```

### D. Test Locally

Access: **http://localhost:5173**

**Test Account (Mock Auth):**
```
Email: demo@mecard.edu
Password: Demo123!
Role: Can test any role
```

**Mock Data Available:**
- ✅ Student Dashboard (students)
- ✅ Parent Portal (parents)
- ✅ POS Terminal (cafeteria)
- ✅ School Admin (school admins)
- ✅ Super Admin (system admins)
- ✅ Rewards System (generates points)
- ✅ AI Features (Gemini integration)

---

## 🌐 3. Supabase Real Integration (Week 2+)

### STEP 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - **Project name:** mecard-platform-prod
   - **Database password:** (Generate strong one)
   - **Region:** Closest to users (e.g., us-east-1)
4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

### STEP 2: Get API Keys

1. Go to **Settings → API**
2. Copy these values to `.env.local`:

```env
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON_KEY_from_Settings]
```

### STEP 3: Execute Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Copy entire contents of [SUPABASE_SCHEMA.sql](SUPABASE_SCHEMA.sql)
4. Paste into SQL editor
5. Click "Run"

**Expected output:**
```
Executed successfully (11 tables, 2 functions created)
```

**Tables created:**
- school_rewards_config (school settings)
- student_rewards_points (current points)
- points_transactions (audit trail)
- marketplace_products (reward shop)
- student_redemptions (canje history)
- pos_transactions_with_rewards (POS linked to rewards)
- students (user data)
- schools (school data)
- + 3 more internal tables

### STEP 4: Enable RLS (Row Level Security)

RLS is **already included** in SUPABASE_SCHEMA.sql

**Verification in Supabase:**
1. Go to **Authentication → Policies**
2. Should see policies for each table
3. Status: ✅ All tables have RLS enabled

---

## 🔑 4. Authentication Setup

### OAuth Configuration (Optional but Recommended)

For Google OAuth:

1. Supabase dashboard → **Authentication → Providers**
2. Enable "Google"
3. Add credentials from Google Cloud Console
4. Set redirect URL: `http://localhost:5173/auth/callback`

### Magic Link (Email) - Already Configured

Default method used in development:
- User enters email
- Clicks link in verification email
- Auto-login

---

## 🗄️ 5. Database Schema Overview

### Core Tables

```
school_rewards_config
├─ school_id (PK)
├─ markup_percentage (5-15%)
├─ points_per_peso (1-50)
├─ tier_thresholds (JSON: Bronze/Silver/Gold/Platinum)
└─ cycle_start, cycle_end

student_rewards_points
├─ student_id (PK)
├─ school_id (PK)
├─ total_points
├─ earned_this_cycle
├─ tier (BRONZE|SILVER|GOLD|PLATINUM)
└─ last_updated

points_transactions
├─ id (PK)
├─ student_id
├─ transaction_type (EARN|REDEEM|EXPIRE|ADJUST)
├─ points_amount
├─ reference_id (pos_txn_*, redemption_*, etc)
└─ created_at

marketplace_products
├─ id (PK)
├─ school_id
├─ name
├─ points_cost
├─ category
├─ stock
└─ popularity_score

student_redemptions
├─ id (PK)
├─ student_id
├─ product_id
├─ status (PENDING|APPROVED|DELIVERED|CANCELLED)
└─ created_at

pos_transactions_with_rewards
├─ id (PK)
├─ student_id
├─ base_amount
├─ markup_amount
├─ points_earned
└─ created_at
```

---

## 🧪 6. Testing the Integration

### Test 1: POS → Rewards Flow

```bash
# 1. Start dev server
npm run dev

# 2. Login as School Admin
# Role: School Admin
# School: Primaria Federal

# 3. Go to POS Terminal
# Menu: Main → POS → Cafeteria Mode

# 4. Scan student QR (use STU-001)

# 5. Add items:
# - Sandwich $45
# - Café $12

# 6. Click "Confirmar Compra"

# 7. EXPECTED RESULT:
# ✅ Payment successful
# ✅ Console shows: "✨ 69 puntos generados"
# ✅ Student rewards updated in DB
```

### Test 2: Student Dashboard

```bash
# 1. Login as Student
# ID: STU-001
# School: Primaria Federal

# 2. Go to Dashboard → Rewards Tab

# 3. EXPECTED RESULT:
# ✅ Points display: 1,269+ (from POS transactions)
# ✅ Tier: SILVER (with icon 🥈)
# ✅ Progress bar to GOLD
# ✅ Transaction history shows recent purchases
```

### Test 3: Marketplace

```bash
# 1. From Rewards Dashboard
# 2. Click "Ir al Marketplace"

# 3. EXPECTED RESULT:
# ✅ See 8 products (Headphones, Backpack, Ball, etc.)
# ✅ Filter by category works
# ✅ Search by name works
# ✅ Can't afford? Shows "Necesitas X puntos más"
# ✅ Can afford? Shows "Canjear" button
```

---

## 🐛 7. Troubleshooting

### Issue: "Import from supabase failed"

**Solution:**
```bash
# Verify Supabase is installed
npm list @supabase/supabase-js

# If not, install:
npm install @supabase/supabase-js
```

### Issue: "Env variables not loading"

**Solution:**
```bash
# 1. Check .env.local exists
ls -la .env.local

# 2. Restart dev server
npm run dev

# 3. Clear browser cache (F12 → Application → Clear Storage)
```

### Issue: "TypeError: mockGetSchoolRewardsConfig is not a function"

**Solution in src/services/rewardsService.ts:**

Replace:
```typescript
const config = await rewardsService.mockGetSchoolRewardsConfig(schoolId);
```

With (when Supabase ready):
```typescript
const { data, error } = await supabase
  .from('school_rewards_config')
  .select()
  .eq('school_id', schoolId)
  .single();
```

---

## 📊 8. Monitoring & Debugging

### Check Transactions in Real-time

```sql
-- Run in Supabase SQL Editor
SELECT 
  id,
  student_id,
  transaction_type,
  points_amount,
  created_at
FROM points_transactions
ORDER BY created_at DESC
LIMIT 10;
```

### View Student Points

```sql
SELECT 
  student_id,
  total_points,
  tier,
  earned_this_cycle,
  redeem_this_cycle
FROM student_rewards_points
WHERE school_id = 'school-001'
ORDER BY total_points DESC;
```

### Monitor POS Sales

```sql
SELECT 
  id,
  student_id,
  base_amount,
  markup_amount,
  points_earned,
  created_at
FROM pos_transactions_with_rewards
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;
```

---

## ✅ 9. Deployment Checklist

- [ ] All secrets set in `.env.local`
- [ ] Database schema executed in Supabase
- [ ] RLS policies verified
- [ ] Gemini API key configured
- [ ] OAuth providers set up (optional)
- [ ] Build test: `npm run build` ✅
- [ ] Dev server test: `npm run dev` ✅
- [ ] POS → Rewards flow tested ✅
- [ ] Student Dashboard verified ✅
- [ ] Marketplace redemption works ✅

---

## 🚀 10. Next Steps

| Week | Task | Status |
|------|------|--------|
| Week 1 | Mock data + fixture development | ✅ COMPLETE |
| Week 2 | Supabase integration (THIS STEP) | 🟡 IN PROGRESS |
| Week 2 | School Dashboard real-time KPIs | ⏳ TODO |
| Week 3 | Settlement automation | ⏳ TODO |
| Week 3 | Advanced reporting | ⏳ TODO |
| Week 4 | Production deployment | ⏳ TODO |

---

## 📞 Support

**Issues?**
1. Check [SUPABASE_SCHEMA.sql](SUPABASE_SCHEMA.sql) for table references
2. Review [ANALYSIS_POS_SUPERADMIN_SCHOOLS.md](ANALYSIS_POS_SUPERADMIN_SCHOOLS.md) for architecture
3. Check console.logs in [src/services/rewardsService.ts](src/services/rewardsService.ts)

**Documentation Files:**
- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) - Overall platform
- [WEEK1_POS_REWARDS_TEST.md](WEEK1_POS_REWARDS_TEST.md) - Testing guide
- [PLAN_SCHOOL_SUPERADMIN.md](PLAN_SCHOOL_SUPERADMIN.md) - Strategic roadmap

---

**Last Updated:** 2026-02-12  
**Ready for:** Local development with full mock data  
**Production Target:** Week 3-4
