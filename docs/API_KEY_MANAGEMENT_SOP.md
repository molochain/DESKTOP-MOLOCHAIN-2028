# API Key Management Standard Operating Procedure (SOP)

## Overview

This document outlines the procedures for managing cross-subdomain email API keys for the Molochain platform ecosystem, including OTMS (opt.molochain.com), Mololink (mololink.molochain.com), and CMS (cms.molochain.com).

## Security Classification: CONFIDENTIAL

---

## 1. API Key Lifecycle

### 1.1 Key Generation

API keys are generated with the following format:
- **Prefix**: `molo_`
- **Random Part**: 64 hexadecimal characters (32 bytes)
- **Storage**: SHA-256 hash (64 characters)

Example format: `molo_[64 hexadecimal characters]`

### 1.2 Key Storage

- **Database**: Only the SHA-256 hash is stored in `email_api_keys.key_hash`
- **Plaintext**: Displayed ONCE during generation; never retrievable afterward
- **Secure Distribution**: Via encrypted channels or one-time secret links

---

## 2. Key Generation Procedure

### 2.1 Via Admin Panel (Recommended)

1. Login to `https://admin.molochain.com`
2. Navigate to **Communications Hub** > **API Keys**
3. Click **Create New API Key**
4. Enter:
   - Subdomain (e.g., `opt`, `mololink`)
   - Description (e.g., "OTMS Platform - Production")
5. Click **Generate**
6. **IMMEDIATELY** copy the displayed key
7. Store in password manager

### 2.2 Via Command Line (Emergency)

```bash
# SSH to production server
ssh root@31.186.24.19

# Generate key with Node.js
node -e "
const crypto = require('crypto');
const plain = 'molo_' + crypto.randomBytes(32).toString('hex');
const hash = crypto.createHash('sha256').update(plain).digest('hex');
console.log('PLAIN:', plain);
console.log('HASH:', hash);
"

# Insert into database
PGPASSWORD='[PASSWORD]' psql -h localhost -U molochain -d molochain_db -c "
INSERT INTO email_api_keys (subdomain, key_hash, description, is_active, created_at)
VALUES ('[SUBDOMAIN]', '[HASH]', '[DESCRIPTION]', true, NOW());
"
```

---

## 3. Key Distribution Procedure

### 3.1 Secure Distribution Methods (Ranked by Preference)

1. **Enterprise Password Manager** (Bitwarden, 1Password)
   - Share via secure vault
   - Grant read-only access to integration team lead

2. **One-Time Secret Links**
   - Use https://onetimesecret.com or similar
   - Set 24-hour expiration
   - Require passphrase

3. **PGP-Encrypted Email**
   - Obtain recipient's public key
   - Encrypt key data
   - Send via email

4. **In-Person Transfer** (Highest Security)
   - Display key on screen
   - Allow recipient to copy
   - Verify acknowledgment

### 3.2 Distribution Checklist

- [ ] Verify recipient identity and authorization
- [ ] Confirm secure communication channel
- [ ] Transfer API key via chosen method
- [ ] Obtain written acknowledgment from recipient
- [ ] Log distribution in admin audit log
- [ ] Set reminder for 90-day rotation

---

## 4. Key Rotation Procedure

### 4.1 Scheduled Rotation (Every 90 Days)

1. Generate new API key for subdomain
2. Notify integration team 7 days before switch
3. Integration team updates environment variables
4. Verify new key works in staging
5. Activate new key in production
6. Deactivate old key after 24-hour grace period
7. Delete old key from database

### 4.2 Emergency Rotation (Key Compromise)

1. **Immediately** deactivate compromised key:
   ```sql
   UPDATE email_api_keys SET is_active = false WHERE subdomain = '[SUBDOMAIN]';
   ```
2. Generate new key
3. Notify integration team via emergency channel
4. Monitor logs for unauthorized usage
5. Conduct incident review

---

## 5. Monitoring and Auditing

### 5.1 Daily Monitoring

