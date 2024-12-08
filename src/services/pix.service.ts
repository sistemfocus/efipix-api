const Gerencianet = require('gn-api-sdk-node');
const { pixConfig } = require('../config/pix');

export interface PixRequestPayload {
  valor: string;
  chave: string;
}

class PixService {
  private gn: Gerencianet;

  constructor() {
    this.gn = new Gerencianet({
      client_id: pixConfig.clientId,
      client_secret: pixConfig.clientSecret,
      sandbox: pixConfig.sandbox,
      certificate: pixConfig.certificatePath
    });
  }

  async listarChavesPix() {
    try {
      const response = await this.gn.pixListEvp({});
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar chaves PIX:', error);
      return { erro: error.message };
    }
  }

  async criarChavePix() {
    try {
      const response = await this.gn.pixCreateEvp({});
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar chave PIX:', error);
      return { erro: error.message };
    }
  }

  async deletarChavePix(chavePix: string) {
    try {
      const response = await this.gn.pixDeleteEvp({ chave: chavePix });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao deletar chave PIX:', error);
      return { erro: error.message };
    }
  }

  async criarQrCode(payload: PixRequestPayload) {
    try {
      const body = {
        calendario: { expiracao: 3600 },
        devedor: {
          cpf: '12345678909',
          nome: 'Cliente Interclasse'
        },
        valor: { original: payload.valor },
        chave: payload.chave,
        infoAdicionais: [
          { nome: 'Pedido', valor: 'Pedido Interclasse' }
        ]
      };

      const response = await this.gn.pixCreateImmediateCharge({}, body);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar QR Code:', error);
      return { erro: error.message };
    }
  }
}

module.exports = { PixService };
