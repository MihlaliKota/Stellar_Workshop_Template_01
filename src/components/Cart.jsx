import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { TransactionBuilder, Operation, Asset, Networks, Transaction } from '@stellar/stellar-sdk';


function Cart({ publicKey, kit, server, setStatus }) {
  const { cartItems, totalPrice, clearCart } = useCart(); // Ensure these match CartContext provider
  const [processing, setProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!publicKey || cartItems.length === 0) return;
    setProcessing(true);
    setStatus('Processing checkout...');
    try {
      // Load buyer's account
      const account = await server.loadAccount(publicKey);

      // Build transaction for all items
      // Note: SDK v14.x uses TransactionBuilder, Operation, Asset, Networks
      const transaction = new TransactionBuilder(account, {
        fee: await server.fetchBaseFee(), // Use the server instance passed down
        networkPassphrase: Networks.TESTNET,
      });

      // Add payment operations for each unique seller
      const sellers = {};
      cartItems.forEach(item => {
        if (!sellers[item.seller]) {
          sellers[item.seller] = 0;
        }
        // Ensure price is treated as a number and formatted correctly
        sellers[item.seller] += parseFloat(item.price) * item.quantity;
      });

      Object.entries(sellers).forEach(([seller, amount]) => {
        // Use Operation.payment from the imported SDK
        transaction.addOperation(
          Operation.payment({
            destination: seller,
            asset: Asset.native(), // Use Asset.native from the imported SDK
            amount: amount.toFixed(7), // Format amount as string with correct decimals
          })
        );
      });

      // Build transaction
      const builtTransaction = transaction.setTimeout(30).build(); // Use setTimeout from builder

      // Sign transaction with user's wallet using the kit instance passed down
      const { signedTxXdr } = await kit.signTransaction(builtTransaction.toXDR(), {
        address: publicKey,
        networkPassphrase: Networks.TESTNET,
      });

      // Rebuild the transaction object from the signed XDR using the SDK
      // SDK v14.x: Use TransactionBuilder.fromXDR
      const signedTransaction = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);

      // Submit transaction to Stellar network using the server instance passed down
      await server.submitTransaction(signedTransaction); // Use the server instance passed down

      setStatus(`Successfully purchased ${cartItems.length} items!`);
      clearCart(); // Use clearCart from the context
    } catch (error) {
      console.error('Checkout failed:', error);
      setStatus('Checkout failed. Check console for details.');
    } finally {
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart empty-cart">
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="cart">
      <h2>Your Cart</h2>
      <div className="cart-items">
        {cartItems.map(item => (
          <div key={item.id} className="cart-item"> {/* Use item.id as key */}
            <img src={item.image} alt={item.name} className="cart-item-image" />
            <div className="cart-item-details">
              <h3>{item.name}</h3>
              <p>{item.quantity} × {item.price} XLM</p>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <p>Total: {totalPrice.toFixed(2)} XLM</p>
        <button
          onClick={handleCheckout}
          disabled={processing || !publicKey} // Disable button during processing or if not connected
        >
          {processing ? 'Processing...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
}

export default Cart;