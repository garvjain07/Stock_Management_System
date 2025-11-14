import React from 'react';

const LoginHelp = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'Arial, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{ 
          color: '#1f2937', 
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontSize: '1.5rem'
        }}>
          🔐 Login Instructions
        </h1>
        
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>
            ✅ Backend Server Status
          </h3>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Running on: <strong>http://localhost:5000</strong>
          </p>
        </div>

        <div style={{
          backgroundColor: '#ecfdf5',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{ color: '#065f46', marginBottom: '0.5rem' }}>
            🚀 Demo Credentials
          </h3>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Admin Account:</strong>
            <br />
            Username: <code style={{ backgroundColor: '#e5e7eb', padding: '0.25rem', borderRadius: '0.25rem' }}>admin</code>
            <br />
            Password: <code style={{ backgroundColor: '#e5e7eb', padding: '0.25rem', borderRadius: '0.25rem' }}>admin123</code>
          </div>
          <div>
            <strong>Cashier Account:</strong>
            <br />
            Username: <code style={{ backgroundColor: '#e5e7eb', padding: '0.25rem', borderRadius: '0.25rem' }}>cashier</code>
            <br />
            Password: <code style={{ backgroundColor: '#e5e7eb', padding: '0.25rem', borderRadius: '0.25rem' }}>cashier123</code>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fef3c7',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ color: '#92400e', marginBottom: '0.5rem' }}>
            ⚠️ Important Notes
          </h3>
          <ul style={{ color: '#b45309', margin: 0, paddingLeft: '1.5rem' }}>
            <li>Use the exact credentials above</li>
            <li>Backend must be running on port 5000</li>
            <li>Frontend runs on port 3000</li>
          </ul>
        </div>

        <div style={{ textAlign: 'center' }}>
          <a 
            href="/login" 
            style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Go to Login Page
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginHelp;