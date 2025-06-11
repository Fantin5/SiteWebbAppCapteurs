import React from 'react';

const Home = ({ onSwitch }) => {
  return (
    <div id="homepage">
      <h1>Bienvenue</h1>
      <button className="btn" onClick={() => onSwitch('login')}>
        Connexion
      </button>
      <button className="btn" onClick={() => onSwitch('register')}>
        S'inscrire
      </button>
    </div>
  );
};

export default Home;
