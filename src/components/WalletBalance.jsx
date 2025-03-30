import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SOLANA_CONNECTION } from '../config/solana';

const WalletBalance = () => {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchBalance = async () => {
      if (!connected || !publicKey) {
        setBalance(null);
        return;
      }
      
      try {
        setLoading(true);
        const walletBalance = await SOLANA_CONNECTION.getBalance(publicKey);
        setBalance(walletBalance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBalance();
    
    
    const intervalId = setInterval(fetchBalance, 15000);
    
    return () => clearInterval(intervalId);
  }, [publicKey, connected]);
  
  const requestAirdrop = async () => {
    if (!connected || !publicKey) return;
    
    try {
      setLoading(true);
      const signature = await SOLANA_CONNECTION.requestAirdrop(
        publicKey,
        2 * LAMPORTS_PER_SOL
      );
      
      await SOLANA_CONNECTION.confirmTransaction(signature);
      
      
      const walletBalance = await SOLANA_CONNECTION.getBalance(publicKey);
      setBalance(walletBalance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error requesting airdrop:", error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!connected) {
    return <div className="wallet-balance">Please connect your wallet</div>;
  }
  
  return (
    <div className="wallet-balance">
      <h3>Wallet Balance</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <p className="sol-balance">{balance !== null ? `${balance.toFixed(4)} SOL` : 'Unknown'}</p>
          <button 
            onClick={requestAirdrop} 
            disabled={loading}
            className="airdrop-button"
          >
            Request Devnet SOL Airdrop
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletBalance;