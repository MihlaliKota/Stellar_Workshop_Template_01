import { useState, useEffect } from 'react';
import { Horizon } from '@stellar/stellar-sdk';

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
          .limit(3) 
          .order('desc')
          .call();

        const processedTransactions = [];

        for (const tx of transactionsResponse.records) {
          let processedTx = {
            id: tx.id || '', 
            hash: tx.hash || '', 
            successful: tx.successful !== undefined ? tx.successful : false, 
            createdAt: tx.created_at || '', 
            payments: [], 
            memo: tx.memo || '', 
            fee_charged: parseFloat(tx.fee_charged || '0').toFixed(7), 
          };

          let operations = [];
          try {
            const operationsResponse = await server.operations()
              .forTransaction(tx.id) 
              .call();
            operations = operationsResponse.records || []; 
          } catch (opError) {
            console.warn(`Failed to fetch operations for transaction ${tx.id}:`, opError);
          }

          
          const payments = [];
          for (const op of operations) {
            if (op.type === 'payment' && op.source_account === publicKey) {
              payments.push({
                destination: op.destination || '', 
                amount: parseFloat(op.amount || '0').toFixed(7), 
                asset_type: op.asset_type || 'native', 
                asset_code: op.asset_code || 'XLM', 
              });
            }
          }


          processedTx.payments = payments;

          processedTransactions.push(processedTx);
        }

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
          {transactions.map((tx, index) => (
            <div key={`${tx.hash}-${index}`} className={`transaction-item ${tx.successful ? 'successful' : 'failed'}`}>
              <div className="transaction-header">
                <div className="transaction-id">
                  ID: <span className="id-truncated">
                    {tx.hash ? `${tx.hash.substring(0, 8)}...${tx.hash.substring(tx.hash.length - 8)}` : 'N/A'}
                  </span>
                </div>
                <div className="transaction-date">
                  {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'Date Unknown'}
                </div>
                <div className={`transaction-status ${tx.successful ? 'status-success' : 'status-failed'}`}>
                  {tx.successful ? 'Success' : 'Failed'}
                </div>
              </div>
              <div className="transaction-body">
                <div className="transaction-payments">
                  <h4>Payments Made:</h4>
                  {tx.payments.length > 0 ? (
                    tx.payments.map((payment, pIndex) => (
                      <div key={pIndex} className="payment-detail">
                        <p><strong>To:</strong> {payment.destination ? `${payment.destination.substring(0, 6)}...${payment.destination.substring(payment.destination.length - 6)}` : 'Unknown Address'}</p>
                        <p><strong>Amount:</strong> {payment.amount} {payment.asset_type === 'native' ? 'XLM' : payment.asset_code}</p>
                      </div>
                    ))
                  ) : (
                    <p>No payment details available for this transaction.</p>
                  )}
                </div>
                 {tx.memo && tx.memo.trim() !== '' && (
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