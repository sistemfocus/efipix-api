import fs from 'fs';
import https from 'https';
import express from 'express';
import { webhookRouter } from '../routes/webhook';

export const configureWebhook = (app: express.Application) => {
  app.use('/webhook', webhookRouter);

  const cert = fs.readFileSync(process.env.CERT_PATH);
  const key = fs.readFileSync(process.env.KEY_PATH);
  const ca = fs.readFileSync(process.env.CA_PATH);

  const httpsServer = https.createServer({
    cert,
    key,
    ca,
    minVersion: 'TLSv1.2' as const,
    requestCert: true,
    rejectUnauthorized: true
  }, app);

  return httpsServer;
};
