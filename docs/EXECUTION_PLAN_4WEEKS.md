# Execution Plan & Timeline: Supabase + MVP-3 Rollout

**Status**: 📋 Ready for Implementation
**Total Duration**: 4 weeks
**Start Date**: January 9, 2026
**End Date**: February 6, 2026

---

## Executive Summary

**4-Week Sprint** to achieve production-ready MeCard platform:

```
WEEK 1: Supabase Schema & Initial Load ✓ (Critical Path)
WEEK 2: Backend Services (Alerting + Reporting) ✓
WEEK 3: MVP-3 Frontend (ParentReports + SchoolAdminDashboard) ✓
WEEK 4: Testing, Optimization, Production Readiness ✓
```

---

## WEEK 1: Supabase Foundation

**Goal**: Database schema in place, mock data loaded, fallback logic working

### Days 1-2: Schema Creation & Verification

**Task 1.1**: Create Supabase migrations file
- Create `migrations/001_initial_schema.sql`
- All 13 tables from SUPABASE_SCHEMA_PLAN.md
- All indexes and constraints
- RLS policies for parent/student/admin isolation
- **Effort**: 4 hours
- **Owner**: Backend Lead
- **Deliverable**: `.sql` file, ready to run

**Task 1.2**: Test migrations locally
- Spin up local Supabase (Docker)
- Run migration script
- Verify all tables created
- Verify relationships/FKs
- **Effort**: 2 hours
- **Verification**: `SELECT count(*) FROM information_schema.tables WHERE table_schema='public'` should return 13

**Task 1.3**: Create seed data script
- Load MOCK_SCHOOLS → schools table (5 records)
- Load MOCK_UNITS → operating_units table (4 records)
- Load MOCK_STUDENTS_LIST → students table (30 records)
- Create test users → users table (10 records)
- **Effort**: 3 hours
- **Deliverable**: `scripts/seed.ts` (can be run repeatedly)

### Days 3-4: Data Validation & Backup

**Task 1.4**: Validate seed data
- Query each table
- Verify relationships work (JOIN tests)
- Check constraints (e.g., non-negative balances)
- **Effort**: 2 hours

**Task 1.5**: Create rollback plan
- Document migration rollback procedure
- Create backup of production-like data
- Test rollback on staging
- **Effort**: 1 hour

**Task 1.6**: Document schema for frontend
- Generate schema diagram (Supabase dashboard → screenshots)
- Document table relationships
- Create ER diagram
- Add to docs/
- **Effort**: 2 hours

### Days 5: Integration Testing

**Task 1.7**: Update services to use Supabase (Phase 1)
- Update `financialService.ts` to use supabase queries
- Create `supabaseFinancialService.ts` wrapper
- Keep mock fallback for offline testing
- **Effort**: 4 hours
- **Testing**: Unit tests for getStudentWallet, updateBalance

**Deliverables Day 5**:
- ✅ All 13 tables created in staging Supabase
- ✅ Schema diagram documented
- ✅ 50+ seed records loaded and validated
- ✅ financialService.ts updated to query Supabase
- ✅ Rollback plan documented

**Risk Items**:
- Foreign key constraint failures during data load → fix seed script
- Supabase connection timeout → add retry logic with exponential backoff
- Mock data in constants.ts conflicts → use conditional imports

**Milestones**:
- `2025-01-13`: Schema complete and tested
- `2025-01-14`: All seeds loaded successfully

---

## WEEK 2: Backend Services

**Goal**: Notification & Reporting services ready for MVP-3 frontend

### Days 1-2: AlertingService (MVP-2 Completion)

**Task 2.1**: Create AlertingService stubs
- File: `services/alertingService.ts`
- Functions: sendLowBalanceAlert, sendLargePurchaseAlert, sendDeniedPurchaseAlert
- Returns mock responses (200ms delay)
- **Effort**: 2 hours

**Task 2.2**: Implement with Supabase queries
- Query alert_configs table for parent's settings
- Create alert_logs records
- Implement retry logic
- **Effort**: 3 hours

**Task 2.3**: Add notification channel stubs
- Create `services/notificationService.ts`
- Stubs for sendEmail, sendSMS, createInAppNotification
- Mock SendGrid/Twilio calls (log to console)
- **Effort**: 2 hours

**Task 2.4**: Unit tests for AlertingService
- Test low balance alert triggering
- Test disabled alert skipping
- Test multiple channels
- Target: 85%+ coverage
- **Effort**: 3 hours

### Days 3-4: ReportingService (MVP-3 Backend)

