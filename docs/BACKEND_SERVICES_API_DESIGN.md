# Backend Services API Design & Contracts

**Status**: 📋 Design Phase (Ready for implementation)
**Purpose**: Define exact data structures and endpoints needed before writing frontend
**Date**: January 9, 2026

---

## Overview

This document specifies the exact API contracts, request/response schemas, and backend services required for:
1. **MVP-2 Completion**: Notification services (AlertingService)
2. **MVP-3 Frontend**: ParentReportsView and SchoolAdminDashboardEnhanced
3. **Settlement/Reporting**: Financial reporting endpoints

Each service includes:
- Request/response TypeScript interfaces
- Example API calls
- Error handling strategy
- Caching/performance notes

---

## Service 1: AlertingService (MVP-2 Backend Completion)

**Purpose**: Send notifications via EMAIL/SMS/IN_APP based on AlertConfig

**Location**: `services/alertingService.ts`

### 1.1 Send Low Balance Alert

**Trigger**: When student's wallet drops below configured threshold

**Request**:
```typescript
interface SendLowBalanceAlertRequest {
  parentId: string;
  studentId: string;
  studentName: string;
  currentBalance: number; // Student's current wallet balance
  threshold: number; // Parent's configured threshold
  schoolId: string;
}

// Example
const alert = {
  parentId: 'parent_1',
  studentId: 'student_5',
  studentName: 'Juan García',
  currentBalance: 35.50,
  threshold: 50.00,
  schoolId: 'school_1',
};
```

**Response**:
```typescript
interface AlertSendResponse {
  alertLogId: string;
  success: boolean;
  channelResults: {
    EMAIL?: {
      sent: boolean;
      sentAt: string; // ISO timestamp
      error?: string;
    };
    SMS?: {
      sent: boolean;
      sentAt: string;
      messageId?: string;
      error?: string;
    };
    IN_APP?: {
      sent: boolean;
      sentAt: string;
      notificationId?: string;
      error?: string;
    };
  };
  timestamp: string;
}

// Example response
{
  "alertLogId": "alert_log_123",
  "success": true,
  "channelResults": {
    "EMAIL": {
      "sent": true,
      "sentAt": "2025-01-09T14:30:00Z"
    },
    "SMS": {
      "sent": true,
      "sentAt": "2025-01-09T14:30:05Z",
      "messageId": "SM123456"
    },
    "IN_APP": {
      "sent": true,
      "sentAt": "2025-01-09T14:30:01Z",
      "notificationId": "notif_789"
    }
  },
  "timestamp": "2025-01-09T14:30:00Z"
}
```

**Implementation**:
```typescript
async sendLowBalanceAlert(request: SendLowBalanceAlertRequest): Promise<AlertSendResponse> {
  // 1. Fetch parent's alert config
  const alertConfig = await limitsService.getAlertConfig(request.parentId);
  
  // 2. If low balance alert disabled, return early
  if (!alertConfig.lowBalanceAlert) {
    return { success: false, reason: 'Alert disabled' };
  }
  
  // 3. Create alert log record in Supabase
  const alertLog = await supabase.from('alert_logs').insert({
    parent_id: request.parentId,
    alert_type: 'LOW_BALANCE',
    trigger_data: {
      studentId: request.studentId,
      studentName: request.studentName,
      currentBalance: request.currentBalance,
      threshold: request.threshold,
    },
    channels_sent: alertConfig.alertChannels,
    status: 'PENDING',
  });
  
  // 4. Send via each configured channel
  const results: AlertSendResponse['channelResults'] = {};
  
  if (alertConfig.alertChannels.includes('EMAIL')) {
    try {
      await sendEmailAlert({
        parentEmail: parent.email,
        subject: `Alerta: Saldo bajo de ${request.studentName}`,
        template: 'LOW_BALANCE_ALERT',
        data: request,
      });
      results.EMAIL = { sent: true, sentAt: new Date().toISOString() };
    } catch (error) {
      results.EMAIL = { sent: false, error: error.message };
    }
  }
  
  if (alertConfig.alertChannels.includes('SMS')) {
    // Similar pattern with Twilio
  }
  
  if (alertConfig.alertChannels.includes('IN_APP')) {
    // Create in-app notification
  }
  
  // 5. Update alert log with results
  await supabase.from('alert_logs').update({
    status: 'SENT',
    ...results,
  });
  
  return { alertLogId: alertLog.id, success: true, channelResults: results };
}
```

