import { Router } from 'express';
import { logger } from '../utils/logger';
import { isAuthenticated } from '../core/auth/auth.service';

const router = Router();

// Agent statuses data - same as in WebSocket service
const agentStatuses = [
  {
    id: "agent-1",
    name: "Mehmet Yilmaz",
    email: "myilmaz@molochain.com",
    country: "Turkey",
    role: "Regional Director",
    status: "online",
    lastActive: new Date(),
    connectionQuality: "95",
    networkAvailability: "98",
    responseTime: "120",
    lastUpdated: new Date(),
    region: "Middle East",
    specialty: ["Bulk Shipping", "Container Tracking"]
  },
  {
    id: "agent-2",
    name: "Ahmed Al-Maktoum",
    email: "aalmaktoum@molochain.com",
    country: "United Arab Emirates",
    role: "Regional Manager",
    status: "busy",
    lastActive: new Date(),
    connectionQuality: "87",
    networkAvailability: "92",
    responseTime: "180",
    lastUpdated: new Date(),
    region: "Middle East",
    specialty: ["Logistics Planning", "Route Optimization"]
  },
  {
    id: "agent-3",
    name: "James Wilson",
    email: "jwilson@molochain.com",
    country: "United Kingdom",
    role: "Regional Director",
    status: "offline",
    lastActive: new Date(Date.now() - 3600000),
    connectionQuality: "0",
    networkAvailability: "0",
    responseTime: "0",
    lastUpdated: new Date(Date.now() - 3600000),
    region: "Europe",
    specialty: ["International Shipping", "Customs Clearance"]
  }
];

// Simulate status changes
setInterval(() => {
  const statuses = ['online', 'busy', 'offline'];
  const randomAgentIndex = Math.floor(Math.random() * agentStatuses.length);
  const randomStatusIndex = Math.floor(Math.random() * statuses.length);
  const newStatus = statuses[randomStatusIndex];
  
  agentStatuses[randomAgentIndex].status = newStatus;
  agentStatuses[randomAgentIndex].lastActive = new Date();
  agentStatuses[randomAgentIndex].lastUpdated = new Date();
  
  if (newStatus === 'online') {
    agentStatuses[randomAgentIndex].connectionQuality = String(85 + Math.floor(Math.random() * 15));
    agentStatuses[randomAgentIndex].networkAvailability = String(90 + Math.floor(Math.random() * 10));
    agentStatuses[randomAgentIndex].responseTime = String(100 + Math.floor(Math.random() * 150));
  } else if (newStatus === 'busy') {
    agentStatuses[randomAgentIndex].connectionQuality = String(70 + Math.floor(Math.random() * 15));
    agentStatuses[randomAgentIndex].networkAvailability = String(75 + Math.floor(Math.random() * 15));
    agentStatuses[randomAgentIndex].responseTime = String(250 + Math.floor(Math.random() * 150));
  } else {
    agentStatuses[randomAgentIndex].connectionQuality = "0";
    agentStatuses[randomAgentIndex].networkAvailability = "0";
    agentStatuses[randomAgentIndex].responseTime = "0";
  }
}, 20000);

// GET /api/contact/agents - Get current agent statuses (public endpoint for contact page)
router.get('/agents', (req, res) => {
  try {
    const formattedStatuses = agentStatuses.map(agent => ({
      ...agent,
      lastActive: agent.lastActive instanceof Date ? agent.lastActive.toISOString() : agent.lastActive,
      lastUpdated: agent.lastUpdated instanceof Date ? agent.lastUpdated.toISOString() : agent.lastUpdated
    }));
    
    logger.debug(`Served agent statuses via HTTP (${agentStatuses.length} agents)`);
    
    res.json({
      success: true,
      data: formattedStatuses,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error serving agent statuses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve agent statuses'
    });
  }
});

// POST /api/contact/submit - Submit contact form
router.post('/submit', async (req, res) => {
  try {
    const { insertContactSubmissionSchema, contactSubmissions } = await import('../../shared/schema');
    const { db } = await import('../db');
    const { emailService } = await import('../services/email.service');
    
    const validatedData = insertContactSubmissionSchema.parse(req.body) as {
      name: string;
      email: string;
      subject?: string | null;
      message: string;
      formTypeId?: number | null;
      status?: string | null;
    };
    
    const [submission] = await db.insert(contactSubmissions).values({
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject || null,
      message: validatedData.message,
      status: 'pending',
      formTypeId: 1, // Contact form type ID
    }).returning();
    
    logger.info(`Contact form submission received from ${validatedData.email}`);
    
    // Send email notification (non-blocking)
    emailService.notifyFormSubmission('contact', {
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject || 'No subject',
      message: validatedData.message,
    }).catch(err => {
      logger.warn('Failed to send contact form notification email:', err);
    });
    
    res.status(201).json({
      success: true,
      message: 'Your message has been received. We will get back to you soon!',
      data: { id: submission.id }
    });
  } catch (error) {
    logger.error('Error processing contact form submission:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid form data. Please check your inputs and try again.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to submit your message. Please try again later.'
    });
  }
});

export { router as contactAgentsRouter };