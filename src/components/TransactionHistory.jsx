import { useState, useEffect } from 'react';
import { Horizon } from '@stellar/stellar-sdk'; 

function extractPaymentDetails(transaction, publicKey) {
  const payments = [];
  if (transaction.operations) {
    transaction.operations.forEach(op => {
      if (op.type === 'payment' && op.source_account === publicKey) {
        payments.push({
          destination: op.destination,
          amount: parseFloat(op.amount).toFixed(7), 
          asset_type: op.asset_type, 
          asset_code: op.asset_code, 
        });
      }
    });
  }
  return payments;
}

function TransactionHistory({ publicKey, server }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!publicKey || !server) {
        console.error("publicKey or server not available in TransactionHistory");
        setError("Wallet not connected or server unavailable.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

      
        const transactionsResponse = await server.transactions()
          .forAccount(publicKey)
          .limit(20) 
          .order('desc')
          .join('transactions') 
          .call();

        
        const processedTransactions = transactionsResponse.records
          .map(tx => {
           
            const payments = extractPaymentDetails(tx, publicKey);

          
            return {
              id: tx.id,
              hash: tx.hash,
              successful: tx.successful,
              createdAt: tx.created_at,
              payments: payments, 
              memo: tx.memo, 
              fee_charged: parseFloat(tx.fee_charged).toFixed(7), 
            };
          })
          .filter(tx => tx.payments.length > 0); 

        setTransactions(processedTransactions);
      } catch (fetchError) {
        console.error('Failed to fetch transactions:', fetchError);
        setError(`Failed to load transactions: ${fetchError.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [publicKey, server]); 

  if (!publicKey) {
    return null; 
  }

  return (
    <div className="transaction-history">
      <h2>Transaction History</h2>
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}
      {loading ? (
        <div className="loading-indicator">
          <p>Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="no-transactions">
          <p>No purchase transactions found.</p>
        </div>
      ) : (
        <div className="transactions-list">
          {transactions.map(tx => (
            <div key={tx.hash} className={`transaction-item ${tx.successful ? 'successful' : 'failed'}`}>
              <div className="transaction-header">
                <div className="transaction-id">
                  ID: <span className="id-truncated">{tx.hash.substring(0, 8)}...{tx.hash.substring(tx.hash.length - 8)}</span>
                </div>
                <div className="transaction-date">
                  {new Date(tx.createdAt).toLocaleString()} 
                </div>
                <div className={`transaction-status ${tx.successful ? 'status-success' : 'status-failed'}`}>
                  {tx.successful ? 'Success' : 'Failed'}
                </div>
              </div>
              <div className="transaction-body">
                <div className="transaction-payments">
                  <h4>Payments Made:</h4>
                  {tx.payments.map((payment, index) => (
                    <div key={index} className="payment-detail">
                      <p><strong>To:</strong> {payment.destination.substring(0, 6)}...{payment.destination.substring(payment.destination.length - 6)}</p>
                      <p><strong>Amount:</strong> {payment.amount} {payment.asset_type === 'native' ? 'XLM' : payment.asset_code}</p>
                    </div>
                  ))}
                </div>
                 {tx.memo && (
                    <div className="transaction-memo">
                      <p><strong>Memo:</strong> {tx.memo}</p>
                    </div>
                  )}
              </div>
              <div className="transaction-footer">
                <p><strong>Fee Paid:</strong> {tx.fee_charged} XLM</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;