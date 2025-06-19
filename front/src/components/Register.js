import React, { useState } from 'react';
import { useAccessibility } from './AccessibilityContext'; // bien sûr il faut importer le contexte accessibilité
import { api } from '../services/api';

const Register = ({ onSwitch, onLogin }) => {
  const { options } = useAccessibility();

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await api.register(
        formData.nom,
        formData.prenom,
        formData.email,
        formData.password
      );

      if (result.success) {
        setMessage(result.message);
        setIsSuccess(true);
        setFormData({ nom: '', prenom: '', email: '', password: '' });
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

  const baseTextColor = options.highContrast ? '#fff' : '#34495e';
  const background = options.highContrast ? '#000' : '#f5f5f5';
  const containerBg = options.highContrast ? '#111' : 'white';
  const boxShadow = options.highContrast
    ? '0 0 10px 2px #fff'
    : '0 4px 12px rgba(0, 0, 0, 0.1)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        minHeight: '100vh',
        backgroundColor: background,
        fontFamily: options.dyslexicFont
          ? '"OpenDyslexic", Arial, sans-serif'
          : 'sans-serif',
        fontSize: options.largeText ? '1.4rem' : '1.1rem',
        lineHeight: options.largeText ? 1.8 : 1.6,
        color: baseTextColor,
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
          filter: options.highContrast ? 'invert(1)' : 'none',
        }}
        onClick={() => window.location.reload()}
      />

      <div
        style={{
          backgroundColor: containerBg,
          borderRadius: '12px',
          padding: '40px 30px',
          maxWidth: 600,
          width: '100%',
          boxShadow,
          textAlign: 'center',
          color: options.highContrast ? '#fff' : '#212121',
        }}
      >
        <h2
          style={{
            fontWeight: 600,
            fontSize: '2.5rem',
            color: options.highContrast ? '#fff' : '#212121',
            marginBottom: 10,
          }}
        >
          Inscription
        </h2>

        <div
          style={{
            width: 200,
            height: 4,
            margin: '0 auto 30px',
            borderRadius: 2,
            background: options.highContrast
              ? 'linear-gradient(to right, #fff, #ccc)'
              : 'linear-gradient(to right, #4caf50, #2196f3)',
          }}
        />

        {message && (
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: isSuccess
                ? options.highContrast
                  ? '#004d00'
                  : '#d4edda'
                : options.highContrast
                ? '#660000'
                : '#f8d7da',
              color: isSuccess
                ? options.highContrast
                  ? '#b2ffb2'
                  : '#155724'
                : options.highContrast
                ? '#ff9999'
                : '#721c24',
              border: `1px solid ${
                isSuccess
                  ? options.highContrast
                    ? '#66bb66'
                    : '#c3e6cb'
                  : options.highContrast
                  ? '#ff6666'
                  : '#f5c6cb'
              }`,
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            {['nom', 'prenom'].map((field) => (
              <div key={field} style={{ flex: 1 }}>
                <label
                  htmlFor={field}
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: baseTextColor,
                  }}
                >
                  {field === 'nom' ? 'Nom:' : 'Prénom:'}
                </label>
                <input
                  type="text"
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease',
                    outline: 'none',
                    backgroundColor: options.highContrast ? '#222' : 'white',
                    color: options.highContrast ? '#fff' : 'inherit',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#2196f3')}
                  onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
                  required
                />
              </div>
            ))}
          </div>

          {['email', 'password'].map((field) => (
            <div key={field} style={{ marginBottom: '20px' }}>
              <label
                htmlFor={field}
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: baseTextColor,
                }}
              >
                {field === 'email' ? 'Email:' : 'Mot de passe:'}
              </label>
              <input
                type={field === 'password' ? 'password' : 'email'}
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                  outline: 'none',
                  backgroundColor: options.highContrast ? '#222' : 'white',
                  color: options.highContrast ? '#fff' : 'inherit',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#2196f3')}
                onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
                required
              />
            </div>
          ))}

          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '30px',
              justifyContent: 'center',
            }}
          >
            <button
              type="submit"
              disabled={isLoading}
              style={{
                minWidth: 140,
                padding: '12px 24px',
                backgroundColor:
                  isLoading || options.highContrast ? '#222' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) =>
                !isLoading &&
                (e.target.style.backgroundColor = options.highContrast
                  ? '#333'
                  : '#45a049')
              }
              onMouseOut={(e) =>
                !isLoading &&
                (e.target.style.backgroundColor = options.highContrast
                  ? '#222'
                  : '#4caf50')
              }
            >
              {isLoading ? 'Inscription...' : 'Inscription'}
            </button>

            <button
              type="button"
              onClick={() => onSwitch('home')}
              disabled={isLoading}
              style={{
                minWidth: 140,
                padding: '12px 24px',
                backgroundColor: options.highContrast ? '#444' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) =>
                !isLoading &&
                (e.target.style.backgroundColor = options.highContrast
                  ? '#555'
                  : '#5a6268')
              }
              onMouseOut={(e) =>
                !isLoading &&
                (e.target.style.backgroundColor = options.highContrast
                  ? '#444'
                  : '#6c757d')
              }
            >
              Retour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
