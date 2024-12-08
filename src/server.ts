import express from 'express';
import cors from 'cors';
import { router as pixRouter } from './routes/pix';
import { configureWebhook } from './config/webhook';
import { CORS_ORIGIN, PORT } from './config';

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/pix', pixRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const startServer = async () => {
  try {
    // Configure webhook (HTTPS) server if certificates are provided
    if (process.env.CERT_PATH && process.env.KEY_PATH && process.env.CA_PATH) {
      const httpsServer = configureWebhook(app);
      httpsServer.listen(PORT, () => {
        console.log(`HTTPS Server running on port ${PORT}`);
      });
    } else {
      // Start regular HTTP server
      app.listen(PORT, () => {
        console.log(`HTTP Server running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();