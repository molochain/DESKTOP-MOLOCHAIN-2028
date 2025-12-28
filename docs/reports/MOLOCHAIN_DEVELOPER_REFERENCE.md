# MoloChain - Developer Quick Reference Guide

## 🚀 Quick Start

### Running the Application
```bash
npm run dev                    # Start development server
npm run dev:memory-optimized   # Start with memory optimization
npm run build                  # Build for production
npm run db:push                # Push database schema changes
npm run db:push --force        # Force push schema (data loss warning)
```

### Default Ports
- Frontend & Backend: `5000` (unified)
- PostgreSQL: Environment variable `DATABASE_URL`
- WebSocket: Same as main server (5000)

## 📁 Key File Locations

### Configuration Files
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite configuration (DO NOT MODIFY)
- `drizzle.config.ts` - Database configuration (DO NOT MODIFY)
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

### Core Application Files
- `server/index.ts` - Server entry point
- `server/routes.ts` - Main route registration
- `client/src/App.tsx` - React app entry
- `client/src/main.tsx` - Client entry point
- `shared/schema.ts` - Database schema definitions

## 🏗️ Architecture Patterns

### Adding a New Feature Module

1. **Create Module Structure**
```
modules/your-module/
├── module.json         # Module metadata
├── index.ts           # Module exports
├── services/          # Business logic
├── components/        # React components
├── hooks/            # React hooks
├── types/            # TypeScript types
└── utils/            # Helper functions
```

2. **Register in Module Index**
```json
// modules/module-index.json
{
  "moduleId": "your-module",
  "name": "Your Module Name",
  "category": "appropriate-category",
  "services": ["service1", "service2"],
  "priority": "high",
  "status": "active"
}
```

3. **Add Routes**
```typescript
// server/routes/your-module.ts
import { Router } from 'express';
const router = Router();

router.get('/api/your-module', async (req, res) => {
  // Implementation
});

export default router;
```

4. **Create React Pages**
```tsx
// client/src/pages/YourModule.tsx
export default function YourModule() {
  return <div>Your Module UI</div>;
}
```

## 🗄️ Database Operations

### Adding New Tables
```typescript
// shared/schema.ts
export const yourTable = pgTable("your_table", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  nameIdx: index("your_table_name_idx").on(table.name),
}));

// Create insert schema
export const insertYourTableSchema = createInsertSchema(yourTable);
export type InsertYourTable = z.infer<typeof insertYourTableSchema>;
export type SelectYourTable = typeof yourTable.$inferSelect;
```

### Push Schema Changes
```bash
npm run db:push          # Normal push
npm run db:push --force  # Force push (may cause data loss)
```

## 🔌 API Patterns

### RESTful Endpoint Structure
```typescript
// GET - List/Read
app.get('/api/resource', cacheMiddleware(300), async (req, res) => {
  const data = await db.select().from(table);
  res.json(data);
});

// POST - Create
app.post('/api/resource', validateRequest(schema), async (req, res) => {
  const result = await db.insert(table).values(req.body);
  res.json(result);
});

// PUT/PATCH - Update
app.patch('/api/resource/:id', isAuthenticated, async (req, res) => {
  const result = await db.update(table)
    .set(req.body)
    .where(eq(table.id, req.params.id));
  res.json(result);
});

// DELETE - Remove
app.delete('/api/resource/:id', isAdmin, async (req, res) => {
  await db.delete(table).where(eq(table.id, req.params.id));
  res.sendStatus(204);
});
```

### Authentication Middleware
```typescript
import { isAuthenticated, isAdmin } from './core/auth/auth.service';

// Protected route
app.get('/api/protected', isAuthenticated, handler);

// Admin only
app.get('/api/admin', isAdmin, handler);
```

## ⚛️ React Patterns

### Using React Query
```tsx
// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ['/api/resource'],
  // No queryFn needed - default fetcher configured
});

// Mutation
const mutation = useMutation({
  mutationFn: (data) => apiRequest('/api/resource', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/resource'] });
  },
});
```

