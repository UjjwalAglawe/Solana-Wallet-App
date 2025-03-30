import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { SOLANA_CONNECTION } from '../config/solana';
import { PublicKey, Transaction } from '@solana/web3.js';
import { 
  getOrCreateAssociatedTokenAccount, 
  mintTo, 
  getAccount,
  createMint
} from '@solana/spl-token';

const MintToken = () => { 
  const { publicKey, signTransaction } = useWallet();
  const [mintAddress, setMintAddress] = useState('');
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [creatingMint, setCreatingMint] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [error, setError] = useState(null);
  
  
  const handleCreateMint = async () => {
    if (!publicKey || !signTransaction) {
      alert('Wallet not connected!');
      return;
    }
    
    try {
      setCreatingMint(true);
      setError(null);
      
      
      const lamports = await SOLANA_CONNECTION.getMinimumBalanceForRentExemption(82);
      
      
      const mint = await createMint(
        SOLANA_CONNECTION,
        {
          publicKey,
          signTransaction
        },
        publicKey, 
        publicKey, 
        9 
      );
      
      const mintAddressStr = mint.toString();
      setMintAddress(mintAddressStr);
      alert(`Successfully created new token mint: ${mintAddressStr}`);
    } catch (error) {
      console.error("Error creating mint:", error);
      setError(`Failed to create mint: ${error.message}`);
      alert(`Error creating mint: ${error.message}`);
    } finally {
      setCreatingMint(false);
    }
  };
  
  
  const handleMint = async (event) => {
    event.preventDefault();
    
    if (!publicKey || !signTransaction) {
      alert('Wallet not connected!');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      alert('Processing mint transaction...');
      
      
      const mintPublicKey = new PublicKey(mintAddress);
      
      console.log("Attempting to get token account...");
      
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        SOLANA_CONNECTION,
        {
          publicKey,
          signTransaction
        },
        mintPublicKey,
        publicKey
      );
      
      console.log("Token account obtained:", tokenAccount.address.toString());
      
      
      console.log("Creating and sending mint transaction...");
      
      
      const { createMintToInstruction } = await import('@solana/spl-token');
      
      
      const transaction = new Transaction();
      
      
      transaction.add(
        createMintToInstruction(
          mintPublicKey,
          tokenAccount.address,
          publicKey,
          BigInt(amount * Math.pow(10, 9))
        )
      );
      
      
      const { blockhash } = await SOLANA_CONNECTION.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      
      const signedTransaction = await signTransaction(transaction);
      
      
      const signature = await SOLANA_CONNECTION.sendRawTransaction(
        signedTransaction.serialize()
      );
      
      
      await SOLANA_CONNECTION.confirmTransaction(signature, 'confirmed');
      
      console.log("Mint successful, getting updated balance...");
    
      const updatedAccount = await getAccount(SOLANA_CONNECTION, tokenAccount.address);
      const balance = Number(updatedAccount.amount) / Math.pow(10, 9);
      setTokenBalance(balance);
      
      alert(`Mint successful! Transaction signature: ${signature}`);
    } catch (error) {
      console.error("Full error object:", error);
      setError(`Error minting tokens: ${error.message}`);
      alert(`Error minting tokens: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mint-token-container">
      <h2>Token Operations</h2>
      
      
      <div className="create-mint-section">
        <h3>Step 1: Create a New Token</h3>
        <p>Create a new token where you will be the mint authority</p>
        <button 
          onClick={handleCreateMint} 
          disabled={creatingMint || !publicKey}
          className="create-mint-btn"
        >
          {creatingMint ? 'Creating...' : 'Create New Token'}
        </button>
      </div>
      
      <hr />
      
      
      <h3>Step 2: Mint Tokens</h3>
      <form onSubmit={handleMint}>
        <div className="form-group">
          <label htmlFor="mintAddress">Token Mint Address</label>
          <input
            id="mintAddress"
            type="text"
            value={mintAddress}
            onChange={(e) => setMintAddress(e.target.value)}
            placeholder="Enter token mint address"
            required
          />
          <small>Use the address from Step 1 or enter another token mint address where you are the mint authority</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">Amount to Mint</label>
          <input
            id="amount"
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value))}
            required
          />
        </div>
        
        <button
          type="submit"
          className="mint-token-btn"
          disabled={loading || !publicKey}
        >
          {loading ? 'Minting...' : 'Mint Tokens'}
        </button>
      </form>
      

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      

      {tokenBalance !== null && (
        <div className="token-balance">
          <h3>Current Token Balance: {tokenBalance}</h3>
        </div>
      )}
    </div>
  );
};

export default MintToken;