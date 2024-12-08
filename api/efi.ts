import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const router = express.Router();

// Fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EFI_CONFIG = {
  clientId: process.env.EFI_CLIENT_ID || 'Client_Id_b1b3d7e6b6c8d9e0f1a2b3c4d5e6f7g8h9i0j1k2',
  clientSecret: process.env.EFI_CLIENT_SECRET || 'Client_Secret_b1b3d7e6b6c8d9e0f1a2b3c4d5e6f7g8h9i0j1k2',
  baseUrl: 'https://api-pix.efipay.com.br',
  certificatePath: path.resolve(__dirname, '../../certs/producao-490108-automação Subliminas.p12'),
  pixKey: '31992271232'
};

// Criar um agente HTTPS com o certificado
const createHttpsAgent = () => {
  return new https.Agent({
    pfx: fs.readFileSync(EFI_CONFIG.certificatePath),
    passphrase: ''
  });
};

let accessToken: string | null = null;
let tokenExpiration: number | null = null;

// Obter token de acesso
const getAccessToken = async () => {
  if (accessToken && tokenExpiration && Date.now() < tokenExpiration) {
    return accessToken;
  }

  try {
    const httpsAgent = createHttpsAgent();
    
    const response = await axios.post(
      `${EFI_CONFIG.baseUrl}/oauth/token`,
      { grant_type: 'client_credentials' },
      {
        auth: {
          username: EFI_CONFIG.clientId,
          password: EFI_CONFIG.clientSecret
        },
        httpsAgent
      }
    );

    accessToken = response.data.access_token;
    tokenExpiration = Date.now() + (response.data.expires_in * 1000);
    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

// Criar cobrança PIX
router.post('/create-charge', async (req, res) => {
  try {
    const { orderId, value, cpf, name } = req.body;
    
    // Obter token com certificado
    const token = await getAccessToken();
    const httpsAgent = createHttpsAgent();

    // Criar cobrança usando o token
    const payload = {
      calendario: {
        expiracao: 3600
      },
      devedor: {
        cpf: cpf.replace(/\D/g, ''),
        nome: name
      },
      valor: {
        original: value
      },
      chave: EFI_CONFIG.pixKey,
      solicitacaoPagador: `Pedido ${orderId}`
    };

    const response = await axios.post(
      `${EFI_CONFIG.baseUrl}/v2/cob`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        httpsAgent
      }
    );

    // Gerar QR Code
    const locId = response.data.loc.id;
    const qrResponse = await axios.get(
      `${EFI_CONFIG.baseUrl}/v2/loc/${locId}/qrcode`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        httpsAgent
      }
    );

    res.json({
      qrcode: qrResponse.data.qrcode,
      copiaECola: qrResponse.data.qrcode,
      txid: response.data.txid
    });
  } catch (error) {
    console.error('Error creating PIX charge:', error);
    res.status(500).json({ error: 'Failed to create PIX charge' });
  }
});

// Verificar status do pagamento
router.get('/check-status/:txid', async (req, res) => {
  try {
    const { txid } = req.params;
    const token = await getAccessToken();
    const httpsAgent = createHttpsAgent();

    const response = await axios.get(
      `${EFI_CONFIG.baseUrl}/v2/cob/${txid}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        httpsAgent
      }
    );

    res.json({ status: response.data.status });
  } catch (error) {
    console.error('Error checking PIX status:', error);
    res.status(500).json({ error: 'Failed to check PIX status' });
  }
});

export default router;