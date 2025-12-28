import { Router, Request, Response } from 'express';
import { db } from '../db';
import { jobs, jobServiceCategoryMappings, type Job } from '@shared/schema';
import { eq, and, desc, or, ilike } from 'drizzle-orm';
import { logger } from '../utils/logger';

const router = Router();

const serviceToJobCategoryMap: Record<string, string[]> = {
  'logistics': ['logistics', 'supply-chain', 'operations'],
  'supply-chain': ['logistics', 'supply-chain', 'operations'],
  'warehousing': ['warehouse', 'inventory', 'distribution'],
  'distribution': ['warehouse', 'logistics', 'distribution'],
  'trucking': ['transport', 'logistics'],
  'shipping': ['transport', 'freight', 'shipping'],
  'ocean-freight': ['freight', 'shipping'],
  'air-freight': ['freight', 'air-freight', 'logistics'],
  'rail-freight': ['transport', 'rail', 'logistics'],
  'customs-clearance': ['customs', 'compliance', 'documentation'],
  'documentation': ['customs', 'documentation', 'compliance'],
  'container': ['freight', 'container', 'shipping'],
  'groupage': ['freight', 'logistics'],
  'blockchain': ['technology', 'it', 'digital'],
  'trading': ['finance', 'trading', 'sales'],
  'chartering': ['freight', 'shipping', 'management'],
  'project-cargo': ['management', 'logistics', 'freight'],
  'consultation': ['management', 'consulting', 'sales'],
  'finance': ['finance', 'trading'],
  'e-commerce': ['logistics', 'technology', 'customer-service'],
  'drop-shipping': ['logistics', 'warehouse', 'e-commerce'],
  'transit': ['transport', 'logistics', 'customs'],
  'transshipment': ['freight', 'logistics', 'shipping'],
  'port-services': ['freight', 'shipping', 'logistics'],
  'bulk-cargo': ['freight', 'shipping', 'logistics'],
  'special-transport': ['transport', 'logistics', 'management'],
  'insurance': ['finance', 'compliance'],
  '3pl': ['logistics', 'warehouse', 'transport'],
};

const sampleJobs: Partial<Job>[] = [
  {
    title: 'Logistics Coordinator',
    description: 'Coordinate logistics operations and ensure timely delivery of goods.',
    location: 'Istanbul, Turkey',
    type: 'full-time',
    department: 'Operations',
    category: 'logistics',
    requirements: ['3+ years experience in logistics', 'Strong communication skills', 'Knowledge of supply chain management'],
    benefits: ['Health insurance', 'Annual bonus', 'Remote work options'],
    salaryRange: '$45,000 - $60,000',
    experienceLevel: 'mid',
    isRemote: false,
    isActive: true,
  },
  {
    title: 'Warehouse Manager',
    description: 'Oversee warehouse operations and manage inventory systems.',
    location: 'Dubai, UAE',
    type: 'full-time',
    department: 'Warehouse',
    category: 'warehouse',
    requirements: ['5+ years warehouse management experience', 'WMS experience', 'Leadership skills'],
    benefits: ['Competitive salary', 'Housing allowance', 'Annual leave'],
    salaryRange: '$55,000 - $75,000',
    experienceLevel: 'senior',
    isRemote: false,
    isActive: true,
  },
  {
    title: 'Customs Specialist',
    description: 'Handle customs documentation and ensure compliance with regulations.',
    location: 'Rotterdam, Netherlands',
    type: 'full-time',
    department: 'Customs',
    category: 'customs',
    requirements: ['Customs certification', 'Knowledge of international trade', '2+ years experience'],
    benefits: ['Training programs', 'Career development', 'Performance bonus'],
    salaryRange: '$40,000 - $55,000',
    experienceLevel: 'mid',
    isRemote: false,
    isActive: true,
  },
  {
    title: 'Freight Forwarder',
    description: 'Manage freight forwarding operations for international shipments.',
    location: 'Singapore',
    type: 'full-time',
    department: 'Freight',
    category: 'freight',
    requirements: ['Experience in freight forwarding', 'Knowledge of INCOTERMS', 'Strong negotiation skills'],
    benefits: ['Travel opportunities', 'Commission structure', 'Health benefits'],
    salaryRange: '$50,000 - $70,000',
    experienceLevel: 'mid',
    isRemote: false,
    isActive: true,
  },
  {
    title: 'Supply Chain Analyst',
    description: 'Analyze supply chain data to optimize operations and reduce costs.',
    location: 'London, UK',
    type: 'full-time',
    department: 'Analytics',
    category: 'supply-chain',
    requirements: ['Data analysis skills', 'Supply chain knowledge', 'Proficiency in Excel and BI tools'],
    benefits: ['Flexible hours', 'Learning budget', 'Stock options'],
    salaryRange: '$55,000 - $75,000',
    experienceLevel: 'mid',
    isRemote: true,
    isActive: true,
  },
  {
    title: 'Transport Coordinator',
    description: 'Coordinate transport operations and manage fleet scheduling.',
    location: 'Tehran, Iran',
    type: 'full-time',
    department: 'Transport',
    category: 'transport',
    requirements: ['Transport industry experience', 'Route planning skills', 'Driver management experience'],
    benefits: ['Company vehicle', 'Performance bonus', 'Health insurance'],
    salaryRange: '$35,000 - $50,000',
    experienceLevel: 'entry',
    isRemote: false,
    isActive: true,
  },
  {
    title: 'Blockchain Developer',
    description: 'Develop and maintain blockchain solutions for supply chain tracking.',
    location: 'Remote',
    type: 'full-time',
    department: 'Technology',
    category: 'technology',
    requirements: ['Solidity experience', 'Smart contract development', 'Web3 knowledge'],
    benefits: ['Fully remote', 'Token compensation', 'Flexible hours'],
    salaryRange: '$80,000 - $120,000',
    experienceLevel: 'senior',
    isRemote: true,
    isActive: true,
  },
  {
    title: 'Sales Representative',
    description: 'Develop new business and manage client relationships in logistics sector.',
    location: 'New York, USA',
    type: 'full-time',
    department: 'Sales',
    category: 'sales',
    requirements: ['B2B sales experience', 'Logistics industry knowledge', 'CRM proficiency'],
    benefits: ['Commission structure', 'Travel budget', 'Health benefits'],
    salaryRange: '$60,000 - $90,000 + commission',
    experienceLevel: 'mid',
    isRemote: false,
    isActive: true,
  },
];

