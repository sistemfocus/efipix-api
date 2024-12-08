# Interclasse API

Backend da aplicação Interclasse 2.0, responsável pelo processamento de pedidos e integração com o sistema PIX.

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
