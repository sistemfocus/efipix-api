import { Router } from 'express';
import { PixService, PixRequestPayload } from '../services/pix.service';

const router = Router();
const pixService = new PixService();

// Listar chaves PIX
router.get('/listar', async (req, res) => {
  const response = await pixService.listarChavesPix();
  res.json(response);
});

// Criar chave PIX
router.get('/', async (req, res) => {
  const response = await pixService.criarChavePix();
  res.json(response);
});

// Criar QR Code
router.post('/', async (req, res) => {
  const payload = req.body as PixRequestPayload;
  const response = await pixService.criarQrCode(payload);
  res.json(response);
});

// Deletar chave PIX
router.delete('/', async (req, res) => {
  const { chavePix } = req.query;
  if (!chavePix || typeof chavePix !== 'string') {
    return res.status(400).json({ erro: 'chavePix é obrigatória' });
  }
  const response = await pixService.deletarChavePix(chavePix);
  res.json(response);
});

export { router as pixRouter };
