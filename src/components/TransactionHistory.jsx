// src/components/TransactionHistory.jsx
import { useState, useEffect } from 'react';

function TransactionHistory({ publicKey, server }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Fetch user's transactions
        const transactionsResponse = await server
          .transactions()
          .forAccount(publicKey)
          .limit(10)
          .order('desc')
          .call();
          
        // Filter for marketplace transactions
        const marketplaceTransactions = transactionsResponse.records.filter(tx => {
          const destination = tx.to;
          return [
            'GB66WWJBXVTB4WLTSMTRBADE2IYUHGEPOHJCBDJ4W3YQTZYTXLOXNTHL',
            'GB66WWJBXVTB4WLTSMTRBADE2IYUHGEPOHJCBDJ4W3YQTZYTXLOXNTHLNF3ZD'
          ].includes(destination);
        });
        
        setTransactions(marketplaceTransactions);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        setLoading(false);
      }
    };
    
    if (publicKey) {
      fetchTransactions();
    }
  }, [publicKey, server]);
  
  if (!publicKey) return null;
  
  return (
    <div className="transaction-history">
      <h2>Transaction History</h2>
      {loading ? (
        <p>Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p>No transactions found</p>
      ) : (
        <div className="transactions-list">
          {transactions.map(tx => (
            <div key={tx.hash} className="transaction-item">
              <div className="transaction-details">
                <p>Purchased: {tx.asset_type === 'native' ? 'XLM' : tx.asset_code}</p>
                <p>Amount: {tx.amount}</p>
                <p>Date: {new Date(tx.created_at).toLocaleDateString()}</p>
                <p>Status: {tx.successful ? 'Completed' : 'Failed'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;