'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/LazyComponents';
import { signOut } from 'next-auth/react';

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        villageName: '',
        zipCode: '',
    });

    useEffect(() => {
        if (session?.user) {
            setFormData({
                name: session.user.name || '',
                image: session.user.image || '',
                villageName: (session.user as any).profile?.villageName || '',
                zipCode: (session.user as any).profile?.zipCode || '',
            });
        }
    }, [session]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (url: string) => {
        setFormData(prev => ({ ...prev, image: url }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                await update();
                alert('Profil mis à jour avec succès !');
            } else {
                const data = await response.json();
                alert(`Erreur lors de la mise à jour: ${data.details || 'Erreur inconnue'}`);
            }
        } catch (error) {
            console.error(error);
            alert('Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return;

        try {
            const response = await fetch('/api/user/profile', {
                method: 'DELETE',
            });

            if (response.ok) {
                await signOut({ callbackUrl: '/' });
            } else {
                alert('Erreur lors de la suppression du compte.');
            }
        } catch (error) {
            console.error(error);
            alert('Une erreur est survenue.');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--spacing-md)' }}>
            <header style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)' }}>Mon Compte</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Gérez vos informations personnelles et votre appartenance au village.</p>
            </header>

            <div style={{
                backgroundColor: 'white',
                padding: 'var(--spacing-xl)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
            }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            backgroundColor: 'var(--secondary)',
                            marginBottom: 'var(--spacing-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '4px solid white',
                            boxShadow: '0 0 0 1px var(--border)',
                        }}>
                            {formData.image ? (
                                <img src={formData.image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '3rem', color: 'var(--text-secondary)' }}>
                                    {formData.name?.[0]?.toUpperCase() || 'U'}
                                </span>
                            )}
                        </div>
                        <ImageUpload onUpload={handleImageUpload} currentImage={formData.image} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Nom complet</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
                            <input
                                type="email"
                                value={session?.user?.email || ''}
                                disabled
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--secondary)',
                                    cursor: 'not-allowed',
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Nom du Village</label>
                            <input
                                type="text"
                                name="villageName"
                                value={formData.villageName}
                                onChange={handleChange}
                                placeholder="Ex: Saint-Céré"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Code Postal</label>
                            <input
                                type="text"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                                placeholder="46400"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border)' }}>
                        <button
                            type="button"
                            onClick={handleDeleteAccount}
                            style={{
                                color: 'red',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                            }}
                        >
                            Supprimer mon compte
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
