import fs from 'fs';
import https from 'https';
import { Express } from 'express';

export function configureWebhook(app: Express) {
    // SSL/TLS configuration for mTLS
    const httpsOptions = {
        cert: fs.readFileSync(process.env.SSL_CERT_PATH!), // Your domain's SSL certificate
        key: fs.readFileSync(process.env.SSL_KEY_PATH!),   // Your domain's private key
        ca: fs.readFileSync(process.env.EFI_PUBLIC_KEY_PATH!), // EFI's public key for mTLS
        minVersion: 'TLSv1.2',
        requestCert: true,
        rejectUnauthorized: true
    };

    // Create HTTPS server with mTLS
    const httpsServer = https.createServer(httpsOptions, app);

    return httpsServer;
}
