import express from 'express';
import fs from 'fs';
import path from 'path';
import { TLSSocket } from 'tls';

const webhookRouter = express.Router();

/**
 * Middleware to verify client certificate
 */
const verifyClientCertificate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const socket = req.socket as TLSSocket;
  
  if (!socket.authorized) {
    return res.status(401).json({ error: 'Invalid client certificate' });
  }
  next();
};

/**
 * POST /webhook
 * Receive webhook notifications
 */
webhookRouter.post('/', verifyClientCertificate, (req: express.Request, res: express.Response) => {
  try {
    // Log webhook data for debugging
    const logData = {
      timestamp: new Date().toISOString(),
      headers: req.headers,
      body: req.body
    };

    const logPath = path.join(__dirname, '../../logs/webhook.log');
    fs.appendFileSync(logPath, JSON.stringify(logData, null, 2) + '\n');

    // Process webhook data here
    // TODO: Implement webhook processing logic

    res.status(200).json({ message: 'Webhook received successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default webhookRouter;
