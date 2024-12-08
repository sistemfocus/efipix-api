import express from 'express';
import fs from 'fs';
import path from 'path';
import { EFI_API_URL } from '../config';

const router = express.Router();

/**
 * POST /webhook/pix
 * Receive PIX payment notifications
 */
router.post('/pix', (req, res) => {
    // Verify if the request was authorized via mTLS
    if (!req.socket.authorized) {
        return res.status(401).json({
            error: 'Unauthorized: Invalid certificate'
        });
    }

    try {
        const webhookData = req.body;

        // Log webhook data for debugging
        console.log('Received PIX webhook:', webhookData);

        // Save webhook data to a file for persistence
        const logPath = path.join(__dirname, '../logs/webhooks.json');
        const currentData = fs.existsSync(logPath) 
            ? JSON.parse(fs.readFileSync(logPath, 'utf-8')) 
            : [];
        
        currentData.push({
            timestamp: new Date().toISOString(),
            data: webhookData
        });

        fs.writeFileSync(logPath, JSON.stringify(currentData, null, 2));

        // TODO: Update order status in database
        // TODO: Notify frontend about payment confirmation

        return res.status(200).end();
    } catch (error: any) {
        console.error('Error processing webhook:', error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
});

export default router;
