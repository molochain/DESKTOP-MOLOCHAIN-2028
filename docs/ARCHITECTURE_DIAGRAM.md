# Molochain Platform Architecture Diagrams

> **Generated**: December 24, 2025  
> **Purpose**: Visual representation of system architecture and data flow  
> **Format**: Mermaid.js diagrams (viewable in GitHub, VS Code, etc.)

---

## 1. Application Architecture (Repository Structure)

```mermaid
graph TB
    subgraph Frontend["🎨 Frontend (client/)"]
        Vite["Vite Dev Server<br/>Port 5000"]
        React["React 18 SPA"]
        TanStack["TanStack Query"]
        
        subgraph Pages["Pages (131 TSX)"]
            AdminPages["admin/*"]
            GeneralPages["general/*"]
            DashboardPages["dashboard/*"]
            MololinkPages["mololink/*"]
        end
    end

    subgraph Backend["⚙️ Backend (server/)"]
        Express["Express Server<br/>Port 5000"]
        
        subgraph Registrars["Route Registrars (6)"]
            AdminReg["admin.registrar.ts"]
            ServicesReg["services.registrar.ts"]
            AnalyticsReg["analytics.registrar.ts"]
            SecurityReg["security.registrar.ts"]
            EcosystemReg["ecosystem.registrar.ts"]
            CollabReg["collaboration.registrar.ts"]
        end
        
        subgraph Routes["Routes (30 files)"]
            MololinkRoutes["mololink.ts"]
            APIDocsRoutes["api-documentation.ts"]
            AdminRoutes["admin/*"]
        end
        
        subgraph Core["Core Services"]
            Auth["auth.service.ts"]
            Cache["cache.service.ts"]
        end
        
        WebSocket["UnifiedWebSocketManager"]
    end

    subgraph Database["💾 Database"]
        Drizzle["Drizzle ORM"]
        PostgreSQL["PostgreSQL"]
    end

    subgraph Shared["📦 Shared (shared/)"]
        Schema["schema.ts<br/>(Types + Tables)"]
    end

    React --> TanStack
    TanStack --> Express
    Express --> Registrars
    Registrars --> Routes
    Routes --> Core
    Core --> Drizzle
    Drizzle --> PostgreSQL
    
    Schema -.-> React
    Schema -.-> Routes
```

> **Note**: In production, this runs on a single Node.js server (PM2) with Nginx reverse proxy. 
> Subdomains (mololink.molochain.com, admin.molochain.com) are handled by subdomain middleware.

---

## 2. Frontend Route Structure

```mermaid
graph LR
    subgraph RouteRegistry["📍 Route Registry"]
        AppRouter["AppRouter.tsx"]
    end

    subgraph RouteModules["📁 Route Modules"]
        MainRoutes["main.routes.ts"]
        AuthRoutes["auth.routes.ts"]
        PortalRoutes["portal.routes.ts"]
        AdminRoutes["admin.routes.ts"]
        DeptRoutes["departments.routes.ts"]
        ServicesRoutes["services.routes.ts"]
        EcoRoutes["ecosystem.routes.ts"]
        MololinkRoutes["mololink.routes.ts"]
        BrandRoutes["brandbook.routes.ts"]
    end

    subgraph Pages["📄 Page Components"]
        subgraph PublicPages["Public (No Auth)"]
            Home["Home"]
            About["About"]
            Services["Services"]
            Contact["Contact"]
        end
        
        subgraph AuthPages["Auth Pages"]
            Login["Login"]
            Register["Register"]
            Reset["Reset Password"]
        end
        
        subgraph PortalPages["Portal (Auth Required)"]
            Dashboard["Dashboard"]
            Settings["Settings"]
            Profile["Profile"]
        end
        
        subgraph AdminPages["Admin (Admin Role)"]
            UserMgmt["User Management"]
            Security["Security Settings"]
            Analytics["Analytics"]
        end
        
        subgraph MololinkPages["Mololink"]
            Marketplace["Marketplace"]
            Companies["Companies"]
            Network["Network"]
        end
    end

    AppRouter --> MainRoutes & AuthRoutes & PortalRoutes & AdminRoutes & DeptRoutes & ServicesRoutes & EcoRoutes & MololinkRoutes & BrandRoutes
    
    MainRoutes --> PublicPages
    AuthRoutes --> AuthPages
    PortalRoutes --> PortalPages
    AdminRoutes --> AdminPages
    MololinkRoutes --> MololinkPages
```

---

## 3. Backend Route Registration Flow

