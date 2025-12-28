/**
 * API Documentation Routes - Swagger UI & OpenAPI Spec
 * 
 * @description Interactive API documentation with Swagger UI
 * @prefix /api (registered in routes.ts)
 * @frontend client/src/pages/developer/DeveloperPortal.tsx
 * 
 * Endpoints:
 * - GET /api/docs - Swagger UI interface (protected in production)
 * - GET /api/openapi.json - OpenAPI 3.0 specification (protected)
 * - GET /api/postman-collection - Postman collection export (protected)
 * 
 * Security:
 * - Development: Open access for testing
 * - Production: Requires authentication (requireDocsAccess middleware)
 * 
 * Documented APIs:
 * - 12 Mololink endpoints (marketplace, companies, profiles, etc.)
 * - 14 component schemas (MarketplaceListing, MololinkCompany, etc.)
 * - All core platform endpoints
 * 
 * Frontend Integration:
 * - Developer Portal links to /api/docs
 * - API documentation button in admin panel
 */
import { Router, Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Documentation access control middleware
// Requires authenticated user to access API documentation
const requireDocsAccess = async (req: Request, res: Response, next: NextFunction) => {
  // Allow access in development mode without authentication
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  // In production, require authentication
  return requireAuth(req, res, next);
};
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load OpenAPI specification
const openApiSpecPath = path.join(__dirname, '../openapi.json');
let openApiSpec = {};

try {
  openApiSpec = JSON.parse(fs.readFileSync(openApiSpecPath, 'utf8'));
} catch (error) {
  logger.info('OpenAPI spec not found, using default structure');
  openApiSpec = {
    openapi: '3.0.0',
    info: { title: 'MOLOCHAIN API', version: '2.0.0' },
    paths: {},
    components: {}
  };
}

// Enhanced OpenAPI documentation with all 27 remaining endpoints
const enhancedSpec = {
  ...(openApiSpec as any),
  info: {
    ...(openApiSpec as any).info,
    title: 'MOLOCHAIN Logistics Platform API',
    version: '2.0.0',
    description: `
# MOLOCHAIN Global Logistics Platform API

Complete API documentation for the advanced logistics and commodity management platform.

## Authentication

All API endpoints require authentication using Bearer tokens:

\`\`\`
Authorization: Bearer <your-token>
\`\`\`

## Rate Limiting

- Standard endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes per IP

## Error Codes

- **400**: Bad Request - Invalid input parameters
- **401**: Unauthorized - Missing or invalid authentication
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **429**: Too Many Requests - Rate limit exceeded
- **500**: Internal Server Error - Server-side error

## WebSocket Endpoints

Real-time functionality is available through WebSocket connections:

- \`/ws/main\` - General platform updates
- \`/ws/tracking\` - Shipment tracking updates
- \`/ws/collaboration\` - Collaborative document editing
- \`/ws/notifications\` - Real-time notifications
- \`/ws/commodity-chat\` - Commodity trading chat

## SDK Support

Official SDKs available for:
- JavaScript/Node.js
- Python
- PHP
- cURL examples included for all endpoints
    `,
    contact: {
      name: 'MOLOCHAIN Support',
      email: 'support@molochain.com',
      url: 'https://molochain.com/support'
    },
    license: {
      name: 'Commercial',
      url: 'https://molochain.com/license'
    }
  },
  servers: [
    {
      url: 'https://api.molochain.com',
      description: 'Production server'
    },
    {
      url: 'https://staging-api.molochain.com',
      description: 'Staging server'
    },
    {
      url: 'http://localhost:5000',
      description: 'Development server'
    }
  ],
  paths: {
    ...(openApiSpec as any).paths,
    
    // Shipment Management
    '/api/shipments': {
      get: {
        summary: 'List all shipments',
        tags: ['Shipments'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Page number for pagination'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, maximum: 100 },
            description: 'Number of items per page'
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['pending', 'in_transit', 'delivered', 'delayed'] },
            description: 'Filter by shipment status'
          }
        ],
        responses: {
          200: {
            description: 'List of shipments',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    shipments: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Shipment' }
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' }
                  }
                },
                examples: {
                  success: {
                    value: {
                      shipments: [
                        {
                          id: "ship_001",
                          trackingNumber: "MCL123456789",
                          origin: "New York, NY",
                          destination: "Los Angeles, CA",
                          status: "in_transit",
                          carrier: "MOLOCHAIN Express",
                          estimatedDelivery: "2025-06-20T14:00:00Z"
                        }
                      ],
                      pagination: {
                        page: 1,
                        limit: 20,
                        total: 45,
                        pages: 3
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create new shipment',
        tags: ['Shipments'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateShipment' },
              examples: {
                standard: {
                  value: {
                    origin: "New York, NY",
                    destination: "Los Angeles, CA",
                    customerId: "cust_001",
                    serviceType: "OCE-FCL",
                    contents: "Electronics",
                    weight: 1500,
                    dimensions: { length: 120, width: 80, height: 80 }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Shipment created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Shipment' }
              }
            }
          }
        }
      }
    },
    
    // Tracking System
    '/api/tracking/{trackingNumber}': {
      get: {
        summary: 'Get shipment tracking information',
        tags: ['Tracking'],
        parameters: [
          {
            name: 'trackingNumber',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Shipment tracking number'
          }
        ],
        responses: {
          200: {
            description: 'Tracking information',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TrackingData' },
                examples: {
                  inTransit: {
                    value: {
                      trackingNumber: "MCL123456789",
                      status: "in_transit",
                      currentLocation: {
                        lat: 40.7128,
                        lng: -74.0060,
                        address: "New York, NY"
                      },
                      events: [
                        {
                          id: "evt_001",
                          timestamp: "2025-06-15T10:00:00Z",
                          location: "New York, NY",
                          status: "picked_up",
                          description: "Package picked up from origin"
                        }
                      ],
                      estimatedDelivery: "2025-06-20T14:00:00Z"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    
    // Service Management
    '/api/services': {
      get: {
        summary: 'List available services',
        tags: ['Services'],
        responses: {
          200: {
            description: 'Available services',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Service' }
                }
              }
            }
          }
        }
      }
    },
    
    // Service Recommendations
    '/api/services/recommend': {
      post: {
        summary: 'Get service recommendations',
        tags: ['Services'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  origin: { type: 'string' },
                  destination: { type: 'string' },
                  weight: { type: 'number' },
                  dimensions: {
                    type: 'object',
                    properties: {
                      length: { type: 'number' },
                      width: { type: 'number' },
                      height: { type: 'number' }
                    }
                  },
                  priority: { type: 'string', enum: ['standard', 'express', 'overnight'] }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Service recommendations',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      serviceId: { type: 'string' },
                      name: { type: 'string' },
                      estimatedCost: { type: 'number' },
                      estimatedTime: { type: 'string' },
                      reliability: { type: 'number' },
                      matchScore: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    
    // Collaboration System
    '/api/collaboration/sessions': {
      get: {
        summary: 'List collaboration sessions',
        tags: ['Collaboration'],
        responses: {
          200: {
            description: 'Collaboration sessions',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/CollaborationSession' }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create collaboration session',
        tags: ['Collaboration'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  participants: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Session created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CollaborationSession' }
              }
            }
          }
        }
      }
    },
    
    // Health Monitoring
    '/api/health/detailed': {
      get: {
        summary: 'Get detailed system health metrics',
        tags: ['Health'],
        responses: {
          200: {
            description: 'Detailed health metrics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
                    database: {
                      type: 'object',
                      properties: {
                        status: { type: 'string' },
                        latency: { type: 'number' }
                      }
                    },
                    services: {
                      type: 'object',
                      additionalProperties: {
                        type: 'object',
                        properties: {
                          status: { type: 'string' },
                          responseTime: { type: 'number' },
                          successRate: { type: 'number' }
                        }
                      }
                    },
                    system: {
                      type: 'object',
                      properties: {
                        cpu: { type: 'object' },
                        memory: { type: 'object' },
                        disk: { type: 'object' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },

    // ===========================================
    // MOLOLINK MARKETPLACE API ENDPOINTS
    // ===========================================

    // Marketplace Listings
    '/api/mololink/marketplace/listings': {
      get: {
        summary: 'Get marketplace listings',
        description: 'Retrieve all active marketplace listings with optional filtering and pagination. This endpoint is publicly accessible.',
        tags: ['Mololink Marketplace'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Page number for pagination'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, maximum: 100 },
            description: 'Number of items per page (max 100)'
          },
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by category'
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search in title and description'
          }
        ],
        responses: {
          200: {
            description: 'List of marketplace listings',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/MarketplaceListing' }
                },
                examples: {
                  success: {
                    value: [
                      {
                        id: 1,
                        title: "Industrial Forklift",
                        description: "Heavy-duty forklift, excellent condition",
                        price: "15000.00",
                        currency: "USD",
                        category: "equipment",
                        status: "active",
                        sellerId: 1,
                        images: ["https://example.com/forklift1.jpg"],
                        location: "New York, NY",
                        createdAt: "2025-01-15T10:00:00Z"
                      }
                    ]
                  }
                }
              }
            }
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create marketplace listing',
        description: 'Create a new marketplace listing. Requires authentication.',
        tags: ['Mololink Marketplace'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMarketplaceListing' },
              examples: {
                standard: {
                  value: {
                    title: "Industrial Forklift",
                    description: "Heavy-duty forklift, excellent condition, 5000lb capacity",
                    price: "15000.00",
                    currency: "USD",
                    category: "equipment",
                    images: ["https://example.com/forklift1.jpg"],
                    location: "New York, NY"
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Listing created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MarketplaceListing' }
              }
            }
          },
          401: {
            description: 'Unauthorized - Authentication required'
          }
        }
      }
    },

    '/api/mololink/marketplace/listings/{id}': {
      get: {
        summary: 'Get listing by ID',
        description: 'Retrieve a specific marketplace listing by its ID.',
        tags: ['Mololink Marketplace'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'Listing ID'
          }
        ],
        responses: {
          200: {
            description: 'Listing details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MarketplaceListing' }
              }
            }
          },
          404: {
            description: 'Listing not found'
          }
        }
      }
    },

    // Marketplace Auctions
    '/api/mololink/marketplace/auctions': {
      get: {
        summary: 'Get marketplace auctions',
        description: 'Retrieve all active auctions with optional filtering and pagination. This endpoint is publicly accessible.',
        tags: ['Mololink Marketplace'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Page number for pagination'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, maximum: 100 },
            description: 'Number of items per page (max 100)'
          },
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by category'
          }
        ],
        responses: {
          200: {
            description: 'List of active auctions',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/MarketplaceAuction' }
                },
                examples: {
                  success: {
                    value: [
                      {
                        id: 1,
                        title: "Vintage Shipping Container",
                        description: "40ft container, good condition",
                        startingPrice: "5000.00",
                        currentBid: "7500.00",
                        currency: "USD",
                        category: "containers",
                        status: "active",
                        sellerId: 1,
                        startTime: "2025-01-01T00:00:00Z",
                        endTime: "2025-01-31T23:59:59Z",
                        bidCount: 12
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create auction',
        description: 'Create a new auction listing. Requires authentication.',
        tags: ['Mololink Marketplace'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMarketplaceAuction' }
            }
          }
        },
        responses: {
          201: {
            description: 'Auction created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MarketplaceAuction' }
              }
            }
          },
          401: {
            description: 'Unauthorized'
          }
        }
      }
    },

    '/api/mololink/marketplace/auctions/{id}': {
      get: {
        summary: 'Get auction by ID',
        description: 'Retrieve a specific auction with bid history.',
        tags: ['Mololink Marketplace'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'Auction ID'
          }
        ],
        responses: {
          200: {
            description: 'Auction details with bid history',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MarketplaceAuction' }
              }
            }
          },
          404: {
            description: 'Auction not found'
          }
        }
      }
    },

    '/api/mololink/marketplace/auctions/{id}/bid': {
      post: {
        summary: 'Place bid on auction',
        description: 'Place a bid on an active auction. Requires authentication.',
        tags: ['Mololink Marketplace'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'Auction ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: {
                  amount: { type: 'string', description: 'Bid amount' }
                }
              },
              examples: {
                standard: {
                  value: { amount: "8000.00" }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Bid placed successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MarketplaceBid' }
              }
            }
          },
          400: {
            description: 'Invalid bid (too low or auction ended)'
          },
          401: {
            description: 'Unauthorized'
          }
        }
      }
    },

    // ===========================================
    // MOLOLINK PROFESSIONAL NETWORK ENDPOINTS
    // ===========================================

    // Companies
    '/api/mololink/companies': {
      get: {
        summary: 'Get companies list',
        description: 'Retrieve list of companies registered on the Mololink professional network. Publicly accessible.',
        tags: ['Mololink Network'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Page number'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, maximum: 100 },
            description: 'Items per page'
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search by company name or industry'
          }
        ],
        responses: {
          200: {
            description: 'List of companies',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/MololinkCompany' }
                },
                examples: {
                  success: {
                    value: [
                      {
                        id: 1,
                        name: "Global Logistics Corp",
                        industry: "Logistics & Supply Chain",
                        description: "Leading provider of integrated logistics solutions",
                        website: "https://globallogistics.com",
                        location: "Singapore",
                        employeeCount: 5000,
                        logo: "https://example.com/logo.png",
                        verified: true,
                        createdAt: "2024-06-01T00:00:00Z"
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create company',
        description: 'Register a new company on the network. Requires authentication.',
        tags: ['Mololink Network'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMololinkCompany' }
            }
          }
        },
        responses: {
          201: {
            description: 'Company created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MololinkCompany' }
              }
            }
          }
        }
      }
    },

    '/api/mololink/companies/{id}': {
      get: {
        summary: 'Get company by ID',
        description: 'Retrieve company details including employees and posts.',
        tags: ['Mololink Network'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'Company ID'
          }
        ],
        responses: {
          200: {
            description: 'Company details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MololinkCompany' }
              }
            }
          },
          404: {
            description: 'Company not found'
          }
        }
      }
    },

    // Posts
    '/api/mololink/posts': {
      get: {
        summary: 'Get posts feed',
        description: 'Retrieve the public posts feed from the Mololink network.',
        tags: ['Mololink Network'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Page number'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, maximum: 100 },
            description: 'Items per page'
          }
        ],
        responses: {
          200: {
            description: 'List of posts',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/MololinkPost' }
                },
                examples: {
                  success: {
                    value: [
                      {
                        id: 1,
                        profileId: 1,
                        content: "Excited to announce our new partnership with MOLOCHAIN!",
                        images: ["https://example.com/announcement.jpg"],
                        likesCount: 45,
                        commentsCount: 12,
                        sharesCount: 8,
                        createdAt: "2025-01-20T14:30:00Z"
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create post',
        description: 'Create a new post on the network. Requires authentication.',
        tags: ['Mololink Network'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMololinkPost' }
            }
          }
        },
        responses: {
          201: {
            description: 'Post created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MololinkPost' }
              }
            }
          }
        }
      }
    },

    // Profiles
    '/api/mololink/profile': {
      get: {
        summary: 'Get current user profile',
        description: 'Retrieve the authenticated user\'s Mololink profile.',
        tags: ['Mololink Network'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MololinkProfile' }
              }
            }
          },
          401: {
            description: 'Unauthorized'
          }
        }
      },
      put: {
        summary: 'Update profile',
        description: 'Update the authenticated user\'s profile.',
        tags: ['Mololink Network'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateMololinkProfile' }
            }
          }
        },
        responses: {
          200: {
            description: 'Profile updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MololinkProfile' }
              }
            }
          }
        }
      }
    },

    '/api/mololink/profile/{userId}': {
      get: {
        summary: 'Get profile by user ID',
        description: 'Retrieve a public Mololink profile by user ID.',
        tags: ['Mololink Network'],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'User ID'
          }
        ],
        responses: {
          200: {
            description: 'User profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MololinkProfile' }
              }
            }
          },
          404: {
            description: 'Profile not found'
          }
        }
      }
    },

    // Search
    '/api/mololink/search': {
      get: {
        summary: 'Search Mololink',
        description: 'Search across companies, profiles, and marketplace listings. Publicly accessible.',
        tags: ['Mololink Search'],
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Search query'
          },
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string', enum: ['all', 'companies', 'profiles', 'listings'], default: 'all' },
            description: 'Filter by entity type'
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Page number'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, maximum: 100 },
            description: 'Items per page'
          }
        ],
        responses: {
          200: {
            description: 'Search results',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MololinkSearchResult' },
                examples: {
                  success: {
                    value: {
                      companies: [
                        { id: 1, name: "Global Logistics Corp", industry: "Logistics" }
                      ],
                      profiles: [
                        { id: 1, firstName: "John", lastName: "Doe", headline: "Logistics Manager" }
                      ],
                      listings: [
                        { id: 1, title: "Industrial Forklift", price: "15000.00" }
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      }
    },

    // Connections
    '/api/mololink/connections': {
      get: {
        summary: 'Get connections',
        description: 'Get the authenticated user\'s network connections.',
        tags: ['Mololink Network'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'List of connections',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/MololinkConnection' }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Send connection request',
        description: 'Send a connection request to another user.',
        tags: ['Mololink Network'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['targetProfileId'],
                properties: {
                  targetProfileId: { type: 'integer', description: 'Profile ID to connect with' },
                  message: { type: 'string', description: 'Optional connection message' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Connection request sent'
          }
        }
      }
    }
  },
  
  components: {
    ...(openApiSpec as any).components,
    schemas: {
      ...(openApiSpec as any).components?.schemas,
      
      Shipment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          trackingNumber: { type: 'string' },
          origin: { type: 'string' },
          destination: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'in_transit', 'delivered', 'delayed'] },
          carrier: { type: 'string' },
          customerId: { type: 'string' },
          serviceType: { type: 'string' },
          contents: { type: 'string' },
          weight: { type: 'number' },
          dimensions: {
            type: 'object',
            properties: {
              length: { type: 'number' },
              width: { type: 'number' },
              height: { type: 'number' }
            }
          },
          estimatedDelivery: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      
      CreateShipment: {
        type: 'object',
        required: ['origin', 'destination', 'customerId', 'serviceType'],
        properties: {
          origin: { type: 'string' },
          destination: { type: 'string' },
          customerId: { type: 'string' },
          serviceType: { type: 'string' },
          contents: { type: 'string' },
          weight: { type: 'number' },
          dimensions: {
            type: 'object',
            properties: {
              length: { type: 'number' },
              width: { type: 'number' },
              height: { type: 'number' }
            }
          }
        }
      },
      
      TrackingData: {
        type: 'object',
        properties: {
          trackingNumber: { type: 'string' },
          status: { type: 'string' },
          currentLocation: {
            type: 'object',
            properties: {
              lat: { type: 'number' },
              lng: { type: 'number' },
              address: { type: 'string' }
            }
          },
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                timestamp: { type: 'string', format: 'date-time' },
                location: { type: 'string' },
                status: { type: 'string' },
                description: { type: 'string' }
              }
            }
          },
          estimatedDelivery: { type: 'string', format: 'date-time' }
        }
      },
      
      Service: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          serviceType: { type: 'string' },
          category: { type: 'string' },
          regions: {
            type: 'array',
            items: { type: 'string' }
          },
          estimatedTime: { type: 'string' },
          basePrice: { type: 'number' }
        }
      },
      
      CollaborationSession: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['active', 'paused', 'completed'] },
          participants: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                userId: { type: 'string' },
                role: { type: 'string' },
                joinedAt: { type: 'string', format: 'date-time' }
              }
            }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          pages: { type: 'integer' }
        }
      },
      
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          code: { type: 'integer' },
          details: { type: 'object' }
        }
      },

      // ===========================================
      // MOLOLINK MARKETPLACE SCHEMAS
      // ===========================================

      MarketplaceListing: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'string', description: 'Price as decimal string' },
          currency: { type: 'string', default: 'USD' },
          category: { type: 'string' },
          status: { type: 'string', enum: ['active', 'sold', 'expired', 'draft'] },
          sellerId: { type: 'integer' },
          images: { type: 'array', items: { type: 'string' } },
          location: { type: 'string' },
          contactEmail: { type: 'string' },
          contactPhone: { type: 'string' },
          viewCount: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },

      CreateMarketplaceListing: {
        type: 'object',
        required: ['title', 'description', 'price', 'category'],
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 200 },
          description: { type: 'string', minLength: 10 },
          price: { type: 'string', description: 'Price as decimal string' },
          currency: { type: 'string', default: 'USD' },
          category: { type: 'string' },
          images: { type: 'array', items: { type: 'string' } },
          location: { type: 'string' },
          contactEmail: { type: 'string' },
          contactPhone: { type: 'string' }
        }
      },

      MarketplaceAuction: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string' },
          startingPrice: { type: 'string', description: 'Starting price as decimal' },
          currentBid: { type: 'string', description: 'Current highest bid' },
          reservePrice: { type: 'string', description: 'Reserve price (minimum to sell)' },
          currency: { type: 'string', default: 'USD' },
          category: { type: 'string' },
          status: { type: 'string', enum: ['active', 'ended', 'cancelled', 'reserve_not_met'] },
          sellerId: { type: 'integer' },
          images: { type: 'array', items: { type: 'string' } },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
          bidCount: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },

      CreateMarketplaceAuction: {
        type: 'object',
        required: ['title', 'description', 'startingPrice', 'category', 'endTime'],
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 200 },
          description: { type: 'string', minLength: 10 },
          startingPrice: { type: 'string' },
          reservePrice: { type: 'string' },
          currency: { type: 'string', default: 'USD' },
          category: { type: 'string' },
          images: { type: 'array', items: { type: 'string' } },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' }
        }
      },

      MarketplaceBid: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          auctionId: { type: 'integer' },
          bidderId: { type: 'integer' },
          amount: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },

      // ===========================================
      // MOLOLINK NETWORK SCHEMAS
      // ===========================================

      MololinkCompany: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          industry: { type: 'string' },
          description: { type: 'string' },
          website: { type: 'string' },
          location: { type: 'string' },
          employeeCount: { type: 'integer' },
          logo: { type: 'string' },
          coverImage: { type: 'string' },
          foundedYear: { type: 'integer' },
          verified: { type: 'boolean' },
          ownerId: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },

      CreateMololinkCompany: {
        type: 'object',
        required: ['name', 'industry'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 200 },
          industry: { type: 'string' },
          description: { type: 'string' },
          website: { type: 'string' },
          location: { type: 'string' },
          employeeCount: { type: 'integer' },
          logo: { type: 'string' },
          foundedYear: { type: 'integer' }
        }
      },

      MololinkProfile: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userId: { type: 'integer' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          headline: { type: 'string' },
          summary: { type: 'string' },
          location: { type: 'string' },
          profilePicture: { type: 'string' },
          coverImage: { type: 'string' },
          website: { type: 'string' },
          linkedinUrl: { type: 'string' },
          connectionCount: { type: 'integer' },
          skills: {
            type: 'array',
            items: { $ref: '#/components/schemas/MololinkSkill' }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },

      UpdateMololinkProfile: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          headline: { type: 'string', maxLength: 200 },
          summary: { type: 'string' },
          location: { type: 'string' },
          profilePicture: { type: 'string' },
          coverImage: { type: 'string' },
          website: { type: 'string' },
          linkedinUrl: { type: 'string' }
        }
      },

      MololinkPost: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          profileId: { type: 'integer' },
          content: { type: 'string' },
          images: { type: 'array', items: { type: 'string' } },
          likesCount: { type: 'integer' },
          commentsCount: { type: 'integer' },
          sharesCount: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },

      CreateMololinkPost: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 5000 },
          images: { type: 'array', items: { type: 'string' } }
        }
      },

      MololinkSkill: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          profileId: { type: 'integer' },
          name: { type: 'string' },
          endorsementCount: { type: 'integer' }
        }
      },

      MololinkConnection: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          requesterId: { type: 'integer' },
          targetId: { type: 'integer' },
          status: { type: 'string', enum: ['pending', 'accepted', 'rejected'] },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },

      MololinkSearchResult: {
        type: 'object',
        properties: {
          companies: {
            type: 'array',
            items: { $ref: '#/components/schemas/MololinkCompany' }
          },
          profiles: {
            type: 'array',
            items: { $ref: '#/components/schemas/MololinkProfile' }
          },
          listings: {
            type: 'array',
            items: { $ref: '#/components/schemas/MarketplaceListing' }
          }
        }
      }
    },
    
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      },
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key'
      }
    }
  },
  
  security: [
    { BearerAuth: [] },
    { ApiKeyAuth: [] }
  ]
};

