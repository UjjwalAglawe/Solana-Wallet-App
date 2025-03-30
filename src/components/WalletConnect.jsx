import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SOLANA_EXPLORER_URL } from '../config/solana';

const WalletConnect = () => {
  const { publicKey, connected } = useWallet();
  
  console.log("This",publicKey);
  
  return (
    <div className="wallet-container">
      <WalletMultiButton />
      
      {connected && publicKey && (
        <div className="wallet-info">
          <p>Connected: {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}</p>
          <a 
            href={`${SOLANA_EXPLORER_URL}?cluster=devnet&address=${publicKey.toString()}`}
            target="_blank" 
            rel="noopener noreferrer"
          >
            View on Explorer
          </a>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;