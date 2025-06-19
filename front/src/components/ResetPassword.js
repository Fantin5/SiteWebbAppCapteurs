import React, { useState } from 'react';
import { api } from '../services/api';
import { useSearchParams } from 'react-router-dom';

const ResetPassword = ({ onSwitch }) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);

    try {
      const result = await api.resetPassword(token, password);
      setMessage(result.message);
      setIsSuccess(result.success);
      if (result.success) {
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onSwitch('login');
        }, 2000);
      }
    } catch (error) {
      setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
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
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px 30px',
            maxWidth: 600,
            width: '100%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb',
              fontWeight: '500',
            }}
          >
            Lien de réinitialisation invalide.
          </div>
          <button
            onClick={() => onSwitch('login')}
            style={{
              minWidth: 140,
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#5a6268')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#6c757d')}
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
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
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px 30px',
          maxWidth: 600,
          width: '100%',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontWeight: 600,
            fontSize: '2.5rem',
            color: '#212121',
            marginBottom: 10,
          }}
        >
          Réinitialisation du mot de passe
        </h2>

        <div
          style={{
            width: 200,
            height: 4,
            margin: '0 auto 30px',
            borderRadius: 2,
            background: 'linear-gradient(to right, #4caf50, #2196f3)',
          }}
        />

        {message && (
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: isSuccess ? '#d4edda' : '#f8d7da',
              color: isSuccess ? '#155724' : '#721c24',
              border: `1px solid ${isSuccess ? '#c3e6cb' : '#f5c6cb'}`,
              fontWeight: '500',
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <label
            htmlFor="password"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#34495e',
            }}
          >
            Nouveau mot de passe:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength={8}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease',
              outline: 'none',
              marginBottom: '20px',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#2196f3')}
            onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
          />

          <label
            htmlFor="confirmPassword"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#34495e',
            }}
          >
            Confirmer le mot de passe:
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength={8}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease',
              outline: 'none',
              marginBottom: '30px',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#2196f3')}
            onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
          />

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                minWidth: 140,
                padding: '12px 24px',
                backgroundColor: isLoading ? '#cccccc' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#45a049')}
              onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = '#4caf50')}
            >
              {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>

            <button
              type="button"
              onClick={() => onSwitch('login')}
              disabled={isLoading}
              style={{
                minWidth: 140,
                padding: '12px 24px',
                backgroundColor: isLoading ? '#cccccc' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#5a6268')}
              onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = '#6c757d')}
            >
              Retour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
