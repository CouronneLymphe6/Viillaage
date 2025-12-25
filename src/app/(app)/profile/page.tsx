'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/LazyComponents';
import { signOut } from 'next-auth/react';

interface NotificationPreferences {
    enableAlerts: boolean;
    enableMarket: boolean;
    enableBusiness: boolean;
    enableMessages: boolean;
    enablePush: boolean;
}

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
    const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>({
        enableAlerts: true,
        enableMarket: true,
        enableBusiness: true,
        enableMessages: true,
        enablePush: true,
    });
    const [savingPrefs, setSavingPrefs] = useState(false);

    useEffect(() => {
        if (session?.user) {
            setFormData({
                name: session.user.name || '',
                image: session.user.image || '',
                villageName: (session.user as any).profile?.villageName || '',
                zipCode: (session.user as any).profile?.zipCode || '',
            });

            // Fetch notification preferences
            fetch('/api/notifications/preferences')
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) {
                        setNotifPrefs({
                            enableAlerts: data.enableAlerts ?? true,
                            enableMarket: data.enableMarket ?? true,
                            enableBusiness: data.enableBusiness ?? true,
                            enableMessages: data.enableMessages ?? true,
                            enablePush: data.enablePush ?? true,
                        });
                    }
                })
                .catch(console.error);
        }
    }, [session]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (url: string) => {
        setFormData(prev => ({ ...prev, image: url }));
    };

    const handleNotifPrefChange = async (key: keyof NotificationPreferences) => {
        const newValue = !notifPrefs[key];
        setNotifPrefs(prev => ({ ...prev, [key]: newValue }));
        setSavingPrefs(true);

        try {
            await fetch('/api/notifications/preferences', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: newValue }),
            });
        } catch (error) {
            console.error('Error saving notification preferences:', error);
            // Revert on error
            setNotifPrefs(prev => ({ ...prev, [key]: !newValue }));
        } finally {
            setSavingPrefs(false);
        }
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

    const ToggleSwitch = ({ enabled, onChange, label, description }: { enabled: boolean; onChange: () => void; label: string; description: string }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--border)' }}>
            <div>
                <div style={{ fontWeight: '500' }}>{label}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{description}</div>
            </div>
            <button
                type="button"
                onClick={onChange}
                disabled={savingPrefs}
                style={{
                    width: '50px',
                    height: '26px',
                    borderRadius: '13px',
                    backgroundColor: enabled ? 'var(--primary)' : 'var(--border)',
                    border: 'none',
                    cursor: savingPrefs ? 'wait' : 'pointer',
                    position: 'relative',
                    transition: 'background-color 0.2s',
                }}
            >
                <span style={{
                    position: 'absolute',
                    top: '3px',
                    left: enabled ? '27px' : '3px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    transition: 'left 0.2s',
                }} />
            </button>
        </div>
    );

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--spacing-md)' }}>
            <header style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)' }}>Mon Compte</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Gérez vos informations personnelles et vos préférences de notifications.</p>
            </header>

            <div style={{
                backgroundColor: 'white',
                padding: 'var(--spacing-xl)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: 'var(--spacing-lg)',
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

            {/* Notification Preferences Section */}
            <div style={{
                backgroundColor: 'white',
                padding: 'var(--spacing-xl)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
            }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🔔 Préférences de Notifications
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)', fontSize: '0.9rem' }}>
                    Choisissez les types de notifications que vous souhaitez recevoir.
                </p>

                <ToggleSwitch
                    enabled={notifPrefs.enableAlerts}
                    onChange={() => handleNotifPrefChange('enableAlerts')}
                    label="🚨 Alertes et Sécurité"
                    description="Vol, accident, activité suspecte..."
                />
                <ToggleSwitch
                    enabled={notifPrefs.enableMarket}
                    onChange={() => handleNotifPrefChange('enableMarket')}
                    label="🛒 Le Marché"
                    description="Nouvelles annonces (ventes, dons, échanges)"
                />
                <ToggleSwitch
                    enabled={notifPrefs.enableBusiness}
                    onChange={() => handleNotifPrefChange('enableBusiness')}
                    label="🏪 Les Pros"
                    description="Nouveaux commerces et artisans"
                />
                <ToggleSwitch
                    enabled={notifPrefs.enableMessages}
                    onChange={() => handleNotifPrefChange('enableMessages')}
                    label="💬 Messagerie"
                    description="Réponses et mentions (@votrenom)"
                />
                <ToggleSwitch
                    enabled={notifPrefs.enablePush}
                    onChange={() => handleNotifPrefChange('enablePush')}
                    label="📱 Notifications Push"
                    description="Recevoir des notifications sur votre appareil (même quand l'app est fermée)"
                />
            </div>
        </div>
    );
}

