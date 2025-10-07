import { useState } from 'react';
import { TransactionBuilder, Operation, Asset, Networks } from '@stellar/stellar-sdk';
import { useCart } from '../context/CartContext';

function Product({ product, publicKey, kit, server, setStatus }) {
  const [localStatus, setLocalStatus] = useState('');

  const { addToCart } = useCart();

  const handleBuy = async () => {
    setLocalStatus('Processing...');
    setStatus('Processing payment...');

    try {
      // Step 1: Load buyer's account from Stellar network
      const account = await server.loadAccount(publicKey);

      // Step 2: Build the payment transaction
      const transaction = new TransactionBuilder(account, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: Networks.TESTNET,
      })
      .addOperation(
        Operation.payment({
          destination: product.seller,
          asset: Asset.native(), // XLM
          amount: product.price,
        })
      )
      .setTimeout(30)
      .build();

      // Step 3: Sign transaction with user's wallet
      const { signedTxXdr } = await kit.signTransaction(transaction.toXDR(), {
        address: publicKey,
        networkPassphrase: Networks.TESTNET,
      });

      // Step 4: Submit transaction to Stellar network
      const signedTransaction = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
      await server.submitTransaction(signedTransaction);

      setLocalStatus('Purchase successful!');
      setStatus(`Successfully bought ${product.name}!`);
    } catch (error) {
      console.error('Purchase failed:', error);
      setLocalStatus('Purchase failed.');
      setStatus('Payment failed. Check console for details.');
    }
  };

  return (
    <div className="product">
      {product.image && (
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-image"
        />
      )}
      <h3>{product.name}</h3>
      <p>Price: {product.price} XLM</p>
      <button onClick={handleBuy}>Buy</button>
      <button onClick={() => addToCart(product)}>Add to Cart</button>
      <button onClick={handleBuy}>Buy Now</button>
      <p>{localStatus}</p>
    </div>
  );
}

export default Product;