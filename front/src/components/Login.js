import React, { useState } from 'react';
import { api } from '../services/api';
import { useAccessibility } from './AccessibilityContext'; // import du hook

const Login = ({ onLogin, onSwitch }) => {
  const { options } = useAccessibility(); // récupération des options

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Styles dynamiques basés sur les options d’accessibilité
  const dynamicStyles = {
    fontSize: options.largeText ? '1.4rem' : '1.1rem',
    fontFamily: options.dyslexicFont ? '"OpenDyslexic", Arial, sans-serif' : 'sans-serif',
    backgroundColor: options.highContrast ? '#000' : '#f5f5f5',
    color: options.highContrast ? '#fff' : '#34495e',
    lineHeight: options.largeText ? 1.8 : 1.6,
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await api.login(formData.email, formData.password);

      if (result.success) {
        setMessage(result.message);
        setIsSuccess(true);
        localStorage.setItem('user', JSON.stringify(result.user));
        setTimeout(() => onLogin(result.user), 1000);
      } else {
        setMessage(result.message);
        setIsSuccess(false);
      }
    } catch {
      setMessage('Erreur de connexion au serveur.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        ...dynamicStyles,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        minHeight: '100vh',
        backgroundColor: options.highContrast ? '#000' : '#f5f5f5',
      }}
    >
      <img
        src="logo-zenhome.png"
        alt="Logo"
        style={{
          width: 120,
          height: 'auto',
          position: 'fixed',
          top: 20,
          left: 20,
          cursor: 'pointer',
          zIndex: 1000,
        }}
        onClick={() => window.location.reload()}
      />

      <div
        style={{
          backgroundColor: options.highContrast ? '#111' : 'white',
          padding: '40px 30px',
          borderRadius: '12px',
          boxShadow: options.highContrast
            ? '0 4px 12px rgba(255, 255, 255, 0.1)'
            : '0 4px 12px rgba(0, 0, 0, 0.1)',
          maxWidth: 500,
          width: '100%',
          boxSizing: 'border-box',
          color: options.highContrast ? '#fff' : '#34495e',
        }}
      >
        <h2
          style={{
            fontWeight: 600,
            fontSize: '2.5rem',
            color: options.highContrast ? '#fff' : '#212121',
            marginBottom: 10,
            textAlign: 'center',
            fontFamily: dynamicStyles.fontFamily,
          }}
        >
          Connexion
        </h2>

        <div
          style={{
            width: 200,
            height: 4,
            margin: '0 auto 30px',
            borderRadius: 2,
            background: 'linear-gradient(to right, #4caf50, #2196f3)',
          }}
        />

        {message && (
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: isSuccess ? '#d4edda' : '#f8d7da',
              color: isSuccess ? '#155724' : '#721c24',
              border: `1px solid ${isSuccess ? '#c3e6cb' : '#f5c6cb'}`,
              textAlign: 'center',
              fontSize: dynamicStyles.fontSize,
              fontFamily: dynamicStyles.fontFamily,
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: options.highContrast ? '#fff' : '#34495e',
                fontSize: dynamicStyles.fontSize,
                fontFamily: dynamicStyles.fontFamily,
              }}
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: dynamicStyles.fontSize,
                boxSizing: 'border-box',
                outline: 'none',
                fontFamily: dynamicStyles.fontFamily,
                backgroundColor: options.highContrast ? '#222' : 'white',
                color: options.highContrast ? '#fff' : '#34495e',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2196f3')}
              onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: options.highContrast ? '#fff' : '#34495e',
                fontSize: dynamicStyles.fontSize,
                fontFamily: dynamicStyles.fontFamily,
              }}
            >
              Mot de passe:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: dynamicStyles.fontSize,
                boxSizing: 'border-box',
                outline: 'none',
                fontFamily: dynamicStyles.fontFamily,
                backgroundColor: options.highContrast ? '#222' : 'white',
                color: options.highContrast ? '#fff' : '#34495e',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2196f3')}
              onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
            />
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => onSwitch('forgot-password')}
                disabled={isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2196f3',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline',
                  fontFamily: dynamicStyles.fontFamily,
                }}
              >
                Mot de passe oublié ?
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px 24px',
                backgroundColor: isLoading ? '#cccccc' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: dynamicStyles.fontSize,
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: dynamicStyles.fontFamily,
              }}
              onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#45a049')}
              onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = '#4caf50')}
            >
              {isLoading ? 'Connexion...' : 'Connexion'}
            </button>

            <button
              type="button"
              onClick={() => onSwitch('home')}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px 24px',
                backgroundColor: isLoading ? '#cccccc' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: dynamicStyles.fontSize,
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: dynamicStyles.fontFamily,
              }}
              onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#5a6268')}
              onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = '#6c757d')}
            >
              Retour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
