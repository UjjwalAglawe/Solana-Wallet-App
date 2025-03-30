import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  getOrCreateAssociatedTokenAccount,
  getAccount,
  createTransferInstruction
} from '@solana/spl-token';
import { PublicKey, Transaction } from '@solana/web3.js';
import { SOLANA_CONNECTION } from '../config/solana';

const TransferToken = () => {
  const { publicKey, signTransaction } = useWallet();
  const [mintAddress, setMintAddress] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [error, setError] = useState(null);
  
  const fetchTokenBalance = async () => {
    if (!publicKey || !mintAddress) return;
    
    try {
      setError(null);
      const mintPublicKey = new PublicKey(mintAddress);
      
      console.log("Fetching token balance...");
      
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        SOLANA_CONNECTION,
        {
          publicKey,
          signTransaction
        },
        mintPublicKey,
        publicKey
      );
      
      
      const account = await getAccount(SOLANA_CONNECTION, tokenAccount.address);
      const balance = Number(account.amount) / Math.pow(10, 9); 
      setTokenBalance(balance);
      console.log(`Token balance: ${balance}`);
    } catch (error) {
      console.error("Error fetching token balance:", error);
      setError(`Error fetching balance: ${error.message}`);
      alert(`Error fetching balance: ${error.message}`);
    }
  };
  
  const handleTransfer = async (event) => {
    event.preventDefault();
    
    if (!publicKey || !signTransaction) {
      alert('Wallet not connected!');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      alert('Processing transfer...');
      
      
      const mintPublicKey = new PublicKey(mintAddress);
      const recipient = new PublicKey(recipientAddress);
      
      console.log("Getting source token account...");
      
      const sourceAccount = await getOrCreateAssociatedTokenAccount(
        SOLANA_CONNECTION,
        {
          publicKey,
          signTransaction
        },
        mintPublicKey,
        publicKey
      );
      
      console.log("Getting destination token account...");
      
      const destinationAccount = await getOrCreateAssociatedTokenAccount(
        SOLANA_CONNECTION,
        {
          publicKey,
          signTransaction
        },
        mintPublicKey,
        recipient
      );
      
      console.log("Creating and sending transfer transaction...");
      
      
      const transaction = new Transaction();
      
      
      transaction.add(
        createTransferInstruction(
          sourceAccount.address,
          destinationAccount.address,
          publicKey,
          BigInt(Math.round(amount * Math.pow(10, 9))) 
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
      
      console.log("Transfer successful:", signature);
      alert(`Transfer successful! Transaction signature: ${signature}`);
      
      
      await fetchTokenBalance();
    } catch (error) {
      console.error("Full error object:", error);
      setError(`Error transferring tokens: ${error.message}`);
      alert(`Error transferring tokens: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="transfer-token-container">
      <h2>Transfer Tokens</h2>
      <form onSubmit={handleTransfer}>
        <div className="form-group">
          <label htmlFor="mintAddress">Token Mint Address</label>
          <input
            id="mintAddress"
            type="text"
            value={mintAddress}
            onChange={(e) => setMintAddress(e.target.value)}
            onBlur={fetchTokenBalance}
            placeholder="Enter token mint address"
            required
          />
        </div>
        
        {tokenBalance !== null && (
          <div className="token-balance-info">
            Your balance: {tokenBalance} tokens
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="recipient">Recipient Address</label>
          <input
            id="recipient"
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="Enter recipient's wallet address"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">Amount to Send</label>
          <input
            id="amount"
            type="number"
            min="0.000000001"
            step="0.000000001"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            required
          />
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        <button
          type="submit"
          className="transfer-token-btn"
          disabled={loading || !publicKey || (tokenBalance !== null && amount > tokenBalance)}
        >
          {loading ? 'Transferring...' : 'Transfer Tokens'}
        </button>
      </form>
    </div>
  );
};

export default TransferToken;