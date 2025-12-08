'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [data, setData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const loginUser = async (e: React.FormEvent) => {
        e.preventDefault();
        signIn('credentials', {
            ...data,
            redirect: false,
        }).then((callback) => {
            if (callback?.error) {
                setError('Identifiants invalides');
            }

            if (callback?.ok && !callback?.error) {
                router.push('/dashboard');
            }
        });
    }

    return (
        <div>
            <h2 style={{ marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>Connexion</h2>
            <form onSubmit={loginUser} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    required
                    style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        fontSize: '1rem',
                    }}
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={data.password}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                    required
                    style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        fontSize: '1rem',
                    }}
                />
                {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}
                <button type="submit" style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginTop: 'var(--spacing-sm)',
                }}>
                    Se connecter
                </button>
            </form>
            <p style={{ marginTop: 'var(--spacing-md)', textAlign: 'center', fontSize: '0.9rem' }}>
                Pas encore de compte ? <Link href="/register" style={{ color: 'var(--primary)' }}>S'inscrire</Link>
            </p>
        </div>
    );
}