- Check `email_logs` for unusual patterns
- Review rate limit alerts
- Monitor failed authentication attempts

### 5.2 Weekly Audit

- Review API key usage by subdomain
- Check for inactive keys
- Verify all active keys have valid descriptions

### 5.3 Audit Queries

```sql
-- List all API keys with last usage
SELECT id, subdomain, description, is_active, 
       created_at, last_used_at
FROM email_api_keys ORDER BY subdomain;

-- Check for suspicious activity (high volume)
SELECT subdomain, COUNT(*) as email_count, DATE(created_at) as date
FROM email_logs
GROUP BY subdomain, DATE(created_at)
ORDER BY email_count DESC;

-- Find unused keys (no usage in 30 days)
SELECT * FROM email_api_keys 
WHERE last_used_at < NOW() - INTERVAL '30 days'
   OR last_used_at IS NULL;
```

---

## 6. Integration Team Onboarding

### 6.1 Prerequisites

- [ ] Integration team lead identified
- [ ] Secure communication channel established
- [ ] Environment (staging/production) prepared
- [ ] Documentation reviewed

### 6.2 Onboarding Checklist

1. **Day 1: Key Distribution**
   - Generate API key for subdomain
   - Distribute via secure method
   - Share documentation links

2. **Day 2-3: Integration**
   - Team implements API calls
   - Test in staging environment
   - Review code for security

3. **Day 4-5: Validation**
   - Conduct end-to-end test
   - Verify rate limit compliance
   - Confirm error handling

4. **Day 6-7: Production**
   - Deploy to production
   - Monitor first 24 hours
   - Provide support as needed

### 6.3 Documentation to Share

- `docs/INTEGRATION_QUICKSTART.md` - Quick start guide
- `docs/CROSS_SUBDOMAIN_EMAIL_INTEGRATION.md` - Full integration docs
- `docs/EMAIL_NOTIFICATION_GUIDE.md` - Admin guide

---

## 7. Troubleshooting

### 7.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid/missing API key | Verify key in X-API-Key header |
| 401 Unauthorized | Key deactivated | Check is_active in database |
| 403 Forbidden | Wrong subdomain | Match X-Subdomain header to key |
| 429 Too Many Requests | Rate limit exceeded | Wait for rate limit window reset |

### 7.2 Verification Commands

```bash
# Test API key validity
curl -s 'https://molochain.com/api/email/form-types' \
  -H 'X-API-Key: [YOUR_KEY]' \
  -H 'X-Subdomain: [YOUR_SUBDOMAIN]'

# Check email API health
curl -s 'https://molochain.com/api/email/health'
```

---

## 8. Contact Information

| Role | Contact |
|------|---------|
| Platform Administrator | admin@molochain.com |
| Technical Support | support@molochain.com |
| Emergency Contact | [Platform Admin Phone] |

---

## 9. Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-12-21 | 1.0 | Initial SOP creation | Platform Admin |

---

## Appendix A: API Key Registry

API keys are managed in the production database. To view current keys:

1. **Via Admin Panel:**
   - Login to `https://admin.molochain.com`
   - Navigate to **Communications Hub** > **API Keys**
   - View masked key list with status

2. **Via Database Query:**
   ```sql
   SELECT id, subdomain, description, is_active, created_at::date
   FROM email_api_keys ORDER BY id;
   ```

**Note:** Raw API keys are never stored or displayed in documentation for security reasons.

---

## Appendix B: Form Types for Integration

| ID | Slug | Available To | Description |
|----|------|--------------|-------------|
| 12 | booking-confirmation | opt | Booking confirmations |
| 13 | bid-notification | opt, mololink | Bid notifications |
| 14 | tracking-alert | opt | Shipment tracking alerts |
| 15 | order-status | opt | Order status updates |
| 16 | auction-result | opt, mololink | Auction results |
| 17 | document-request | opt | Document requests |
| 18 | system-alert | opt, mololink, cms | System alerts |
