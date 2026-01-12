# Supabase Schema & Data Persistence Plan

**Status**: 📋 Design Phase (Ready for implementation)
**Owner**: Architecture Team
**Date**: January 9, 2026

---

## Overview

This document defines the complete Supabase schema required for MeCard platform. Current implementation uses mock data in `constants.ts`; this plan specifies the migration to PostgreSQL persistence via Supabase.

---

## Current State Analysis

### Existing Mock Data
- **Students**: MOCK_STUDENTS_LIST (30 records) in constants.ts
- **Transactions**: MOCK_TRANSACTIONS (50+ records) in constants.ts  
- **Schools**: MOCK_SCHOOLS (5 records) with businessModel JSONB
- **Units**: MOCK_UNITS (4 records)
- **Products**: PRODUCTS (15 records)
- **Users**: Auth via Supabase (exists but not fully integrated)

### Existing Supabase Tables (In DB)
- `auth.users` (Supabase native, managed by auth system)
- Assuming minimal existing schema; will verify during implementation

### What Needs to Be Created
1. Core business entities (schools, units, students, users)
2. Financial entities (deposits, transactions, wallets, savings goals)
3. Operational entities (products, inventory, orders)
4. Monitoring entities (alert configs, alert logs, audit logs)
5. Card management (credentials, printing orders, replacements)

---

## Proposed Schema (13 Tables)

### **Tier 1: Core Master Data**

#### 1. `schools`
Master record for each school using MeCard platform.

```sql
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  city VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Business Model (JSONB for flexibility)
  business_model JSONB DEFAULT '{
    "setupFee": 25000,
    "annualFee": 15000,
    "monthlyRentFee": 5000,
    "parentAppFee": 25,
    "cardDepositFeePercent": 3.5,
    "speiDepositFeeFixed": 8.0,
    "cafeteriaFeePercent": 5.0,
    "cafeteriaFeeAutoMarkup": true,
    "posMarkupPercent": 15,
    "posOperatorIncentivePercent": 20,
    "pointsExchangeRate": 10,
    "printingCardFeeFixed": 2.50,
    "cardReplacementFeeFixed": 5.00
  }'::jsonb,
  
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_schools_active ON schools(active);
CREATE INDEX idx_schools_city ON schools(city);
```

---

#### 2. `operating_units`
Physical locations/cafeterias within a school.

```sql
CREATE TABLE operating_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  unit_type VARCHAR(50), -- 'CAFETERIA', 'CONCESSIONAIRE', 'STORE'
  location VARCHAR(255),
  manager_id UUID, -- References auth.users later
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_operating_units_school_id ON operating_units(school_id);
CREATE INDEX idx_operating_units_manager_id ON operating_units(manager_id);
```

---

#### 3. `students`
Master student records.

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  student_id_number VARCHAR(50) UNIQUE, -- Enrollment number
  grade VARCHAR(50),
  status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'GRADUATED', 'INACTIVE', 'SUSPENDED'
  enrollment_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_students_student_id_number ON students(student_id_number);
CREATE INDEX idx_students_status ON students(status);
```

---

#### 4. `users`
Extended user profiles (parent, student, staff, admin).

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'SUPER_ADMIN', 'SCHOOL_ADMIN', 'UNIT_MANAGER', 'PARENT', 'STUDENT', 'CASHIER', 'POS_OPERATOR'
  profile_type VARCHAR(50), -- 'PARENT', 'STUDENT', 'STAFF'
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);
```

---

### **Tier 2: Financial Entities**

#### 5. `financial_profiles`
Wallet and gamification data for each student.

```sql
CREATE TABLE financial_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- Wallet balances
  available_balance DECIMAL(12, 2) DEFAULT 0.00,
  locked_balance DECIMAL(12, 2) DEFAULT 0.00, -- Savings goals
  total_points INT DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT balances_non_negative CHECK (available_balance >= 0 AND locked_balance >= 0)
);

CREATE INDEX idx_financial_profiles_student_id ON financial_profiles(student_id);
CREATE INDEX idx_financial_profiles_school_id ON financial_profiles(school_id);
```

---

#### 6. `parent_profiles`
Parent account information and linked children.

```sql
CREATE TABLE parent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  total_wallet_balance DECIMAL(12, 2) DEFAULT 0.00,
  preferred_currency VARCHAR(10) DEFAULT 'MXN',
  
  -- KYC (if needed later)
  kyc_verified BOOLEAN DEFAULT false,
  kyc_verified_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_parent_profiles_user_id ON parent_profiles(user_id);
CREATE INDEX idx_parent_profiles_school_id ON parent_profiles(school_id);
```

