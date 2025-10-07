import { useState } from 'react';

function WalletConnector({ onConnect }) {
  const wallets = [
    { id: 'xbull', name: 'xBull' },
    { id: 'freighter', name: 'Freighter' },
  ];

  const handleSelectWallet = (walletId) => {
    onConnect(walletId);
  };

  return (
    <div className="wallet-connector">
      <h2>Connect Your Wallet</h2>
      <div>
        {wallets.map((wallet) => (
          <button 
            key={wallet.id} 
            onClick={() => handleSelectWallet(wallet.id)}
          >
            Connect with {wallet.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default WalletConnector;