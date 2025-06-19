import React from 'react';
import { useAccessibility } from './AccessibilityContext';

const Home = ({ onSwitch }) => {
  const { options } = useAccessibility();

  const dynamicStyles = {
    fontSize: options.largeText ? '1.4rem' : '1.1rem',
    fontFamily: options.dyslexicFont ? '"OpenDyslexic", Arial, sans-serif' : 'sans-serif',
    backgroundColor: options.highContrast ? '#000' : '#f5f5f5',
    color: options.highContrast ? '#fff' : '#34495e',
    lineHeight: options.largeText ? 1.8 : 1.6,
  };

  // Styles du bloc blanc, à inverser en mode contraste élevé
  const containerStyle = {
    backgroundColor: options.highContrast ? '#111' : 'white',
    borderRadius: '12px',
    padding: '40px 30px',
    maxWidth: 600,
    width: '100%',
    boxShadow: options.highContrast
      ? '0 0 10px 2px #fff'
      : '0 4px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    color: options.highContrast ? '#fff' : '#212121',
  };

  // Style des boutons avec adaptation au contraste élevé
  const buttonStyle = (bgColor, hoverColor) => ({
    minWidth: 140,
    padding: '12px 24px',
    backgroundColor: options.highContrast ? '#222' : bgColor,
    color: options.highContrast ? '#fff' : 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  return (
    <div
      style={{
        ...dynamicStyles,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        minHeight: '100vh',
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
          filter: options.highContrast ? 'invert(1)' : 'none', // Inverse logo en mode contraste élevé
        }}
        onClick={() => window.location.reload()}
      />

      <div style={containerStyle}>
        <h1
          style={{
            fontWeight: 600,
            fontSize: '2.5rem',
            marginBottom: 10,
            color: options.highContrast ? '#fff' : '#212121',
          }}
        >
          Bienvenue
        </h1>

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

        <p
          style={{
            fontSize: '1.1rem',
            lineHeight: 1.6,
            marginBottom: 60,
            textAlign: 'justify',
            color: options.highContrast ? '#eee' : '#34495e',
          }}
        >
          Rejoignez notre plateforme pour gérer facilement tous vos capteurs et
          actionneurs. Visualisez vos données, exportez-les et automatisez vos
          équipements pour une maison plus intelligente.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => onSwitch('login')}
            style={buttonStyle('#4caf50', '#45a049')}
            onMouseOver={(e) =>
              (e.target.style.backgroundColor = options.highContrast
                ? '#333'
                : '#45a049')
            }
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = options.highContrast
                ? '#222'
                : '#4caf50')
            }
          >
            Connexion
          </button>

          <button
            onClick={() => onSwitch('register')}
            style={buttonStyle('#2196f3', '#1976d2')}
            onMouseOver={(e) =>
              (e.target.style.backgroundColor = options.highContrast
                ? '#333'
                : '#1976d2')
            }
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = options.highContrast
                ? '#222'
                : '#2196f3')
            }
          >
            Inscription
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
