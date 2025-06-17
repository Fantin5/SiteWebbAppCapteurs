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
  distance: "cm",
  // Ajoute d'autres capteurs ici si besoin
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

  return (
    <div className="app-container">
      {/* Profil utilisateur à gauche */}
      <div className="profile-container">
        <h2>Profil Utilisateur</h2>
        {profileLoading && <p>Chargement...</p>}
        {profileError && <p style={{ color: "red" }}>Erreur : {profileError}</p>}
        {profile && (
          <div>
            <p><strong>Nom :</strong> {profile.nom}</p>
            <p><strong>Prénom :</strong> {profile.prenom}</p>
            <p><strong>Email :</strong> {profile.email}</p>
            <p><strong>Admin :</strong> {profile.isAdmin ? "Oui" : "Non"}</p>
          </div>
        )}
      </div>

      {/* Dashboard à droite */}
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
                  <h2 className="device-name">{nom}</h2>
                  <span className={`device-badge ${is_capteur ? "green" : "red"}`}>
                    {is_capteur ? "Capteur" : "Actionneur"}
                  </span>
                </div>

                <div className="device-body">
                  {is_capteur ? (
                    <>
                      <p className="sensor-value">
                        Dernière valeur : {valeur !== null ? valeur : "N/A"}
                        {unite && <span className="sensor-unit"> {unite}</span>}
                      </p>
                      <p className="sensor-date">
                        Date : {date ? new Date(date).toLocaleString() : "N/A"}
                      </p>
                    </>
                  ) : (
                    <p>Pas de données à afficher</p>
                  )}
                </div>

                {is_capteur && (
                  <div className="device-actions">
                    <button className="btn btn-on" onClick={() => alert(`Allumer ${nom}`)}>
                      Allumer
                    </button>
                    <button className="btn btn-off" onClick={() => alert(`Éteindre ${nom}`)}>
                      Éteindre
                    </button>
                    <button className="btn btn-graph" onClick={() => handleShowGraph(id)}>
                      {activeGraphId === id ? "Cacher graphique" : "Afficher graphique"}
                    </button>
                    <button className="btn btn-csv" onClick={() => exportCSV(id, nom)}>
                      Exporter CSV
                    </button>
                  </div>
                )}

                {activeGraphId === id && (
                  <div className="graph-container">
                    {graphLoading && <p>Chargement du graphique...</p>}
                    {graphError && <p style={{ color: "red" }}>Erreur: {graphError}</p>}
                    {!graphLoading && !graphError && graphData.length > 0 && (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={graphData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="valeur"
                            stroke="#4caf50"
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                    {!graphLoading && !graphError && graphData.length === 0 && (
                      <p>Aucune donnée pour ce capteur.</p>
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
