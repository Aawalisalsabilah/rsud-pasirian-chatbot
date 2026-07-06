'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login gagal.');
        setLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError('Terjadi kesalahan koneksi.');
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.glowOrange} />
      <div style={styles.glowGreen} />

      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.logoWrap}>
          <img
            src="/logo-rs.jpeg"
            alt="Logo RSUD Pasirian Lumajang"
            style={styles.logo}
          />
        </div>

        <h1 style={styles.title}>Admin RSUD Pasirian</h1>
        <p style={styles.subtitle}>Masuk untuk mengelola data chatbot</p>

        <label style={styles.label}>Password</label>
        <input
          type="password"
          placeholder="Masukkan password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={focused ? { ...styles.input, ...styles.inputFocus } : styles.input}
          autoFocus
        />

        {error && (
          <p style={styles.error}>
            <span style={styles.errorDot} />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>

        <p style={styles.footer}>RSUD Pasirian Lumajang · Sistem Asisten Virtual</p>
      </form>
    </div>
  );
}

const colors = {
  greenDark: '#0B3D2E',
  greenDarker: '#082B20',
  green: '#146354',
  greenSoft: '#E4F1EC',
  orange: '#F5821F',
  orangeHover: '#DD720F',
  border: '#E2E8DE',
  textMain: '#0F2E22',
  textMuted: '#5B6B63',
  red: '#DC2626',
  redSoft: '#FDECEC',
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.greenDark,
    fontFamily: 'system-ui, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    padding: '24px',
    boxSizing: 'border-box',
  },
  glowOrange: {
    position: 'absolute',
    width: '480px',
    height: '480px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,130,31,0.35) 0%, rgba(245,130,31,0) 70%)',
    top: '-160px',
    right: '-160px',
    pointerEvents: 'none',
  },
  glowGreen: {
    position: 'absolute',
    width: '420px',
    height: '420px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(20,99,84,0.45) 0%, rgba(20,99,84,0) 70%)',
    bottom: '-140px',
    left: '-140px',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    background: '#fff',
    padding: '40px 36px 32px',
    borderRadius: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
    width: '100%',
    maxWidth: '380px',
    boxSizing: 'border-box',
  },
  logoWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '18px',
  },
  logo: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    objectFit: 'cover',
    background: '#fff',
    boxShadow: `0 0 0 3px ${colors.greenSoft}`,
  },
  title: {
    fontSize: '20px',
    fontWeight: 800,
    margin: 0,
    color: colors.textMain,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '13.5px',
    color: colors.textMuted,
    marginTop: '6px',
    marginBottom: '26px',
    textAlign: 'center',
  },
  label: {
    display: 'block',
    fontSize: '12.5px',
    fontWeight: 700,
    color: colors.textMuted,
    marginBottom: '6px',
    letterSpacing: '0.2px',
  },
  input: {
    width: '100%',
    padding: '11px 13px',
    borderRadius: '9px',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: colors.border,
    fontSize: '14px',
    marginBottom: '16px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    color: colors.textMain,
  },
  inputFocus: {
    borderColor: colors.orange,
    boxShadow: '0 0 0 3px rgba(245,130,31,0.15)',
  },
  button: {
    width: '100%',
    padding: '12px',
    borderRadius: '9px',
    border: 'none',
    background: colors.orange,
    color: '#fff',
    fontWeight: 700,
    fontSize: '14.5px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(245,130,31,0.35)',
    transition: 'background 0.15s',
  },
  buttonDisabled: {
    background: colors.orangeHover,
    cursor: 'not-allowed',
    opacity: 0.85,
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    color: colors.red,
    fontSize: '13px',
    marginTop: '-6px',
    marginBottom: '14px',
    background: colors.redSoft,
    padding: '8px 10px',
    borderRadius: '7px',
  },
  errorDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: colors.red,
    flexShrink: 0,
  },
  footer: {
    textAlign: 'center',
    fontSize: '11.5px',
    color: colors.textMuted,
    marginTop: '22px',
    marginBottom: 0,
  },
};