**Error Handling**:
```typescript
// If SendGrid down: In-app alert still sent, email fails gracefully
// If Twilio down: SMS fails, but email/in-app continue
// If Supabase down: Log to console, retry with exponential backoff
```

---

### 1.2 Send Large Purchase Alert

**Trigger**: When transaction amount exceeds configured threshold

**Request**:
```typescript
interface SendLargePurchaseAlertRequest {
  parentId: string;
  studentId: string;
  studentName: string;
  transactionAmount: number;
  threshold: number;
  itemName: string;
  category: string; // 'CAFETERIA', 'MARKETPLACE', etc
  unitName: string; // Where purchase was made
  schoolId: string;
}
```

**Response**: Same as `AlertSendResponse` above

**Implementation Notes**:
- Call this **before** transaction is committed (deny/allow decision)
- If alert fails, transaction should still complete (non-blocking)
- Log all attempts for audit trail

---

### 1.3 Send Denied Purchase Alert

**Trigger**: When purchase is blocked due to spending limit

**Request**:
```typescript
interface SendDeniedPurchaseAlertRequest {
  parentId: string;
  studentId: string;
  studentName: string;
  attemptedAmount: number;
  dailyRemaining: number;
  weeklyRemaining: number;
  monthlyRemaining: number;
  reason: string; // 'DAILY_LIMIT_EXCEEDED', 'CATEGORY_BLOCKED', 'SCHOOL_HOURS_BLOCKED'
  schoolId: string;
}
```

**Response**: Same as above

---

### 1.4 Get Alert History

**Purpose**: Fetch all alerts sent to a parent

**Request**:
```typescript
interface GetAlertHistoryRequest {
  parentId: string;
  limit?: number; // Default 50
  offset?: number; // Default 0
  alertType?: string; // Filter: 'LOW_BALANCE', 'LARGE_PURCHASE', 'DENIED_PURCHASE'
  dateFrom?: string; // ISO date
  dateTo?: string; // ISO date
}
```

**Response**:
```typescript
interface AlertHistoryResponse {
  alerts: Array<{
    id: string;
    alertType: string;
    status: string;
    triggerData: Record<string, any>;
    channelsSent: string[];
    createdAt: string;
    channelResults?: {
      EMAIL?: { sent: boolean; sentAt: string };
      SMS?: { sent: boolean; sentAt: string };
      IN_APP?: { sent: boolean; sentAt: string };
    };
  }>;
  total: number;
  hasMore: boolean;
}
```

---

## Service 2: ReportingService (MVP-3 Backend)

**Purpose**: Generate data for ParentReportsView and SchoolAdminDashboardEnhanced

**Location**: `services/reportingService.ts`

### 2.1 Get Parent Spending Report

**Purpose**: Aggregated spending data for ParentReportsView

**Request**:
```typescript
interface GetParentSpendingReportRequest {
  parentId: string;
  period: 'WEEK' | 'MONTH' | 'YEAR'; // Time frame
  comparison?: boolean; // Include previous period
  categories?: string[]; // Filter by categories
  studentId?: string; // Filter by specific child
}
```

