'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { validatePassword } from '@/lib/passwordValidator';

interface Village {
    id: string;
    name: string;
    zipCode: string;
    region?: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const [villages, setVillages] = useState<Village[]>([]);
    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        villageId: '',
        acceptCGU: false,
        acceptPrivacy: false,
    });
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(validatePassword(''));

    // Fetch villages
    useEffect(() => {
        fetch('/api/villages')
            .then(res => res.json())
            .then(data => setVillages(data))
            .catch(err => console.error('Error fetching villages:', err));
    }, []);

    // Update password strength on password change
    useEffect(() => {
        setPasswordStrength(validatePassword(data.password));
    }, [data.password]);

    const registerUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validations frontend
        if (!data.villageId) {
            setError('Veuillez sélectionner votre village.');
            return;
        }

        if (data.password !== data.confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        if (!passwordStrength.isValid) {
            setError('Le mot de passe ne respecte pas les critères de sécurité.');
            return;
        }

        if (!data.acceptCGU) {
            setError('Vous devez accepter les Conditions Générales d\'Utilisation.');
            return;
        }

        if (!data.acceptPrivacy) {
            setError('Vous devez accepter la Politique de confidentialité.');
            return;
        }

        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                password: data.password,
                villageId: data.villageId,
                acceptCGU: data.acceptCGU,
                acceptPrivacy: data.acceptPrivacy,
            }),
        });

        if (response.ok) {
            router.push('/login?registered=true');
        } else {
            const errorText = await response.text();
            setError(errorText || "Une erreur est survenue lors de l'inscription.");
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>
                Rejoindre Village
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)', fontSize: '0.9rem' }}>
                Créez votre compte pour accéder à votre communauté locale
            </p>

            <form onSubmit={registerUser} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {/* Nom */}
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                        Nom complet <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Jean Dupont"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        required
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

                {/* Email */}
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                        Adresse email <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                        type="email"
                        placeholder="jean.dupont@example.com"
                        value={data.email}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                        required
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

                {/* Village */}
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                        Votre village <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                        value={data.villageId}
                        onChange={(e) => setData({ ...data, villageId: e.target.value })}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            fontSize: '1rem',
                            boxSizing: 'border-box',
                            backgroundColor: 'var(--background)',
                        }}
                    >
                        <option value="">Sélectionnez votre village</option>
                        {villages.map((village) => (
                            <option key={village.id} value={village.id}>
                                {village.name} ({village.zipCode})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Mot de passe */}
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                        Mot de passe <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={data.password}
                        onChange={(e) => setData({ ...data, password: e.target.value })}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            fontSize: '1rem',
                            boxSizing: 'border-box',
                        }}
                    />
                    {/* Password strength indicator */}
                    {data.password && (
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

                {/* Confirmation mot de passe */}
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                        Confirmer le mot de passe <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={data.confirmPassword}
                        onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: 'var(--radius-sm)',
                            border: `1px solid ${data.confirmPassword && data.password !== data.confirmPassword ? '#ef4444' : 'var(--border)'}`,
                            fontSize: '1rem',
                            boxSizing: 'border-box',
                        }}
                    />
                    {data.confirmPassword && data.password !== data.confirmPassword && (
                        <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px' }}>
                            Les mots de passe ne correspondent pas
                        </p>
                    )}
                </div>

                {/* CGU */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <input
                        type="checkbox"
                        id="cgu"
                        checked={data.acceptCGU}
                        onChange={(e) => setData({ ...data, acceptCGU: e.target.checked })}
                        required
                        style={{ marginTop: '3px' }}
                    />
                    <label htmlFor="cgu" style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                        J'accepte les{' '}
                        <a href="/cgu" target="_blank" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                            Conditions Générales d'Utilisation
                        </a>{' '}
                        <span style={{ color: 'red' }}>*</span>
                    </label>
                </div>

                {/* Privacy */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <input
                        type="checkbox"
                        id="privacy"
                        checked={data.acceptPrivacy}
                        onChange={(e) => setData({ ...data, acceptPrivacy: e.target.checked })}
                        required
                        style={{ marginTop: '3px' }}
                    />
                    <label htmlFor="privacy" style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                        J'accepte la{' '}
                        <a href="/privacy" target="_blank" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                            Politique de confidentialité
                        </a>{' '}
                        <span style={{ color: 'red' }}>*</span>
                    </label>
                </div>

                {error && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#fee2e2',
                        border: '1px solid #ef4444',
                        borderRadius: 'var(--radius-sm)',
                        color: '#991b1b',
                        fontSize: '0.9rem',
                    }}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        padding: '14px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginTop: 'var(--spacing-sm)',
                    }}
                >
                    Créer mon compte
                </button>
            </form>

            <p style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center', fontSize: '0.9rem' }}>
                Déjà un compte ?{' '}
                <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '500' }}>
                    Se connecter
                </Link>
            </p>
        </div>
    );
}
