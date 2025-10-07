import Product from './Product';
import tshirtImg from '../assets/products/tshirt.jpg';
import mugImg from '../assets/products/mug.jpg';

const products = [
  { 
    id: 1, 
    name: 'Stellar T-Shirt', 
    price: '5', 
    seller: 'GB66WWJBXVTB4WLTSMTRBADE2IYUHGEPOHJCBDJ4W3YQTZYTXLOXNTHL',
    image: tshirtImg
  },
  { 
    id: 2, 
    name: 'Stellar Mug', 
    price: '5', 
    seller: 'GB66WWJBXVTB4WLTSMTRBADE2IYUHGEPOHJCBDJ4W3YQTZYTXLOXNTHL',
    image: mugImg
  },
];

const tokenOptions = [
  { code: 'XLM', issuer: null, name: 'Lumens' },
  { 
    code: 'USDC', 
    issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', 
    name: 'USD Coin' 
  },
  { 
    code: 'BTC', 
    issuer: 'GAUTUYY2USFTMQ623754DHX2RUMQ7V45TGTYOISG6N2LNCVYQ66554LZ', 
    name: 'Bitcoin' 
  }
];

function ProductList({ publicKey, kit, server, setStatus }) {
  return (
    <div className="product-list">
      <h2>Available Products</h2>
      {products.map((product) => (
        <Product
          key={product.id}
          product={product}
          publicKey={publicKey}
          kit={kit}
          server={server}
          setStatus={setStatus}
          tokenOptions={tokenOptions}
        />
      ))}
    </div>
  );
}

export default ProductList;