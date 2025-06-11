import React from 'react';

const Dashboard = ({ user, onLogout }) => {
  return (
    <div className="dashboard">
      <h1>Tableau de bord</h1>
      <p>Bienvenue, {user.prenom || user.email} !</p>
      <div className="user-info">
        <p><strong>Email:</strong> {user.email}</p>
        {user.nom && <p><strong>Nom:</strong> {user.nom}</p>}
        {user.prenom && <p><strong>Prénom:</strong> {user.prenom}</p>}
      </div>
      <button className="btn" onClick={onLogout}>
        Se déconnecter
      </button>
    </div>
  );
};

export default Dashboard;
