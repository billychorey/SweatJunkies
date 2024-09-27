// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './components/App';  // Updated import path

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <App />
  </Router>
);
