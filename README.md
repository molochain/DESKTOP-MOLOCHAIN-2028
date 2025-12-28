# MoloChain - Global Logistics Platform

**Version:** 2.0  
**Last Updated:** December 21, 2025

A comprehensive enterprise-grade global logistics and commodity management platform serving the Molochain ecosystem.

---

## Quick Start

1. The application runs on port 5000
2. Use `npm run dev` to start the development server
3. Database is automatically configured via PostgreSQL

---

## Documentation

### Quick Access

- **[Architecture Documentation](ARCHITECTURE_DOCUMENTATION.md)** - Complete system architecture
- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - Codebase organization
- **[Platform Analysis](docs/reports/MOLOCHAIN_PLATFORM_ANALYSIS.md)** - Deep technical analysis
- **[Developer Reference](docs/reports/MOLOCHAIN_DEVELOPER_REFERENCE.md)** - Quick API reference

### Email Notification System

- **[Integration Quick Start](docs/INTEGRATION_QUICKSTART.md)** - For OTMS/Mololink developers
- **[Cross-Subdomain Integration](docs/CROSS_SUBDOMAIN_EMAIL_INTEGRATION.md)** - Full integration guide
- **[Admin User Guide](docs/EMAIL_NOTIFICATION_GUIDE.md)** - For administrators
- **[API Key Management SOP](docs/API_KEY_MANAGEMENT_SOP.md)** - Key management procedures

### By Category

| Category | Documents |
|----------|-----------|
| **Architecture** | [System Design](ARCHITECTURE_DOCUMENTATION.md), [Project Structure](docs/PROJECT_STRUCTURE.md), [User Flows](docs/user-flow-chart.md) |
| **Testing** | [Auth Testing](docs/reports/authentication-test-report.md), [RBAC Testing](docs/reports/RBAC_TEST_REPORT.md), [Dashboard Testing](docs/reports/dashboard-test-report.md) |
| **Developer Guides** | [API Reference](docs/reports/MOLOCHAIN_DEVELOPER_REFERENCE.md), [Module Connections](docs/reports/MOLOCHAIN_MODULE_CONNECTIONS.md) |
| **Operations** | [Deployment](docs/DEPLOYMENT.md), [Server Audit](server-audit-report.md), [Ecosystem Map](docs/ECOSYSTEM_MAP.md) |

### Project Memory

- **[replit.md](replit.md)** - Project history, preferences, and technical details

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Node.js, Express, PostgreSQL, Drizzle ORM |
| **Real-time** | WebSocket (UnifiedWebSocketManager) |
| **AI** | OpenAI SDK (controlled by FEATURE_AI_ENABLED) |
| **Email** | Nodemailer with local Postfix relay |
| **Security** | JWT, CSRF protection, rate limiting, API key auth |

---

## Ecosystem

MoloChain is the central hub for a multi-subdomain logistics platform:

| Subdomain | Purpose |
|-----------|---------|
| `molochain.com` | Main platform and public API |
| `admin.molochain.com` | Admin dashboard |
| `opt.molochain.com` | OTMS (Order & Transport Management) |
| `mololink.molochain.com` | Freight marketplace |
| `cms.molochain.com` | Content management (Laravel) |
| `auth.molochain.com` | SSO authentication service |

---

## Key Features

- Supply chain management
- Real-time collaboration with WebSocket
- Performance monitoring and analytics
- User authentication with 2FA support
- File management with cloud storage
- Cross-subdomain email notification system
- API documentation (Swagger)
- Communications Hub for email management

---

## Production

- **Server:** 31.186.24.19
- **Domain:** molochain.com
- **SSL:** Valid until January 4, 2026
- **Process Manager:** PM2 (molochain-core)

---

## License

Proprietary - All rights reserved
