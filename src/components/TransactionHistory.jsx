import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { SOLANA_CONNECTION, SOLANA_EXPLORER_URL } from '../config/solana';

const TransactionHistory = () => {
  const { publicKey, connected } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!connected || !publicKey) {
        setTransactions([]);
        return;
      }
      
      try {
        setLoading(true);
        
        
        const signatures = await SOLANA_CONNECTION.getSignaturesForAddress(
          publicKey,
          { limit: 10 }
        );
        
        
        const transactionDetails = await Promise.all(
          signatures.map(async (sig) => {
            const tx = await SOLANA_CONNECTION.getTransaction(sig.signature);
            return {
              signature: sig.signature,
              timestamp: sig.blockTime ? new Date(sig.blockTime * 1000).toLocaleString() : 'Unknown',
              status: tx?.meta?.err ? 'Failed' : 'Confirmed',
              slot: sig.slot
            };
          })
        );
        
        setTransactions(transactionDetails);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
    
    
    const intervalId = setInterval(fetchTransactions, 60000);
    
    return () => clearInterval(intervalId);
  }, [publicKey, connected]);
  
  if (!connected) {
    return <div className="transaction-history">Please connect your wallet to view transactions</div>;
  }
  
  return (
    <div className="transaction-history">
      <h3>Recent Transactions</h3>
      
      {loading ? (
        <p>Loading transactions...</p>
      ) : transactions.length > 0 ? (
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Signature</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.signature}>
                <td className="signature">
                  {tx.signature.slice(0, 6)}...{tx.signature.slice(-4)}
                </td>
                <td>{tx.timestamp}</td>
                <td className={`status ${tx.status === 'Confirmed' ? 'success' : 'error'}`}>
                  {tx.status}
                </td>
                <td>
                  <a
                    href={`${SOLANA_EXPLORER_URL}/tx/${tx.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="explorer-link"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No recent transactions found</p>
      )}
    </div>
  );
};

export default TransactionHistory;