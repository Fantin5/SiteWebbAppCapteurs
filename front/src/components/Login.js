import React, { useState } from 'react';
import { api } from '../services/api';
import { useAccessibility } from './AccessibilityContext';

const Login = ({ onLogin, onSwitch }) => {
  const { options } = useAccessibility(); // récupération des options

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Styles dynamiques basés sur les options d'accessibilité
  const dynamicStyles = {
    fontSize: options.largeText ? '1.6rem' : '1.2rem', // Augmenté pour meilleure lisibilité
    fontFamily: options.dyslexicFont ? '"OpenDyslexic", Arial, sans-serif' : 'Arial, sans-serif',
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
        padding: '40px 20px', // Augmenté le padding
        minHeight: '100vh',
        backgroundColor: options.highContrast ? '#000' : '#f5f5f5',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <img
        src="logo-zenhome.png"
        alt="Logo ZenHome"
        style={{
          width: 140, // Augmenté la taille du logo
          height: 'auto',
          position: 'fixed',
          top: 30, // Légèrement décalé
          left: 30,
          cursor: 'pointer',
          zIndex: 1000,
          filter: options.highContrast ? 'invert(1) brightness(1.2)' : 'none',
        }}
        onClick={() => window.location.reload()}
      />

      <div
        style={{
          backgroundColor: options.highContrast ? '#111' : 'white',
          padding: '50px 40px', // Augmenté le padding
          borderRadius: '12px',
           boxShadow: options.highContrast
            ? '0 0 15px 3px #fff'
            : '0 6px 20px rgba(0, 0, 0, 0.15)',
          maxWidth: 600, // Augmenté la largeur maximale
          width: '90%', // Utilise un pourcentage pour plus de flexibilité
          boxSizing: 'border-box',
          color: options.highContrast ? '#fff' : '#34495e',
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontWeight: 700, // Plus gras
            fontSize: options.largeText ? '3rem' : '2.8rem', // Augmenté
            color: options.highContrast ? '#fff' : '#212121',
            marginBottom: 20, // Plus d'espace
            textAlign: 'center',
            fontFamily: dynamicStyles.fontFamily,
            letterSpacing: '-0.5px',
          }}
        >
          Connexion
        </h2>

        <div
          style={{
            width: 220, // Augmenté la largeur
            height: 5, // Augmenté la hauteur
            margin: '0 auto 40px', // Plus d'espace
            borderRadius: 3,
            background: options.highContrast
              ? 'linear-gradient(to right, #fff, #ccc)'
              : 'linear-gradient(to right, #4caf50, #2196f3)',
          }}
        />

        {message && (
          <div
            style={{
              padding: '16px 20px', // Augmenté le padding
              borderRadius: '8px',
              marginBottom: '25px', // Plus d'espace
              backgroundColor: options.highContrast 
                ? (isSuccess ? '#1a5f1a' : '#5f1a1a')
                : (isSuccess ? '#d4edda' : '#f8d7da'),
              color: options.highContrast
                ? '#fff'
                : (isSuccess ? '#155724' : '#721c24'),
              border: options.highContrast
                ? `2px solid ${isSuccess ? '#4caf50' : '#f44336'}`
                : `1px solid ${isSuccess ? '#c3e6cb' : '#f5c6cb'}`,
              textAlign: 'center',
              fontSize: options.largeText ? '1.3rem' : '1.1rem', // Taille appropriée
              fontFamily: dynamicStyles.fontFamily,
              fontWeight: '500',
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '25px' }}> {/* Plus d'espace */}
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '12px', // Plus d'espace
                fontWeight: '600', // Plus gras
                color: options.highContrast ? '#fff' : '#34495e',
                fontSize: options.largeText ? '1.4rem' : '1.1rem', // Taille appropriée
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
                padding: '16px 20px', // Augmenté le padding
                border: options.highContrast 
                  ? '2px solid #555' 
                  : '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: options.largeText ? '1.3rem' : '1.1rem', // Taille appropriée
                boxSizing: 'border-box',
                outline: 'none',
                fontFamily: dynamicStyles.fontFamily,
                backgroundColor: options.highContrast ? '#222' : 'white',
                color: options.highContrast ? '#fff' : '#34495e',
                transition: 'border-color 0.3s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = options.highContrast ? '#fff' : '#2196f3')}
              onBlur={(e) => (e.target.style.borderColor = options.highContrast ? '#555' : '#e0e0e0')}
            />
          </div>

          <div style={{ marginBottom: '25px' }}> {/* Plus d'espace */}
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '12px', // Plus d'espace
                fontWeight: '600', // Plus gras
                color: options.highContrast ? '#fff' : '#34495e',
                fontSize: options.largeText ? '1.4rem' : '1.1rem', // Taille appropriée
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
                padding: '16px 20px', // Augmenté le padding
                border: options.highContrast 
                  ? '2px solid #555' 
                  : '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: options.largeText ? '1.3rem' : '1.1rem', // Taille appropriée
                boxSizing: 'border-box',
                outline: 'none',
                fontFamily: dynamicStyles.fontFamily,
                backgroundColor: options.highContrast ? '#222' : 'white',
                color: options.highContrast ? '#fff' : '#34495e',
                transition: 'border-color 0.3s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = options.highContrast ? '#fff' : '#2196f3')}
              onBlur={(e) => (e.target.style.borderColor = options.highContrast ? '#555' : '#e0e0e0')}
            />
            <div style={{ textAlign: 'right', marginTop: '12px' }}> {/* Plus d'espace */}
              <button
                type="button"
                onClick={() => onSwitch('forgot-password')}
                disabled={isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: options.highContrast ? '#87ceeb' : '#2196f3',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: options.largeText ? '1.1rem' : '1rem', // Taille appropriée
                  textDecoration: 'underline',
                  fontFamily: dynamicStyles.fontFamily,
                  padding: '4px 8px', // Ajout de padding pour zone de clic
                  borderRadius: '4px',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = options.highContrast ? '#333' : '#f0f8ff')}
                onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = 'transparent')}
              >
                Mot de passe oublié ?
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '40px', flexWrap: 'wrap' }}> {/* Plus d'espace */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                minWidth: '140px', // Largeur minimale
                padding: '16px 32px', // Augmenté le padding
                backgroundColor: isLoading 
                  ? '#cccccc' 
                  : (options.highContrast ? '#1a5f1a' : '#4caf50'),
                color: 'white',
                border: options.highContrast ? '2px solid #4caf50' : 'none',
                borderRadius: '8px',
                fontSize: options.largeText ? '1.3rem' : '1.1rem', // Taille appropriée
                fontWeight: '600', // Plus gras
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: dynamicStyles.fontFamily,
                transition: 'all 0.3s ease',
                boxShadow: options.highContrast 
                  ? 'none' 
                  : '0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
              onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = options.highContrast ? '#2d7a2d' : '#45a049')}
              onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = options.highContrast ? '#1a5f1a' : '#4caf50')}
            >
              {isLoading ? 'Connexion...' : 'Connexion'}
            </button>

            <button
              type="button"
              onClick={() => onSwitch('home')}
              disabled={isLoading}
              style={{
                flex: 1,
                minWidth: '140px', // Largeur minimale
                padding: '16px 32px', // Augmenté le padding
                backgroundColor: isLoading 
                  ? '#cccccc' 
                  : (options.highContrast ? '#444' : '#6c757d'),
                color: 'white',
                border: options.highContrast ? '2px solid #6c757d' : 'none',
                borderRadius: '8px',
                fontSize: options.largeText ? '1.3rem' : '1.1rem', // Taille appropriée
                fontWeight: '600', // Plus gras
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: dynamicStyles.fontFamily,
                transition: 'all 0.3s ease',
                boxShadow: options.highContrast 
                  ? 'none' 
                  : '0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
              onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = options.highContrast ? '#555' : '#5a6268')}
              onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = options.highContrast ? '#444' : '#6c757d')}
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