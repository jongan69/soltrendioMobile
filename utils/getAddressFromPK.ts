import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Creates a Solana wallet address from a Base58-encoded private key.
 * @param privateKeyBase58 - The Base58-encoded private key.
 * @returns The corresponding Solana public address.
 */
export function getSolanaAddressFromPrivateKey(privateKeyBase58: string): string {
  try {
    const secretKey = bs58.decode(privateKeyBase58);
    const keypair = Keypair.fromSecretKey(secretKey);
    return keypair.publicKey.toBase58();
  } catch (error) {
    throw new Error('Invalid private key: Ensure it is Base58-encoded.');
  }
}