import React, { useState } from 'react';
import { api } from '../services/api';

const ForgotPassword = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await api.forgotPassword(email);
      setMessage(result.message);
      setIsSuccess(result.success);
      if (result.success) {
        setEmail('');
      }
    } catch (error) {
      setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Mot de passe oublié</h2>
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? 'Envoi en cours...' : 'Réinitialiser le mot de passe'}
        </button>
        <button
          type="button"
          className="btn back-btn"
          onClick={() => onSwitch('login')}
          disabled={isLoading}
        >
          Retour
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword; 