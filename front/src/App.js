import React, { useState } from 'react';
import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

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
      case 'dashboard':
        return <Dashboard user={user} onLogout={handleLogout} />;
      default:
        return <Home onSwitch={handlePageSwitch} />;
    }
  };

  return (
    <div className="App">
      <div className="container">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
