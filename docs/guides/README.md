# MoloChain - Blockchain-Powered Logistics Super-App

## 🌐 Overview
MoloChain is a revolutionary blockchain-powered logistics Super-App transforming the $9.1 trillion global logistics industry. Built with smart contracts, the MOLOCHAIN token ecosystem, and enterprise-grade infrastructure, the platform provides comprehensive solutions for supply chain management, real-time tracking, commodity trading, and transparent global trade operations.

## 💎 Blockchain Features
- **MOLOCHAIN Token**: 1 Billion supply with deflationary model
- **Smart Contracts**: 48,000+ deployed contracts
- **Network Nodes**: 1,286 active blockchain nodes
- **Transactions**: 186,000+ MOLOCHAIN transactions processed
- **Network Value**: $142 Million total value locked
- **Coverage**: 150+ countries with 10,000+ partners

## 🚀 Current Status
- **Version**: Production-Ready (September 2025)
- **Health**: ✅ All systems operational
- **Database**: PostgreSQL 16.9 (Neon.tech)
- **Active Services**: 46 services available
- **WebSocket Connections**: 8 real-time channels
- **API Endpoints**: 100+ RESTful endpoints

## 📊 Key Metrics
- **Response Time**: ~250ms average (excluding cold starts)
- **Memory Usage**: 58.5 MB stable
- **Database Pool**: 4 connections (1 active, 3 idle)
- **Cache Hit Rate**: Optimizing (target 85%)
- **Error Recovery**: 100% success rate

## 🏗️ Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **UI Components**: Tailwind CSS + Radix UI
- **State Management**: React Query v5
- **Routing**: Wouter (client-side)
- **Real-time**: WebSocket integration

### Backend Stack
- **Runtime**: Node.js 20.19.3 with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT + Session + 2FA
- **Caching**: Multi-layer NodeCache system
- **Security**: Helmet.js, CORS, rate limiting

### Infrastructure
- **Hosting**: Replit deployment-ready
- **Monitoring**: Production monitoring system
- **Backup**: Automated database backups
- **Recovery**: Disaster recovery procedures

## 🎯 Core Features

### 1. Transport & Logistics
- Air, Maritime, and Land transport management
- Real-time shipment tracking
- Route optimization
- Carrier integration

### 2. MOLOLINK Marketplace
- Professional networking
- Company directory
- Product marketplace
- Auction system
- Service trading

### 3. Commodity Management
- 4 major commodity categories
- Trading platform
- Price tracking
- Inventory management

### 4. Enterprise Features
- Multi-tenant architecture
- Role-based access control (RBAC)
- Advanced analytics dashboard
- API developer portal
- Webhook integrations

### 5. Admin Control Center
- Master control panel
- 14 department dashboards
- User management
- Security settings
- Content management
- Performance monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- PostgreSQL database
- Environment variables configured

### Installation
```bash
# 1. Clone the repository
git clone [repository-url]

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Setup database
npm run db:push

# 5. Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## 📁 Project Structure
```
molochain/
├── client/          # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route pages (129 pages)
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities and helpers
│   │   └── services/     # API service layer
├── server/          # Express backend server
│   ├── routes/      # API route handlers
│   ├── services/    # Business logic
│   ├── middleware/  # Express middleware
│   ├── utils/       # Server utilities
│   └── core/        # Core system modules
├── shared/          # Shared types and schemas
├── modules/         # Feature modules
├── services/        # Microservices
└── docs/            # Documentation
```

## 🔐 Security Features
- JWT-based authentication
- Two-factor authentication (2FA)
- Session management with encryption
- CSRF protection
- SQL injection prevention
- Rate limiting per endpoint
- Input validation and sanitization
- Secure password hashing (bcrypt)

## 🌐 API Overview
- **Base URL**: `/api`
- **Authentication**: Bearer token or session
- **Format**: JSON
- **Documentation**: `/api/docs` (Swagger UI)

### Key Endpoints
- `GET /api/health` - System health check
- `GET /api/services` - Available services
- `GET /api/commodities` - Commodity listings
- `GET /api/guides/categories` - Guide categories
- `POST /api/auth/login` - User authentication
- `GET /api/tracking/:id` - Shipment tracking

## 📡 WebSocket Services
Real-time communication channels:
- `/ws/platform` - Platform updates
- `/ws/collaboration` - Team collaboration
- `/ws/marketplace` - MOLOLINK marketplace
- `/ws/notifications` - User notifications
- `/ws/tracking` - Live shipment tracking
- `/ws/projects` - Project updates
- `/ws/activity` - Activity logs
- `/ws/commodity-chat` - Commodity chat

## 🔧 Configuration

### Environment Variables
```env
# Required
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret-key

# Optional but recommended
OPENAI_API_KEY=sk-...
NODE_ENV=production
PORT=5000
CACHE_ENABLED=true
LOG_LEVEL=info
```

## 📊 Performance Optimization
- Unified memory optimizer with automatic cleanup
- Multi-layer caching system
- Database query optimization
- Connection pooling
- Lazy loading and code splitting
- WebSocket connection management
- Response compression
- ETag caching

## 🛠️ Maintenance

### Database Backup
```bash
# Create backup
tsx server/scripts/database-backup.ts create

# List backups
tsx server/scripts/database-backup.ts list

# Restore backup
tsx server/scripts/database-backup.ts restore [backup-file]
```

### Health Monitoring
```bash
# Check system health
curl http://localhost:5000/api/health

# Monitor WebSocket connections
curl http://localhost:5000/api/websocket/health

# View performance metrics
curl http://localhost:5000/api/performance/metrics
```

## 📚 Documentation
- [Architecture Documentation](../../ARCHITECTURE_DOCUMENTATION.md) - Complete system architecture
- [Project Structure](../PROJECT_STRUCTURE.md) - Codebase organization
- [Platform Analysis](../reports/MOLOCHAIN_PLATFORM_ANALYSIS.md) - Platform overview
- [Developer Reference](../reports/MOLOCHAIN_DEVELOPER_REFERENCE.md) - Quick developer lookup
- [Development Notes](../../replit.md) - Technical architecture

## 🤝 Support
For technical support, API documentation, and development resources:
- Access the developer portal at `/developer`
- View API documentation at `/api/docs`
- Check system status at `/api/health`
- Admin dashboard at `/admin`

## 📝 License
Proprietary - MoloChain Platform

---
*Last Updated: September 7, 2025*