**Task 2.5**: Create ReportingService stubs
- File: `services/reportingService.ts`
- Functions: getParentSpendingReport, getSchoolAdminDashboard
- Returns structured mock data matching API spec
- **Effort**: 2 hours

**Task 2.6**: Implement getParentSpendingReport
- Query transactions table (with date filters)
- Aggregate by category, by child, daily trend
- Calculate change vs previous period
- Implement caching (1 hour TTL)
- **Effort**: 4 hours

**Task 2.7**: Implement getSchoolAdminDashboard
- Query transactions, students, units
- Aggregate KPIs (revenue, transactions, students)
- Calculate hourly distribution
- Unit performance metrics
- **Effort**: 5 hours

**Task 2.8**: Unit tests for ReportingService
- Test parent spending report aggregation
- Test school admin KPI calculation
- Test caching behavior
- Target: 80%+ coverage
- **Effort**: 3 hours

### Day 5: Integration & Documentation

**Task 2.9**: Integration testing
- Test alertingService → alert_logs creation
- Test reportingService → correct aggregations
- Test error handling (Supabase down, fallback to mocks)
- **Effort**: 2 hours

**Task 2.10**: API documentation
- Document all service endpoints
- Example request/response for each function
- Error codes and handling
- Update docs/BACKEND_SERVICES_API_DESIGN.md with impl notes
- **Effort**: 2 hours

**Deliverables Day 10**:
- ✅ AlertingService fully functional (with Supabase)
- ✅ ReportingService fully functional (with caching)
- ✅ Unit tests > 80% coverage
- ✅ Services integrated with App.tsx (no UI changes yet)
- ✅ All services have error handling & fallback logic

**Risk Items**:
- Complex aggregation queries slow → optimize with indexes + materialized views
- Caching issues (stale data) → implement cache invalidation on new transactions
- SendGrid/Twilio not available during testing → use mock mode with environment variable

**Milestones**:
- `2025-01-17`: AlertingService complete
- `2025-01-20`: ReportingService complete

---

## WEEK 3: MVP-3 Frontend Implementation

**Goal**: ParentReportsView & SchoolAdminDashboardEnhanced fully functional

### Days 1-2: ParentReportsView

**Task 3.1**: Create component structure
- File: `components/ParentReportsView.tsx`
- Hook up reportingService.getParentSpendingReport()
- Create data aggregation logic (useMemo)
- **Effort**: 2 hours

**Task 3.2**: Build summary cards
- Total spent, transaction count, average, trends
- Visual styling with Tailwind
- Display formatting ($, percentages)
- **Effort**: 2 hours

**Task 3.3**: Build chart components
- Recharts LineChart for spending trend
- Recharts PieChart for category breakdown
- Period selector and comparison toggle
- **Effort**: 3 hours

**Task 3.4**: Add AI suggestions (optional)
- Integrate with existing geminiService
- Call Gemini API with parent spending data
- Display suggestions in card format
- **Effort**: 2 hours

**Task 3.5**: Test ParentReportsView
- Verify data loading
- Test filters and period selection
- Test chart rendering with different data
- Performance test (should render in < 1 second)
- **Effort**: 2 hours

### Days 3-4: SchoolAdminDashboardEnhanced

**Task 3.6**: Create component structure
- File: `components/SchoolAdminDashboardEnhanced.tsx`
- Hook up reportingService.getSchoolAdminDashboard()
- Create KPI calculation logic
- **Effort**: 2 hours

**Task 3.7**: Build KPI cards
- 10 metric cards: students, revenue, transactions, etc
- Sparklines for trends (use Recharts mini charts)
- Traffic light indicators (green/yellow/red)
- **Effort**: 3 hours

**Task 3.8**: Build unit performance table
- Sortable table of unit/cafeteria metrics
- Revenue, transaction count, top product per unit
- Inline sparkline per unit
- **Effort**: 2 hours

**Task 3.9**: Build analysis charts
- Recharts BarChart for top products
- LineChart for hourly transaction distribution
- PieChart for transaction type breakdown (cafeteria/marketplace/etc)
- **Effort**: 3 hours

**Task 3.10**: Add alerts & warnings section
- Display system alerts (low inventory, high refunds, etc)
- Color-coded severity (critical/warning/info)
- Recommended actions
- **Effort**: 1 hour

**Task 3.11**: Test SchoolAdminDashboardEnhanced
- Verify all KPIs calculate correctly
- Test chart rendering
- Performance test (heavy data load)
- Test on mobile/tablet
- **Effort**: 2 hours

### Day 5: MVP-3 Integration

**Task 3.12**: Update App.tsx routing
- Add PARENT_REPORTS view case
- Add SCHOOL_ADMIN_ENHANCED view case
- Wire up props (reportingService, children, etc)
- **Effort**: 1 hour

