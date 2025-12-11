'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { validatePassword } from '@/lib/passwordValidator';

export default function ResetPasswordPage() {
    const router = useRouter();
    const params = useParams();
    const token = params.token as string;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(validatePassword(''));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (!passwordStrength.isValid) {
            setError('Le mot de passe ne respecte pas les critères de sécurité');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/login?reset=success');
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
                    Nouveau mot de passe
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)', fontSize: '0.9rem' }}>
                    Choisissez un nouveau mot de passe sécurisé
                </p>

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
                            Nouveau mot de passe
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setPasswordStrength(validatePassword(e.target.value));
                            }}
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
                        {password && (
                            <div style={{ marginTop: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <div style={{
                                        flex: 1,
                                        height: '4px',
                                        backgroundColor: '#e5e7eb',
                                        borderRadius: '2px',
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            width: `${(passwordStrength.score / 5) * 100}%`,
                                            height: '100%',
                                            backgroundColor: passwordStrength.color,
                                            transition: 'all 0.3s',
                                        }} />
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: passwordStrength.color, fontWeight: '500' }}>
                                        {passwordStrength.label}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                                    Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                            Confirmer le mot de passe
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: 'var(--radius-sm)',
                                border: `1px solid ${confirmPassword && password !== confirmPassword ? '#ef4444' : 'var(--border)'}`,
                                fontSize: '1rem',
                                boxSizing: 'border-box',
                            }}
                        />
                        {confirmPassword && password !== confirmPassword && (
                            <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px' }}>
                                Les mots de passe ne correspondent pas
                            </p>
                        )}
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
                        {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
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
