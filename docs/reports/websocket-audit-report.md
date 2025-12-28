# WebSocket Layer Security Audit Report

**Date:** December 15, 2025  
**Scope:** server/core/websocket/*  
**Status:** Complete

---

## Executive Summary

This audit reviewed the WebSocket layer of the Molochain Platform, including connection handling, authentication, namespace handlers, cleanup procedures, memory management, and monitoring. The review identified **25 findings** across various severity levels.

| Severity | Count |
|----------|-------|
| Critical | 1     |
| High     | 7     |
| Medium   | 11    |
| Low      | 6     |

---

## CRITICAL FINDINGS

### 1. Hardcoded JWT Secret Fallback

**File:** `server/core/websocket/security/ws-auth.ts` (Line 34)  
**Severity:** CRITICAL  
**Category:** Security Vulnerability

**Description:**  
The WebSocket authenticator uses a hardcoded fallback JWT secret when `JWT_SECRET` environment variable is not set:

```typescript
this.jwtSecret = process.env.JWT_SECRET || 'molochain-websocket-secret-2025';
```

**Risk:** If the environment variable is not properly configured, all JWT tokens would be validated against a publicly known secret, allowing attackers to forge authentication tokens.

**Recommendation:**  
- Remove the fallback secret
- Fail startup if JWT_SECRET is not configured
- Log an error and exit process if secret is missing

---

## HIGH SEVERITY FINDINGS

### 2. Token Exposure via URL Query Parameters

**File:** `server/core/websocket/security/ws-auth.ts` (Lines 139-141)  
**Severity:** HIGH  
**Category:** Security Vulnerability

**Description:**  
Authentication tokens can be passed via URL query parameters:

```typescript
if (parsedUrl.query?.token) {
  return parsedUrl.query.token as string;
}
```

**Risk:** Query parameters are logged in server access logs, browser history, and proxy logs, exposing sensitive authentication tokens.

**Recommendation:**  
- Deprecate query parameter token extraction
- Use only Authorization header or secure cookies
- Add warning log when query token is used

---

### 3. Memory Leak - Tracking Subscriptions

**File:** `server/core/websocket/handlers/tracking.handlers.ts` (Lines 5, 14-20)  
**Severity:** HIGH  
**Category:** Memory Leak

**Description:**  
The `trackingSubscriptions` Map stores WebSocket references but has no cleanup when connections close:

```typescript
const trackingSubscriptions = new Map<string, Set<any>>();
// No 'close' event handler to clean up
```

**Risk:** WebSocket references accumulate indefinitely, causing memory exhaustion over time.

**Recommendation:**  
- Add 'close' event handler to remove subscriptions
- Implement periodic cleanup for stale entries
- Track subscription count metrics

---

### 4. Memory Leak - Notification User Connections

**File:** `server/core/websocket/handlers/notification.handlers.ts` (Line 5)  
**Severity:** HIGH  
**Category:** Memory Leak

**Description:**  
The `userConnections` Map is never cleaned when users disconnect:

```typescript
const userConnections = new Map<string, any>();
// Line 15: userConnections.set(userId, ws);
// No cleanup on disconnect
```

**Risk:** User connection references accumulate, preventing garbage collection.

**Recommendation:**  
- Register 'close' handler to delete user from Map
- Add periodic cleanup for stale connections

---

### 5. Memory Leak - Project Subscriptions

**File:** `server/core/websocket/handlers/project.handlers.ts` (Lines 5, 14-20)  
**Severity:** HIGH  
**Category:** Memory Leak

**Description:**  
Same issue as tracking subscriptions - `projectSubscriptions` Map has no cleanup.

**Recommendation:**  
Same as finding #3.

---

### 6. Missing Input Validation in Handlers

**Files:** Multiple handlers  
**Severity:** HIGH  
**Category:** Security Vulnerability

**Description:**  
Message handlers don't validate incoming payload data:

- `collaboration.handlers.ts` line 12: `join-room` accepts unvalidated roomId, userId, username
- `notification.handlers.ts` line 12: `subscribe` accepts unvalidated userId  
- `commodity.handlers.ts` line 22: `join-commodity` accepts unvalidated commodityId, userId, username

**Risk:**  
- SQL/NoSQL injection if data is used in queries
- XSS if data is broadcast to clients
- Type confusion errors

**Recommendation:**  
- Add Zod or similar schema validation
- Sanitize all user input
- Validate data types and lengths

---

### 7. Missing Close Handler for Subscription Cleanup

**Files:** `tracking.handlers.ts`, `project.handlers.ts`, `notification.handlers.ts`, `commodity.handlers.ts`  
**Severity:** HIGH  
**Category:** Connection Management

**Description:**  
Handlers that maintain subscription Maps don't register WebSocket 'close' event listeners to clean up subscriptions.

**Risk:** This is the root cause of the memory leak issues identified above.

**Recommendation:**  
Add close event handler in each subscription-based handler:

```typescript
ws.on('close', () => {
  // Clean up subscriptions for this connection
});
```

---

### 8. Memory Leak - Commodity Chat Rooms

**File:** `server/core/websocket/handlers/commodity.handlers.ts` (Lines 14-16)  
**Severity:** HIGH  
**Category:** Memory Leak

**Description:**  
Both `commodityRooms` and `messageHistory` Maps grow indefinitely:

```typescript
const commodityRooms = new Map<number, Set<any>>();
const messageHistory = new Map<number, ChatMessage[]>();
```

**Risk:** Message history for commodities is never purged, consuming memory.

**Recommendation:**  
- Implement TTL-based cleanup for message history
- Remove commodity room entries when empty
- Add maximum room/history limits

---

## MEDIUM SEVERITY FINDINGS

### 9. Overly Permissive Public Namespaces

**File:** `server/core/websocket/security/ws-auth.ts` (Lines 190-195)  
**Severity:** MEDIUM  
**Category:** Security Vulnerability

**Description:**  
`/ws/main` and `/ws/tracking` allow anonymous connections without authentication.

**Risk:** Could be exploited for DoS attacks or information disclosure.

**Recommendation:**  
- Implement stricter rate limiting for anonymous connections
- Consider requiring at least a session token
- Monitor anonymous connection patterns

---

### 10. No Message Size Validation in Handlers

**File:** `server/core/websocket/UnifiedWebSocketManager.ts` (Line 53)  
**Severity:** MEDIUM  
**Category:** Security Vulnerability

**Description:**  
Global maxPayload is 16MB, but handlers don't validate individual message sizes.

**Risk:** Large messages could cause memory exhaustion or slow processing.

**Recommendation:**  
- Add per-handler message size limits
- Reject oversized messages with error response

---

### 11. Activity Buffer Timing Issue

**File:** `server/core/websocket/handlers/activity.handlers.ts` (Lines 69-80)  
**Severity:** MEDIUM  
**Category:** Memory Leak

**Description:**  
Activity buffer cleanup runs only every hour, allowing accumulation during high activity.

**Recommendation:**  
- Reduce cleanup interval to 5-10 minutes
- Implement size-based cleanup trigger

---

### 12. No Connection Limit Per User

**File:** `server/core/websocket/security/ws-auth.ts`  
**Severity:** MEDIUM  
**Category:** Connection Management

**Description:**  
Rate limiting is IP-based only. A single authenticated user could open many connections from different IPs.

**Recommendation:**  
- Add per-user connection limit
- Track active connections per user ID

---

### 13. No Ping/Pong Timeout Tracking

**File:** `server/core/websocket/UnifiedWebSocketManager.ts` (Lines 238-272)  
**Severity:** MEDIUM  
**Category:** Connection Management

**Description:**  
Health check sends pings but doesn't track if pong responses are received within timeout.

**Risk:** Dead connections may not be detected if they don't fail on send.

**Recommendation:**  
- Implement pong response timeout
- Mark connections as dead if pong not received

---

### 14. Silent JSON Parse Failures

**File:** `server/core/websocket/UnifiedWebSocketManager.ts` (Lines 165-178)  
**Severity:** MEDIUM  
**Category:** Error Handling

**Description:**  
JSON parse errors are logged but no error response is sent to client:

```typescript
} catch (error) {
  logger.error(`Error handling message in ${namespace.name}:`, error);
  // No error sent to client
}
```

**Recommendation:**  
Send error response to client for malformed messages.

---

### 15. No Standardized Error Response Format

**Files:** All handlers  
**Severity:** MEDIUM  
**Category:** Error Handling

**Description:**  
Handlers don't send standardized error responses. Clients cannot reliably detect failures.

**Recommendation:**  
Implement standard error response format:
```typescript
{ type: 'error', code: string, message: string, timestamp: string }
```

---

### 16. Auth Handler Accepts All Tokens

**File:** `server/core/websocket/handlers/main.handlers.ts` (Lines 37-48)  
**Severity:** MEDIUM  
**Category:** Missing Authentication

**Description:**  
Comment indicates "Phase 4 will add proper validation" - currently all auth requests succeed:

```typescript
// For now, accept all auth requests (Phase 4 will add proper validation)
ws.send(JSON.stringify({
  type: 'auth_success',
  ...
}));
```

**Recommendation:**  
Implement proper token validation or remove the fake auth success response.

---

### 17. No Token Refresh Mechanism

**File:** `server/core/websocket/security/ws-auth.ts`  
**Severity:** MEDIUM  
**Category:** Missing Authentication

**Description:**  
WebSocket connections don't handle token expiration. Long-lived connections continue with expired tokens.

**Recommendation:**  
- Implement token refresh protocol
- Periodically re-validate tokens
- Disconnect on token expiration

---

### 18. Broadcast Sends to All Connections

**File:** `server/core/websocket/handlers/mololink.handlers.ts` (Line 20)  
**Severity:** MEDIUM  
**Category:** Connection Management

**Description:**  
`manager.broadcast()` sends to ALL connections in namespace, not just targeted users.

**Risk:** Information leakage and bandwidth waste.

**Recommendation:**  
Implement targeted broadcast based on user filtering.

---

### 19. Permission Denied Leaks Token Validity

**File:** `server/core/websocket/security/ws-auth.ts` (Lines 105-112)  
**Severity:** MEDIUM  
**Category:** Security Vulnerability

**Description:**  
Returning "Insufficient permissions" reveals that the token was valid but unauthorized.

**Recommendation:**  
Use generic error message that doesn't reveal token validity.

---

## LOW SEVERITY FINDINGS

### 20. Collaboration Rooms Not Cleaned

**File:** `server/core/websocket/handlers/collaboration.handlers.ts` (Line 9)  
**Severity:** LOW  
**Category:** Memory Leak

**Description:**  
`activeRooms` Map entries not cleaned when room becomes empty.

**Recommendation:**  
Check and delete empty room entries on user leave.

---

### 21. Missing Try-Catch in Handlers

**Files:** All handlers  
**Severity:** LOW  
**Category:** Error Handling

**Description:**  
Most handler functions lack try-catch blocks.

**Recommendation:**  
Wrap handler logic in try-catch with error logging.

---

### 22. No Connection Duration Tracking

**File:** `server/core/websocket/UnifiedWebSocketManager.ts`  
**Severity:** LOW  
**Category:** Monitoring

**Description:**  
Cannot identify long-lived problematic connections.

**Recommendation:**  
Add connection duration to metrics.

---

### 23. Missing Namespace-Level Error Thresholds

**File:** `server/core/websocket/monitoring/periodic-collector.ts`  
**Severity:** LOW  
**Category:** Monitoring

**Description:**  
Alerts are global, can't identify which namespace has issues.

**Recommendation:**  
Add per-namespace alerting thresholds.

---

### 24. Rate Limit Map Grows Without Bounds

**File:** `server/core/websocket/security/ws-auth.ts` (Lines 297-304)  
**Severity:** LOW  
**Category:** Memory Leak

**Description:**  
While cleanup runs every 5 minutes, rapid attack could still grow the map.

**Recommendation:**  
Add maximum size limit to rate limit map.

---

### 25. Verbose Logging in Production

**File:** `server/core/websocket/security/ws-auth.ts` (Multiple lines)  
**Severity:** LOW  
**Category:** Security

**Description:**  
Extensive info-level logging includes namespace checks and IP addresses.

**Recommendation:**  
Reduce log verbosity in production environment.

---

## Recommendations Summary

### Immediate Actions (Critical/High)
1. Remove hardcoded JWT secret fallback
2. Add close event handlers to all subscription-based handlers
3. Implement input validation for all message payloads
4. Deprecate query parameter token authentication

### Short-term Actions (Medium)
1. Implement per-user connection limits
2. Add ping/pong timeout tracking
3. Create standardized error response format
4. Complete "Phase 4" authentication validation
5. Implement token refresh mechanism

### Long-term Improvements (Low)
1. Add connection duration metrics
2. Implement namespace-level alerting
3. Reduce production log verbosity
4. Add comprehensive cleanup routines

---

## Architecture Observations

**Positive Aspects:**
- Well-structured namespace-based architecture
- Good separation of concerns between handlers
- Comprehensive audit logging with attack pattern detection
- Health check and metrics collection in place
- Rate limiting implemented

**Areas for Improvement:**
- Handler cleanup logic should be centralized
- Consider using WeakRef for connection tracking
- Add circuit breaker pattern for external dependencies
- Implement connection pooling for database operations in handlers
