import React, { useState } from 'react';
import { api } from '../services/api';
import { useSearchParams } from 'react-router-dom';

const ResetPassword = ({ onSwitch }) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await api.resetPassword(token, password);
      setMessage(result.message);
      setIsSuccess(result.success);
      if (result.success) {
        setPassword('');
        setConfirmPassword('');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          onSwitch('login');
        }, 2000);
      }
    } catch (error) {
      setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="form-container">
        <div className="message error">
          Lien de réinitialisation invalide.
        </div>
        <button className="btn" onClick={() => onSwitch('login')}>
          Retour à la connexion
        </button>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2>Réinitialisation du mot de passe</h2>
      {message && (
        <div className={`message ${isSuccess ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">Nouveau mot de passe:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength="8"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmer le mot de passe:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength="8"
          />
        </div>
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
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

export default ResetPassword; 