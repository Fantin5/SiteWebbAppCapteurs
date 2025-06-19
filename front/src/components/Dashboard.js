import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAccessibility } from './AccessibilityContext';
import "./Dashboard.css";

// Configuration des unités pour chaque type de capteur
const UNITES = {
  "Capteur lumière": "lux",
  "Capteur Température": "°C",
  "Capteur Humidité": "%",
  "Capteur de distance": "cm",
};

// URL de base de l'API - VÉRIFIER CETTE LIGNE
const API_BASE = 'http://localhost/SiteWebbAppCapteurs/backend';

export default function Dashboard({ user }) {
  const { options } = useAccessibility();

  // Responsive helpers
  const isMobile = window.innerWidth <= 480;
  const isTablet = window.innerWidth <= 768;

  // Dynamic styles based on accessibility options
  const dynamicStyles = {
    fontSize: options.largeText ? '1.4rem' : isMobile ? '1rem' : '1.1rem',
    fontFamily: options.dyslexicFont ? '"OpenDyslexic", Arial, sans-serif' : '"Inter", sans-serif',
    backgroundColor: options.highContrast ? '#000' : '#f0f4f8',
    color: options.highContrast ? '#fff' : '#34495e',
    lineHeight: options.largeText ? 1.8 : 1.6,
  };

  const containerStyles = {
    backgroundColor: options.highContrast ? '#111' : 'white',
    color: options.highContrast ? '#fff' : '#34495e',
    borderColor: options.highContrast ? '#333' : '#e0e0e0',
  };

  const buttonStyles = {
    fontSize: options.largeText ? '1rem' : isMobile ? '0.8rem' : '0.9rem',
    fontFamily: dynamicStyles.fontFamily,
    padding: options.largeText ? '14px 18px' : isMobile ? '10px 12px' : '12px 16px',
  };

  // États pour le profil utilisateur
  const [profil, setProfil] = useState({
    data: user || null, // Utiliser les données utilisateur passées en props
    loading: !user, // Ne charger que si pas d'utilisateur en props
    error: null
  });

  // États pour les appareils (capteurs et actionneurs)
  const [appareils, setAppareils] = useState({
    data: [],
    loading: true,
    error: null
  });

  // États pour les graphiques
  const [graphique, setGraphique] = useState({
    activeId: null,
    data: [],
    loading: false,
    error: null
  });

  // États des actionneurs (allumé/éteint, ouvert/fermé)
  const [etatsActionneurs, setEtatsActionneurs] = useState({});

  // Seuils pour l'automatisation
  const [seuils, setSeuils] = useState({
    temperature: 25,
    luminosite: 300,
    // Valeurs temporaires pour les inputs
    tempInput: 25,
    lumInput: 300
  });

  // ========== FONCTIONS UTILITAIRES ==========

  // Déconnexion
  const deconnecter = () => {
    // Supprimer les données utilisateur du localStorage
    localStorage.removeItem('user');
    // Rediriger vers la page de connexion
    window.location.href = '/login';
  };

  // Formater le nom d'un appareil (première lettre en majuscule)
  const formaterNom = (nom) => {
    return nom.split(' ')
      .map(mot => mot.charAt(0).toUpperCase() + mot.slice(1))
      .join(' ');
  };

  // Obtenir l'état lisible d'un actionneur
  const obtenirEtatLisible = (appareil) => {
    const etat = etatsActionneurs[appareil.id];
    
    if (etat === undefined) return "Inconnu";
    
    // Pour les capteurs
    if (appareil.is_capteur) {
      return etat === 1 ? "Allumé" : "Éteint";
    }
    
    // Pour les volets (servo/moteur)
    if (appareil.nom.toLowerCase().includes("servo") || 
        appareil.nom.toLowerCase().includes("moteur")) {
      return etat === 0 ? "Fermé" : "Ouvert";
    }
    
    // Pour les autres actionneurs
    return etat === 1 ? "Allumé" : "Éteint";
  };

  // ========== CHARGEMENT DES DONNÉES ==========

  // Charger la liste des appareils
  const chargerAppareils = async () => {
    try {
      const response = await fetch(`${API_BASE}/api.php`);
      if (!response.ok) throw new Error("Erreur réseau");
      
      const data = await response.json();
      setAppareils({ data, loading: false, error: null });
      
      // Initialiser les états des actionneurs
      const etatsInitiaux = {};
      data.forEach(appareil => {
        etatsInitiaux[appareil.id] = 0;
      });
      setEtatsActionneurs(etatsInitiaux);
    } catch (error) {
      setAppareils({ data: [], loading: false, error: error.message });
    }
  };

  // Charger les données d'un graphique
  const chargerGraphique = async (id) => {
    setGraphique(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`${API_BASE}/api.php?id_composant=${id}`);
      if (!response.ok) throw new Error("Erreur réseau");
      
      const data = await response.json();
      const donneesFormatees = data.map(item => ({
        date: new Date(item.date).toLocaleString(),
        valeur: Number(item.valeur),
      }));
      
      setGraphique(prev => ({ 
        ...prev, 
        data: donneesFormatees, 
        loading: false 
      }));
    } catch (error) {
      setGraphique(prev => ({ 
        ...prev, 
        data: [], 
        loading: false, 
        error: error.message 
      }));
    }
  };

  // Charger le profil utilisateur avec l'ID de l'utilisateur connecté
  const chargerProfil = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/user.php?user_id=${userId}`);
      if (!response.ok) throw new Error("Erreur réseau");
      
      const data = await response.json();
      setProfil({ data, loading: false, error: null });
    } catch (error) {
      setProfil({ data: null, loading: false, error: error.message });
    }
  };

  // ========== GESTION DES ACTIONS ==========

  // Afficher/cacher un graphique
  const basculerGraphique = (id) => {
    if (graphique.activeId === id) {
      setGraphique(prev => ({ ...prev, activeId: null }));
    } else {
      setGraphique(prev => ({ ...prev, activeId: id }));
      chargerGraphique(id);
    }
  };

  // Exporter les données en CSV
  const exporterCSV = async (id, nom) => {
    try {
      const response = await fetch(`${API_BASE}/api.php?id_composant=${id}`);
      if (!response.ok) throw new Error("Erreur réseau");
      
      const data = await response.json();
      if (!data.length) {
        alert("Aucune donnée à exporter.");
        return;
      }

      // Créer le contenu CSV
      const csvHeader = "Date,Valeur\n";
      const csvRows = data.map(item => {
        const date = new Date(item.date).toLocaleString();
        return `"${date}","${item.valeur}"`;
      });
      const csvContent = csvHeader + csvRows.join("\n");

      // Télécharger le fichier
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${nom.replace(/\s+/g, "_")}_mesures.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Erreur lors de l'export CSV : " + error.message);
    }
  };

  // Allumer un appareil
  const allumerAppareil = async (id) => {
    if(id == 5) {
      try {
        const response = await fetch(`http://localhost:8000/fan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ state: 'on' })
        });
        if (!response.ok) throw new Error("Erreur réseau");
        const data = await response.json();
        if (data.success) {
        setEtatsActionneurs(prev => ({ ...prev, [id]: 1 }));
      } else {
        throw new Error("Erreur lors de l'allumage");
      }
    } catch (error) {
      console.log(error);
    }
  };
}

  // Éteindre un appareil
  const eteindrAppareil = async (id) => {
    if(id == 5) {
      try {
        const response = await fetch(`http://localhost:8000/fan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ state: 'off' })
        });
        if (!response.ok) throw new Error("Erreur réseau");
        const data = await response.json();
        if (data.success) {
          setEtatsActionneurs(prev => ({ ...prev, [id]: 0 }));
        } else {
          throw new Error("Erreur lors de l'extinction");
        }
      } catch (error) {
        console.log(error);
      }
    };
  }

  // ========== AUTOMATISATION ==========

  // Appliquer l'automatisation des volets
  const appliquerAutomatisation = (appareils, etatsActuels) => {
    // Trouver les capteurs
    const capteurTemp = appareils.find(a => 
      a.nom.toLowerCase().includes("température") && a.is_capteur
    );
    const capteurLum = appareils.find(a => 
      a.nom.toLowerCase().includes("lumière") && a.is_capteur
    );

    // Trouver les volets
    const volets = appareils.filter(a => 
      !a.is_capteur && 
      (a.nom.toLowerCase().includes("servo") || a.nom.toLowerCase().includes("moteur"))
    );

    if (volets.length === 0) return etatsActuels;

    const nouveauxEtats = { ...etatsActuels };
    const temperature = capteurTemp ? Number(capteurTemp.valeur) : null;
    const luminosite = capteurLum ? Number(capteurLum.valeur) : null;

    // Priorité à la température
    if (temperature !== null && !isNaN(temperature)) {
      const etatVolet = temperature > seuils.temperature ? 0 : 1; // 0=fermé, 1=ouvert
      volets.forEach(volet => {
        nouveauxEtats[volet.id] = etatVolet;
      });
    } 
    // Sinon, utiliser la luminosité
    else if (luminosite !== null && !isNaN(luminosite)) {
      const etatVolet = luminosite < seuils.luminosite ? 1 : 0; // Faible lum = ouvert
      volets.forEach(volet => {
        nouveauxEtats[volet.id] = etatVolet;
      });
    }

    return nouveauxEtats;
  };

  // Sauvegarder les nouveaux seuils
  const sauvegarderSeuils = (e) => {
    e.preventDefault();

    const nouvelleTemp = Number(seuils.tempInput);
    const nouvelleLum = Number(seuils.lumInput);

    // Validation
    if (isNaN(nouvelleTemp) || isNaN(nouvelleLum)) {
      alert("Merci d'entrer des valeurs numériques valides.");
      return;
    }
    if (nouvelleTemp < -50 || nouvelleTemp > 100) {
      alert("Température doit être entre -50 et 100 °C.");
      return;
    }
    if (nouvelleLum < 0) {
      alert("Luminosité doit être positive.");
      return;
    }

    setSeuils(prev => ({
      ...prev,
      temperature: nouvelleTemp,
      luminosite: nouvelleLum
    }));
    alert("Seuils mis à jour !");
  };

  // ========== EFFETS ==========

  // Charger le profil au démarrage si nécessaire
  useEffect(() => {
    if (!profil.data && user && user.userId) {
      chargerProfil(user.userId);
    }
  }, [user]);

  // Charger les appareils au démarrage
  useEffect(() => {
    chargerAppareils();
  }, []);

  // Appliquer l'automatisation quand les données changent
  useEffect(() => {
    if (appareils.data.length === 0) return;
    
    setEtatsActionneurs(etatsActuels => {
      const nouveauxEtats = appliquerAutomatisation(appareils.data, etatsActuels);
      
      // Ne mettre à jour que si il y a des changements
      const aChange = Object.keys(nouveauxEtats).some(
        id => nouveauxEtats[id] !== etatsActuels[id]
      );
      
      return aChange ? nouveauxEtats : etatsActuels;
    });
  }, [appareils.data, seuils.temperature, seuils.luminosite]);

  // ========== RENDU ==========

  return (
    <div 
      className="app-container"
      style={{
        fontFamily: dynamicStyles.fontFamily,
        fontSize: dynamicStyles.fontSize,
        backgroundColor: dynamicStyles.backgroundColor,
        color: dynamicStyles.color,
      }}
    >
      {/* COLONNE GAUCHE - Profil et Paramètres */}
      <div 
        className="profile-container"
        style={{
          background: options.highContrast ? '#111' : 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
          color: dynamicStyles.color,
          fontFamily: dynamicStyles.fontFamily,
          fontSize: dynamicStyles.fontSize,
        }}
      >
        {/* En-tête avec logo */}
        <div className="profile-header">
          <img 
            src="logo-zenhome.png" 
            alt="Logo Domotique" 
            className="site-logo"
            style={{
              filter: options.highContrast ? 'invert(1)' : 'none',
            }}
          />
        </div>

        {/* Profil utilisateur */}
        <h2 style={{
          color: options.highContrast ? '#fff' : '#2c3e50',
          fontFamily: dynamicStyles.fontFamily,
          fontSize: options.largeText ? '2rem' : '1.8rem',
        }}>
          Profil Utilisateur
        </h2>
        
        {profil.loading && <p style={{ fontFamily: dynamicStyles.fontFamily }}>Chargement...</p>}
        {profil.error && (
          <p style={{ 
            color: options.highContrast ? "#ff6666" : "red",
            fontFamily: dynamicStyles.fontFamily 
          }}>
            Erreur : {profil.error}
          </p>
        )}
        
        {profil.data && (
          <div 
            className="profile-info"
            style={{
              backgroundColor: containerStyles.backgroundColor,
              color: containerStyles.color,
              fontFamily: dynamicStyles.fontFamily,
              fontSize: dynamicStyles.fontSize,
              lineHeight: dynamicStyles.lineHeight,
            }}
          >
            <p style={{ fontFamily: dynamicStyles.fontFamily }}>
              <strong>Nom :</strong> {profil.data.nom}
            </p>
            <p style={{ fontFamily: dynamicStyles.fontFamily }}>
              <strong>Prénom :</strong> {profil.data.prenom}
            </p>
            <p style={{ fontFamily: dynamicStyles.fontFamily }}>
              <strong>Email :</strong> {profil.data.email}
            </p>
            <p style={{ fontFamily: dynamicStyles.fontFamily }}>
              <strong>Administrateur :</strong> {profil.data.isAdmin ? "Oui" : "Non"}
            </p>
            <button 
              className="btn-logout" 
              onClick={deconnecter}
              style={{
                ...buttonStyles,
                backgroundColor: options.highContrast ? '#660000' : '#f44336',
                color: '#fff',
                border: options.highContrast ? '1px solid #ff6666' : 'none',
              }}
            >
              Déconnexion
            </button>
          </div>
        )}

        <hr style={{
          borderColor: options.highContrast ? '#333' : '#ddd',
        }} />

        {/* Paramètres des seuils */}
        <div 
          className="seuils-container"
          style={{
            backgroundColor: containerStyles.backgroundColor,
            color: containerStyles.color,
            fontFamily: dynamicStyles.fontFamily,
          }}
        >
          <h3 style={{
            color: options.highContrast ? '#fff' : '#2c3e50',
            fontFamily: dynamicStyles.fontFamily,
            fontSize: options.largeText ? '1.6rem' : '1.5rem',
          }}>
            Paramètres
          </h3>
          
          <form onSubmit={sauvegarderSeuils} className="param-form">
            <label style={{
              fontFamily: dynamicStyles.fontFamily,
              fontSize: dynamicStyles.fontSize,
              color: containerStyles.color,
            }}>
              Seuil Température (°C)
              <input
                type="number"
                value={seuils.tempInput}
                onChange={(e) => setSeuils(prev => ({...prev, tempInput: e.target.value}))}
                step="0.1"
                min="-50"
                max="100"
                style={{
                  backgroundColor: options.highContrast ? '#222' : '#f9f9f9',
                  color: options.highContrast ? '#fff' : '#34495e',
                  borderColor: options.highContrast ? '#555' : '#e0e0e0',
                  fontFamily: dynamicStyles.fontFamily,
                  fontSize: isMobile ? '16px' : dynamicStyles.fontSize,
                }}
              />
            </label>

            <label style={{
              fontFamily: dynamicStyles.fontFamily,
              fontSize: dynamicStyles.fontSize,
              color: containerStyles.color,
            }}>
              Seuil Luminosité (lux)
              <input
                type="number"
                value={seuils.lumInput}
                onChange={(e) => setSeuils(prev => ({...prev, lumInput: e.target.value}))}
                step="1"
                min="0"
                style={{
                  backgroundColor: options.highContrast ? '#222' : '#f9f9f9',
                  color: options.highContrast ? '#fff' : '#34495e',
                  borderColor: options.highContrast ? '#555' : '#e0e0e0',
                  fontFamily: dynamicStyles.fontFamily,
                  fontSize: isMobile ? '16px' : dynamicStyles.fontSize,
                }}
              />
            </label>

            <button 
              type="submit" 
              className="btn btn-save"
              style={{
                ...buttonStyles,
                background: options.highContrast 
                  ? 'linear-gradient(to right, #004d00, #003300)' 
                  : 'linear-gradient(to right, #4caf50, #2e7d32)',
                border: options.highContrast ? '1px solid #66bb66' : 'none',
              }}
            >
              Enregistrer
            </button>
          </form>
        </div>
      </div>

      {/* COLONNE DROITE - Dashboard */}
      <div 
        className="dashboard"
        style={{
          backgroundColor: dynamicStyles.backgroundColor,
          fontFamily: dynamicStyles.fontFamily,
          fontSize: dynamicStyles.fontSize,
        }}
      >
        <h1 
          className="dashboard-title"
          style={{
            color: options.highContrast ? '#fff' : '#212121',
            fontFamily: dynamicStyles.fontFamily,
            fontSize: options.largeText ? '3rem' : isMobile ? '2rem' : '2.5rem',
          }}
        >
          Dashboard Capteurs & Actionneurs
        </h1>

        {appareils.loading && (
          <p style={{ 
            fontFamily: dynamicStyles.fontFamily,
            color: dynamicStyles.color 
          }}>
            Chargement des données...
          </p>
        )}
        
        {appareils.error && (
          <p style={{ 
            color: options.highContrast ? "#ff6666" : "red",
            fontFamily: dynamicStyles.fontFamily 
          }}>
            Erreur : {appareils.error}
          </p>
        )}

        {/* Grille des appareils */}
        <div className="device-grid">
          {appareils.data.map((appareil) => {
            const unite = UNITES[appareil.nom] || "";
            const estCapteur = Boolean(appareil.is_capteur);

            return (
              <div
                key={appareil.id}
                className={`device-card ${estCapteur ? "capteur" : "actionneur"}`}
                style={{
                  backgroundColor: options.highContrast ? '#111' : '#fff',
                  color: options.highContrast ? '#fff' : '#212121',
                  border: options.highContrast 
                    ? '3px solid #555' 
                    : '2px solid #e1f5fe',
                  borderLeft: options.highContrast
                    ? '8px solid #00aaff'
                    : '6px solid #81d4fa',
                  fontFamily: dynamicStyles.fontFamily,
                  boxShadow: options.highContrast 
                    ? '0 0 15px rgba(255, 255, 255, 0.2), 0 0 0 1px #666' 
                    : '0 8px 16px rgb(0 0 0 / 0.1)',
                }}
              >
                {/* En-tête de la carte */}
                <div className="device-header">
                  <h2 
                    className="device-name"
                    style={{
                      color: options.highContrast ? '#fff' : '#212121',
                      fontFamily: dynamicStyles.fontFamily,
                      fontSize: options.largeText ? '1.4rem' : '1.2rem',
                    }}
                  >
                    {formaterNom(appareil.nom)}
                  </h2>
                  <span 
                    className={`device-badge ${estCapteur ? "green" : "red"}`}
                    style={{
                      backgroundColor: estCapteur 
                        ? (options.highContrast ? '#006600' : '#4caf50')
                        : (options.highContrast ? '#660000' : '#f44336'),
                      color: '#fff',
                      fontSize: options.largeText ? '0.9rem' : '0.75rem',
                      fontFamily: dynamicStyles.fontFamily,
                    }}
                  >
                    {estCapteur ? "Capteur" : "Actionneur"}
                  </span>
                </div>

                {/* Corps de la carte */}
                <div 
                  className="device-body"
                  style={{
                    borderColor: options.highContrast ? '#333' : '#eee',
                    fontFamily: dynamicStyles.fontFamily,
                  }}
                >
                  {estCapteur ? (
                    // Affichage pour les capteurs
                    <>
                      <p 
                        className="sensor-value"
                        style={{
                          color: options.highContrast ? '#fff' : '#333',
                          fontFamily: dynamicStyles.fontFamily,
                          fontSize: options.largeText ? '1.3rem' : '1.1rem',
                        }}
                      >
                        Dernière valeur: {appareil.valeur || "N/A"}
                        {unite && (
                          <span 
                            className="sensor-unit"
                            style={{
                              color: options.highContrast ? '#ccc' : '#555',
                              fontFamily: dynamicStyles.fontFamily,
                            }}
                          > 
                            {unite}
                          </span>
                        )}
                      </p>
                      <p 
                        className="sensor-date"
                        style={{
                          color: options.highContrast ? '#aaa' : '#777',
                          fontFamily: dynamicStyles.fontFamily,
                          fontSize: options.largeText ? '1rem' : '0.8rem',
                        }}
                      >
                        Date: {appareil.date ? new Date(appareil.date).toLocaleString() : "N/A"}
                      </p>
                    </>
                  ) : (
                    // Affichage pour les actionneurs
                    <p 
                      className="actionneur-state"
                      style={{
                        color: options.highContrast ? '#fff' : '#333',
                        fontFamily: dynamicStyles.fontFamily,
                        fontSize: options.largeText ? '1.3rem' : '1.1rem',
                      }}
                    >
                      État: {obtenirEtatLisible(appareil)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="device-actions">
                  <button 
                    className="btn btn-on" 
                    onClick={() => allumerAppareil(appareil.id)}
                    style={{
                      ...buttonStyles,
                      backgroundColor: options.highContrast ? '#006600' : '#4caf50',
                      border: options.highContrast ? '1px solid #66bb66' : 'none',
                    }}
                  >
                    Allumer
                  </button>
                  <button 
                    className="btn btn-off" 
                    onClick={() => eteindrAppareil(appareil.id)}
                    style={{
                      ...buttonStyles,
                      backgroundColor: options.highContrast ? '#660000' : '#f44336',
                      border: options.highContrast ? '1px solid #ff6666' : 'none',
                    }}
                  >
                    Éteindre
                  </button>
                  
                  {/* Actions spécifiques aux capteurs */}
                  {estCapteur && (
                    <>
                      <button
                        className="btn btn-graph"
                        onClick={() => basculerGraphique(appareil.id)}
                        style={{
                          ...buttonStyles,
                          backgroundColor: options.highContrast ? '#003366' : '#1976d2',
                          border: options.highContrast ? '1px solid #6699ff' : 'none',
                        }}
                      >
                        {graphique.activeId === appareil.id ? "Cacher Graphique" : "Voir Graphique"}
                      </button>
                      <button
                        className="btn btn-csv"
                        onClick={() => exporterCSV(appareil.id, appareil.nom)}
                        style={{
                          ...buttonStyles,
                          backgroundColor: options.highContrast ? '#663300' : '#ff9800',
                          border: options.highContrast ? '1px solid #ffaa44' : 'none',
                        }}
                      >
                        Export CSV
                      </button>
                    </>
                  )}
                </div>

                {/* Graphique (si actif) */}
                {graphique.activeId === appareil.id && graphique.data.length > 0 && (
                  <div 
                    className="graph-container"
                    style={{
                      backgroundColor: options.highContrast ? '#222' : 'transparent',
                      borderRadius: '8px',
                      padding: options.highContrast ? '10px' : '0',
                    }}
                  >
                    {graphique.loading ? (
                      <p style={{ 
                        fontFamily: dynamicStyles.fontFamily,
                        color: dynamicStyles.color 
                      }}>
                        Chargement graphique...
                      </p>
                    ) : graphique.error ? (
                      <p style={{ 
                        color: options.highContrast ? "#ff6666" : "red",
                        fontFamily: dynamicStyles.fontFamily 
                      }}>
                        Erreur graphique : {graphique.error}
                      </p>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={graphique.data}>
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke={options.highContrast ? '#444' : '#e0e0e0'}
                          />
                          <XAxis 
                            dataKey="date" 
                            tick={{ 
                              fill: options.highContrast ? '#fff' : '#666',
                              fontFamily: dynamicStyles.fontFamily,
                              fontSize: 12
                            }}
                          />
                          <YAxis 
                            tick={{ 
                              fill: options.highContrast ? '#fff' : '#666',
                              fontFamily: dynamicStyles.fontFamily,
                              fontSize: 12
                            }}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: options.highContrast ? '#111' : '#fff',
                              color: options.highContrast ? '#fff' : '#333',
                              border: options.highContrast ? '1px solid #555' : '1px solid #ddd',
                              fontFamily: dynamicStyles.fontFamily,
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="valeur"
                            stroke={options.highContrast ? '#66bb66' : '#8884d8'}
                            strokeWidth={options.highContrast ? 3 : 2}
                            activeDot={{ 
                              r: 8,
                              fill: options.highContrast ? '#66bb66' : '#8884d8'
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}