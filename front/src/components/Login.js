import React, { useState } from 'react';
import { api } from '../services/api';

const Login = ({ onLogin, onSwitch }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await api.login(formData.email, formData.password);
      
      if (result.success) {
        setMessage(result.message);
        setIsSuccess(true);
        setTimeout(() => {
          onLogin(result.user);
        }, 1000);
      } else {
        setMessage(result.message);
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Erreur de connexion au serveur.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <img 
        src="logo-zenhome.png"
        alt="Logo" 
        style={{ 
          width: 120, 
          height: 'auto', 
          position: 'fixed',
          top: 20,
          left: 20,
          cursor: 'pointer',
          zIndex: 1000,
        }}
        onClick={() => window.location.reload()}
      />

      <div
        style={{
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        <h2 style={{ fontWeight: 600, fontSize: '2.5rem', color: '#212121', marginBottom: 10 }}>
          Connexion
        </h2>

        <div 
          style={{ 
            width: 200, 
            height: 4, 
            margin: '0 auto 30px', 
            borderRadius: 2, 
            background: 'linear-gradient(to right, #4caf50, #2196f3)'
          }} 
        />

        {message && (
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            backgroundColor: isSuccess ? '#d4edda' : '#f8d7da',
            color: isSuccess ? '#155724' : '#721c24',
            border: `1px solid ${isSuccess ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message}
          </div>
        )}

        <div style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="email" style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#34495e'
            }}>
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2196f3'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#34495e'
            }}>
              Mot de passe:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2196f3'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => onSwitch('forgot-password')}
                disabled={isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2196f3',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline'
                }}
              >
                Mot de passe oublié ?
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
            <button 
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px 24px',
                backgroundColor: isLoading ? '#cccccc' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#45a049')}
              onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = '#4caf50')}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
            
            <button
              type="button"
              onClick={() => onSwitch('home')}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px 24px',
                backgroundColor: isLoading ? '#cccccc' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#5a6268')}
              onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = '#6c757d')}
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;