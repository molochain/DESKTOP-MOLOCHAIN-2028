# Dashboard Access Control Test Checklist

## Overview
This document provides a comprehensive checklist for testing the dashboard access control and permissions system in the MoloChain platform.

## Test Environment Setup
- [ ] Ensure test database is configured
- [ ] Test users created for each role
- [ ] API server running on port 5000
- [ ] Frontend development server running
- [ ] Test data seeded in database

## 1. Authentication & Authorization Tests

### 1.1 Unauthenticated User Handling
- [ ] Accessing `/dashboard` redirects to `/auth/login`
- [ ] Accessing `/dashboard/admin` redirects to `/auth/login`
- [ ] Accessing `/dashboard/user` redirects to `/auth/login`
- [ ] API calls to `/api/dashboards/*` return 401 without authentication
- [ ] No dashboard data is accessible without login

### 1.2 Authentication Flow
- [ ] Login with valid credentials succeeds
- [ ] Login sets authentication cookie/token
- [ ] Invalid credentials show error message
- [ ] Logout clears authentication and redirects to login

## 2. Role-Based Dashboard Routing

### 2.1 User Role (Default)
- [ ] After login, user with 'user' role lands on `/dashboard/user`
- [ ] Accessing `/dashboard` redirects to `/dashboard/user`
- [ ] Cannot access `/dashboard/admin` (redirects or shows error)
- [ ] Cannot access `/dashboard/developer` (unless multi-role)

### 2.2 Admin Role
- [ ] After login, admin lands on `/dashboard/admin`
- [ ] Accessing `/dashboard` redirects to `/dashboard/admin`
- [ ] Can access all dashboard routes:
  - [ ] `/dashboard/admin`
  - [ ] `/dashboard/user`
  - [ ] `/dashboard/developer`
  - [ ] `/dashboard/company`
  - [ ] `/dashboard/department`
  - [ ] `/dashboard/manager`
  - [ ] `/dashboard/analyst`
  - [ ] `/dashboard/moderator`

### 2.3 Developer Role
- [ ] After login, developer lands on `/dashboard/developer`
- [ ] Can access `/dashboard/developer`
- [ ] Can access `/dashboard/user`
- [ ] Cannot access `/dashboard/admin`

### 2.4 Manager Role
- [ ] After login, manager lands on `/dashboard/manager`
- [ ] Can access:
  - [ ] `/dashboard/manager`
  - [ ] `/dashboard/user`
  - [ ] `/dashboard/analyst`
  - [ ] `/dashboard/moderator`

### 2.5 Company Role
- [ ] After login, company user lands on `/dashboard/company`
- [ ] Can access:
  - [ ] `/dashboard/company`
  - [ ] `/dashboard/department`
  - [ ] `/dashboard/user`

## 3. Permission Matrix Verification

### 3.1 Admin Permissions
- [ ] ✅ canViewAnalytics
- [ ] ✅ canViewUsers
- [ ] ✅ canManageContent
- [ ] ✅ canViewReports
- [ ] ✅ canAccessDeveloperTools
- [ ] ✅ canManageDepartments
- [ ] ✅ canViewFinancials
- [ ] ✅ canManageProjects
- [ ] ✅ canAccessGodLayer
- [ ] ✅ canViewSystemHealth
- [ ] ✅ canManageIntegrations

### 3.2 User Permissions
- [ ] ❌ canViewAnalytics
- [ ] ❌ canViewUsers
- [ ] ❌ canManageContent
- [ ] ❌ canViewReports
- [ ] ❌ canAccessDeveloperTools
- [ ] ❌ canManageDepartments
- [ ] ❌ canViewFinancials
- [ ] ❌ canManageProjects
- [ ] ❌ canAccessGodLayer
- [ ] ❌ canViewSystemHealth
- [ ] ❌ canManageIntegrations

### 3.3 Developer Permissions
- [ ] ✅ canViewAnalytics
- [ ] ❌ canViewUsers
- [ ] ❌ canManageContent
- [ ] ✅ canViewReports
- [ ] ✅ canAccessDeveloperTools
- [ ] ❌ canManageDepartments
- [ ] ❌ canViewFinancials
- [ ] ✅ canManageProjects
- [ ] ❌ canAccessGodLayer
- [ ] ✅ canViewSystemHealth
- [ ] ✅ canManageIntegrations

### 3.4 Manager Permissions
- [ ] ✅ canViewAnalytics
- [ ] ✅ canViewUsers
- [ ] ✅ canManageContent
- [ ] ✅ canViewReports
- [ ] ❌ canAccessDeveloperTools
- [ ] ✅ canManageDepartments
- [ ] ✅ canViewFinancials
- [ ] ✅ canManageProjects
- [ ] ❌ canAccessGodLayer
- [ ] ✅ canViewSystemHealth
- [ ] ❌ canManageIntegrations

## 4. Dashboard UI/UX Tests

### 4.1 Dashboard Layout
- [ ] Correct sidebar navigation shows based on role
- [ ] Header displays user info and role
- [ ] Breadcrumbs show correct navigation path
- [ ] Mobile responsive layout works

### 4.2 Dashboard Switching (Multi-role Users)
- [ ] Dashboard switcher component appears for multi-role users
- [ ] Can switch between available dashboards
- [ ] Switching updates URL correctly
- [ ] Dashboard data refreshes after switch
- [ ] Active dashboard is highlighted in switcher

### 4.3 Permission-based UI Elements
- [ ] Admin sees system health widgets
- [ ] Developer sees API metrics and deployment tools
- [ ] Manager sees team and project management tools
- [ ] Features are hidden/disabled based on permissions
- [ ] Error boundaries handle permission-denied scenarios