**Response**:
```typescript
interface ParentSpendingReport {
  period: {
    start: string; // ISO date
    end: string;
    totalDays: number;
  };
  
  // Summary metrics
  summary: {
    totalSpent: number;
    transactionCount: number;
    averagePerTransaction: number;
    maxSinglePurchase: number;
    minSinglePurchase: number;
    
    // Trends
    changePercent: number; // vs previous period (if comparison=true)
    changeTrend: 'UP' | 'DOWN' | 'STABLE';
  };
  
  // Category breakdown
  byCategory: Array<{
    category: string; // 'CAFETERIA', 'MARKETPLACE', etc
    amount: number;
    percentage: number;
    transactionCount: number;
    trend: number; // Percent change vs previous period
  }>;
  
  // By child (if multiple children)
  byChild?: Array<{
    studentId: string;
    studentName: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }>;
  
  // Daily breakdown for charts
  dailyTrend: Array<{
    date: string; // YYYY-MM-DD
    amount: number;
    transactionCount: number;
    average: number;
    previousPeriodAmount?: number; // If comparison=true
  }>;
  
  // Top merchants
  topMerchants: Array<{
    unitName: string;
    unitId: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }>;
  
  // Recent transactions
  recentTransactions: Array<{
    id: string;
    studentName: string;
    itemName: string;
    amount: number;
    category: string;
    timestamp: string;
    location: string;
  }>;
  
  // AI Suggestions (if enabled)
  aiSuggestions?: Array<{
    type: string; // 'SAVINGS_TIP', 'SPENDING_ALERT', 'PATTERN'
    title: string;
    description: string;
    impact: string; // Estimated savings
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
}

// Example response
{
  "period": {
    "start": "2025-01-01",
    "end": "2025-01-31",
    "totalDays": 31
  },
  "summary": {
    "totalSpent": 2540.50,
    "transactionCount": 42,
    "averagePerTransaction": 60.49,
    "maxSinglePurchase": 250.00,
    "minSinglePurchase": 15.00,
    "changePercent": 8.5,
    "changeTrend": "UP"
  },
  "byCategory": [
    {
      "category": "CAFETERIA",
      "amount": 1850.00,
      "percentage": 72.7,
      "transactionCount": 28,
      "trend": 5.2
    },
    {
      "category": "MARKETPLACE",
      "amount": 690.50,
      "percentage": 27.3,
      "transactionCount": 14,
      "trend": 15.3
    }
  ],
  "dailyTrend": [
    {"date": "2025-01-01", "amount": 120.00, "transactionCount": 2, "average": 60.00},
    {"date": "2025-01-02", "amount": 85.50, "transactionCount": 1, "average": 85.50}
  ],
  "topMerchants": [
    {
      "unitName": "Cafetería Principal",
      "unitId": "unit_1",
      "amount": 1200.00,
      "percentage": 47.2,
      "transactionCount": 18
    }
  ],
  "recentTransactions": [
    {
      "id": "txn_123",
      "studentName": "Juan García",
      "itemName": "Comida del día + refresco",
      "amount": 85.00,
      "category": "CAFETERIA",
      "timestamp": "2025-01-09T12:30:00Z",
      "location": "Cafetería Principal"
    }
  ],
  "aiSuggestions": [
    {
      "type": "SAVINGS_TIP",
      "title": "Cafetería: Opción económica disponible",
      "description": "El menú de económico ahorra ~$20/día vs premium",
      "impact": "$400-600/mes",
      "priority": "MEDIUM"
    }
  ]
}
```

**Implementation Notes**:
- All queries should be **date-indexed** for performance
- Implement **caching** (cache for 1 hour, invalidate on new transaction)
- For AI suggestions, use Gemini API (from existing `geminiService.ts`)
- Handle null cases (no transactions = empty arrays, zero summary)

---

### 2.2 Get School Admin Dashboard Data

**Purpose**: KPIs and metrics for SchoolAdminDashboardEnhanced

**Request**:
```typescript
interface GetSchoolAdminDashboardRequest {
  schoolId: string;
  period: 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR';
  unitId?: string; // Filter to specific unit/cafeteria
  comparison?: boolean; // Include previous period
}
```

