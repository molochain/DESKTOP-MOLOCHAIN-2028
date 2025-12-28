# MoloChain Platform Documentation

**Last Updated:** December 21, 2025

## Documentation Overview

This directory contains comprehensive documentation for the MoloChain logistics platform. All markdown files are organized by category and purpose.

---

## Core Documentation Structure

### Architecture & Development

- **[Architecture Documentation](../ARCHITECTURE_DOCUMENTATION.md)** - Complete system architecture overview
- **[Project Structure](PROJECT_STRUCTURE.md)** - Detailed project organization guide
- **[User Flow Chart](user-flow-chart.md)** - Authentication and user journey flows
- **[Ecosystem Map](ECOSYSTEM_MAP.md)** - Multi-subdomain ecosystem overview

### Email Notification System (NEW)

- **[Integration Quick Start](INTEGRATION_QUICKSTART.md)** - For OTMS/Mololink developers
- **[Cross-Subdomain Integration](CROSS_SUBDOMAIN_EMAIL_INTEGRATION.md)** - Complete integration guide
- **[Admin User Guide](EMAIL_NOTIFICATION_GUIDE.md)** - For administrators
- **[API Key Management SOP](API_KEY_MANAGEMENT_SOP.md)** - Key management procedures

### Comprehensive PDF Report

- **[MOLOCHAIN_COMPREHENSIVE_REPORT.pdf](MOLOCHAIN_COMPREHENSIVE_REPORT.pdf)** - 19-page report with diagrams and screenshots
  - 7 embedded diagrams (Architecture, Auth, Email, Subdomain, Database, Features)
  - 15 page screenshots with detailed descriptions
  - 14 chapters covering all 551 commits across 17 phases
  - Regenerate with: `npx tsx scripts/generate-report.ts`
  - Mermaid sources: `docs/assets/diagrams/`

### Screenshots

Screenshots are stored in `docs/assets/screenshots/`. To capture real screenshots on production:

```bash
# Install Playwright browser (requires Chrome libraries)
npx playwright install chromium

# Capture screenshots from local server
npx tsx scripts/capture-real-screenshots.ts

# Or capture from production
npx tsx scripts/capture-real-screenshots.ts --base-url=https://molochain.com
```

Note: Placeholder screenshots are used in development environments where Chrome is unavailable.

### Reports & Analysis

- **[Platform Analysis](reports/MOLOCHAIN_PLATFORM_ANALYSIS.md)** - Comprehensive platform analysis
- **[Developer Reference](reports/MOLOCHAIN_DEVELOPER_REFERENCE.md)** - Quick developer reference guide
- **[Module Connections](reports/MOLOCHAIN_MODULE_CONNECTIONS.md)** - System module relationships
- **[API Endpoints Report](reports/API_ENDPOINT_ERRORS_REPORT.md)** - API endpoint analysis
- **[Authentication Analysis](reports/AUTHENTICATION_SYSTEM_ANALYSIS_REPORT.md)** - Security system analysis

### Testing & Validation

- **[Authentication Test Report](reports/authentication-test-report.md)** - Comprehensive authentication testing
- **[Registration Test Report](reports/REGISTRATION_TEST_REPORT.md)** - User registration system testing
- **[Test Consolidation](reports/TEST_REPORT_AUTH_CONSOLIDATION.md)** - Authentication test consolidation
- **[2FA Testing Report](reports/2fa-testing-report.md)** - Two-factor authentication validation
- **[Profile Test Report](reports/PROFILE_TEST_REPORT.md)** - User profile functionality testing
- **[RBAC Test Report](reports/RBAC_TEST_REPORT.md)** - Role-based access control testing
- **[Session Management Test](reports/session-management-test-report.md)** - Session handling validation
- **[Dashboard Test Report](reports/dashboard-test-report.md)** - Dashboard system testing

### Deployment & Operations

- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment procedures
- **[Deployment Workflow](DEPLOYMENT_WORKFLOW.md)** - CI/CD workflow documentation
- **[Server Audit Report](../server-audit-report.md)** - Production server health report

### User & Developer Guides

- **[Platform Guides](guides/README.md)** - User and developer guidance
- **[Quick Start](QUICK_START.md)** - Essential documentation routes

---

## Documentation Categories

### By Development Phase

| Phase | Documents |
|-------|-----------|
| **Planning** | Architecture docs, project structure |
| **Implementation** | Developer reference, module connections |
| **Testing** | All test reports and validation documents |
| **Maintenance** | Dashboard reorganization, system analysis |
| **Operations** | Deployment guides, server audit |

### By Audience

| Audience | Documents |
|----------|-----------|
| **Developers** | Architecture, API docs, developer reference, integration guides |
| **QA/Testers** | Test reports, checklists, validation documents |
| **System Administrators** | Platform analysis, dashboard controls, server audit |
| **Integration Teams** | Email integration guides, API key SOP |
| **End Users** | User guides, flow charts |

---

## Documentation Metrics

| Metric | Count |
|--------|-------|
| Total Documentation Files | 36 |
| Architecture Documents | 4 |
| Test Reports | 22 |
| Analysis Reports | 5 |
| Email Integration Docs | 4 |
| Index/Guide Files | 6 |

---

## Quick Navigation

### Most Frequently Used

1. **[Architecture Documentation](../ARCHITECTURE_DOCUMENTATION.md)** - Start here for system overview
2. **[Integration Quick Start](INTEGRATION_QUICKSTART.md)** - For cross-subdomain email integration
3. **[Developer Reference](reports/MOLOCHAIN_DEVELOPER_REFERENCE.md)** - For quick development lookup
4. **[Platform Analysis](reports/MOLOCHAIN_PLATFORM_ANALYSIS.md)** - For comprehensive understanding

### By Task

| Task | Recommended Documents |
|------|----------------------|
| Development Setup | Architecture Documentation + Developer Reference |
| Testing | Test Reports + Checklists |
| Analysis | Platform Analysis + Module Connections |
| Troubleshooting | API Endpoints Report + Authentication Analysis |
| Email Integration | Integration Quick Start + Cross-Subdomain Guide |
| Operations | Deployment Guide + Server Audit |

---

## Documentation Standards

- **Format**: Consistent Markdown with proper headers
- **Naming**: Descriptive kebab-case filenames
- **Updates**: Version controlled with timestamps
- **Cross-references**: Linked related documentation
- **Validation**: All reports include execution summaries

---

## Maintenance Schedule

| Frequency | Activity |
|-----------|----------|
| Weekly | Review active documentation for updates |
| Monthly | Update test reports and metrics |
| Quarterly | Comprehensive architecture review |
| On-demand | Update integration docs after API changes |

---

*Documentation maintained by MoloChain Development Team*  
*Last Updated: December 21, 2025*