## 5. API Endpoint Tests

### 5.1 Dashboard Data Endpoints
- [ ] GET `/api/dashboards/user` returns user-specific data
- [ ] GET `/api/dashboards/admin` returns system metrics (admin only)
- [ ] GET `/api/dashboards/developer` returns dev metrics
- [ ] GET `/api/dashboards/company` returns company overview
- [ ] GET `/api/dashboards/department` returns department data
- [ ] GET `/api/dashboards/available` returns list of accessible dashboards

### 5.2 Response Structure Validation
- [ ] User dashboard includes:
  - [ ] user object
  - [ ] metrics object
  - [ ] notifications array
  - [ ] quickStats object
  - [ ] lastUpdated timestamp

- [ ] Admin dashboard includes:
  - [ ] admin object
  - [ ] systemMetrics object
  - [ ] systemHealth object
  - [ ] alerts array
  - [ ] complianceStatus object

### 5.3 Query Parameters
- [ ] `timeRange` parameter filters data correctly
- [ ] `includeDetails` parameter adds/removes detailed data
- [ ] Invalid parameters are handled gracefully

## 6. Error Handling & Edge Cases

### 6.1 Error Scenarios
- [ ] Network failure shows error message
- [ ] API 500 errors handled gracefully
- [ ] Invalid role defaults to user dashboard
- [ ] Missing permissions show appropriate message
- [ ] Session timeout redirects to login

### 6.2 Edge Cases
- [ ] User with no assigned role defaults to 'user'
- [ ] Corrupted session data handled
- [ ] Simultaneous dashboard switches prevented
- [ ] Race conditions in data fetching handled
- [ ] Browser back/forward navigation works correctly

## 7. Performance Tests

### 7.1 Loading Performance
- [ ] Dashboard loads within 2 seconds
- [ ] Lazy loading for heavy components
- [ ] Data caching reduces API calls
- [ ] Pagination for large data sets

### 7.2 Rate Limiting
- [ ] API rate limiting prevents abuse
- [ ] User notified when rate limited
- [ ] Rate limit resets appropriately

## 8. Security Tests

### 8.1 Access Control
- [ ] Cannot access other users' dashboard data
- [ ] Cannot bypass role checks via URL manipulation
- [ ] API validates permissions server-side
- [ ] Sensitive data filtered based on role

### 8.2 Session Management
- [ ] Session expires after inactivity
- [ ] Multiple login sessions handled
- [ ] CSRF protection active
- [ ] XSS prevention in dashboard content

## 9. Integration Tests

### 9.1 Navigation Flow
- [ ] Main nav → Dashboard → Correct role dashboard
- [ ] `/admin` route redirects to `/dashboard`
- [ ] Deep links to dashboard sections work
- [ ] Browser history navigation works

### 9.2 Data Consistency
- [ ] Dashboard data matches database state
- [ ] Real-time updates reflect correctly
- [ ] Cached data invalidates appropriately
- [ ] Cross-dashboard data consistency

## 10. Accessibility Tests

### 10.1 Screen Reader Support
- [ ] Role information announced correctly
- [ ] Dashboard sections have proper ARIA labels
- [ ] Navigation is keyboard accessible
- [ ] Focus management on dashboard switch

### 10.2 Visual Accessibility
- [ ] Color contrast meets WCAG standards
- [ ] Text is readable at different zoom levels
- [ ] Icons have text alternatives
- [ ] Error messages are clear and actionable

## Test Execution Commands

### Run Frontend Tests
```bash
npm test client/src/tests/dashboard-access.test.ts
```

### Run API Tests
```bash
node scripts/test-dashboard-api.js
```

### Manual Testing
1. Login with test users for each role
2. Navigate through dashboard routes
3. Verify permissions and features
4. Test dashboard switching
5. Check error scenarios

## Test User Credentials

| Role      | Username    | Password      | Expected Dashboard |
|-----------|-------------|---------------|-------------------|
| Admin     | admin       | admin123      | /dashboard/admin  |
| User      | testuser    | testpass123   | /dashboard/user   |
| Developer | devuser     | devpass123    | /dashboard/developer |
| Manager   | manager     | manager123    | /dashboard/manager |
| Company   | companyuser | company123    | /dashboard/company |

## Test Results Tracking

| Test Category | Pass | Fail | Pending | Notes |
|--------------|------|------|---------|-------|
| Authentication | | | | |
| Role Routing | | | | |
| Permissions | | | | |
| UI/UX | | | | |
| API Endpoints | | | | |
| Error Handling | | | | |
| Performance | | | | |
| Security | | | | |
| Integration | | | | |
| Accessibility | | | | |

## Known Issues & Limitations

1. **Mock Data**: Some dashboards return mock data when endpoints are not implemented
2. **Rate Limiting**: Currently uses memory-based rate limiting (resets on server restart)
3. **Session Management**: Sessions persist in memory, not distributed
4. **Real-time Updates**: WebSocket connections may need reconnection after dashboard switch

## Recommendations

1. **Implement Missing Endpoints**: Complete all dashboard API endpoints
2. **Add E2E Tests**: Use Cypress or Playwright for full integration testing
3. **Performance Monitoring**: Add metrics collection for dashboard load times
4. **Audit Logging**: Log all dashboard access for security compliance
5. **Progressive Enhancement**: Add offline support for dashboard data

## Conclusion

This checklist ensures comprehensive testing of the dashboard access control system. Regular testing using this checklist helps maintain security, performance, and user experience standards.

Last Updated: September 11, 2025