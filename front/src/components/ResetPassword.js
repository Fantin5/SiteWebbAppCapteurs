import React, { useState } from 'react';
import { api } from '../services/api';
import { useSearchParams } from 'react-router-dom';
import { useAccessibility } from './AccessibilityContext';

const ResetPassword = ({ onSwitch }) => {
  const { options } = useAccessibility();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const dynamicStyles = {
    fontSize: options.largeText ? '1.6rem' : '1.2rem',
    fontFamily: options.dyslexicFont ? '"OpenDyslexic", Arial, sans-serif' : 'Arial, sans-serif',
    backgroundColor: options.highContrast ? '#000' : '#f5f5f5',
    color: options.highContrast ? '#fff' : '#34495e',
    lineHeight: options.largeText ? 1.8 : 1.6,
  };

  const containerStyle = {
    backgroundColor: options.highContrast ? '#111' : 'white',
    borderRadius: '12px',
    padding: '50px 40px',
    maxWidth: 700,
    width: '90%',
    boxShadow: options.highContrast
      ? '0 0 15px 3px #fff'
      : '0 6px 20px rgba(0, 0, 0, 0.15)',
    textAlign: 'center',
    color: options.highContrast ? '#fff' : '#212121',
    margin: '0 auto',
  };

  const buttonStyle = (baseColor) => ({
    minWidth: 160,
    padding: '16px 32px',
    backgroundColor: options.highContrast
      ? (baseColor === '#4caf50' ? '#1a5f1a' : '#6c757d')
      : baseColor,
    color: 'white',
    border: options.highContrast ? `2px solid ${baseColor}` : 'none',
    borderRadius: '8px',
    fontSize: options.largeText ? '1.3rem' : '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: options.highContrast
      ? 'none'
      : '0 2px 8px rgba(0, 0, 0, 0.2)',
    fontFamily: dynamicStyles.fontFamily,
  });

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
        setTimeout(() => onSwitch('login'), 2000);
      }
    } catch {
      setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <main style={{ ...dynamicStyles, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', minHeight: '100vh' }}>
        <img
          src="logo-zenhome.png"
          alt="Logo ZenHome"
          style={{
            width: 140,
            position: 'fixed',
            top: 30,
            left: 30,
            cursor: 'pointer',
            filter: options.highContrast ? 'invert(1) brightness(1.2)' : 'none',
          }}
          onClick={() => window.location.reload()}
        />
        <div style={containerStyle}>
          <div role="alert" aria-live="assertive" style={{
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            fontWeight: '500',
          }}>
            Lien de réinitialisation invalide.
          </div>
          <button
            onClick={() => onSwitch('login')}
            style={buttonStyle('#6c757d')}
          >
            Retour à la connexion
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ ...dynamicStyles, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', minHeight: '100vh' }}>
      <img
        src="logo-zenhome.png"
        alt="Logo ZenHome"
        style={{
          width: 140,
          position: 'fixed',
          top: 30,
          left: 30,
          cursor: 'pointer',
          filter: options.highContrast ? 'invert(1) brightness(1.2)' : 'none',
        }}
        onClick={() => window.location.reload()}
      />
      <section style={containerStyle}>
        <h2 style={{ fontWeight: 700, fontSize: options.largeText ? '2.8rem' : '2.5rem', marginBottom: 20 }}>
          Réinitialisation du mot de passe
        </h2>

        <div style={{
          width: 220,
          height: 5,
          margin: '0 auto 30px',
          borderRadius: 3,
          background: options.highContrast
            ? 'linear-gradient(to right, #fff, #ccc)'
            : 'linear-gradient(to right, #4caf50, #2196f3)'
        }} />

        {message && (
          <div role="alert" aria-live="polite" style={{
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            backgroundColor: isSuccess ? '#d4edda' : '#f8d7da',
            color: isSuccess ? '#155724' : '#721c24',
            border: `1px solid ${isSuccess ? '#c3e6cb' : '#f5c6cb'}`,
            fontWeight: '500',
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }} aria-label="Formulaire de réinitialisation du mot de passe">
          <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Nouveau mot de passe :
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength={8}
            aria-required="true"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              marginBottom: '20px',
              outline: 'none',
              fontFamily: dynamicStyles.fontFamily,
            }}
          />

          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Confirmer le mot de passe :
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength={8}
            aria-required="true"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              marginBottom: '30px',
              outline: 'none',
              fontFamily: dynamicStyles.fontFamily,
            }}
          />

          <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={buttonStyle('#4caf50')}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = options.highContrast ? '#2d7a2d' : '#45a049';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = options.highContrast ? '#1a5f1a' : '#4caf50';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>

            <button
              type="button"
              onClick={() => onSwitch('login')}
              disabled={isLoading}
              style={buttonStyle('#6c757d')}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = options.highContrast ? '#5a6268' : '#5a6268';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = options.highContrast ? '#6c757d' : '#6c757d';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              Retour
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default ResetPassword;
