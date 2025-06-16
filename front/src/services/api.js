const API_BASE_URL = 'http://localhost/sitewebbappcapteurs/backend';

export const api = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    });
    return response.json();
  },

  register: async (nom, prenom, email, password) => {
    const response = await fetch(`${API_BASE_URL}/register.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `nom=${encodeURIComponent(nom)}&prenom=${encodeURIComponent(prenom)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    });
    return response.json();
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/forgot-password.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `email=${encodeURIComponent(email)}`
    });
    return response.json();
  },

  resetPassword: async (token, password) => {
    const response = await fetch(`${API_BASE_URL}/reset-password.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `token=${encodeURIComponent(token)}&password=${encodeURIComponent(password)}`
    });
    return response.json();
  }
};