```mermaid
graph TB
    subgraph Entry["🚪 Entry Point"]
        RoutesTS["routes.ts<br/>(registerRoutes)"]
    end

    subgraph DirectRoutes["📌 Direct Routes"]
        ContactRoutes["/api/contact"]
        DriveRoutes["/api/drive"]
        SettingsRoutes["/api/settings"]
        DashboardRoutes["/api/dashboards"]
        ProjectsRoutes["/api/projects"]
        DocsRoutes["/api/docs<br/>/api/openapi.json<br/>/api/postman-collection"]
    end

    subgraph Registrars["🗂️ Domain Registrars"]
        AdminReg["registerAdminRoutes()<br/>/api/admin/*"]
        ServicesReg["registerServiceRoutes()<br/>/api/*"]
        AnalyticsReg["registerAnalyticsRoutes()<br/>/api/analytics, /api/performance"]
        SecurityReg["registerSecurityRoutes()<br/>/api/auth, /api/identity"]
        EcosystemReg["registerEcosystemRoutes()<br/>/api/cms, /api/mololink"]
        CollabReg["registerCollaborationRoutes()<br/>/api/collaborative-documents"]
    end

    subgraph RouteFiles["📁 Route Handlers"]
        AdminUsers["admin-users.ts"]
        AdminSecurity["admin-security.ts"]
        Mololink["mololink.ts"]
        APIDocumentation["api-documentation.ts"]
        Performance["performance.ts"]
    end

    RoutesTS --> DirectRoutes
    RoutesTS --> Registrars
    
    AdminReg --> AdminUsers & AdminSecurity
    EcosystemReg --> Mololink
    RoutesTS --> APIDocumentation
    AnalyticsReg --> Performance
```

---

## 4. Mololink Module Architecture

```mermaid
graph TB
    subgraph Frontend["🎨 Frontend (React)"]
        subgraph MololinkRoutes["mololink.routes.ts"]
            Main["/mololink"]
            Marketplace["/mololink/marketplace"]
            Companies["/mololink/companies"]
            Network["/mololink/network"]
            Profile["/mololink/profile"]
            Search["/mololink/search"]
        end
        
        subgraph MololinkComponents["Components"]
            MarketplaceList["MarketplaceListing"]
            AuctionCard["AuctionCard"]
            CompanyCard["CompanyCard"]
            ProfileForm["ProfileForm"]
        end
    end

    subgraph Backend["⚙️ Backend"]
        subgraph MololinkAPI["mololink.ts Routes"]
            GetCompanies["GET /api/mololink/companies"]
            GetListings["GET /api/mololink/marketplace/listings"]
            GetAuctions["GET /api/mololink/marketplace/auctions"]
            GetProfile["GET /api/mololink/profile"]
            PostListing["POST /api/mololink/marketplace/listings"]
            PostBid["POST /api/mololink/marketplace/auctions/:id/bids"]
            GetConnections["GET /api/mololink/connections"]
            Search["GET /api/mololink/search"]
        end
    end

    subgraph Database["💾 Database Tables"]
        ProfilesTable["mololink_profiles"]
        CompaniesTable["mololink_companies"]
        PostsTable["mololink_posts"]
        ListingsTable["marketplace_listings"]
        AuctionsTable["marketplace_auctions"]
        BidsTable["marketplace_bids"]
        ConnectionsTable["mololink_connections"]
    end

    Main --> GetCompanies
    Marketplace --> GetListings & GetAuctions
    Companies --> GetCompanies
    Profile --> GetProfile
    Search --> Search
    Network --> GetConnections

    GetCompanies --> CompaniesTable
    GetListings --> ListingsTable
    GetAuctions --> AuctionsTable & BidsTable
    GetProfile --> ProfilesTable
    GetConnections --> ConnectionsTable
    PostListing --> ListingsTable
    PostBid --> BidsTable
```

---

## 5. Authentication Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Frontend as React App
    participant Backend as Express Server
    participant AuthService as Auth Service
    participant DB as PostgreSQL

    User->>Frontend: Enter credentials
    Frontend->>Backend: POST /api/auth/login
    Backend->>DB: Validate credentials
    DB-->>Backend: User data
    Backend->>Backend: Generate JWT token
    Backend->>Backend: Create session
    Backend-->>Frontend: { token, user }
    Frontend->>Frontend: Store in AuthContext
    
    Note over Frontend,Backend: Subsequent requests include token
    
    Frontend->>Backend: GET /api/protected (+ Authorization header)
    Backend->>Backend: isAuthenticated middleware
    Backend->>Backend: Validate JWT
    Backend-->>Frontend: Protected data
