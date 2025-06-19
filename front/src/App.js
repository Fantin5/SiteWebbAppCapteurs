import React, { useState } from 'react';
import { AccessibilityProvider } from './components/AccessibilityContext';
import AccessibilityPanel from './components/AccessibilityPanel';

import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const handlePageSwitch = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onLogin={handleLogin} onSwitch={handlePageSwitch} />;
      case 'register':
        return <Register onSwitch={handlePageSwitch} onLogin={handleLogin} />;
      case 'forgot-password':
        return <ForgotPassword onSwitch={handlePageSwitch} />;
      case 'reset-password':
        return <ResetPassword onSwitch={handlePageSwitch} />;
      case 'dashboard':
        return <Dashboard user={user} onLogout={handleLogout} />;
      default:
        return <Home onSwitch={handlePageSwitch} />;
    }
  };

  return (
    <AccessibilityProvider>
      <div className="App">
        {/* Conteneur centré sauf pour dashboard */}
        {currentPage === 'dashboard' ? (
          renderPage()
        ) : (
          <div className="container">
            {renderPage()}
          </div>
        )}

        {/* Accessibilité affichée sur toutes les pages */}
        <AccessibilityPanel />
      </div>
    </AccessibilityProvider>
  );
}

export default App;