router.get('/', async (_req: Request, res: Response) => {
  try {
    let jobsList: Job[];
    
    try {
      jobsList = await db
        .select()
        .from(jobs)
        .where(eq(jobs.isActive, true))
        .orderBy(desc(jobs.createdAt));
    } catch {
      jobsList = sampleJobs.map((job, index) => ({
        id: index + 1,
        title: job.title || '',
        description: job.description || '',
        location: job.location || '',
        type: job.type || 'full-time',
        department: job.department || null,
        category: job.category || 'logistics',
        requirements: job.requirements || null,
        benefits: job.benefits || null,
        salaryRange: job.salaryRange || null,
        experienceLevel: job.experienceLevel || null,
        isRemote: job.isRemote || false,
        isActive: true,
        applicationDeadline: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }

    res.json(jobsList);
  } catch (error) {
    logger.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

router.get('/by-service/:serviceId', async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;
    
    const jobCategories = serviceToJobCategoryMap[serviceId] || ['logistics'];
    
    let jobsList: Job[];
    
    try {
      const conditions = jobCategories.map(cat => ilike(jobs.category, `%${cat}%`));
      
      jobsList = await db
        .select()
        .from(jobs)
        .where(and(
          eq(jobs.isActive, true),
          or(...conditions)
        ))
        .orderBy(desc(jobs.createdAt))
        .limit(limit);
    } catch {
      jobsList = sampleJobs
        .filter(job => jobCategories.some(cat => 
          job.category?.toLowerCase().includes(cat.toLowerCase())
        ))
        .slice(0, limit)
        .map((job, index) => ({
          id: index + 1,
          title: job.title || '',
          description: job.description || '',
          location: job.location || '',
          type: job.type || 'full-time',
          department: job.department || null,
          category: job.category || 'logistics',
          requirements: job.requirements || null,
          benefits: job.benefits || null,
          salaryRange: job.salaryRange || null,
          experienceLevel: job.experienceLevel || null,
          isRemote: job.isRemote || false,
          isActive: true,
          applicationDeadline: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
    }

    res.json({
      jobs: jobsList,
      serviceId,
      matchedCategories: jobCategories,
      total: jobsList.length,
    });
  } catch (error) {
    logger.error('Error fetching jobs by service:', error);
    res.status(500).json({ error: 'Failed to fetch jobs for service' });
  }
});

router.get('/categories', async (_req: Request, res: Response) => {
  try {
    res.json({
      mappings: serviceToJobCategoryMap,
      availableCategories: Object.keys(jobServiceCategoryMappings),
    });
  } catch (error) {
    logger.error('Error fetching job categories:', error);
    res.status(500).json({ error: 'Failed to fetch job categories' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const jobId = parseInt(req.params.id, 10);
    
    if (isNaN(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    let job: Job | undefined;
    
    try {
      const [foundJob] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, jobId))
        .limit(1);
      job = foundJob;
    } catch {
      const sampleJob = sampleJobs[jobId - 1];
      if (sampleJob) {
        job = {
          id: jobId,
          title: sampleJob.title || '',
          description: sampleJob.description || '',
          location: sampleJob.location || '',
          type: sampleJob.type || 'full-time',
          department: sampleJob.department || null,
          category: sampleJob.category || 'logistics',
          requirements: sampleJob.requirements || null,
          benefits: sampleJob.benefits || null,
          salaryRange: sampleJob.salaryRange || null,
          experienceLevel: sampleJob.experienceLevel || null,
          isRemote: sampleJob.isRemote || false,
          isActive: true,
          applicationDeadline: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    logger.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

export default router;
