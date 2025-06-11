import React, { useState } from 'react';
import { api } from '../services/api';

const Login = ({ onLogin, onSwitch }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await api.login(formData.email, formData.password);
      
      if (result.success) {
        setMessage(result.message);
        setIsSuccess(true);
        setTimeout(() => {
          onLogin(result.user);
        }, 1000);
      } else {
        setMessage(result.message);
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Erreur de connexion au serveur.');
      setIsSuccess(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Connexion</h2>
      {message && (
        <div className={`message ${isSuccess ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Mot de passe:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn">Se connecter</button>
        <button type="button" className="btn back-btn" onClick={() => onSwitch('home')}>
          Retour
        </button>
      </form>
    </div>
  );
};

export default Login;
