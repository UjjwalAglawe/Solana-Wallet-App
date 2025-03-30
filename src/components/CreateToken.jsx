import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  createInitializeMintInstruction,
  getMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { 
  Keypair, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { SOLANA_CONNECTION } from '../config/solana';
// import { NotificationManager } from 'react-notifications';

const CreateToken = () => {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [decimals, setDecimals] = useState(9);
  const [loading, setLoading] = useState(false);
  const [mintAddress, setMintAddress] = useState('');
  
  const createToken = async (event) => {
    event.preventDefault();
    
    if (!publicKey || !signTransaction) {
      alert('Wallet not connected!');
    //   NotificationManager.error('Wallet not connected!');
      return;
    }
    
    try {
      setLoading(true);
      
      
      const mintKeypair = Keypair.generate();
      console.log(`Mint public key: ${mintKeypair.publicKey.toString()}`);
      
      
      const lamports = await SOLANA_CONNECTION.getMinimumBalanceForRentExemption(MINT_SIZE);
      
      // Crate a transaction
      const transaction = new Transaction();
      
      
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        })
      );
      
      
      transaction.add(
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          decimals,
          publicKey,
          publicKey,
          TOKEN_PROGRAM_ID
        )
      );
      
      
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      
      
      transaction.add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          associatedTokenAddress,
          publicKey,
          mintKeypair.publicKey,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
      
      
      transaction.recentBlockhash = (await SOLANA_CONNECTION.getLatestBlockhash()).blockhash;
      transaction.feePayer = publicKey;
      
      
      transaction.partialSign(mintKeypair);
      
      
      const signedTx = await signTransaction(transaction);
      
      
      const txid = await sendTransaction(signedTx, SOLANA_CONNECTION);
      await SOLANA_CONNECTION.confirmTransaction(txid, 'confirmed');
      
      alert(`Token created successfully! Mint address: ${mintKeypair.publicKey.toString()}`);
    
      setMintAddress(mintKeypair.publicKey.toString());
      
    } catch (error) {
      console.error("Error creating token:", error);
    //   NotificationManager.error('Failed to create token: ' + error.message);
      alert('Failed to create token: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="token-creation-container">
      <h2>Create New Token</h2>
      <form onSubmit={createToken}>
        <div className="form-group">
          <label htmlFor="tokenName">Token Name</label>
          <input
            id="tokenName"
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder="My Token"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tokenSymbol">Token Symbol</label>
          <input
            id="tokenSymbol"
            type="text"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            placeholder="MTK"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="decimals">Decimals</label>
          <input
            id="decimals"
            type="number"
            min="0"
            max="9"
            value={decimals}
            onChange={(e) => setDecimals(parseInt(e.target.value))}
            required
          />
        </div>
        
        <button type="submit" className="create-token-btn" disabled={loading || !publicKey}>
          {loading ? 'Creating...' : 'Create Token'}
        </button>
      </form>
      
      {mintAddress && (
        <div className="token-created">
          <h3>Token Created!</h3>
          <p>Mint Address: {mintAddress}</p>
          <a
            href={`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Solana Explorer
          </a>
        </div>
      )}
    </div>
  );
};

export default CreateToken;