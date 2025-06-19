import React, { useState } from 'react';
import { useAccessibility } from './AccessibilityContext';

const AccessibilityPanel = () => {
  const [open, setOpen] = useState(false);
  const { options, toggleOption } = useAccessibility();

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 1000,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: '10px 16px',
          borderRadius: 8,
          background: '#333',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        ♿ Accessibilité
      </button>

      {open && (
        <div style={{
          marginTop: 10,
          background: '#fff',
          padding: 20,
          borderRadius: 12,
          boxShadow: '0 0 10px rgba(0,0,0,0.3)',
          width: 250
        }}>
          <h3 style={{ marginBottom: 10 }}>Options :</h3>

          <label style={{ display: 'block', marginBottom: 10 }}>
            <input
              type="checkbox"
              checked={options.highContrast}
              onChange={() => toggleOption('highContrast')}
            /> Contraste élevé
          </label>

          <label style={{ display: 'block', marginBottom: 10 }}>
            <input
              type="checkbox"
              checked={options.largeText}
              onChange={() => toggleOption('largeText')}
            /> Texte large
          </label>

          <label style={{ display: 'block' }}>
            <input
              type="checkbox"
              checked={options.dyslexicFont}
              onChange={() => toggleOption('dyslexicFont')}
            /> Police dyslexique
          </label>
        </div>
      )}
    </div>
  );
};

export default AccessibilityPanel;
