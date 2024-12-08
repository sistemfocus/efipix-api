# EFI PIX API

API de integração com o sistema PIX do EFI Bank, fornecendo endpoints para geração de cobranças PIX e webhooks para notificações de pagamento.

## Tecnologias

- Node.js
- TypeScript
- Express
- EFI Bank API (PIX)

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
- Copie o arquivo `.env.example` para `.env`
- Preencha as variáveis necessárias

3. Execute em desenvolvimento:
```bash
npm run dev
```

4. Para build de produção:
```bash
npm run build
npm start
```

## Variáveis de Ambiente

- `NODE_ENV`: ambiente (development/production)
- `CLIENT_ID`: ID do cliente EFI Bank
- `CLIENT_SECRET`: Secret do cliente EFI Bank
- `CERT_PATH`: Caminho para o certificado de produção

## Endpoints

### POST /pix/charge
Cria uma nova cobrança PIX

### PUT /pix/charge/:txid
Cria uma cobrança PIX com txid específico

### POST /pix/webhook
Endpoint para receber notificações de pagamento
