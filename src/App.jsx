import React, { useState } from 'react';
// import { NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import './App.css';

import WalletProviderComponent from './components/WalletProvider';
import WalletConnect from './components/WalletConnect';
import WalletBalance from './components/WalletBalance';
import CreateToken from './components/CreateToken';
import MintToken from './components/MintToken';
import TransferToken from './components/TransferToken';
import TransactionHistory from './components/TransactionHistory';

function App() {
  const [activeTab, setActiveTab] = useState('create');
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'create':
        return <CreateToken />;
      case 'mint':
        return <MintToken />;
      case 'transfer':
        return <TransferToken />;
      case 'transactions':
        return <TransactionHistory />;
      default:
        return <CreateToken />;
    }
  };
  
  return (
    <WalletProviderComponent>
      <div className="app-container">
        <header className="app-header">
          <h1>Solana Token Manager</h1>
          <WalletConnect />
        </header>
        
        <main className="app-main">
          <div className="sidebar">
            <WalletBalance />
            
            <nav className="app-nav">
              <button 
                className={`nav-button ${activeTab === 'create' ? 'active' : ''}`}
                onClick={() => setActiveTab('create')}
              >
                Create Token
              </button>
              <button 
                className={`nav-button ${activeTab === 'mint' ? 'active' : ''}`}
                onClick={() => setActiveTab('mint')}
              >
                Mint Token
              </button>
              <button 
                className={`nav-button ${activeTab === 'transfer' ? 'active' : ''}`}
                onClick={() => setActiveTab('transfer')}
              >
                Transfer Token
              </button>
              <button 
                className={`nav-button ${activeTab === 'transactions' ? 'active' : ''}`}
                onClick={() => setActiveTab('transactions')}
              >
                Transactions
              </button>
            </nav>
          </div>
          
          <div className="content">
            {renderTabContent()}
          </div>
        </main>
        
        <footer className="app-footer">
          <p>Solana Token Manager &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
      
      {/* <NotificationContainer /> */}
    </WalletProviderComponent>
  );
}

export default App;