```

---

## 6. WebSocket Architecture

```mermaid
graph TB
    subgraph Clients["👥 Connected Clients"]
        Client1["User 1"]
        Client2["User 2"]
        Client3["Admin"]
    end

    subgraph WSManager["🔌 UnifiedWebSocketManager"]
        MainNS["/ws/main<br/>(Public)"]
        CollabNS["/ws/collaboration<br/>(Auth Required)"]
        MololinkNS["/ws/mololink<br/>(Auth Required)"]
        NotifNS["/ws/notifications<br/>(Auth Required)"]
        TrackNS["/ws/tracking<br/>(Public)"]
        HealthNS["/ws/health<br/>(Public)"]
    end

    subgraph Events["📡 Event Types"]
        SystemEvents["System Events<br/>- health updates<br/>- server status"]
        UserEvents["User Events<br/>- notifications<br/>- messages"]
        CollabEvents["Collaboration Events<br/>- document updates<br/>- cursor positions"]
        TrackEvents["Tracking Events<br/>- shipment updates<br/>- location data"]
    end

    Client1 --> MainNS & NotifNS
    Client2 --> MainNS & MololinkNS & CollabNS
    Client3 --> MainNS & HealthNS
    
    MainNS --> SystemEvents
    NotifNS --> UserEvents
    CollabNS --> CollabEvents
    TrackNS --> TrackEvents
```

---

## 7. Data Flow: Page Load Example

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant React as React App
    participant TanStack as TanStack Query
    participant Express as Express Server
    participant Cache as Cache Service
    participant DB as PostgreSQL

    Browser->>React: Navigate to /mololink/marketplace
    React->>TanStack: useQuery({ queryKey: ['/api/mololink/marketplace/listings'] })
    TanStack->>TanStack: Check query cache
    
    alt Cache Hit
        TanStack-->>React: Cached data
    else Cache Miss
        TanStack->>Express: GET /api/mololink/marketplace/listings
        Express->>Cache: Check API cache
        
        alt Cache Hit
            Cache-->>Express: Cached response
        else Cache Miss
            Express->>DB: SELECT * FROM marketplace_listings
            DB-->>Express: Listings data
            Express->>Cache: Store in cache (TTL: 30s)
        end
        
        Express-->>TanStack: JSON response
        TanStack->>TanStack: Update query cache
    end
    
    TanStack-->>React: { data, isLoading, error }
    React->>Browser: Render marketplace listings
```

---

## 8. File Structure Overview

```mermaid
graph LR
    subgraph Root["📁 Project Root"]
        Client["client/"]
        Server["server/"]
        Shared["shared/"]
        Docs["docs/"]
    end

    subgraph ClientDir["📁 client/src/"]
        Pages["pages/<br/>(131 TSX files)"]
        Routes["routes/<br/>(9 route modules)"]
        Components["components/<br/>(UI library)"]
        Hooks["hooks/<br/>(Custom hooks)"]
        Contexts["contexts/<br/>(React contexts)"]
        Modules["modules/<br/>(Feature modules)"]
        Lib["lib/<br/>(Utilities)"]
    end

    subgraph ServerDir["📁 server/"]
        RoutesTS["routes.ts"]
        RoutesDir["routes/<br/>(30 route files)"]
        Registrars["registrars/<br/>(6 domain registrars)"]
        Core["core/<br/>(Auth, Cache, Monitor)"]
        Services["services/<br/>(Business logic)"]
        Middleware["middleware/<br/>(Request handlers)"]
        API["api/<br/>(Additional endpoints)"]
    end

    subgraph SharedDir["📁 shared/"]
        Schema["schema.ts<br/>(Drizzle models)"]
        Types["types.ts<br/>(Shared interfaces)"]
    end

    Root --> ClientDir & ServerDir & SharedDir
    Client --> ClientDir
    Server --> ServerDir
    Shared --> SharedDir
```

---

## Legend

| Symbol | Meaning |
|--------|---------|
| 🌐 | Client/Browser layer |
| ⚙️ | Backend/Server layer |
| 💾 | Database layer |
| 📦 | CDN/Proxy layer |
| 🔌 | External integrations |
| 📍 | Route registration |
| 📁 | File/Directory |
| 📄 | Page component |
| 🔗 | Subdomain |
| 📡 | Real-time events |
| 👥 | Users/Clients |

---

## Viewing These Diagrams

1. **GitHub**: Renders Mermaid automatically
2. **VS Code**: Install "Mermaid Preview" extension
3. **Online**: Paste into [mermaid.live](https://mermaid.live)
4. **CLI**: Use `mmdc` from `@mermaid-js/mermaid-cli`

---

*Last Updated: December 24, 2025*