**Response**:
```typescript
interface SchoolAdminDashboard {
  period: {
    start: string;
    end: string;
    label: string; // "Hoy", "Última semana", etc
  };
  
  // Top-level KPIs
  kpis: {
    // Students & Enrollment
    totalActiveStudents: number;
    newStudentsThisMonth: number;
    studentGrowthPercent: number;
    
    // Financial
    totalBalanceLoaded: number; // All student wallets combined
    totalTransactions: number;
    totalRevenue: number;
    averageTransactionValue: number;
    platformCommission: number;
    
    // Operational
    activeUnits: number;
    busyPeriod: string; // "12:00-14:00"
    peakTransactionHour: number; // 12, 13, etc
    
    // Comparison
    previousPeriodRevenue?: number;
    revenueChangePercent?: number;
    transactionChangePercent?: number;
  };
  
  // Hourly transaction distribution
  hourlyDistribution: Array<{
    hour: number; // 0-23
    label: string; // "12:00"
    transactionCount: number;
    revenue: number;
    capacity: string; // "HIGH", "MEDIUM", "LOW"
  }>;
  
  // Unit performance
  unitMetrics: Array<{
    unitId: string;
    unitName: string;
    transactionCount: number;
    revenue: number;
    percentOfTotal: number;
    topProduct: {
      name: string;
      soldCount: number;
      revenue: number;
    };
  }>;
  
  // Product trends
  topProducts: Array<{
    productId: string;
    productName: string;
    unitName: string;
    soldCount: number;
    revenue: number;
    trend: number; // Percent change vs previous period
    costPrice: number;
    markup: number;
  }>;
  
  // Transaction types breakdown
  transactionBreakdown: {
    purchases: number;
    deposits: number;
    refunds: number;
    other: number;
  };
  
  // Revenue breakdown
  revenueBreakdown: Array<{
    type: string; // 'CAFETERIA_SALES', 'DEPOSITS', 'MARKETPLACE', 'SERVICES'
    amount: number;
    percentage: number;
  }>;
  
  // Student spending distribution (for segmentation)
  studentSpendingDistribution: {
    heavySpenders: number; // > $100/month
    mediumSpenders: number; // $50-100/month
    lightSpenders: number; // < $50/month
    nonSpenders: number; // $0
  };
  
  // Alerts/Warnings
  alerts: Array<{
    type: string; // 'LOW_INVENTORY', 'HIGH_REFUNDS', 'SYSTEM_ISSUE'
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    message: string;
    action?: string; // Recommended action
  }>;
}

// Example response
{
  "period": {
    "start": "2025-01-01",
    "end": "2025-01-31",
    "label": "Enero 2025"
  },
  "kpis": {
    "totalActiveStudents": 487,
    "newStudentsThisMonth": 12,
    "studentGrowthPercent": 2.5,
    "totalBalanceLoaded": 45250.75,
    "totalTransactions": 3240,
    "totalRevenue": 125640.50,
    "averageTransactionValue": 38.78,
    "platformCommission": 5653.82,
    "activeUnits": 4,
    "busyPeriod": "12:00-14:00",
    "peakTransactionHour": 13
  },
  "hourlyDistribution": [
    {"hour": 12, "label": "12:00", "transactionCount": 580, "revenue": 22540.00, "capacity": "HIGH"},
    {"hour": 13, "label": "13:00", "transactionCount": 620, "revenue": 24380.00, "capacity": "HIGH"},
    {"hour": 14, "label": "14:00", "transactionCount": 420, "revenue": 16240.00, "capacity": "MEDIUM"}
  ],
  "unitMetrics": [
    {
      "unitId": "unit_1",
      "unitName": "Cafetería Principal",
      "transactionCount": 1850,
      "revenue": 71540.00,
      "percentOfTotal": 56.9,
      "topProduct": {"name": "Comida del día", "soldCount": 480, "revenue": 24000.00}
    }
  ],
  "topProducts": [
    {"productId": "prod_1", "productName": "Comida del día", "unitName": "Cafetería Principal", "soldCount": 480, "revenue": 24000.00, "trend": 12.5}
  ],
  "studentSpendingDistribution": {
    "heavySpenders": 120,
    "mediumSpenders": 240,
    "lightSpenders": 100,
    "nonSpenders": 27
  }
}
```

