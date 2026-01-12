# Deployment Guide - MeCard Platform

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Docker (optional, for local Supabase)

---

## Local Development Setup

### 1. Environment Variables

Create `.env.local` in root:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_KEY=your-service-key

# Auth (optional)
VITE_AUTH_CALLBACK_URL=http://localhost:5173/auth/callback

# API (if using backend)
VITE_API_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase Locally (Optional)

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Run migrations
supabase migration up

# View URL and keys
supabase status
```

### 4. Run Development Server

```bash
npm run dev
```

Access at `http://localhost:5173`

---

## Database Setup

### 1. Run Migrations

```bash
# Via Supabase dashboard:
# 1. Go to SQL Editor
# 2. Create new query
# 3. Paste content of:
#    - supabase/migrations/001_initial_schema.sql
#    - supabase/migrations/002_add_limits_alerts_tables.sql

# Or via CLI:
supabase migration up
```

### 2. Seed Test Data

Create `supabase/seeds/seed.sql`:

```sql
-- Seed schools
INSERT INTO public.schools (name) VALUES ('Test School');

-- Seed operating units
INSERT INTO public.operating_units (school_id, name, unit_type)
SELECT id, 'Cafetería', 'CAFETERIA' FROM public.schools LIMIT 1;

-- Seed products
INSERT INTO public.products (school_id, name, price, category, operating_unit_id)
SELECT s.id, 'Pizza', 5.00, 'food', ou.id 
FROM public.schools s, public.operating_units ou LIMIT 1;
```

Load with:
```bash
supabase db push --dir supabase/seeds
```

---

## Testing

### Run Tests

```bash
# Unit tests
npm run test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Services

```bash
# Test Financial Service
npm run test -- financialService

# Test specific suite
npm run test -- services.test
```

---

## Production Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Link Supabase project
```

### Option 2: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
```

Build and run:
```bash
docker build -t mecard:latest .
docker run -p 3000:3000 mecard:latest
```

### Option 3: Self-Hosted

```bash
# Build
npm run build

# Upload dist/ to server
# Setup reverse proxy (nginx/apache)
# Serve with: python -m http.server 8000
```

---

## Performance Optimization

### 1. Database

```sql
-- Create indexes (already done in migrations)
-- Monitor slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### 2. Frontend

```bash
# Build analysis
npm run build -- --analyze

# Check bundle size
npm run build

# Output in dist/
```

### 3. Caching

```typescript
// Service caching example
const cache = new Map();

async function getCachedBalance(studentId, schoolId) {
  const key = `balance_${studentId}_${schoolId}`;
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const balance = await financialService.getStudentBalance(studentId, schoolId);
  cache.set(key, balance);
  
  // Clear after 5 minutes
  setTimeout(() => cache.delete(key), 5 * 60 * 1000);
  
  return balance;
}
```

---

## Monitoring & Logging

### Supabase Monitoring

```bash
# View real-time logs
supabase functions logs

# View database logs
supabase start --no-seed

# In dashboard: Database -> Logs
```

### Application Logging

```typescript
// Use consistent logging
import { logger } from './utils/logger';

logger.info('User logged in', { userId, timestamp: new Date() });
logger.error('Payment failed', { error, studentId });
```

---

## Security Checklist

- [x] Enable RLS on all tables
- [x] Validate input server-side
- [x] Use environment variables for secrets
- [x] Implement rate limiting
- [x] Setup CORS properly
- [x] Enable HTTPS in production
- [x] Regular security audits
- [x] Backup database regularly

---

## Troubleshooting

### RLS Issues

```sql
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Test RLS policy
EXPLAIN (ANALYZE) 
SELECT * FROM students 
WHERE school_id = get_current_user_school_id();
```

### Connection Issues

```bash
# Test Supabase connection
npm run test -- connection

# Check environment variables
node -e "console.log(process.env.VITE_SUPABASE_URL)"
```

### Performance Issues

```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM transactions 
WHERE school_id = 1 AND student_id = 100;

-- Add missing indexes
CREATE INDEX idx_txn_school_student 
ON transactions(school_id, student_id);
```

---

## Maintenance

### Regular Tasks

- [ ] Monitor error rates
- [ ] Check database size
- [ ] Review slow queries
- [ ] Update dependencies
- [ ] Backup sensitive data
- [ ] Review RLS policies

### Monthly

- [ ] Run performance audit
- [ ] Update security patches
- [ ] Analyze usage trends
- [ ] Clean up old logs

---

## Support

For issues:
1. Check logs: `supabase logs`
2. Review RLS policies
3. Test with sample data
4. Check browser console
5. Contact Supabase support

---

**Last Updated**: January 9, 2026
**Version**: 1.0.0
