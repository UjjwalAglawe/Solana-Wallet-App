import { clusterApiUrl, Connection } from '@solana/web3.js';

export const NETWORK = 'devnet';
export const SOLANA_CONNECTION = new Connection(clusterApiUrl(NETWORK));
export const SOLANA_EXPLORER_URL = 'https://explorer.solana.com';