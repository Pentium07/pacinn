import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';   // 👈 import Toaster
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <App />
    <Toaster position="top-right" richColors />  {/* 👈 add Toaster */}
  </Router>
);