**Task 3.13**: Update Sidebar.tsx navigation
- Add "Mis Reportes" nav item (ParentReportsView)
- Add "Dashboard Mejorado" nav item (SchoolAdminDashboardEnhanced)
- Add appropriate icons
- **Effort**: 1 hour

**Task 3.14**: Build README for new views
- Document features of each view
- Usage examples with screenshots
- Known limitations
- **Effort**: 1 hour

**Task 3.15**: Smoke tests on full app
- Start dev server
- Navigate through all views
- Verify no console errors
- Verify responsive design
- **Effort**: 1 hour

**Deliverables Day 15**:
- ✅ ParentReportsView fully functional with Recharts
- ✅ SchoolAdminDashboardEnhanced with KPIs and charts
- ✅ Both integrated into App.tsx and Sidebar.tsx
- ✅ Navigation working correctly
- ✅ All views responsive (mobile, tablet, desktop)

**Risk Items**:
- Recharts rendering performance on large datasets → lazy load charts, use virtualization
- Gemini API latency → cache suggestions for 24 hours
- Heavy data aggregation queries slow → implement pagination + lazy loading

**Milestones**:
- `2025-01-22`: ParentReportsView complete
- `2025-01-24`: SchoolAdminDashboardEnhanced complete

---

## WEEK 4: Testing, Optimization & Production Readiness

### Days 1-2: Quality Assurance

**Task 4.1**: Comprehensive functional testing
- Test every user flow end-to-end
- Test on multiple browsers (Chrome, Safari, Firefox)
- Test on mobile devices (iOS, Android)
- **Effort**: 4 hours

**Task 4.2**: Performance testing & optimization
- Run Lighthouse on all pages
- Target: 90+ performance score
- Optimize images, code splitting, lazy loading
- **Effort**: 3 hours

**Task 4.3**: Security testing
- Check for XSS vulnerabilities
- Verify RLS policies on Supabase
- Check for SQL injection opportunities
- Test unauthenticated access (should be denied)
- **Effort**: 2 hours

**Task 4.4**: Load testing
- Simulate 100 concurrent users
- Verify system doesn't crash
- Measure response times under load
- **Effort**: 2 hours

### Days 3-4: Documentation & Deployment Prep

**Task 4.5**: Complete API documentation
- Swagger/OpenAPI specs for all services
- Example cURL calls for each endpoint
- Error response codes and meanings
- **Effort**: 2 hours

**Task 4.6**: Create runbook for operations
- How to run migrations
- How to restore from backup
- Common issues and fixes
- Performance tuning guidelines
- **Effort**: 2 hours

**Task 4.7**: Create deployment checklist
- Pre-deployment validation
- Staging environment testing
- Production deployment steps
- Rollback procedure
- Post-deployment monitoring
- **Effort**: 1 hour

**Task 4.8**: Update README.md
- Add architecture diagram
- Add quick start guide for new developers
- Document new services and views
- **Effort**: 1 hour

### Day 5: Final Verification & Go-Live Prep

**Task 4.9**: Staging environment verification
- Deploy entire application to staging Supabase
- Run full test suite
- Verify all integrations
- **Effort**: 2 hours

**Task 4.10**: UAT (User Acceptance Testing)
- Have school admin test SchoolAdminDashboardEnhanced
- Have parent test ParentReportsView
- Collect feedback
- Fix critical issues
- **Effort**: 3 hours

**Task 4.11**: Production deployment planning
- Schedule deployment window (low-traffic time)
- Brief all stakeholders
- Have rollback plan ready
- Set up monitoring alerts
- **Effort**: 1 hour

**Task 4.12**: Create post-launch support plan
- Response time SLAs
- Escalation procedures
- Bug fix prioritization
- **Effort**: 1 hour

**Deliverables Day 20**:
- ✅ All tests passing (functional, performance, security, load)
- ✅ Staging environment 100% functional
- ✅ All documentation complete
- ✅ Runbook and deployment checklist ready
- ✅ Team trained and ready for production

---

## Resource Requirements

### Team Composition
| Role | Hours/Week | Tasks |
|------|-----------|-------|
| Backend Lead | 30h | Schema, migrations, services, testing |
| Frontend Lead | 25h | MVP-3 components, integration, styling |
| QA Engineer | 20h | Testing, performance optimization, UAT |
| DevOps | 10h | Supabase setup, deployment, monitoring |
| **Total** | **85 hours** | Full 4-week sprint |

