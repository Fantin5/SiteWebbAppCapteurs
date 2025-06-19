const PHP_BASE = 'http://localhost/SiteWebbAppCapteurs/backend';
const TIVA_BASE = 'http://localhost:8000';

export const api = {
  login: async (email, password) => {
    const r = await fetch(`${PHP_BASE}/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    });
    return r.json();
  },

  register: async (nom, prenom, email, password) => {
    const r = await fetch(`${PHP_BASE}/register.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:
        `nom=${encodeURIComponent(nom)}&` +
        `prenom=${encodeURIComponent(prenom)}&` +
        `email=${encodeURIComponent(email)}&` +
        `password=${encodeURIComponent(password)}`,
    });
    return r.json();
  },

  forgotPassword: async (email) => {
    const r = await fetch(`${PHP_BASE}/forgot-password.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `email=${encodeURIComponent(email)}`,
    });
    return r.json();
  },

  resetPassword: async (token, password) => {
    const r = await fetch(`${PHP_BASE}/reset-password.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `token=${encodeURIComponent(token)}&password=${encodeURIComponent(password)}`,
    });
    return r.json();
  },

  sendFanCommand: async (state) => {
    const res = await fetch(`${TIVA_BASE}/fan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    return res.json();
  },

  openMeasureStream(onData) {
    const ws = new WebSocket('ws://localhost:8000/measure');
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onData(data);
      } catch (err) {
        console.error('WebSocket parsing error:', err);
      }
    };
    return ws;
  },
};
