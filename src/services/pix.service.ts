import { EfiPay } from '@efipay/sdk';
import { pixConfig } from '../config/pix';

export interface PixRequestPayload {
  valor: string;
  chave: string;
}

export class PixService {
  private efi: EfiPay;

  constructor() {
    this.efi = new EfiPay({
      client_id: pixConfig.clientId,
      client_secret: pixConfig.clientSecret,
      certificate: pixConfig.certificatePath,
      sandbox: pixConfig.sandbox,
      debug: pixConfig.debug
    });
  }

  async listarChavesPix() {
    try {
      const response = await this.efi.call('pixListEvp', {});
      return response;
    } catch (error: any) {
      console.error('Erro ao listar chaves PIX:', error);
      return { erro: error.message };
    }
  }

  async criarChavePix() {
    try {
      const response = await this.efi.call('pixCreateEvp', {});
      return response;
    } catch (error: any) {
      console.error('Erro ao criar chave PIX:', error);
      return { erro: error.message };
    }
  }

  async deletarChavePix(chavePix: string) {
    try {
      const response = await this.efi.call('pixDeleteEvp', { chave: chavePix });
      return response;
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

      const response = await this.efi.call('pixCreateImmediateCharge', {}, body);
      return response;
    } catch (error: any) {
      console.error('Erro ao criar QR Code:', error);
      return { erro: error.message };
    }
  }
}