---

#### 7. `parent_student_links`
Relationship between parents and their linked children.

```sql
CREATE TABLE parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- Relationship type
  relationship VARCHAR(50) DEFAULT 'PARENT', -- 'PARENT', 'GUARDIAN', 'LEGAL_GUARDIAN'
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(parent_id, student_id)
);

CREATE INDEX idx_parent_student_links_parent_id ON parent_student_links(parent_id);
CREATE INDEX idx_parent_student_links_student_id ON parent_student_links(student_id);
```

---

#### 8. `deposits`
Parent deposit transactions.

```sql
CREATE TABLE deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'MXN',
  fee DECIMAL(12, 2) DEFAULT 0.00,
  net_amount DECIMAL(12, 2) NOT NULL,
  
  payment_method VARCHAR(50) NOT NULL, -- 'CARD', 'SPEI', 'BANK_TRANSFER'
  payment_method_id UUID REFERENCES payment_methods(id),
  
  status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'
  
  external_reference VARCHAR(255), -- Payment gateway reference
  
  deposit_date TIMESTAMP DEFAULT NOW(),
  completed_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT amount_positive CHECK (amount > 0),
  CONSTRAINT net_amount_valid CHECK (net_amount = amount - fee)
);

CREATE INDEX idx_deposits_parent_id ON deposits(parent_id);
CREATE INDEX idx_deposits_student_id ON deposits(student_id);
CREATE INDEX idx_deposits_school_id ON deposits(school_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_deposits_deposit_date ON deposits(deposit_date);
```

---

#### 9. `payment_methods`
Saved parent payment methods.

```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL, -- 'CARD', 'SPEI', 'BANK_ACCOUNT'
  
  -- Card data (encrypted in real implementation)
  card_number_last_4 VARCHAR(4),
  card_holder_name VARCHAR(255),
  card_expiry_month INT,
  card_expiry_year INT,
  
  -- Bank/SPEI data
  clabe_or_account VARCHAR(50),
  bank_name VARCHAR(255),
  
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_parent_id ON payment_methods(parent_id);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(is_default);
```

---

#### 10. `spending_limits`
Parent-configured spending limits for children.

```sql
CREATE TABLE spending_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  daily_limit DECIMAL(10, 2),
  weekly_limit DECIMAL(10, 2),
  monthly_limit DECIMAL(10, 2),
  
  -- Restricted categories
  restricted_categories TEXT[], -- Array of category names (JSONB alternative)
  
  -- Time-based restrictions (optional)
  block_outside_school_hours BOOLEAN DEFAULT false,
  school_start_time TIME,
  school_end_time TIME,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_spending_limits_parent_id ON spending_limits(parent_id);
CREATE INDEX idx_spending_limits_student_id ON spending_limits(student_id);
```

---

### **Tier 3: Monitoring & Alerts**

#### 11. `alert_configs`
Parent notification preferences.

```sql
CREATE TABLE alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL UNIQUE REFERENCES parent_profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- Alert toggles
  low_balance_alert BOOLEAN DEFAULT true,
  low_balance_threshold DECIMAL(10, 2) DEFAULT 50.00,
  
  large_purchase_alert BOOLEAN DEFAULT true,
  large_purchase_threshold DECIMAL(10, 2) DEFAULT 100.00,
  
  denied_purchase_alert BOOLEAN DEFAULT true,
  
  -- Notification channels
  alert_channels TEXT[] DEFAULT '{"IN_APP"}', -- Array: 'EMAIL', 'SMS', 'IN_APP'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alert_configs_parent_id ON alert_configs(parent_id);
```

---

#### 12. `alert_logs`
Historical record of sent alerts.

```sql
CREATE TABLE alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  alert_type VARCHAR(50) NOT NULL, -- 'LOW_BALANCE', 'LARGE_PURCHASE', 'DENIED_PURCHASE'
  
  trigger_data JSONB, -- Data that triggered the alert
  -- Example: {"studentId": "...", "amount": 150.00, "category": "CAFETERIA"}
  
  channels_sent TEXT[], -- Which channels were used: ['EMAIL', 'SMS', 'IN_APP']
  
  status VARCHAR(50) DEFAULT 'SENT', -- 'PENDING', 'SENT', 'FAILED'
  
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP,
  email_error VARCHAR(500),
  
  sms_sent BOOLEAN DEFAULT false,
  sms_sent_at TIMESTAMP,
  sms_error VARCHAR(500),
  
  in_app_notification_created BOOLEAN DEFAULT false,
  in_app_read BOOLEAN DEFAULT false,
  in_app_read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alert_logs_parent_id ON alert_logs(parent_id);
CREATE INDEX idx_alert_logs_alert_type ON alert_logs(alert_type);
CREATE INDEX idx_alert_logs_created_at ON alert_logs(created_at);
CREATE INDEX idx_alert_logs_status ON alert_logs(status);
```

