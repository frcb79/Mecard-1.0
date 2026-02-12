# 📋 LO QUE FALTA - Listado Directo & Priorizado

**Hoy (Feb 12):** Week 1 Complete ✅  
**Próxima:** Week 2 (Feb 12-16) → Supabase Integration

---

## 🔴 BLOCKER (MUST FIX - Week 2)

### 1. Supabase Connection [2-3 horas]
**Why:** Currently using mock data. Real database needed for persistence.

**What to do:**
- [ ] Create Supabase account (free tier: supabase.com)
- [ ] Create new project
- [ ] Copy **SUPABASE_SCHEMA.sql** to SQL editor → click Run
- [ ] Get API keys (Settings → API)
- [ ] Update **.env.local** with keys:
  ```
  VITE_SUPABASE_URL=https://xxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyxxxx
  ```
- [ ] In **src/services/rewardsService.ts**:
  - [ ] Replace `mockGetSchoolRewardsConfig()` with Supabase query
  - [ ] Replace `mockGetStudentRewardsPoints()` with Supabase query
  - [ ] Replace `mockProcessRedemption()` with Supabase insert
  - [ ] Replace `mockGetMarketplaceProducts()` with Supabase query

**Files to update:**
- .env.local (create with keys)
- src/services/rewardsService.ts (5 functions to migrate)
- src/lib/supabaseClient.ts (uncomment initialization)

**Test result:** POS checkout saves to real Supabase ✅

---

### 2. School Dashboard Real KPIs [2 horas]
**Why:** Currently shows fake data. Need real metrics from database.

**What to do:**
- [ ] In **src/components/SchoolAdminView.tsx**:
  - [ ] Query: student count by tier from `student_rewards_points`
  - [ ] Query: today's sales from `pos_transactions_with_rewards`
  - [ ] Query: total points earned today
  - [ ] Display tier distribution (pie chart)
  - [ ] Show top 5 products sold today

**Test result:** Admin dashboard shows real live numbers ✅

---

## 🟡 HIGH PRIORITY (Week 2-3)

### 3. Tier-Up Notifications [2-3 horas]
**Why:** Students should know when they advance tiers.

**What to do:**
- [ ] In **src/components/PosView.tsx** handleCheckout():
  - [ ] Already detects tier change (✅)
  - [ ] [ ] When tier changes, send notification
- [ ] Create email template for "Tier Advanced!"
- [ ] Create push notification (if app supported)
- [ ] Test: Make student cross BRONZE → SILVER threshold

**Expected:** Parent gets email when child advances ✅

---

### 4. Inventory Real-time Sync [2-3 horas]
**Why:** Need to track stock and alert when low.

**What to do:**
- [ ] Create `inventory` table in Supabase
  - [ ] Store: item_id, current_stock, minimum_threshold
- [ ] On POS checkout:
  - [ ] Decrement stock for each item sold
  - [ ] Check if stock < minimum
  - [ ] If yes, alert school admin
- [ ] In school dashboard:
  - [ ] Show items with low stock
  - [ ] Add restock request workflow

**Expected:** POS decrements inventory, alerts show low stock ✅

---

### 5. Settlement Automation [3-4 horas]
**Why:** Need to process payments and settle accounts.

**What to do:**
- [ ] Create settlement cycle (daily/weekly)
  - [ ] Close all transactions for period
  - [ ] Sum WALLET transactions (→ parent accounts)
  - [ ] Sum CASH transactions (→ school deposits)
- [ ] Generate settlement report:
  - [ ] PDF/CSV export
  - [ ] Breakdown by school
  - [ ] Breakdown by payment method
- [ ] Create settlement status page
  - [ ] Show pending settlements
  - [ ] Show completed settlements
  - [ ] Show bank confirmations

**Expected:** School admin can settle payments ✅

---

## 🟢 MEDIUM PRIORITY (Week 3+)

### 6. Advanced Reporting [3-4 horas]

**Sales Analytics:**
- [ ] Daily/weekly sales trend (line chart)
- [ ] Sales by category (pie chart)
- [ ] Top products (bar chart)
- [ ] Peak hours (when most sales)

**Student Analytics:**
- [ ] Points earned per student
- [ ] Tier distribution across school
- [ ] Top spenders
- [ ] Inactive students

