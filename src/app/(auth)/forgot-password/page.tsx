'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setEmail('');
            } else {
                setError(data.error || 'Une erreur est survenue');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: 'var(--background-secondary)',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                backgroundColor: 'var(--background)',
                padding: 'var(--spacing-xl)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
            }}>
                <h2 style={{ marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>
                    Mot de passe oublié
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)', fontSize: '0.9rem' }}>
                    Entrez votre adresse email pour recevoir un lien de réinitialisation
                </p>

                {message && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#d1fae5',
                        border: '1px solid #10b981',
                        borderRadius: 'var(--radius-sm)',
                        color: '#065f46',
                        fontSize: '0.9rem',
                        marginBottom: 'var(--spacing-md)',
                    }}>
                        {message}
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#fee2e2',
                        border: '1px solid #ef4444',
                        borderRadius: 'var(--radius-sm)',
                        color: '#991b1b',
                        fontSize: '0.9rem',
                        marginBottom: 'var(--spacing-md)',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                            Adresse email
                        </label>
                        <input
                            type="email"
                            placeholder="votre.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? '#9ca3af' : 'var(--primary)',
                            color: 'white',
                            padding: '14px',
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                    </button>
                </form>

                <p style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center', fontSize: '0.9rem' }}>
                    <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '500' }}>
                        Retour à la connexion
                    </Link>
                </p>
            </div>
        </div>
    );
}