---

#### 13. `transactions`
All financial transactions (purchases, deposits, refunds, etc).

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES operating_units(id) ON DELETE SET NULL,
  
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES parent_profiles(id) ON DELETE SET NULL,
  
  type VARCHAR(50) NOT NULL, -- 'PURCHASE', 'DEPOSIT', 'REFUND', 'ADJUSTMENT'
  category VARCHAR(100), -- 'CAFETERIA', 'VENDING', 'MARKETPLACE'
  
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'MXN',
  
  -- For purchases
  item_name VARCHAR(255),
  quantity INT,
  unit_price DECIMAL(10, 2),
  
  -- For POS transactions
  pos_markup_amount DECIMAL(10, 2) DEFAULT 0.00,
  points_earned INT DEFAULT 0,
  operator_id UUID, -- POS operator who processed it
  
  -- Status
  status VARCHAR(50) DEFAULT 'COMPLETED', -- 'COMPLETED', 'PENDING', 'FAILED', 'CANCELLED'
  
  description VARCHAR(500),
  reference_id VARCHAR(255), -- External reference if any
  
  transaction_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT amount_non_zero CHECK (amount != 0)
);

CREATE INDEX idx_transactions_school_id ON transactions(school_id);
CREATE INDEX idx_transactions_unit_id ON transactions(unit_id);
CREATE INDEX idx_transactions_student_id ON transactions(student_id);
CREATE INDEX idx_transactions_parent_id ON transactions(parent_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_status ON transactions(status);
```

---

## Data Migration Strategy

### Phase 1: Initial Load (Week 1)
1. **Create all 13 tables** (via Supabase migrations)
2. **Load MOCK_SCHOOLS** → `schools` table
3. **Load MOCK_UNITS** → `operating_units` table
4. **Load MOCK_STUDENTS_LIST** → `students` table
5. **Load PRODUCTS** → products table (add to schema if needed)
6. **Create default users** in `users` table from auth

### Phase 2: Service Migration (Week 1-2)
1. **Update financialService.ts**:
   - `createFinancialProfile()` → INSERT into financial_profiles
   - `getStudentWallet()` → SELECT from financial_profiles
   - `updateWallet()` → UPDATE financial_profiles

2. **Update parentDepositService.ts**:
   - `createDeposit()` → INSERT into deposits
   - `getDepositHistory()` → SELECT from deposits
   - `savePaymentMethod()` → INSERT into payment_methods

3. **Update limitsService.ts**:
   - `getStudentLimits()` → SELECT from spending_limits
   - `updateLimits()` → UPDATE spending_limits
   - `validatePurchase()` → Check spending_limits table

4. **Create alertingService.ts**:
   - `getAlertConfig()` → SELECT from alert_configs
   - `updateAlertConfig()` → UPDATE alert_configs
   - `logAlert()` → INSERT into alert_logs
   - `sendAlert()` → Call EMAIL/SMS APIs and update alert_logs

### Phase 3: Transaction Migration (Week 2)
1. **Migrate MOCK_TRANSACTIONS** → `transactions` table
2. **Update settlementService.ts** to query from transactions table
3. **Update reporting services** to use Supabase queries

---

## Service Layer Changes Required

### New Service: `supabaseFinancialService.ts`
```typescript
// Replaces mock logic with Supabase queries
async getStudentWallet(studentId: string) {
  const { data } = await supabase
    .from('financial_profiles')
    .select('*')
    .eq('student_id', studentId);
  return data?.[0];
}

async updateWalletBalance(studentId: string, amount: number) {
  // Handle atomic updates with proper error handling
}
```

### New Service: `supabaseAlertingService.ts`
```typescript
// Handle notification logic
async sendAlert(parentId: string, alertConfig: AlertConfig, triggerData: any) {
  const alert = await this.createAlertLog(parentId, triggerData);
  
  if (alertConfig.alertChannels.includes('EMAIL')) {
    await this.sendEmailAlert(parent.email, alert);
  }
  if (alertConfig.alertChannels.includes('SMS')) {
    await this.sendSMSAlert(parent.phone, alert);
  }
  if (alertConfig.alertChannels.includes('IN_APP')) {
    await this.createInAppNotification(parentId, alert);
  }
}
```

### Updated Service: `settlementService.ts`
```typescript
// Change from mock data to Supabase queries
async calculateSettlement(schoolId: string, period: DateRange) {
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('school_id', schoolId)
    .gte('transaction_date', period.start)
    .lte('transaction_date', period.end);
  
  // Rest of calculation logic unchanged
}
```

---

## Environment Variables

Add to `.env.local`:
```bash
# Supabase (already exists)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Notification Services (NEW)
VITE_SENDGRID_API_KEY=sg_...
VITE_TWILIO_ACCOUNT_SID=AC...
VITE_TWILIO_AUTH_TOKEN=...
VITE_TWILIO_PHONE_NUMBER=+...
```

---

## Implementation Checklist

### Week 1
- [ ] Review and approve schema design
- [ ] Create Supabase migrations file with all 13 CREATE TABLE statements
- [ ] Test migrations on staging Supabase project
- [ ] Create migration rollback plan
- [ ] Load MOCK data into tables
- [ ] Verify data integrity and relationships
- [ ] Create database backup

### Week 2
- [ ] Create `supabaseFinancialService.ts`
- [ ] Create `supabaseAlertingService.ts`
- [ ] Update `parentDepositService.ts` to use Supabase
- [ ] Update `limitsService.ts` to use Supabase
- [ ] Update `settlementService.ts` to use Supabase
- [ ] Create `notificationService.ts` (EMAIL/SMS templates)
- [ ] Test all services with real data
- [ ] Create unit tests for critical queries

### Week 3
- [ ] Update all components to use real services
- [ ] Remove mock data dependencies where possible
- [ ] Test end-to-end flows
- [ ] Performance testing (add indexes if needed)
- [ ] Load testing (1000+ concurrent users)

---

## Performance Considerations

### Indexes Strategy
- ✅ All foreign keys indexed (automatic with references)
- ✅ Filter columns indexed (school_id, student_id, parent_id, status, dates)
- ✅ Search columns indexed (email, student_id_number)
- ✅ Sort columns indexed (created_at, transaction_date)

### Query Optimization
- Use connection pooling (Supabase default)
- Implement query caching for frequently accessed data
- Batch inserts for bulk operations (deposits, transactions)
- Pagination for large result sets (100 records per page)

### Row Level Security (RLS)
```sql
-- Example: Parents can only see their own children's data
CREATE POLICY "parents_see_own_children" ON students
  FOR SELECT USING (
    id IN (
      SELECT student_id FROM parent_student_links
      WHERE parent_id = current_user_id()
    )
  );
```

---

## Testing Data Sets

### Seed Data Requirements
- 5 schools with different business models
- 20 students per school (100 total)
- 10 parents per school (50 total)
- 4 operating units per school (20 total)
- 500+ transactions per school (2500 total)
- Mixed transaction types: purchases, deposits, refunds

### Test Scenarios
1. Parent deposits to student wallet
2. Student makes purchase (under limit)
3. Student tries purchase (over limit, denied)
4. Alert triggered and logged
5. Alert notification sent (EMAIL/SMS/IN_APP)
6. Report generation from transactions

---

## Rollback Plan

In case of issues:
1. Keep MOCK data in `constants.ts` as fallback
2. Services check `SUPABASE_URL` env var
3. If Supabase connection fails → fall back to mocks
4. Database migrations are versioned and reversible

```typescript
// Example fallback pattern
async getStudentWallet(studentId: string) {
  if (!SUPABASE_URL) {
    return MOCK_FINANCIAL_PROFILES.find(p => p.studentId === studentId);
  }
  
  try {
    const { data } = await supabase
      .from('financial_profiles')
      .select('*')
      .eq('student_id', studentId);
    return data?.[0];
  } catch (error) {
    console.error('Supabase query failed, falling back to mocks', error);
    return MOCK_FINANCIAL_PROFILES.find(p => p.studentId === studentId);
  }
}
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Query latency (P95) | < 100ms | Supabase dashboard |
| Data consistency | 100% | Automated tests |
| Schema coverage | 100% | All 13 tables created + indexed |
| Service integration | 100% | All services updated |
| Test coverage | > 80% | Jest/Vitest |
| Data migration | 100% | Verify row counts |

---

## Next Steps (After Approval)

1. **Finalize schema** (request user feedback)
2. **Create migration file** with all DDL statements
3. **Create seed data script** to load mock data
4. **Implement services** in order (financial → deposits → limits → alerts)
5. **Test end-to-end** with real Supabase project
6. **Document API endpoints** for MVP-3 backend services

---

**Ready to proceed with implementation?**

Next document: `SUPABASE_SERVICE_DESIGN.md` will define the exact API contracts for:
- ParentReportsView backend
- SchoolAdminDashboardEnhanced backend
- Notification service APIs
