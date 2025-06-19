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
  const allumerAppareil = (id) => {
    setEtatsActionneurs(prev => ({ ...prev, [id]: 1 }));
  };

  // Éteindre un appareil
  const eteindrAppareil = (id) => {
    setEtatsActionneurs(prev => ({ ...prev, [id]: 0 }));
  };

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
    <div className="app-container">
      {/* COLONNE GAUCHE - Profil et Paramètres */}
      <div className="profile-container">
        {/* En-tête avec logo */}
        <div className="profile-header">
          <img src="logo-zenhome.png" alt="Logo Domotique" className="site-logo" />
        </div>

        {/* Profil utilisateur */}
        <h2>Profil Utilisateur</h2>
        {profil.loading && <p>Chargement...</p>}
        {profil.error && <p style={{ color: "red" }}>Erreur : {profil.error}</p>}
        {profil.data && (
          <div className="profile-info">
            <p><strong>Nom :</strong> {profil.data.nom}</p>
            <p><strong>Prénom :</strong> {profil.data.prenom}</p>
            <p><strong>Email :</strong> {profil.data.email}</p>
            <p><strong>Administrateur :</strong> {profil.data.isAdmin ? "Oui" : "Non"}</p>
            <button className="btn-logout" onClick={deconnecter}>
              Déconnexion
            </button>
          </div>
        )}

        <hr />

        {/* Paramètres des seuils */}
        <div className="seuils-container">
          <h3>Paramètres</h3>
          <form onSubmit={sauvegarderSeuils} className="param-form">
            <label>
              Seuil Température (°C)
              <input
                type="number"
                value={seuils.tempInput}
                onChange={(e) => setSeuils(prev => ({...prev, tempInput: e.target.value}))}
                step="0.1"
                min="-50"
                max="100"
              />
            </label>

            <label>
              Seuil Luminosité (lux)
              <input
                type="number"
                value={seuils.lumInput}
                onChange={(e) => setSeuils(prev => ({...prev, lumInput: e.target.value}))}
                step="1"
                min="0"
              />
            </label>

            <button type="submit" className="btn btn-save">
              Enregistrer
            </button>
          </form>
        </div>
      </div>

      {/* COLONNE DROITE - Dashboard */}
      <div className="dashboard">
        <h1 className="dashboard-title">Dashboard Capteurs & Actionneurs</h1>

        {appareils.loading && <p>Chargement des données...</p>}
        {appareils.error && <p style={{ color: "red" }}>Erreur : {appareils.error}</p>}

        {/* Grille des appareils */}
        <div className="device-grid">
          {appareils.data.map((appareil) => {
            const unite = UNITES[appareil.nom] || "";
            const estCapteur = Boolean(appareil.is_capteur);

            return (
              <div
                key={appareil.id}
                className={`device-card ${estCapteur ? "capteur" : "actionneur"}`}
              >
                {/* En-tête de la carte */}
                <div className="device-header">
                  <h2 className="device-name">
                    {formaterNom(appareil.nom)}
                  </h2>
                  <span className={`device-badge ${estCapteur ? "green" : "red"}`}>
                    {estCapteur ? "Capteur" : "Actionneur"}
                  </span>
                </div>

                {/* Corps de la carte */}
                <div className="device-body">
                  {estCapteur ? (
                    // Affichage pour les capteurs
                    <>
                      <p className="sensor-value">
                        Dernière valeur: {appareil.valeur || "N/A"}
                        {unite && <span className="sensor-unit"> {unite}</span>}
                      </p>
                      <p className="sensor-date">
                        Date: {appareil.date ? new Date(appareil.date).toLocaleString() : "N/A"}
                      </p>
                    </>
                  ) : (
                    // Affichage pour les actionneurs
                    <p className="actionneur-state">
                      État: {obtenirEtatLisible(appareil)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="device-actions">
                  <button 
                    className="btn btn-on" 
                    onClick={() => allumerAppareil(appareil.id)}
                  >
                    Allumer
                  </button>
                  <button 
                    className="btn btn-off" 
                    onClick={() => eteindrAppareil(appareil.id)}
                  >
                    Éteindre
                  </button>
                  
                  {/* Actions spécifiques aux capteurs */}
                  {estCapteur && (
                    <>
                      <button
                        className="btn btn-graph"
                        onClick={() => basculerGraphique(appareil.id)}
                      >
                        {graphique.activeId === appareil.id ? "Cacher Graphique" : "Voir Graphique"}
                      </button>
                      <button
                        className="btn btn-csv"
                        onClick={() => exporterCSV(appareil.id, appareil.nom)}
                      >
                        Export CSV
                      </button>
                    </>
                  )}
                </div>

                {/* Graphique (si actif) */}
                {graphique.activeId === appareil.id && graphique.data.length > 0 && (
                  <div className="graph-container">
                    {graphique.loading ? (
                      <p>Chargement graphique...</p>
                    ) : graphique.error ? (
                      <p style={{ color: "red" }}>Erreur graphique : {graphique.error}</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={graphique.data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="valeur"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
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