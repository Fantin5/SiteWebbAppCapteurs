import React, { useState, useEffect, useRef } from 'react';

const Dashboard = ({ user, onLogout }) => {
  const [sensors, setSensors] = useState([
    { id: 1, name: 'Capteur Température', status: 'active', value: '22.5°C', unit: '°C', min: 18, max: 30, currentValue: 22.5 },
    { id: 2, name: 'Capteur Humidité', status: 'inactive', value: '65%', unit: '%', min: 40, max: 80, currentValue: 65 },
    { id: 3, name: 'Capteur Pression', status: 'active', value: '1013.2 hPa', unit: ' hPa', min: 990, max: 1030, currentValue: 1013.2 },
    { id: 4, name: 'Capteur Luminosité', status: 'active', value: '350 lux', unit: ' lux', min: 0, max: 1000, currentValue: 350 }
  ]);
  const [motorSpeed, setMotorSpeed] = useState(0);
  const [motorRunning, setMotorRunning] = useState(false);
  const [sensorHistory, setSensorHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedSensorForChart, setSelectedSensorForChart] = useState(null);
  const [dataCollectionStarted, setDataCollectionStarted] = useState(false);

  // Use refs to access current values inside the interval without dependencies
  const motorSpeedRef = useRef(motorSpeed);
  const dataCollectionStartedRef = useRef(dataCollectionStarted);
  const intervalRef = useRef(null);

  // Update refs when state changes
  useEffect(() => {
    motorSpeedRef.current = motorSpeed;
  }, [motorSpeed]);

  useEffect(() => {
    dataCollectionStartedRef.current = dataCollectionStarted;
  }, [dataCollectionStarted]);

  useEffect(() => {
    setMotorRunning(motorSpeed > 0);
  }, [motorSpeed]);

  // Generate random coherent values every 10 seconds - FIXED
  useEffect(() => {
    // Clear any existing interval to prevent duplicates
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const timestamp = new Date();
      
      setSensors(prevSensors => {
        const updatedSensors = prevSensors.map(sensor => {
          if (sensor.status === 'active') {
            // Generate coherent random values within realistic ranges
            let newValue;
            const variation = 0.05; // 5% variation for more realistic changes
            const currentVal = sensor.currentValue;
            const minVal = sensor.min;
            const maxVal = sensor.max;
            
            // Add small random variation to current value
            const change = (Math.random() - 0.5) * 2 * variation * currentVal;
            newValue = Math.max(minVal, Math.min(maxVal, currentVal + change));
            
            // Round based on sensor type
            if (sensor.id === 1) { // Temperature
              newValue = Math.round(newValue * 10) / 10;
            } else if (sensor.id === 2) { // Humidity
              newValue = Math.round(newValue);
            } else if (sensor.id === 3) { // Pressure
              newValue = Math.round(newValue * 10) / 10;
            } else if (sensor.id === 4) { // Light
              newValue = Math.round(newValue);
            }
            
            return {
              ...sensor,
              currentValue: newValue,
              value: `${newValue}${sensor.unit}`
            };
          }
          return sensor;
        });
        
        // Only add to history if there are active sensors
        const hasActiveSensors = updatedSensors.some(sensor => sensor.status === 'active');
        if (hasActiveSensors) {
          // Update dataCollectionStarted if not already started
          if (!dataCollectionStartedRef.current) {
            setDataCollectionStarted(true);
          }
          
          // Use ref to get current motor speed without causing dependency issues
          const historyEntry = {
            timestamp: timestamp.toISOString(),
            sensors: updatedSensors.map(sensor => ({
              id: sensor.id,
              name: sensor.name,
              value: sensor.currentValue,
              unit: sensor.unit,
              status: sensor.status
            })),
            motorSpeed: motorSpeedRef.current
          };
          
          setSensorHistory(prev => {
            // Prevent duplicate entries with the same timestamp
            const lastEntry = prev[prev.length - 1];
            if (lastEntry && lastEntry.timestamp === historyEntry.timestamp) {
              return prev; // Don't add duplicate
            }
            return [...prev, historyEntry].slice(-1000); // Keep last 1000 entries
          });
        }
        
        return updatedSensors;
      });
    }, 10000); // Every 10 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // Empty dependencies - interval runs once and never restarts

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

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

  const exportToCSV = () => {
    if (sensorHistory.length === 0) {
      alert('Aucune donnée à exporter. Attendez que les capteurs collectent des données.');
      return;
    }

    const headers = [
      'Date',
      'Heure',
      'Temperature_Celsius',
      'Humidite_Pourcentage',
      'Pression_hPa',
      'Luminosite_Lux',
      'Vitesse_Moteur_Pourcentage'
    ];
    
    const csvContent = [
      headers.join(';'),
      ...sensorHistory.map(entry => {
        const date = new Date(entry.timestamp);
        const temp = entry.sensors.find(s => s.id === 1);
        const humidity = entry.sensors.find(s => s.id === 2);
        const pressure = entry.sensors.find(s => s.id === 3);
        const light = entry.sensors.find(s => s.id === 4);
        
        return [
          date.toLocaleDateString('fr-FR'),
          date.toLocaleTimeString('fr-FR'),
          temp && temp.status === 'active' ? temp.value.toFixed(1) : 'Inactif',
          humidity && humidity.status === 'active' ? humidity.value.toFixed(0) : 'Inactif',
          pressure && pressure.status === 'active' ? pressure.value.toFixed(1) : 'Inactif',
          light && light.status === 'active' ? light.value.toFixed(0) : 'Inactif',
          entry.motorSpeed.toFixed(0)
        ].join(';');
      })
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `donnees_capteurs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSensorToCSV = (sensorId) => {
    if (sensorHistory.length === 0) {
      alert('Aucune donnée à exporter. Attendez que les capteurs collectent des données.');
      return;
    }

    const sensor = sensors.find(s => s.id === sensorId);
    const sensorData = sensorHistory
      .map(entry => {
        const sensorEntry = entry.sensors.find(s => s.id === sensorId);
        return {
          timestamp: entry.timestamp,
          value: sensorEntry ? sensorEntry.value : null,
          status: sensorEntry ? sensorEntry.status : 'inactive'
        };
      })
      .filter(entry => entry.status === 'active' && entry.value !== null);

    if (sensorData.length === 0) {
      alert(`Aucune donnée active trouvée pour ${sensor.name}.`);
      return;
    }

    // Get unit without leading/trailing spaces
    const unit = sensor.unit.trim();
    const unitSuffix = unit ? `_${unit.replace(/[^a-zA-Z0-9]/g, '')}` : '';
    
    const headers = [
      'Date',
      'Heure',
      'Timestamp_ISO',
      `${sensor.name.replace(/\s+/g, '_')}${unitSuffix}`,
      'Valeur_Numerique'
    ];
    
    const csvContent = [
      headers.join(';'),
      ...sensorData.map(entry => {
        const date = new Date(entry.timestamp);
        let numericValue = entry.value;
        
        // Format numeric value based on sensor type
        if (sensor.id === 1) { // Temperature
          numericValue = numericValue.toFixed(1);
        } else if (sensor.id === 2) { // Humidity
          numericValue = numericValue.toFixed(0);
        } else if (sensor.id === 3) { // Pressure
          numericValue = numericValue.toFixed(1);
        } else if (sensor.id === 4) { // Light
          numericValue = numericValue.toFixed(0);
        }
        
        return [
          date.toLocaleDateString('fr-FR'),
          date.toLocaleTimeString('fr-FR'),
          date.toISOString(),
          `${numericValue}${unit}`,
          numericValue
        ].join(';');
      })
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${sensor.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearHistory = () => {
    setSensorHistory([]);
    setDataCollectionStarted(false);
    alert('Historique des données effacé.');
  };

  const showSensorChart = (sensorId) => {
    setSelectedSensorForChart(sensorId);
  };

  const getSensorChartData = (sensorId) => {
    return sensorHistory
      .map(entry => {
        const sensorEntry = entry.sensors.find(s => s.id === sensorId);
        return {
          timestamp: new Date(entry.timestamp),
          value: sensorEntry && sensorEntry.status === 'active' ? sensorEntry.value : null
        };
      })
      .filter(entry => entry.value !== null);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-section">
          <div className="logo">
            <img src="/logo-zenhome.png" alt="ZenHome Logo" className="logo-image" />
            
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
                  <div className="sensor-actions">
                    <button
                      className={`btn sensor-toggle ${sensor.status === 'active' ? 'stop-btn' : 'start-btn'}`}
                      onClick={() => toggleSensor(sensor.id)}
                    >
                      {sensor.status === 'active' ? 'Arrêter' : 'Démarrer'}
                    </button>
                    <button
                      className="btn chart-btn"
                      onClick={() => showSensorChart(sensor.id)}
                      disabled={getSensorChartData(sensor.id).length === 0}
                    >
                      Graphique
                    </button>
                    <button
                      className="btn export-individual-btn"
                      onClick={() => exportSensorToCSV(sensor.id)}
                      disabled={sensorHistory.length === 0}
                    >
                      CSV
                    </button>
                  </div>
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

          <section className="data-export-card">
            <h2>Historique des Données</h2>
            <div className="export-controls">
              <div className="export-info">
                <p><strong>Données collectées:</strong> {sensorHistory.length} entrées</p>
                <p><strong>Collecte:</strong> {dataCollectionStarted ? 'En cours (toutes les 10s)' : 'Pas encore démarrée'}</p>
                {sensorHistory.length > 0 && (
                  <p><strong>Dernière collecte:</strong> {new Date(sensorHistory[sensorHistory.length - 1].timestamp).toLocaleString('fr-FR')}</p>
                )}
              </div>
              <div className="export-buttons">
                <button className="btn export-btn" onClick={exportToCSV} disabled={sensorHistory.length === 0}>
                  Exporter Tout (CSV)
                </button>
                <button className="btn view-btn" onClick={() => setShowHistory(!showHistory)}>
                  {showHistory ? 'Masquer' : 'Voir'} Historique
                </button>
                <button className="btn clear-btn" onClick={clearHistory} disabled={sensorHistory.length === 0}>
                  Effacer Historique
                </button>
              </div>
            </div>
            
            {showHistory && sensorHistory.length > 0 && (
              <div className="history-table">
                <h3>Dernières 10 entrées</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Heure</th>
                        <th>Temp (°C)</th>
                        <th>Humidité (%)</th>
                        <th>Pression (hPa)</th>
                        <th>Lumière (lux)</th>
                        <th>Moteur (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sensorHistory.slice(-10).reverse().map((entry, index) => {
                        const date = new Date(entry.timestamp);
                        const temp = entry.sensors.find(s => s.id === 1);
                        const humidity = entry.sensors.find(s => s.id === 2);
                        const pressure = entry.sensors.find(s => s.id === 3);
                        const light = entry.sensors.find(s => s.id === 4);
                        
                        return (
                          <tr key={index}>
                            <td>{date.toLocaleDateString('fr-FR')}</td>
                            <td>{date.toLocaleTimeString('fr-FR')}</td>
                            <td className={temp?.status === 'active' ? 'active' : 'inactive'}>
                              {temp?.status === 'active' ? temp.value : 'Inactif'}
                            </td>
                            <td className={humidity?.status === 'active' ? 'active' : 'inactive'}>
                              {humidity?.status === 'active' ? humidity.value : 'Inactif'}
                            </td>
                            <td className={pressure?.status === 'active' ? 'active' : 'inactive'}>
                              {pressure?.status === 'active' ? pressure.value : 'Inactif'}
                            </td>
                            <td className={light?.status === 'active' ? 'active' : 'inactive'}>
                              {light?.status === 'active' ? light.value : 'Inactif'}
                            </td>
                            <td>{entry.motorSpeed}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {selectedSensorForChart && (
            <section className="chart-card">
              <h2>Graphique - {sensors.find(s => s.id === selectedSensorForChart)?.name}</h2>
              <div className="chart-container">
                <div className="chart-header">
                  <button className="btn close-chart-btn" onClick={() => setSelectedSensorForChart(null)}>
                    Fermer
                  </button>
                  <button 
                    className="btn export-chart-btn" 
                    onClick={() => exportSensorToCSV(selectedSensorForChart)}
                  >
                    Exporter CSV
                  </button>
                </div>
                <SensorChart 
                  data={getSensorChartData(selectedSensorForChart)}
                  sensor={sensors.find(s => s.id === selectedSensorForChart)}
                />
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

// Simple chart component using SVG
const SensorChart = ({ data, sensor }) => {
  if (!data || data.length === 0) {
    return <div className="no-data">Aucune donnée disponible pour ce capteur.</div>;
  }

  const width = 800;
  const height = 300;
  const margin = { top: 20, right: 30, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Calculate scales
  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;
  const padding = valueRange * 0.1;

  const minTime = Math.min(...data.map(d => d.timestamp.getTime()));
  const maxTime = Math.max(...data.map(d => d.timestamp.getTime()));

  const getX = (timestamp) => {
    return ((timestamp.getTime() - minTime) / (maxTime - minTime)) * chartWidth;
  };

  const getY = (value) => {
    return chartHeight - ((value - minValue + padding) / (valueRange + 2 * padding)) * chartHeight;
  };

  // Create path
  const pathData = data.map((d, i) => {
    const x = getX(d.timestamp);
    const y = getY(d.value);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  return (
    <div className="chart-svg-container">
      <svg width={width} height={height} className="sensor-chart">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#667eea" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#667eea" stopOpacity="0.1"/>
          </linearGradient>
        </defs>
        
        {/* Chart area background */}
        <rect 
          x={margin.left} 
          y={margin.top} 
          width={chartWidth} 
          height={chartHeight} 
          fill="#f8f9fa" 
          stroke="#e9ecef"
        />
        
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <line
            key={ratio}
            x1={margin.left}
            y1={margin.top + ratio * chartHeight}
            x2={margin.left + chartWidth}
            y2={margin.top + ratio * chartHeight}
            stroke="#e9ecef"
            strokeDasharray="2,2"
          />
        ))}
        
        {/* Chart line */}
        <path
          d={pathData}
          fill="none"
          stroke="#667eea"
          strokeWidth="3"
          transform={`translate(${margin.left}, ${margin.top})`}
        />
        
        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={margin.left + getX(d.timestamp)}
            cy={margin.top + getY(d.value)}
            r="4"
            fill="#667eea"
            stroke="white"
            strokeWidth="2"
          />
        ))}
        
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
          const value = minValue - padding + ratio * (valueRange + 2 * padding);
          return (
            <text
              key={ratio}
              x={margin.left - 10}
              y={margin.top + (1 - ratio) * chartHeight + 4}
              textAnchor="end"
              fontSize="12"
              fill="#666"
            >
              {value.toFixed(1)}
            </text>
          );
        })}
        
        {/* X-axis labels */}
        {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 5)) === 0).map((d, i) => (
          <text
            key={i}
            x={margin.left + getX(d.timestamp)}
            y={height - 20}
            textAnchor="middle"
            fontSize="10"
            fill="#666"
          >
            {d.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </text>
        ))}
        
        {/* Axis labels */}
        <text
          x={margin.left + chartWidth / 2}
          y={height - 5}
          textAnchor="middle"
          fontSize="14"
          fill="#333"
        >
          Heure
        </text>
        
        <text
          x={15}
          y={margin.top + chartHeight / 2}
          textAnchor="middle"
          fontSize="14"
          fill="#333"
          transform={`rotate(-90 15 ${margin.top + chartHeight / 2})`}
        >
          {sensor.name} ({sensor.unit.trim()})
        </text>
      </svg>
      
      <div className="chart-stats">
        <p><strong>Points de données:</strong> {data.length}</p>
        <p><strong>Valeur min:</strong> {minValue.toFixed(1)}{sensor.unit}</p>
        <p><strong>Valeur max:</strong> {maxValue.toFixed(1)}{sensor.unit}</p>
        <p><strong>Moyenne:</strong> {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)}{sensor.unit}</p>
      </div>
    </div>
  );
};

export default Dashboard;