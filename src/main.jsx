import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CartProvider } from './context/CartContext'; // This import is crucial
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider> {/* This wrapper is missing */}
      <App />
    </CartProvider>
  </React.StrictMode>
);