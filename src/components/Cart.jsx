import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { TransactionBuilder, Operation, Asset, Networks, Transaction } from '@stellar/stellar-sdk';


function Cart({ publicKey, kit, server, setStatus }) {
  const { cartItems, totalPrice, clearCart } = useCart(); 
  const [processing, setProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!publicKey || cartItems.length === 0) return;
    setProcessing(true);
    setStatus('Processing checkout...');
    try {

      const account = await server.loadAccount(publicKey);

      const transaction = new TransactionBuilder(account, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: Networks.TESTNET,
      });


      const sellers = {};
      cartItems.forEach(item => {
        if (!sellers[item.seller]) {
          sellers[item.seller] = 0;
        }
        sellers[item.seller] += parseFloat(item.price) * item.quantity;
      });

      Object.entries(sellers).forEach(([seller, amount]) => {
        transaction.addOperation(
          Operation.payment({
            destination: seller,
            asset: Asset.native(), 
            amount: amount.toFixed(7), 
          })
        );
      });


      const builtTransaction = transaction.setTimeout(30).build(); 

      const { signedTxXdr } = await kit.signTransaction(builtTransaction.toXDR(), {
        address: publicKey,
        networkPassphrase: Networks.TESTNET,
      });


      const signedTransaction = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);

   
      await server.submitTransaction(signedTransaction);

      setStatus(`Successfully purchased ${cartItems.length} items!`);
      clearCart(); 
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
          <div key={item.id} className="cart-item">
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
          disabled={processing || !publicKey} 
        >
          {processing ? 'Processing...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
}

export default Cart;