**Export:**
- [ ] CSV export
- [ ] PDF report
- [ ] Email delivery

---

### 7. Email Notifications [2-3 horas]

**When to send:**
- [ ] Tier-up notification
- [ ] Redemption approved
- [ ] Low inventory alert
- [ ] Settlement complete
- [ ] Wallet balance low

**Setup:**
- [ ] Choose email provider (SendGrid, Mailgun, etc.)
- [ ] Create email templates
- [ ] Configure in .env.local
- [ ] Test with real email

---

### 8. Real-time Notifications [WebSocket] [2-3 horas]

**What needs real-time:**
- [ ] Point balance updates
- [ ] Tier-up alerts
- [ ] Inventory alerts
- [ ] Redemption processed

**How:**
- [ ] Supabase RealtimeClient available
- [ ] Subscribe to table changes
- [ ] Push updates to UI

---

## 🟢 NICE-TO-HAVE (Future)

### 9. Performance Optimization
- [ ] Code splitting
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Database indexes

### 10. Security Hardening
- [ ] 2FA (Two-factor authentication)
- [ ] API rate limiting
- [ ] Encryption at rest
- [ ] Audit logging

### 11. Advanced Features
- [ ] Gamification (badges, leaderboards)
- [ ] Social features (teams, challenges)
- [ ] Mobile app
- [ ] Offline support (PWA)

### 12. Integrations
- [ ] Payment gateways (Stripe, PayPal)
- [ ] Accounting software link
- [ ] SPEI Mexico transfers
- [ ] Cryptocurrency (future)

---

## 📊 SUMMARY TABLE

| # | Task | Hours | Week | Priority | Status |
|---|------|-------|------|----------|--------|
| 1 | Supabase Connection | 2-3 | W2 | 🔴 BLOCKER | ⏳ TODO |
| 2 | School Dashboard KPIs | 2 | W2 | 🔴 BLOCKER | ⏳ TODO |
| 3 | Tier-Up Notifications | 2-3 | W2-3 | 🟡 HIGH | ⏳ TODO |
| 4 | Inventory Sync | 2-3 | W2-3 | 🟡 HIGH | ⏳ TODO |
| 5 | Settlement Auto | 3-4 | W3 | 🟡 HIGH | ⏳ TODO |
| 6 | Advanced Reports | 3-4 | W3 | 🟢 MED | ⏳ TODO |
| 7 | Email Notifications | 2-3 | W3 | 🟢 MED | ⏳ TODO |
| 8 | Real-time Sync | 2-3 | W3-4 | 🟢 MED | ⏳ TODO |
| 9-12 | Nice-to-have | 8-10 | W4+ | 🟢 LOW | ⏳ TODO |

**Total Hours Remaining:** ~30-40 hours  
**Timeline to Production:** 4 weeks (Mar 9)

---

## 🎯 THIS WEEK'S FOCUS (Feb 12-16)

**Must Finish:**
1. ✅ Supabase account setup
2. ✅ Database schema execution  
3. ✅ API keys configured
4. ✅ rewardsService connected to real DB
5. ✅ School Dashboard getting real data
6. ✅ Verified POS → Supabase flow works

**If time permits:**
7. 🟡 Tier-up notifications
8. 🟡 Inventory tracking setup

---

## 📂 FILES WITH TODO COMMENTS

```bash
# Search for TODO in code:
grep -r "TODO\|FIXME" src/

# Should find:
src/components/PosView.tsx (// TODO: tier-up email)
src/components/SchoolAdminView.tsx (// TODO: real KPIs)
src/services/rewardsService.ts (// TODO: replace mock)
```

---

## 🚀 QUICK REFERENCE

**Next Action:** Open [SUPABASE_SETUP.md](SUPABASE_SETUP.md) and follow steps

**Questions?** Check [DETAILED_FEATURE_STATUS.md](DETAILED_FEATURE_STATUS.md)

**Testing?** See [WEEK1_POS_REWARDS_TEST.md](WEEK1_POS_REWARDS_TEST.md)

**Roadmap?** Read [TODO_ROADMAP.md](TODO_ROADMAP.md)

---

**Generated:** Feb 12, 2026  
**Build:** ✅ 2306 modules, ZERO errors  
**Ready?** Start with Supabase setup 🚀
