const express = require('express');
const tls = require('tls');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 7002;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

if (!INTERNAL_API_KEY) {
  console.error('FATAL: INTERNAL_API_KEY environment variable is required');
  process.exit(1);
}

const authenticateInternal = (req, res, next) => {
  const apiKey = req.headers['x-internal-api-key'];
  
  if (!apiKey || apiKey !== INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Internal access only' });
  }
  
  next();
};

const DOMAINS_TO_CHECK = [
  { domain: 'admin.molochain.com', label: 'Admin Panel' },
  { domain: 'molochain.com', label: 'Main Website' },
  { domain: 'auth.molochain.com', label: 'Auth Service' },
  { domain: 'cms.molochain.com', label: 'CMS Laravel' },
  { domain: 'api.molochain.com', label: 'API Gateway' },
  { domain: 'opt.molochain.com', label: 'OTMS Service' },
];

function checkSSLCertificate(domain) {
  return new Promise((resolve) => {
    // First, try with TLS verification enabled to check chain validity
    const tlsOptions = {
      host: domain,
      port: 443,
      servername: domain,
      timeout: 10000,
    };

    const socket = tls.connect(tlsOptions, () => {
      const cert = socket.getPeerCertificate(true);
      const authorized = socket.authorized;
      const authError = socket.authorizationError;
      
      socket.end();

      if (cert && cert.valid_to) {
        const validTo = new Date(cert.valid_to);
        const validFrom = new Date(cert.valid_from);
        const now = new Date();
        const daysRemaining = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));
        
        let status;
        if (!authorized) {
          status = 'invalid';
        } else if (daysRemaining <= 0) {
          status = 'expired';
        } else if (daysRemaining <= 14) {
          status = 'expiring';
        } else {
          status = 'valid';
        }

        resolve({
          domain,
          label: DOMAINS_TO_CHECK.find(d => d.domain === domain)?.label || domain,
          status,
          issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
          subject: cert.subject?.CN || domain,
          validFrom: validFrom.toISOString(),
          validTo: validTo.toISOString(),
          daysRemaining,
          serialNumber: cert.serialNumber,
          fingerprint: cert.fingerprint,
          authorized,
          authorizationError: authError || null,
          accessible: true,
          lastChecked: new Date().toISOString(),
        });
      } else {
        resolve({
          domain,
          label: DOMAINS_TO_CHECK.find(d => d.domain === domain)?.label || domain,
          status: 'error',
          error: 'No certificate information available',
          accessible: true,
          lastChecked: new Date().toISOString(),
        });
      }
    });

    socket.on('error', (err) => {
      // Check if this is a certificate error
      const isCertError = err.code === 'CERT_HAS_EXPIRED' || 
                          err.code === 'DEPTH_ZERO_SELF_SIGNED_CERT' ||
                          err.code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
                          err.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
                          err.code === 'ERR_TLS_CERT_ALTNAME_INVALID';
      
      if (isCertError) {
        // Try again without verification to get cert details
        const fallbackSocket = tls.connect({
          host: domain,
          port: 443,
          servername: domain,
          rejectUnauthorized: false,
          timeout: 10000,
        }, () => {
          const cert = fallbackSocket.getPeerCertificate(true);
          fallbackSocket.end();
          
          if (cert && cert.valid_to) {
            const validTo = new Date(cert.valid_to);
            const validFrom = new Date(cert.valid_from);
            const now = new Date();
            const daysRemaining = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));
            
            let status = 'invalid';
            if (daysRemaining <= 0) {
              status = 'expired';
            }

            resolve({
              domain,
              label: DOMAINS_TO_CHECK.find(d => d.domain === domain)?.label || domain,
              status,
              issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
              subject: cert.subject?.CN || domain,
              validFrom: validFrom.toISOString(),
              validTo: validTo.toISOString(),
              daysRemaining,
              serialNumber: cert.serialNumber,
              fingerprint: cert.fingerprint,
              authorized: false,
              authorizationError: err.message || err.code,
              accessible: true,
              lastChecked: new Date().toISOString(),
            });
          } else {
            resolve({
              domain,
              label: DOMAINS_TO_CHECK.find(d => d.domain === domain)?.label || domain,
              status: 'invalid',
              error: err.message || err.code,
              authorized: false,
              accessible: true,
              lastChecked: new Date().toISOString(),
            });
          }
        });

        fallbackSocket.on('error', (fallbackErr) => {
          resolve({
            domain,
            label: DOMAINS_TO_CHECK.find(d => d.domain === domain)?.label || domain,
            status: 'error',
            error: fallbackErr.message,
            accessible: false,
            lastChecked: new Date().toISOString(),
          });
        });

        fallbackSocket.on('timeout', () => {
          fallbackSocket.destroy();
          resolve({
            domain,
            label: DOMAINS_TO_CHECK.find(d => d.domain === domain)?.label || domain,
            status: 'error',
            error: 'Connection timeout',
            accessible: false,
            lastChecked: new Date().toISOString(),
          });
        });
      } else {
        resolve({
          domain,
          label: DOMAINS_TO_CHECK.find(d => d.domain === domain)?.label || domain,
          status: 'error',
          error: err.message,
          accessible: false,
          lastChecked: new Date().toISOString(),
        });
      }
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        domain,
        label: DOMAINS_TO_CHECK.find(d => d.domain === domain)?.label || domain,
        status: 'error',
        error: 'Connection timeout',
        accessible: false,
        lastChecked: new Date().toISOString(),
      });
    });
  });
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/api/ssl/check', authenticateInternal, async (req, res) => {
  const domain = req.query.domain;
  
  if (!domain) {
    return res.status(400).json({ error: 'Domain parameter required' });
  }

  const result = await checkSSLCertificate(domain);
  res.json(result);
});

app.get('/api/ssl/check-all', authenticateInternal, async (req, res) => {
  const results = await Promise.all(
    DOMAINS_TO_CHECK.map(d => checkSSLCertificate(d.domain))
  );
  
  const summary = {
    total: results.length,
    valid: results.filter(r => r.status === 'valid').length,
    expiring: results.filter(r => r.status === 'expiring').length,
    expired: results.filter(r => r.status === 'expired').length,
    invalid: results.filter(r => r.status === 'invalid').length,
    error: results.filter(r => r.status === 'error').length,
    lastChecked: new Date().toISOString(),
  };
  
  res.json({ summary, certificates: results });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SSL Checker service running on port ${PORT}`);
});