**Implementation Notes**:
- Heavy aggregation workload; implement **materialized views** or **hourly summaries** table
- Cache results aggressively (1 hour for day, 6 hours for month)
- Implement **row-level security** so schools only see their own data
- Hourly distribution query can be expensive; pre-aggregate nightly

---

### 2.3 Get Settlement Data (for SettlementService)

**Purpose**: Calculate liquidations between MeCard, schools, and operators

**Request**:
```typescript
interface GetSettlementDataRequest {
  schoolId: string;
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
  unitId?: string; // Optional: filter to specific unit
  calculateCommissions?: boolean; // Default true
}
```

**Response**:
```typescript
interface SettlementData {
  period: {
    start: string;
    end: string;
    days: number;
  };
  
  summary: {
    grossRevenue: number;
    totalTransactions: number;
    averageTransaction: number;
  };
  
  // MeCard commission calculation
  mecard: {
    platformCommissionPercent: number; // 4.5% fixed
    platformCommission: number;
    
    // Additional fees
    processsingFees: number; // Deposit fees collected
    servicesFees: number; // Parent app fees, etc
    totalMeCardRevenue: number;
  };
  
  // School revenue
  school: {
    grossFromTransactions: number;
    depositFeesCollected: number;
    businessModelFees: number;
    totalSchoolRevenue: number;
  };
  
  // Unit/Operator commissions
  unitBreakdown: Array<{
    unitId: string;
    unitName: string;
    unitManagerId: string;
    
    transactionCount: number;
    revenue: number;
    
    // Unit operator incentive (from businessModel)
    operatorIncentivePercent: number;
    operatorIncentive: number;
    
    // POS markup
    posMarkupPercent: number;
    posMarkupAmount: number;
    
    netToSchool: number; // After all deductions
  }>;
  
  // Transactions detail (for audit)
  transactions: Array<{
    transactionId: string;
    date: string;
    amount: number;
    category: string;
    unitId: string;
    
    // Breakdown
    platformShare: number;
    schoolShare: number;
    operatorShare: number;
  }>;
  
  // Summary by transaction type
  byType: {
    cafeteria: {
      count: number;
      revenue: number;
      meCardRevenue: number;
    };
    marketplace: {
      count: number;
      revenue: number;
      meCardRevenue: number;
    };
  };
}
```

**Implementation Notes**:
- Use existing `settlementService.ts` calculation logic
- Just wrap it with Supabase queries instead of mock data
- Return full detail for audit purposes

---

## Service 3: NotificationService (Supporting Infrastructure)

**Purpose**: Send actual emails and SMS

**Location**: `services/notificationService.ts`

### 3.1 SendGrid Email Integration

```typescript
interface EmailPayload {
  to: string; // Parent email
  subject: string;
  templateId: string; // 'LOW_BALANCE_ALERT', 'LARGE_PURCHASE_ALERT', etc
  dynamicTemplateData: {
    [key: string]: any; // Merge tags for template
  };
  schoolName?: string;
  schoolLogo?: string;
}

async sendEmail(payload: EmailPayload): Promise<{ messageId: string; status: 'sent' | 'failed' }> {
  // Use SendGrid SDK
  // Template examples:
  // - LOW_BALANCE_ALERT: "Hola {{parentName}}, el saldo de {{studentName}} es {{balance}}"
  // - LARGE_PURCHASE_ALERT: "Alerta: {{studentName}} intentó comprar {{amount}} de {{item}}"
}
```

### 3.2 Twilio SMS Integration

```typescript
interface SMSPayload {
  to: string; // Parent phone
  body: string; // Message text (max 160 chars or will split)
  schoolName?: string;
}

async sendSMS(payload: SMSPayload): Promise<{ messageId: string; status: 'sent' | 'failed' }> {
  // Use Twilio SDK
  // Example: "MeCard: Alerta saldo bajo para Juan García. Saldo: $35. Portal: app.mecard.mx"
}
```

### 3.3 In-App Notification

