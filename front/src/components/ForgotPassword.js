import React, { useState } from 'react';
import { api } from '../services/api';
import { useAccessibility } from './AccessibilityContext';

const ForgotPassword = ({ onSwitch }) => {
  const { options } = useAccessibility();

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
      if (result.success) setEmail('');
    } catch {
      setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      role="main"
      style={{
        ...dynamicStyles,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <img
        src="logo-zenhome.png"
        alt="Accueil ZenHome"
        style={{
          width: 140,
          height: 'auto',
          position: 'fixed',
          top: 30,
          left: 30,
          cursor: 'pointer',
          zIndex: 1000,
          filter: options.highContrast ? 'invert(1) brightness(1.2)' : 'none',
        }}
        onClick={() => window.location.reload()}
      />

      <section style={containerStyle} aria-labelledby="forgot-title">
        <h2
          id="forgot-title"
          style={{
            fontWeight: 700,
            fontSize: options.largeText ? '2.8rem' : '2.5rem',
            marginBottom: 20,
            letterSpacing: '-0.5px',
          }}
        >
          Mot de passe oublié
        </h2>

        <div
          style={{
            width: 220,
            height: 5,
            margin: '0 auto 40px',
            borderRadius: 3,
            background: options.highContrast
              ? 'linear-gradient(to right, #fff, #ccc)'
              : 'linear-gradient(to right, #4caf50, #2196f3)',
          }}
        />

        <div
          aria-live="polite"
          role="status"
          style={{
            minHeight: '1.5em',
            marginBottom: '20px',
          }}
        >
          {message && (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: isSuccess ? '#d4edda' : '#f8d7da',
                color: isSuccess ? '#155724' : '#721c24',
                border: `1px solid ${isSuccess ? '#c3e6cb' : '#f5c6cb'}`,
              }}
            >
              {message}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ textAlign: 'left' }}
          aria-label="Formulaire de réinitialisation de mot de passe"
        >
          <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Adresse email :
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            aria-required="true"
            aria-label="Adresse email"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease',
              outline: 'none',
              marginBottom: '30px',
              fontFamily: dynamicStyles.fontFamily,
            }}
            onFocus={(e) => (e.target.style.borderColor = '#2196f3')}
            onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
          />

          <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={isLoading}
              aria-disabled={isLoading}
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
              {isLoading ? 'Envoi en cours...' : 'Réinitialiser'}
            </button>

            <button
              type="button"
              onClick={() => onSwitch('login')}
              disabled={isLoading}
              aria-disabled={isLoading}
              aria-label="Retour à la page de connexion"
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

export default ForgotPassword;
