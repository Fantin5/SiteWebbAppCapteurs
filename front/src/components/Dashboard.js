import React, { useState, useEffect } from 'react';

const Dashboard = ({ user, onLogout }) => {
  const [sensors, setSensors] = useState([
    { id: 1, name: 'Capteur Température', status: 'active', value: '22.5°C' },
    { id: 2, name: 'Capteur Humidité', status: 'inactive', value: '65%' },
    { id: 3, name: 'Capteur Pression', status: 'active', value: '1013.2 hPa' },
    { id: 4, name: 'Capteur Luminosité', status: 'active', value: '350 lux' }
  ]);
  const [motorSpeed, setMotorSpeed] = useState(0);
  const [motorRunning, setMotorRunning] = useState(false);

  useEffect(() => {
    setMotorRunning(motorSpeed > 0);
  }, [motorSpeed]);

  const toggleSensor = (id) => {
    setSensors(prevSensors =>
      prevSensors.map(sensor =>
        sensor.id === id
          ? { ...sensor, status: sensor.status === 'active' ? 'inactive' : 'active' }
          : sensor
      )
    );
  };

  const handleSpeedChange = (e) => {
    setMotorSpeed(parseInt(e.target.value));
  };

  const resetAllSensors = () => {
    setSensors(prevSensors =>
      prevSensors.map(sensor => ({ ...sensor, status: 'active' }))
    );
  };

  const stopAllSensors = () => {
    setSensors(prevSensors =>
      prevSensors.map(sensor => ({ ...sensor, status: 'inactive' }))
    );
    setMotorSpeed(0);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-section">
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
              <rect x="20" y="20" width="60" height="60" rx="8" stroke="#667eea" strokeWidth="3" fill="none"/>
              <circle cx="35" cy="35" r="3" fill="#667eea"/>
              <circle cx="65" cy="35" r="3" fill="#667eea"/>
              <circle cx="35" cy="65" r="3" fill="#667eea"/>
              <circle cx="65" cy="65" r="3" fill="#667eea"/>
              <path d="M35 35 L65 35 L65 65 L35 65 Z" stroke="#667eea" strokeWidth="2" fill="rgba(102, 126, 234, 0.1)"/>
            </svg>
            <h1>ZenHome</h1>
          </div>
        </div>
        <div className="user-section">
          <span>Bienvenue, {user.prenom || user.email}</span>
          <button className="btn logout-btn" onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          <section className="user-info-card">
            <h2>Profil Utilisateur</h2>
            <div className="user-details">
              <p><strong>Email:</strong> {user.email}</p>
              {user.nom && <p><strong>Nom:</strong> {user.nom}</p>}
              {user.prenom && <p><strong>Prénom:</strong> {user.prenom}</p>}
            </div>
          </section>

          <section className="sensors-card">
            <h2>Gestion des Capteurs</h2>
            <div className="sensors-controls">
              <button className="btn control-btn active-btn" onClick={resetAllSensors}>
                Activer Tous
              </button>
              <button className="btn control-btn stop-btn" onClick={stopAllSensors}>
                Arrêter Tous
              </button>
            </div>
            <div className="sensors-grid">
              {sensors.map(sensor => (
                <div key={sensor.id} className={`sensor-item ${sensor.status}`}>
                  <div className="sensor-info">
                    <h4>{sensor.name}</h4>
                    <p className="sensor-value">{sensor.value}</p>
                    <span className={`status-badge ${sensor.status}`}>
                      {sensor.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <button
                    className={`btn sensor-toggle ${sensor.status === 'active' ? 'stop-btn' : 'start-btn'}`}
                    onClick={() => toggleSensor(sensor.id)}
                  >
                    {sensor.status === 'active' ? 'Arrêter' : 'Démarrer'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="motor-control-card">
            <h2>Contrôle Moteur</h2>
            <div className="motor-container">
              <div className="motor-visual">
                <div className={`motor ${motorRunning ? 'running' : ''}`} style={{
                  animationDuration: motorSpeed > 0 ? `${2 - (motorSpeed / 100)}s` : '2s'
                }}>
                  <div className="motor-center"></div>
                  <div className="motor-blade blade-1"></div>
                  <div className="motor-blade blade-2"></div>
                  <div className="motor-blade blade-3"></div>
                  <div className="motor-blade blade-4"></div>
                </div>
                <p className="motor-status">
                  {motorRunning ? `Moteur en marche - ${motorSpeed}%` : 'Moteur arrêté'}
                </p>
              </div>
              <div className="speed-control">
                <label htmlFor="speed-slider">Vitesse: {motorSpeed}%</label>
                <input
                  type="range"
                  id="speed-slider"
                  min="0"
                  max="100"
                  value={motorSpeed}
                  onChange={handleSpeedChange}
                  className="speed-slider"
                />
                <div className="speed-buttons">
                  <button className="btn speed-btn" onClick={() => setMotorSpeed(0)}>Arrêt</button>
                  <button className="btn speed-btn" onClick={() => setMotorSpeed(25)}>25%</button>
                  <button className="btn speed-btn" onClick={() => setMotorSpeed(50)}>50%</button>
                  <button className="btn speed-btn" onClick={() => setMotorSpeed(75)}>75%</button>
                  <button className="btn speed-btn" onClick={() => setMotorSpeed(100)}>100%</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
