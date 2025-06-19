import React from 'react';
import { useAccessibility } from './AccessibilityContext';

const Home = ({ onSwitch }) => {
  const { options } = useAccessibility();

  const dynamicStyles = {
    fontSize: options.largeText ? '1.6rem' : '1.2rem', // Augmenté pour meilleure lisibilité
    fontFamily: options.dyslexicFont ? '"OpenDyslexic", Arial, sans-serif' : 'Arial, sans-serif',
    backgroundColor: options.highContrast ? '#000' : '#f5f5f5',
    color: options.highContrast ? '#fff' : '#34495e',
    lineHeight: options.largeText ? 1.8 : 1.6,
  };

  const containerStyle = {
    backgroundColor: options.highContrast ? '#111' : 'white',
    borderRadius: '12px',
    padding: '50px 40px', // Augmenté le padding
    maxWidth: 700, // Légèrement augmenté
    width: '90%', // Utilise un pourcentage pour plus de flexibilité
    boxShadow: options.highContrast
      ? '0 0 15px 3px #fff'
      : '0 6px 20px rgba(0, 0, 0, 0.15)',
    textAlign: 'center',
    color: options.highContrast ? '#fff' : '#212121',
    margin: '0 auto', // Centrage automatique
  };

  const buttonStyle = (baseColor, hoverColor) => ({
    minWidth: 160, // Augmenté la largeur minimale
    padding: '16px 32px', // Augmenté le padding des boutons
    backgroundColor: options.highContrast 
      ? (baseColor === '#4caf50' ? '#1a5f1a' : '#1565c0')
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
        width: '100%',
        boxSizing: 'border-box', // Important pour éviter les débordements
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

      <div style={containerStyle}>
        <h1
          style={{
            fontWeight: 700,
            fontSize: options.largeText ? '3rem' : '2.8rem',
            marginBottom: 20,
            color: options.highContrast ? '#fff' : '#212121',
            letterSpacing: '-0.5px',
          }}
        >
          Bienvenue
        </h1>

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

        <p
          style={{
            fontSize: options.largeText ? '1.4rem' : '1.25rem',
            lineHeight: 1.7,
            marginBottom: 50,
            textAlign: 'center',
            color: options.highContrast ? '#eee' : '#34495e',
            maxWidth: '600px',
            margin: '0 auto 50px auto',
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
            gap: 30,
            flexWrap: 'wrap',
            marginTop: 20,
          }}
        >
          <button
            onClick={() => onSwitch('login')}
            style={buttonStyle('#4caf50', '#45a049')}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = options.highContrast ? '#2d7a2d' : '#45a049';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = options.highContrast ? '#1a5f1a' : '#4caf50';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Connexion
          </button>

          <button
            onClick={() => onSwitch('register')}
            style={buttonStyle('#2196f3', '#1976d2')}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = options.highContrast ? '#1976d2' : '#1976d2';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = options.highContrast ? '#1565c0' : '#2196f3';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Inscription
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;