// Serve Swagger UI - Protected in production
router.use('/docs', requireDocsAccess, swaggerUi.serve);
router.get('/docs', requireDocsAccess, swaggerUi.setup(enhancedSpec, {
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #2563eb; }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; }
  `,
  customSiteTitle: 'MOLOCHAIN API Documentation',
  customfavIcon: '/molochain-logo.png'
}));

// API specification endpoint - Protected in production
router.get('/openapi.json', requireDocsAccess, (req, res) => {
  res.json(enhancedSpec);
});

// Generate Postman collection - Protected in production
router.get('/postman-collection', requireDocsAccess, (req, res) => {
  const postmanCollection = {
    info: {
      name: 'MOLOCHAIN Logistics API',
      description: 'Complete API collection for MOLOCHAIN platform',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    variable: [
      {
        key: 'baseUrl',
        value: 'http://localhost:5000',
        type: 'string'
      },
      {
        key: 'authToken',
        value: 'your-auth-token-here',
        type: 'string'
      }
    ],
    auth: {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: '{{authToken}}',
          type: 'string'
        }
      ]
    },
    item: [
      {
        name: 'Authentication',
        item: [
          {
            name: 'Login',
            request: {
              method: 'POST',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json'
                }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  email: 'user@example.com',
                  password: 'password123'
                })
              },
              url: {
                raw: '{{baseUrl}}/api/auth/login',
                host: ['{{baseUrl}}'],
                path: ['api', 'auth', 'login']
              }
            }
          }
        ]
      },
      {
        name: 'Shipments',
        item: [
          {
            name: 'List Shipments',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/shipments?page=1&limit=20',
                host: ['{{baseUrl}}'],
                path: ['api', 'shipments'],
                query: [
                  { key: 'page', value: '1' },
                  { key: 'limit', value: '20' }
                ]
              }
            }
          },
          {
            name: 'Create Shipment',
            request: {
              method: 'POST',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json'
                }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  origin: 'New York, NY',
                  destination: 'Los Angeles, CA',
                  customerId: 'cust_001',
                  serviceType: 'OCE-FCL',
                  contents: 'Electronics',
                  weight: 1500
                })
              },
              url: {
                raw: '{{baseUrl}}/api/shipments',
                host: ['{{baseUrl}}'],
                path: ['api', 'shipments']
              }
            }
          }
        ]
      },
      {
        name: 'Mololink Marketplace',
        description: 'Marketplace listings, auctions, and bidding APIs',
        item: [
          {
            name: 'Get Listings',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/mololink/marketplace/listings?page=1&limit=20',
                host: ['{{baseUrl}}'],
                path: ['api', 'mololink', 'marketplace', 'listings'],
                query: [
                  { key: 'page', value: '1' },
                  { key: 'limit', value: '20' }
                ]
              }
            }
          },
          {
            name: 'Get Auctions',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/mololink/marketplace/auctions?page=1&limit=20',
                host: ['{{baseUrl}}'],
                path: ['api', 'mololink', 'marketplace', 'auctions'],
                query: [
                  { key: 'page', value: '1' },
                  { key: 'limit', value: '20' }
                ]
              }
            }
          },
          {
            name: 'Create Listing',
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  title: 'Industrial Equipment',
                  description: 'High-quality industrial equipment for sale',
                  price: '5000.00',
                  currency: 'USD',
                  category: 'equipment',
                  location: 'Singapore'
                })
              },
              url: {
                raw: '{{baseUrl}}/api/mololink/marketplace/listings',
                host: ['{{baseUrl}}'],
                path: ['api', 'mololink', 'marketplace', 'listings']
              }
            }
          },
          {
            name: 'Place Bid',
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({ amount: '1500.00' })
              },
              url: {
                raw: '{{baseUrl}}/api/mololink/marketplace/auctions/1/bid',
                host: ['{{baseUrl}}'],
                path: ['api', 'mololink', 'marketplace', 'auctions', '1', 'bid']
              }
            }
          }
        ]
      },
      {
        name: 'Mololink Network',
        description: 'Professional network APIs for companies, profiles, posts, and connections',
        item: [
          {
            name: 'Get Companies',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/mololink/companies?page=1&limit=20',
                host: ['{{baseUrl}}'],
                path: ['api', 'mololink', 'companies'],
                query: [
                  { key: 'page', value: '1' },
                  { key: 'limit', value: '20' }
                ]
              }
            }
          },
          {
            name: 'Get Posts Feed',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/mololink/posts?page=1&limit=20',
                host: ['{{baseUrl}}'],
                path: ['api', 'mololink', 'posts'],
                query: [
                  { key: 'page', value: '1' },
                  { key: 'limit', value: '20' }
                ]
              }
            }
          },
          {
            name: 'Search Mololink',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/mololink/search?q=logistics&type=all',
                host: ['{{baseUrl}}'],
                path: ['api', 'mololink', 'search'],
                query: [
                  { key: 'q', value: 'logistics' },
                  { key: 'type', value: 'all' }
                ]
              }
            }
          },
          {
            name: 'Get My Profile',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/mololink/profile',
                host: ['{{baseUrl}}'],
                path: ['api', 'mololink', 'profile']
              }
            }
          },
          {
            name: 'Create Post',
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  content: 'Excited to share our latest logistics innovations!'
                })
              },
              url: {
                raw: '{{baseUrl}}/api/mololink/posts',
                host: ['{{baseUrl}}'],
                path: ['api', 'mololink', 'posts']
              }
            }
          },
          {
            name: 'Send Connection Request',
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  targetProfileId: 1,
                  message: 'I would like to connect with you!'
                })
              },
              url: {
                raw: '{{baseUrl}}/api/mololink/connections',
                host: ['{{baseUrl}}'],
                path: ['api', 'mololink', 'connections']
              }
            }
          }
        ]
      }
    ]
  };
  
  res.json(postmanCollection);
});

export default router;