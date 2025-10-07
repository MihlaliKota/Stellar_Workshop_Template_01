# Stellar Marketplace: Template

Welcome to this advanced walkthrough where you'll build an improved decentralized marketplace on the Stellar blockchain!
By the end of this guide, you'll have a more feature-rich web application that connects to Stellar wallets, supports multiple payments, and introduces new marketplace functionality.

## What You'll Build

A modern decentralized marketplace where users can:

Connect their Stellar wallet (xBull or Freighter)

Browse and purchase products in XLM

Add products to a shopping cart

View recent transactions

Enjoy a more interactive, polished interface

## Prerequisites

Basic understanding of React and JavaScript

Node.js installed on your computer

A Stellar wallet (we’ll use Freighter or xBull)

A code editor (VS Code recommended)

## Step 1: Project Setup

Create Your Project

Open your terminal and run these commands:

```bash
# Create a new React project
npm create vite@latest marketplace --template react

# Navigate to the project folder
cd marketplace

# Install required packages
npm install @stellar/stellar-sdk
npm install @creit.tech/stellar-wallets-kit

# Start the development server
npm run dev
```

Your app should now be running at http://localhost:5173

Install a Stellar Wallet

Before you begin coding, install one of these Stellar wallets:

Freighter: freighter.app

xBull: xbull.app

Once installed, switch to TESTNET in your wallet settings.

## Step 2: Understanding the Project Structure

Your project will have the following structure:

```
marketplace/
├── src/
│   ├── components/
│   │   ├── WalletConnector.jsx
│   │   ├── Product.jsx
│   │   ├── ProductList.jsx
│   │   ├── Cart.jsx
│   │   └── TransactionHistory.jsx
│   ├── context/
│   │   └── CartContext.jsx
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
└── vite.config.js
```

## Step 3: Configure Vite (vite.config.js)

Replace the contents of vite.config.js with:

```bash
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
});
```

Why this matters:
This configuration ensures that the Stellar SDK can run smoothly in a browser environment by defining global as window.

## Step 4: Create the Wallet Connector Component

Create src/components/WalletConnector.jsx:

```bash
function WalletConnector({ onConnect }) {
  const wallets = [
    { id: 'xbull', name: 'xBull' },
    { id: 'freighter', name: 'Freighter' },
  ];

  return (
    <div className="wallet-connector">
      <h2>Connect Your Wallet</h2>
      <div>
        {wallets.map(wallet => (
          <button key={wallet.id} onClick={() => onConnect(wallet.id)}>
            Connect with {wallet.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default WalletConnector;
```

What this does:
Creates simple wallet connection buttons that allow users to connect to either xBull or Freighter.

## Step 5: Create the Main App Component

Replace src/App.jsx with:

```bash
import { useState } from 'react';
import { XBULL_ID, FreighterModule, xBullModule, WalletNetwork, StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { Horizon, Networks } from '@stellar/stellar-sdk';
import WalletConnector from './components/WalletConnector';
import ProductList from './components/ProductList';
import TransactionHistory from './components/TransactionHistory';
import Cart from './components/Cart';
import './App.css';

const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: XBULL_ID,
  modules: [new xBullModule(), new FreighterModule()],
});

const server = new Horizon.Server('https://horizon-testnet.stellar.org');

function App() {
  const [publicKey, setPublicKey] = useState(null);
  const [status, setStatus] = useState('');

  const handleConnect = async (walletId) => {
    try {
      await kit.setWallet(walletId);
      const { address } = await kit.getAddress();
      setPublicKey(address);
      setStatus(`Connected with public key: ${address.slice(0, 6)}...`);
    } catch (error) {
      console.error('Connection failed:', error);
      setStatus('Failed to connect wallet.');
    }
  };

  return (
    <div className="app">
      <h1>Stellar Market</h1>
      <WalletConnector onConnect={handleConnect} />
      <p>{status}</p>
      {publicKey && (
        <>
          <ProductList publicKey={publicKey} kit={kit} server={server} setStatus={setStatus} />
          <Cart publicKey={publicKey} kit={kit} server={server} setStatus={setStatus} />
          <TransactionHistory publicKey={publicKey} server={server} />
        </>
      )}
      <p className="note">
        Need test XLM? Use{' '}
        <a href="https://friendbot.stellar.org" target="_blank" rel="noopener noreferrer">
          Friendbot
        </a>.
      </p>
    </div>
  );
}

export default App;
```

What this does:

Initializes wallet connections

Displays marketplace components only after a wallet is connected

Shows real-time transaction feedback

## Step 6: Add Product Components

Create src/components/Product.jsx and src/components/ProductList.jsx.
These handle displaying products, adding to the cart, and making payments in XLM.

You can extend them to include:

Product images

Custom asset types (tokens other than XLM)

## Step 7: Add Context for Cart

Create src/context/CartContext.jsx:

```bash
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  
  useEffect(() => {
    const savedCart = localStorage.getItem('stellar-marketplace-cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('stellar-marketplace-cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };
  
  const removeFromCart = (productId) => {
    setCartItems(prevItems => 
      prevItems.filter(item => item.id !== productId)
    );
  };
  
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = () => {
    setCartItems([]);
  };
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => 
    sum + (parseFloat(item.price) * item.quantity), 0);
  
  return (
    <CartContext.Provider value={{
      cartItems,
      totalItems,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
```

What this does:
Manages global cart state across components, enabling persistent and sharable cart functionality.

## Step 8: Add Styling

Replace src/App.css with:

```bash
.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.wallet-connector, .product, .cart, .dashboard {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.note {
  margin-top: 20px;
  padding: 10px;
  background-color: #fff3cd;
  border-radius: 4px;
}
```

What this does:
Applies a clean layout and consistent design for wallet connection, products, and marketplace views.

## Step 9: Test Your Application

Start the development server:

npm run dev


Get test XLM from Friendbot

Connect your wallet (xBull or Freighter)

Add products to your cart and purchase them

View your transaction history

Understanding Key Additions
New Features Introduced

Shopping Cart — Add multiple items and purchase in one go

Transaction History — View previous purchases directly in the app

Improved UI — Clean, responsive, and user-friendly design

Core Concepts

Wallet Connection: Using Stellar Wallets Kit for xBull and Freighter

Transaction Building: Creating and signing payments on Testnet

Cart State Management: Using React context for global data

Blockchain Interaction: Reading and writing data via Horizon API

Common Issues and Solutions

Wallet won’t connect:
Ensure you’ve switched your wallet to Testnet.

Transaction fails:
Check your XLM balance and request more test funds via Friendbot.

App won’t start:
Make sure dependencies are installed with npm install.

## Next Steps

Now that you’ve built an enhanced marketplace, try adding:

User authentication and profiles

Product images stored on IPFS

Custom Stellar assets (tokens)

Backend API for persistence

Mobile-friendly UI improvements

Congratulations!

You’ve successfully built an upgraded decentralized marketplace on Stellar!
You now understand:

Wallet integration and blockchain payments

Transaction lifecycle from signing to confirmation

State management for cart and transactions

How to expand a tutorial into a full-featured app

Keep experimenting and continue building new decentralized ideas on the Stellar network!