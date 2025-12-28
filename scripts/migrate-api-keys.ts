import { db } from '../server/db';
import { emailApiKeys } from '../shared/schema';
import { eq, isNull, isNotNull, and } from 'drizzle-orm';
import { hashApiKey } from '../server/utils/api-key.utils';

async function migrateApiKeys() {
  console.log('Starting API key migration to SHA-256 hashes...\n');

  try {
    const keysToMigrate = await db
      .select()
      .from(emailApiKeys)
      .where(and(
        isNotNull(emailApiKeys.apiKey),
        isNull(emailApiKeys.keyHash)
      ));

    if (keysToMigrate.length === 0) {
      console.log('No plaintext API keys found. All keys are already hashed or no keys exist.');
      return;
    }

    console.log(`Found ${keysToMigrate.length} API key(s) to migrate.\n`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const keyRecord of keysToMigrate) {
      try {
        if (!keyRecord.apiKey) {
          console.log(`Skipping key ID ${keyRecord.id} - no plaintext key found`);
          continue;
        }

        const keyHash = hashApiKey(keyRecord.apiKey);

        await db
          .update(emailApiKeys)
          .set({ 
            keyHash,
            apiKey: null 
          })
          .where(eq(emailApiKeys.id, keyRecord.id));

        console.log(`✓ Migrated key ID ${keyRecord.id} (subdomain: ${keyRecord.subdomain})`);
        migratedCount++;
      } catch (error) {
        console.error(`✗ Failed to migrate key ID ${keyRecord.id}:`, error);
        errorCount++;
      }
    }

    console.log('\n--- Migration Summary ---');
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Failed: ${errorCount}`);
    console.log(`Total processed: ${keysToMigrate.length}`);

    if (errorCount > 0) {
      console.log('\n⚠️  Some keys failed to migrate. Please review the errors above.');
      process.exit(1);
    }

    console.log('\n✓ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

async function reportPlaintextKeys() {
  console.log('Checking for remaining plaintext API keys...\n');

  try {
    const plaintextKeys = await db
      .select({
        id: emailApiKeys.id,
        subdomain: emailApiKeys.subdomain,
        hasPlaintext: emailApiKeys.apiKey,
        hasHash: emailApiKeys.keyHash,
        isActive: emailApiKeys.isActive,
        lastUsedAt: emailApiKeys.lastUsedAt,
      })
      .from(emailApiKeys)
      .where(isNotNull(emailApiKeys.apiKey));

    if (plaintextKeys.length === 0) {
      console.log('✓ No plaintext API keys found. All keys are secure.');
      return;
    }

    console.log(`⚠️  Found ${plaintextKeys.length} API key(s) with plaintext storage:\n`);
    
    for (const key of plaintextKeys) {
      console.log(`  ID: ${key.id}`);
      console.log(`  Subdomain: ${key.subdomain}`);
      console.log(`  Has Hash: ${key.hasHash ? 'Yes' : 'No'}`);
      console.log(`  Active: ${key.isActive ? 'Yes' : 'No'}`);
      console.log(`  Last Used: ${key.lastUsedAt || 'Never'}`);
      console.log('');
    }

    console.log('Run this script with --migrate to convert these keys to secure hashes.');
  } catch (error) {
    console.error('Report failed:', error);
    process.exit(1);
  }
}

const args = process.argv.slice(2);

if (args.includes('--migrate')) {
  migrateApiKeys()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else if (args.includes('--report')) {
  reportPlaintextKeys()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else {
  console.log('API Key Migration Script');
  console.log('========================\n');
  console.log('Usage:');
  console.log('  npx tsx scripts/migrate-api-keys.ts --report   Check for plaintext keys');
  console.log('  npx tsx scripts/migrate-api-keys.ts --migrate  Migrate plaintext keys to hashes');
  console.log('');
  process.exit(0);
}