### Infrastructure Costs
- Supabase project: ~$50/month (Pro tier)
- SendGrid: ~$50/month (5000 emails/month)
- Twilio: ~$20/month (SMS volume)
- Vercel (hosting): ~$20/month
- **Total**: ~$140/month operating costs

---

## Success Metrics

### Functional
- ✅ 100% of features from user story implemented
- ✅ 0 critical bugs in production
- ✅ All API endpoints responding < 100ms (P95)

### Performance
- ✅ Lighthouse score > 90
- ✅ Mobile performance > 85
- ✅ Database queries < 50ms (P95)

### Reliability
- ✅ 99.9% uptime
- ✅ 99% alert delivery success rate
- ✅ 0 data loss incidents

### User Satisfaction
- ✅ Parent survey: 4.5+/5 stars
- ✅ Admin survey: 4.5+/5 stars
- ✅ 0 critical support tickets

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Supabase schema issues | Medium | High | Early validation + testing in staging |
| Performance under load | Medium | High | Load testing + optimization during Week 4 |
| Gemini API rate limits | Low | Medium | Caching + fallback to generic suggestions |
| Team availability | Low | High | Cross-training + documentation |
| Data migration bugs | Low | High | Automated validation + rollback plan |

---

## Weekly Standup Agenda

### Every Monday 9 AM
- Previous week summary (deliverables, blockers)
- Current week plan (tasks, dependencies)
- Risk assessment and escalations
- Resource needs
- **Duration**: 30 minutes

### Daily 4 PM Check-in
- Quick status (on track / off track)
- Blockers needing resolution
- Tomorrow's focus
- **Duration**: 10 minutes

---

## Commit Strategy

**Weekly commits** to staging branch:
- Week 1: `feat: implement Supabase schema with 13 tables and seed data`
- Week 2: `feat: implement AlertingService and ReportingService with full test coverage`
- Week 3: `feat: implement MVP-3 screens (ParentReportsView, SchoolAdminDashboardEnhanced)`
- Week 4: `chore: add documentation, optimize performance, prepare for production`

**PR Requirements**:
- All tests passing
- 80%+ code coverage
- Owner (@frcb79) approval required
- No merge conflicts

---

## Go-Live Plan (Feb 6, 2025)

### Pre-Launch (Feb 5)
- ✅ Final staging verification
- ✅ Database backups created
- ✅ Monitoring dashboards configured
- ✅ Team briefing (communication plan)

### Launch Window (Feb 6, 2 AM - 4 AM, off-peak)
- ✅ Run database migrations
- ✅ Deploy application to production
- ✅ Run smoke tests
- ✅ Monitor error rates (target: < 0.1%)
- ✅ Notify stakeholders

### Post-Launch (Feb 6 onwards)
- ✅ 24-hour critical support coverage
- ✅ Daily performance reviews
- ✅ Weekly retrospective with team
- ✅ Bug fix prioritization (critical first, rest in backlog)

---

## Definition of Done (DoD)

For each task to be considered "complete":
1. ✅ Code written and committed to staging
2. ✅ Unit tests written (target: 80%+ coverage)
3. ✅ Code review completed (owner approval)
4. ✅ Integration tests passing
5. ✅ No console errors or warnings
6. ✅ Documentation updated
7. ✅ Performance acceptable (< 100ms API response)
8. ✅ Mobile responsive (tested on device or browser DevTools)

---

## Questions & Decisions Needed

Before starting Week 1:

1. **Supabase Project**: Should we use staging.supabase.co or prod.supabase.co?
   - **Recommendation**: Separate projects (staging_mecard, prod_mecard)
   - **Decision**: ________ (Your call)

2. **Email Provider**: SendGrid or alternatives (Mailgun, AWS SES)?
   - **Recommendation**: SendGrid (has good Mexico region support)
   - **Decision**: ________ (Your call)

3. **SMS Provider**: Twilio or alternatives (Vonage, MessageBird)?
   - **Recommendation**: Twilio (easy integration)
   - **Decision**: ________ (Your call)

4. **Data Retention**: How long to keep transaction logs?
   - **Recommendation**: 5 years (regulatory requirement for schools)
   - **Decision**: ________ (Your call)

5. **Notification Frequency**: Limit parent to 1 alert per minute?
   - **Recommendation**: Yes (prevent alert fatigue)
   - **Decision**: ________ (Your call)

---

## Next Actions

**Immediately**:
1. Review and approve this timeline
2. Allocate team resources
3. Set up Supabase project (staging)
4. Configure email/SMS providers

**Week 1 Start**:
1. Create migration file
2. Run schema setup
3. Load seed data
4. Begin schema documentation

---

**Ready to start?** ✅ Week 1 begins January 9, 2026.
