import axios from 'axios';
import { EFI_API_URL, CLIENT_ID, CLIENT_SECRET } from '../config';
import fs from 'fs';
import https from 'https';

let cachedToken: string | null = null;
let tokenExpiration: Date | null = null;

export async function getAccessToken(): Promise<string> {
    // Check if we have a valid cached token
    if (cachedToken && tokenExpiration && tokenExpiration > new Date()) {
        return cachedToken;
    }

    try {
        // Read certificate
        const cert = fs.readFileSync(process.env.CERTIFICATE_PATH!);

        const agent = new https.Agent({
            pfx: cert,
            passphrase: process.env.CERTIFICATE_PASSWORD
        });

        const response = await axios.post(`${EFI_API_URL}/oauth/token`, {
            grant_type: 'client_credentials'
        }, {
            auth: {
                username: CLIENT_ID,
                password: CLIENT_SECRET
            },
            httpsAgent: agent,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Cache the token
        cachedToken = response.data.access_token;
        tokenExpiration = new Date(Date.now() + (response.data.expires_in * 1000));

        return cachedToken;
    } catch (error: any) {
        console.error('Error getting access token:', error.response?.data || error.message);
        throw error;
    }
}
