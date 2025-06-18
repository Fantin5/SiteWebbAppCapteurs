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

const unitMap = {
  "Capteur lumière": "lux",
  "Capteur Température": "°C",
  "Capteur Humidité": "%",
  "Capteur de distance": "cm",
};

export default function Dashboard() {
  // Profil utilisateur
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  // Devices
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Graph
  const [activeGraphId, setActiveGraphId] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState(null);

  // Etats actionneurs stockés localement {id: état}
  const [actionneurEtats, setActionneurEtats] = useState({});

  // Seuils température et luminosité modifiables
  const [seuilTemperature, setSeuilTemperature] = useState(25);
  const [seuilLuminosite, setSeuilLuminosite] = useState(300);

  // Valeurs saisies dans le formulaire (pour contrôle)
  const [tempInput, setTempInput] = useState(seuilTemperature);
  const [lumInput, setLumInput] = useState(seuilLuminosite);

  const handleLogout = () => {
    window.location.href = '/login';
  };

  // Chargement profil utilisateur (exemple user_id=1)
  useEffect(() => {
    fetch("http://localhost/SiteWebbAppCapteurs/backend/user.php?user_id=1")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur réseau");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setProfileLoading(false);
      })
      .catch((e) => {
        setProfileError(e.message);
        setProfileLoading(false);
      });
  }, []);

  // Chargement devices
  useEffect(() => {
    fetch("http://localhost/SiteWebbAppCapteurs/backend/api.php")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur réseau");
        return res.json();
      })
      .then((data) => {
        setDevices(data);
        setLoading(false);
        const etatsInit = {};
        data.forEach(({ id }) => {
          etatsInit[id] = 0;
        });
        setActionneurEtats(etatsInit);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  // Chargement graphique
  const fetchGraphData = (id) => {
    setGraphLoading(true);
    setGraphError(null);
    fetch(`http://localhost/SiteWebbAppCapteurs/backend/api.php?id_composant=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur réseau");
        return res.json();
      })
      .then((data) => {
        setGraphData(
          data.map((item) => ({
            date: new Date(item.date).toLocaleString(),
            valeur: Number(item.valeur),
          }))
        );
        setGraphLoading(false);
      })
      .catch((e) => {
        setGraphError(e.message);
        setGraphLoading(false);
      });
  };

  const handleShowGraph = (id) => {
    if (activeGraphId === id) {
      setActiveGraphId(null);
    } else {
      setActiveGraphId(id);
      fetchGraphData(id);
    }
  };
  
  const exportCSV = (id, nom) => {
    fetch(`http://localhost/SiteWebbAppCapteurs/backend/api.php?id_composant=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur réseau");
        return res.json();
      })
      .then((data) => {
        if (!data.length) {
          alert("Aucune donnée à exporter.");
          return;
        }
        const csvHeader = "Date, Valeur\n";
        const csvRows = data.map((item) => {
          const date = new Date(item.date).toLocaleString();
          return `"${date}","${item.valeur}"`;
        });
        const csvContent = csvHeader + csvRows.join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${nom.replace(/\s+/g, "_")}_mesures.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      })
      .catch((e) => {
        alert("Erreur lors de l'export CSV : " + e.message);
      });
  };

  // Automatisation volet selon seuils avec priorité température
  const appliquerAutomatiqueVolet = (devices, etats) => {
    const capteurTemp = devices.find(d => d.nom.toLowerCase().includes("température") && d.is_capteur);
    const capteurLum = devices.find(d => d.nom.toLowerCase().includes("lumière") && d.is_capteur);

    const voletServo = devices.find(d => d.nom.toLowerCase().includes("servo") && !d.is_capteur);
    const voletMoteur = devices.find(d => d.nom.toLowerCase().includes("moteur") && !d.is_capteur);

    if (!voletServo && !voletMoteur) return etats;

    const tempVal = capteurTemp ? Number(capteurTemp.valeur) : null;
    const lumVal = capteurLum ? Number(capteurLum.valeur) : null;

    let nouvelEtat = { ...etats };

    if (tempVal !== null && tempVal !== undefined) {
      if (tempVal > seuilTemperature) {
        // Temp élevée => volet fermé
        if (voletServo) nouvelEtat[voletServo.id] = 0;
        if (voletMoteur) nouvelEtat[voletMoteur.id] = 0;
      } else {
        // Temp basse => volet ouvert
        if (voletServo) nouvelEtat[voletServo.id] = 1;
        if (voletMoteur) nouvelEtat[voletMoteur.id] = 1;
      }
    } else if (lumVal !== null && lumVal !== undefined) {
      if (lumVal < seuilLuminosite) {
        // Luminosité faible => volet ouvert
        if (voletServo) nouvelEtat[voletServo.id] = 1;
        if (voletMoteur) nouvelEtat[voletMoteur.id] = 1;
      } else {
        // Luminosité forte => volet fermé
        if (voletServo) nouvelEtat[voletServo.id] = 0;
        if (voletMoteur) nouvelEtat[voletMoteur.id] = 0;
      }
    }

    return nouvelEtat;
  };

  useEffect(() => {
    if (devices.length === 0) return;
    setActionneurEtats((prevEtats) => {
      const nouveauxEtats = appliquerAutomatiqueVolet(devices, prevEtats);
      const changed = Object.keys(nouveauxEtats).some(
        (key) => nouveauxEtats[key] !== prevEtats[key]
      );
      return changed ? nouveauxEtats : prevEtats;
    });
  }, [devices, seuilTemperature, seuilLuminosite]);

  const handleAllumer = (id) => {
    setActionneurEtats((prev) => ({ ...prev, [id]: 1 }));
  };

  const handleEteindre = (id) => {
    setActionneurEtats((prev) => ({ ...prev, [id]: 0 }));
  };

  const getEtatLisible = (device) => {
    const etat = actionneurEtats[device.id];

    if (etat === undefined) return "Inconnu";

    if (device.is_capteur) {
      return etat === 1 ? "Allumé" : "Éteint";
    } else {
      if (device.nom.toLowerCase().includes("servo")) {
        return etat === 0 ? "Fermé" : etat === 1 ? "Ouvert" : "Inconnu";
      }
      if (device.nom.toLowerCase().includes("moteur")) {
        return etat === 0 ? "Fermé" : etat === 1 ? "Ouvert" : "Inconnu";
      }
      return etat === 1 ? "Allumé" : "Éteint";
    }
  };


  // Validation et application seuils depuis formulaire
  const handleSeuilsSubmit = (e) => {
    e.preventDefault();

    const tempVal = Number(tempInput);
    const lumVal = Number(lumInput);

    if (isNaN(tempVal) || isNaN(lumVal)) {
      alert("Merci d'entrer des valeurs numériques valides.");
      return;
    }
    if (tempVal < -50 || tempVal > 100) {
      alert("Température doit être entre -50 et 100 °C.");
      return;
    }
    if (lumVal < 0) {
      alert("Luminosité doit être positive.");
      return;
    }

    setSeuilTemperature(tempVal);
    setSeuilLuminosite(lumVal);
    alert("Seuils mis à jour !");
  };

  return (
    <div className="app-container">
      {/* Colonne gauche: Profil + Paramètres seuils */}
      <div className="profile-container">
        <div className="profile-header">
          <img src="logo-zenhome.png" alt="Logo Domotique" className="site-logo" />
        </div>
        <h2>Profil Utilisateur</h2>
        {profileLoading && <p>Chargement...</p>}
        {profileError && <p style={{ color: "red" }}>Erreur : {profileError}</p>}
        {profile && (
          <div className="profile-info">
            <p><strong>Nom :</strong> {profile.nom}</p>
            <p><strong>Prénom :</strong> {profile.prenom}</p>
            <p><strong>Email :</strong> {profile.email}</p>
            <p><strong>Administrateur :</strong> {profile.isAdmin ? "Oui" : "Non"}</p>
            <button className="btn-logout" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        )}

        <hr />

        <div className="seuils-container">
          <h3>Paramètres </h3>
          <form onSubmit={handleSeuilsSubmit} className="param-form">
            <label>
              Seuil Température (°C)
              <input
                type="number"
                value={tempInput}
                onChange={(e) => setTempInput(e.target.value)}
                step="0.1"
                min="-50"
                max="100"
              />
            </label>

            <label>
              Seuil Luminosité (lux)
              <input
                type="number"
                value={lumInput}
                onChange={(e) => setLumInput(e.target.value)}
                step="1"
                min="0"
              />
            </label>

            <button type="submit" className="btn btn-save">Enregistrer</button>
          </form>
        </div>
      </div>


      {/* Dashboard droite */}
      <div className="dashboard">
        <h1 className="dashboard-title">Dashboard Capteurs & Actionneurs</h1>

        {loading && <p>Chargement des données...</p>}
        {error && <p style={{ color: "red" }}>Erreur : {error}</p>}

        <div className="device-grid">
          {devices.map(({ id, nom, is_capteur, valeur, date }) => {
            const unite = unitMap[nom] || "";

            return (
              <div
                key={id}
                className={`device-card ${is_capteur ? "capteur" : "actionneur"}`}
              >
                <div className="device-header">
                  <h2 className="device-name">
                    {nom.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </h2>
                  <span className={`device-badge ${is_capteur ? "green" : "red"}`}>
                    {is_capteur ? "Capteur" : "Actionneur"}
                  </span>
                </div>

                <div className="device-body">
                  {is_capteur ? (
                    <>
                      <p className="sensor-value">
                        Dernière valeur: {valeur || "N/A"}
                        {unite && <span className="sensor-unit"> {unite}</span>}
                      </p>
                      <p className="sensor-date">
                        Date: {date ? new Date(date).toLocaleString() : "N/A"}
                      </p>
                    </>
                  ) : (
                    <p className="actionneur-state">
                      État: {getEtatLisible({ id, nom, is_capteur })}
                    </p>
                  )}
                </div>

                <div className="device-actions">
                  <button className="btn btn-on" onClick={() => handleAllumer(id)}>
                    Allumer
                  </button>
                  <button className="btn btn-off" onClick={() => handleEteindre(id)}>
                    Éteindre
                  </button>
                  {is_capteur && (
                    <>
                      <button
                        className="btn btn-graph"
                        onClick={() => handleShowGraph(id)}
                      >
                        {activeGraphId === id ? "Cacher Graphique" : "Voir Graphique"}
                      </button>
                      <button
                        className="btn btn-export"
                        onClick={() => exportCSV(id, nom)}
                      >
                        Export CSV
                      </button>
                    </>
                  )}
                </div>

                {activeGraphId === id && graphData.length > 0 && (
                  <div className="graph-container">
                    {graphLoading ? (
                      <p>Chargement graphique...</p>
                    ) : graphError ? (
                      <p style={{ color: "red" }}>Erreur graphique : {graphError}</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={graphData}>
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
