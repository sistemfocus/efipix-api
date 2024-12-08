import { config } from 'dotenv';
config();

export interface PixConfig {
  clientId: string;
  clientSecret: string;
  sandbox: boolean;
  debug: boolean;
  certificatePath: string;
}

export const pixConfig: PixConfig = {
  clientId: process.env.CLIENT_ID || '',
  clientSecret: process.env.CLIENT_SECRET || '',
  sandbox: process.env.NODE_ENV !== 'production',
  debug: process.env.NODE_ENV !== 'production',
  certificatePath: process.env.CERT_PATH || ''
};
