import express from 'express';
import { getAccessToken } from '../services/auth';
import axios from 'axios';
import { EFI_API_URL } from '../config';

const router = express.Router();

/**
 * GET /pix/charges
 * List PIX charges within a date range
 */
router.get('/charges', async (req, res) => {
    try {
        const { inicio, fim, cpf, cnpj, status, locationPresente } = req.query;
        
        // Validate required parameters
        if (!inicio || !fim) {
            return res.status(400).json({
                error: 'Parameters inicio and fim are required'
            });
        }

        // Get access token
        const accessToken = await getAccessToken();
        
        // Build query parameters
        const params = new URLSearchParams();
        params.append('inicio', inicio as string);
        params.append('fim', fim as string);
        
        // Add optional filters
        if (cpf) params.append('cpf', cpf as string);
        if (cnpj) params.append('cnpj', cnpj as string);
        if (status) params.append('status', status as string);
        if (locationPresente) params.append('locationPresente', locationPresente as string);

        // Make request to EFI Bank API
        const response = await axios.get(`${EFI_API_URL}/v2/cob?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return res.json(response.data);
    } catch (error: any) {
        console.error('Error listing PIX charges:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            error: error.response?.data || 'Internal server error'
        });
    }
});

/**
 * POST /pix/charge
 * Create an immediate PIX charge
 */
router.post('/charge', async (req, res) => {
    try {
        const {
            orderId,
            value,
            customerName,
            customerCpf,
        } = req.body;

        if (!orderId || !value || !customerName || !customerCpf) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        // Get access token
        const accessToken = await getAccessToken();

        // Format CPF (remove special characters)
        const formattedCpf = customerCpf.replace(/\D/g, '');

        // Create charge payload
        const payload = {
            calendario: {
                expiracao: 3600 // 1 hour expiration
            },
            devedor: {
                cpf: formattedCpf,
                nome: customerName
            },
            valor: {
                original: value.toFixed(2)
            },
            chave: process.env.PIX_KEY,
            solicitacaoPagador: `Pedido ${orderId}`,
            infoAdicionais: [
                {
                    nome: "Pedido",
                    valor: orderId
                }
            ]
        };

        // Make request to EFI Bank API
        const response = await axios.post(`${EFI_API_URL}/v2/cob`, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return res.json(response.data);
    } catch (error: any) {
        console.error('Error creating PIX charge:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            error: error.response?.data || 'Internal server error'
        });
    }
});

/**
 * PUT /pix/charge/:txid
 * Create a PIX charge with specific txid
 */
router.put('/charge/:txid', async (req, res) => {
    try {
        const { txid } = req.params;
        const {
            value,
            customerName,
            customerDocument,
            isCompany = false,
            expiresIn = 3600,
            additionalInfo = []
        } = req.body;

        if (!txid || !value || !customerName || !customerDocument) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        // Get access token
        const accessToken = await getAccessToken();

        // Format document (remove special characters)
        const formattedDocument = customerDocument.replace(/\D/g, '');

        // Create charge payload
        const payload = {
            calendario: {
                expiracao: expiresIn
            },
            devedor: {
                [isCompany ? 'cnpj' : 'cpf']: formattedDocument,
                nome: customerName
            },
            valor: {
                original: value.toFixed(2)
            },
            chave: process.env.PIX_KEY,
            solicitacaoPagador: `Pedido ${txid}`,
            infoAdicionais: additionalInfo
        };

        // Make request to EFI Bank API
        const response = await axios.put(`${EFI_API_URL}/v2/cob/${txid}`, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return res.status(201).json(response.data);
    } catch (error: any) {
        console.error('Error creating PIX charge:', error.response?.data || error.message);
        
        // Handle specific error cases
        if (error.response?.status === 409) {
            return res.status(409).json({
                nome: "txid_duplicado",
                mensagem: "Campo txid informado já foi utilizado em outra cobrança"
            });
        }

        return res.status(error.response?.status || 500).json({
            error: error.response?.data || 'Internal server error'
        });
    }
});

export default router;