### Form Handling
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { /* ... */ },
});
```

## 🔐 Security Best Practices

### Environment Variables
```bash
# Required secrets (use ask_secrets tool)
OPENAI_API_KEY
STRIPE_SECRET_KEY
INSTAGRAM_CLIENT_ID
INSTAGRAM_CLIENT_SECRET

# Always present (don't ask for these)
DATABASE_URL
NODE_ENV
REPLIT_DOMAINS
```

### Input Validation
```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  amount: z.number().positive(),
});

// Use with validateRequest middleware
app.post('/api/endpoint', validateRequest(schema), handler);
```

## 🚨 Common Issues & Solutions

### Issue: Database Connection Timeout
**Solution**: Use cached services instead of direct DB queries
```typescript
// Bad
app.use('/api', servicesEnhancedRoutes); // May timeout

// Good
app.use('/api', cachedServicesRoutes); // Uses cache
```

### Issue: WebSocket Connection Issues
**Solution**: Check UnifiedWebSocketManager
```typescript
// All WebSocket services handled by:
server/websocket/UnifiedWebSocketManager.ts
```

### Issue: Frontend Not Updating
**Solution**: 
1. Restart workflow
2. Check console logs
3. Verify server is running
4. Clear cache if needed

### Issue: Module Not Loading
**Solution**: Check registration in:
1. `modules/module-index.json`
2. `client/src/routes/routeConfig.ts`
3. `server/routes.ts`

## 📊 Performance Optimization

### Caching Strategy
```typescript
// Cache TTL constants
const CACHE_TTL = {
  SHORT: 60,        // 1 minute
  MEDIUM: 5 * 60,   // 5 minutes
  LONG: 30 * 60,    // 30 minutes
  VERY_LONG: 24 * 60 * 60 // 1 day
};

// Apply caching
app.get('/api/data', cacheMiddleware(CACHE_TTL.MEDIUM), handler);
```

### Lazy Loading Pages
```typescript
// Always use lazy loading for pages
const MyPage = lazy(() => import('@/pages/MyPage'));
```

## 🧪 Testing Patterns

### API Testing
```bash
# Use the built-in artillery for load testing
npm run test:load
```

### Component Testing
```tsx
// Located in client/src/tests/
import { render, screen } from '@testing-library/react';
```

## 📝 Important Notes

### DO NOT MODIFY
- `server/vite.ts` - Vite server configuration
- `vite.config.ts` - Vite build configuration
- `package.json` scripts - Without asking
- `drizzle.config.ts` - Database configuration

### ALWAYS DO
- Use `npm run db:push` for schema changes
- Test changes with `npm run dev`
- Keep data models in `shared/schema.ts`
- Use proper TypeScript types
- Implement proper error handling
- Add `data-testid` attributes for testing

### File Naming Conventions
- React components: `PascalCase.tsx`
- API routes: `kebab-case.ts`
- Utilities: `camelCase.ts`
- Database tables: `snake_case`

## 🔗 Useful Links

### Internal Documentation
- `/developer` - Developer portal
- `/developer/websocket-guide` - WebSocket guide
- `/developer/auth-guide` - Authentication guide
- `/developer/sdk` - SDK libraries
- `/developer/policies` - API policies

### API Documentation
- `/api-docs` - Swagger UI
- `/api/health` - Health check
- `/api/metrics` - Performance metrics

## 🆘 Getting Help

### In-App Resources
1. Developer Portal: `/developer`
2. Database Schema Explorer: `/database-schema`
3. API Documentation: `/api-docs`
4. Health Recommendations: `/health-recommendations`

### Check Logs
```bash
# View server logs
npm run dev

# Check browser console
F12 → Console tab

# Database issues
Check PostgreSQL logs in Neon dashboard
```

### Common Commands
```bash
# Install dependencies
npm install

# Install specific package
npm install package-name

# Check TypeScript errors
npm run check

# Build for production
npm run build

# Start production server
npm start
```

## 🎯 Development Workflow

1. **Plan** - Review requirements and existing code
2. **Search** - Use grep/glob to find related files
3. **Read** - Understand existing patterns
4. **Implement** - Follow established patterns
5. **Test** - Run dev server and verify
6. **Commit** - Changes auto-committed by system

Remember: The platform is production-ready. No mock data, no placeholders. Always implement real functionality.