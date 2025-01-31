import { Connection, PublicKey } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import Bottleneck from "bottleneck";
import { fetchJupiterSwap } from "./getJupiterPrice";
import { getTokenInfo } from "./getTokenInfo";
// import { extractCidFromUrl } from "./extractCid";
// import { processTokenMetadata } from "./processMetadata";
// import { withRetry } from "./withRetry";
// import { fetchIpfsMetadata } from "./getIpfsMetadata";

export const HELIUS = process.env.EXPO_PUBLIC_RPC_ENDPOINT;

console.log("HELIUS endpoint:", HELIUS);

const connection = new Connection(HELIUS as string);
// const DEFAULT_IMAGE_URL = process.env.UNKNOWN_IMAGE_URL || "https://s3.coinmarketcap.com/static-gravity/image/5cc0b99a8dd84fbfa4e150d84b5531f2.png";

// Rate limiters
const rpcLimiter = new Bottleneck({ maxConcurrent: 10, minTime: 100 });
export const apiLimiter = new Bottleneck({ maxConcurrent: 5, minTime: 100 });

export interface TokenData {
    name: string;
    mintAddress: string;
    tokenAddress: string;
    amount: number;
    decimals: number;
    usdValue: number;
    symbol: string;
    logo: string;
    cid: null;
    isNft: boolean;
    collectionName: string;
    collectionLogo: string;
    description?: string;
}

export async function fetchTokenMetadata(mintAddress: PublicKey, mint: string) {
    try {
        // Simplified metadata fetch using just token info
        return getTokenInfo(mint);
    } catch (error) {
        console.warn("Error fetching token metadata for:", mint, error);
        return getTokenInfo(mint);
    }
}

export async function fetchTokenAccounts(publicKey: PublicKey) {
    try {
        console.log("Connecting to:", HELIUS);
        const result = await rpcLimiter.schedule(() =>
            connection.getParsedTokenAccountsByOwner(publicKey, {
                programId: TOKEN_PROGRAM_ID,
            })
        );
        console.log("Token accounts fetch successful");
        return result;
    } catch (error) {
        console.error("Error fetching token accounts:", error);
        throw error;
    }
}

export async function fetchNftPrice(mintAddress: string) {
    const response = await apiLimiter.schedule(() =>
        fetch(`api/nfts/nftfloor`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ca: mintAddress }),
        })
    );
    return response.json();
}

export async function handleTokenData(publicKey: PublicKey, tokenAccount: any, apiLimiter: any) {
    const mintAddress = tokenAccount.account.data.parsed.info.mint;
    const amount = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount || 0;

    const [tokenAccountAddress] = PublicKey.findProgramAddressSync(
        [publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), new PublicKey(mintAddress).toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const jupiterPrice = await apiLimiter.schedule(() =>
        fetchJupiterSwap(mintAddress)
    );

    const metadata = await fetchTokenMetadata(new PublicKey(mintAddress), mintAddress);
    // console.log("Metadata:", metadata);

    if (!metadata?.isNft) {
        const price = jupiterPrice.data[mintAddress]?.price || 0;
        const usdValue = amount * price;

        return {
            ...metadata,
            mintAddress,
            tokenAddress: tokenAccountAddress.toString(),
            amount,
            usdValue,
        };
    } else {
        // console.log("NFT detected");
        const nftData = await fetchNftPrice(mintAddress);
        // console.log("NFT Data:", nftData);
        const nftPrice = nftData.usdValue ?? 0;
        // console.log(`NFT Floor Price of ${mintAddress}:`, nftPrice);
        return {
            ...metadata,
            mintAddress,
            tokenAddress: tokenAccountAddress.toString(),
            amount,
            usdValue: nftPrice,
        };
    }
}

export async function calculateTotalWalletValue(publicKey: PublicKey) {
    try {
        console.log("Starting wallet value calculation for:", publicKey.toString());
        
        // Fetch the token accounts for the given public key
        console.log("Fetching token accounts...");
        const tokenAccounts = await fetchTokenAccounts(publicKey);
        console.log("Found token accounts:", tokenAccounts.value.length);
        
        // Initialize total value and token data array
        let totalValue = 0;
        const allTokenData = [];
    
        // Loop through each token account and calculate its value
        for (let tokenAccount of tokenAccounts.value) {
            console.log("Processing token account:", tokenAccount.account.data.parsed.info.mint);
            const tokenData = await handleTokenData(publicKey, tokenAccount, apiLimiter);
            console.log("Token data:", {
                mint: tokenData.mintAddress,
                amount: tokenData.amount,
                value: tokenData.usdValue
            });
    
            // Add the USD value of the token to the total value
            totalValue += tokenData.usdValue;
            console.log("Running total:", totalValue);

            // Add token data to the array
            allTokenData.push(tokenData);
        }
        
        console.log("Final wallet value:", totalValue);
        return { totalValue, allTokenData };
    
    } catch (error) {
        console.error("Error calculating total wallet value:", error);
        console.error("Error details:", error instanceof Error ? error.message : error);
        return { totalValue: 0, allTokenData: [] };
    }
}
  