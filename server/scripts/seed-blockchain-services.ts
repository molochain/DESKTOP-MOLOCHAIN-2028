import { db } from '../db';
import { services } from '@shared/schema';
import { sql } from 'drizzle-orm';

const blockchainServices = [
  {
    code: 'blockchain-tracking',
    name: 'Blockchain Tracking',
    description: 'End-to-end supply chain tracking with immutable blockchain records for complete transparency and trust',
    category: 'blockchain',
    type: 'core',
    status: 'active',
    features: ['Real-time tracking', 'Immutable records', 'Chain of custody', 'Proof of origin'],
    isActive: true,
  },
  {
    code: 'smart-contracts',
    name: 'Smart Contract Logistics',
    description: 'Automated contract execution for logistics agreements, payments, and compliance verification',
    category: 'blockchain',
    type: 'core',
    status: 'active',
    features: ['Automated payments', 'Contract execution', 'Compliance verification', 'Dispute resolution'],
    isActive: true,
  },
  {
    code: 'document-auth',
    name: 'Document Authentication',
    description: 'Blockchain-based authentication for shipping documents, bills of lading, and certificates of origin',
    category: 'blockchain',
    type: 'core',
    status: 'active',
    features: ['Document verification', 'Anti-fraud protection', 'Digital signatures', 'Audit trail'],
    isActive: true,
  },
  {
    code: 'tokenized-assets',
    name: 'Tokenized Cargo Assets',
    description: 'Tokenization of cargo and shipping assets for fractional ownership and trading',
    category: 'blockchain',
    type: 'premium',
    status: 'active',
    features: ['Asset tokenization', 'Fractional ownership', 'Secondary trading', 'Liquidity pools'],
    isActive: true,
  },
];

async function seedBlockchainServices() {
  console.log('Seeding blockchain services...');
  
  for (const service of blockchainServices) {
    try {
      await db.insert(services).values({
        ...service,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: services.code,
        set: {
          name: service.name,
          description: service.description,
          features: service.features,
          updatedAt: new Date(),
        },
      });
      console.log(`  ✓ ${service.name}`);
    } catch (error) {
      console.error(`  ✗ ${service.name}:`, error);
    }
  }
  
  console.log('Blockchain services seeding complete!');
}

async function ensureGuidesSchema() {
  console.log('Ensuring guides table has is_featured column...');
  try {
    await db.execute(sql`ALTER TABLE guides ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false`);
    console.log('  ✓ is_featured column exists');
  } catch (error) {
    console.log('  ✓ Column already exists or table not ready');
  }
}

async function main() {
  try {
    await ensureGuidesSchema();
    await seedBlockchainServices();
    console.log('\n✅ All seeds completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

main();