```typescript
interface InAppNotificationPayload {
  parentId: string;
  title: string;
  description: string;
  icon: string; // Icon name from lucide-react
  actionUrl?: string; // Link to navigate to when clicked
  type: string; // 'ALERT', 'INFO', 'SUCCESS'
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

async createInAppNotification(payload: InAppNotificationPayload) {
  // Create record in notifications table
  // Will be fetched by NotificationCenter component on app load
}
```

---

## Integration Flow Diagram

```
When Parent Makes Deposit (Example):
┌─────────────────────────────────────────────────────────────┐
│ User clicks "Depositar" in ParentWalletView                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ parentDepositService.createDeposit()                        │
│ - Validate amount & payment method                          │
│ - Call payment processor (if real)                          │
│ - Insert into deposits table                               │
│ - Update financial_profiles wallet                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ NEW: Check if low balance alert should trigger              │
│ - If previous balance WAS below threshold                   │
│ - And new balance is NOW above threshold                    │
│ - Call alertingService.sendAlert('BALANCE_RECOVERED')       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ alertingService.sendLowBalanceAlert()                       │
│ - Fetch alert config for parent                            │
│ - Send via configured channels (EMAIL/SMS/IN_APP)          │
│ - Create alert_logs record                                 │
│ - Return response to UI                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
          UI shows success toast
```

---

## Testing Strategy

### Unit Tests
```typescript
// services/__tests__/alertingService.test.ts
describe('AlertingService', () => {
  test('sendLowBalanceAlert triggers for EMAIL channel', async () => {
    // Mock Supabase insert
    // Mock sendEmail function
    // Verify alert_logs record created
    // Verify sendEmail called with correct params
  });
  
  test('sendLowBalanceAlert skips disabled alert type', async () => {
    // Set alert config with lowBalanceAlert: false
    // Call sendAlert
    // Verify no email sent
  });
});
```

### Integration Tests
```typescript
// e2e tests: Parent deposits → balance recovered alert sent
// e2e tests: Large purchase attempt → denied purchase alert + limit email
// e2e tests: Multiple children → alerts per child
```

### Load Testing
- Simulate 1000 parents receiving alerts simultaneously
- Measure queue processing time
- Verify no data loss under load

---

## Deployment Strategy

### Phase 1: Development
- [ ] Implement alertingService with mock SendGrid/Twilio
- [ ] Test with local Supabase instance
- [ ] Unit tests pass (>80% coverage)

### Phase 2: Staging
- [ ] Connect to staging SendGrid account
- [ ] Connect to staging Twilio account
- [ ] Load test with 100 sample alerts
- [ ] Verify email/SMS delivery

### Phase 3: Production
- [ ] Production Supabase project
- [ ] Production SendGrid/Twilio secrets
- [ ] Canary deploy: send alerts to 10% of parents first
- [ ] Monitor error rates
- [ ] Full rollout

---

## Monitoring & Observability

### Metrics to Track
- Alert delivery success rate (target: 99%)
- Email delivery latency (target: < 5 seconds)
- SMS delivery latency (target: < 10 seconds)
- Failed deliveries by channel
- Cost per alert (SendGrid: ~$0.01, Twilio: ~$0.01)

### Logging
```typescript
// Every alert action logged with:
// - alertId, parentId, studentId
// - Action taken (email sent, SMS failed, etc)
// - Timestamp
// - Reason/error if failed
// - Cost if billable
```

---

## Next Steps

1. **Review & Approval**: Confirm API contracts match requirements
2. **Create stubs**: Generate empty service functions
3. **Mock implementations**: Implement with hardcoded responses
4. **Real implementations**: Connect to Supabase queries
5. **Testing**: Unit + integration tests
6. **Documentation**: API docs for frontend developers

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Alert delivery success | 99%+ |
| Email latency (P95) | < 5 seconds |
| SMS latency (P95) | < 10 seconds |
| Service uptime | 99.9% |
| Test coverage | > 85% |
| API response time | < 100ms |

---

**Ready to implement these services in order?**

Suggested sequence:
1. AlertingService (completes MVP-2)
2. ReportingService (enables MVP-3 frontend)
3. NotificationService (infrastructure for production)
