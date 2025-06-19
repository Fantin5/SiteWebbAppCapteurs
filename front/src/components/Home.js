import React from 'react';

const Home = ({ onSwitch }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column', // pour empiler verticalement
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
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

      <h1 style={{ fontWeight: 600, fontSize: '2.5rem', color: '#212121', marginBottom: 10, textAlign: 'center' }}>
        Bienvenue
      </h1>

      <div 
        style={{ 
          width: 200, 
          height: 4, 
          margin: '0 auto 30px', 
          borderRadius: 2, 
          background: 'linear-gradient(to right, #4caf50, #2196f3)'
        }} 
      />

      <p style={{
        fontSize: '1.1rem',
        color: '#34495e',
        lineHeight: 1.6,
        marginBottom: 60,
        maxWidth: 1000,
        textAlign: 'justify',
      }}>
        Rejoignez notre plateforme pour gérer facilement tous vos capteurs et actionneurs. Visualisez vos données, exportez-les et automatisez vos équipements pour une maison plus intelligente.
      </p>


      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'nowrap' }}>
        <button 
          onClick={() => onSwitch('login')} 
          style={{ 
            minWidth: 140,
            padding: '12px 24px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#4caf50'}
        >
          Connexion
        </button>

        <button 
          onClick={() => onSwitch('register')} 
          style={{ 
            minWidth: 140,
            padding: '12px 24px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#1976d2'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#2196f3'}
        >
          Inscription
        </button>
      </div>
    </div>
  );
};

export default Home;
