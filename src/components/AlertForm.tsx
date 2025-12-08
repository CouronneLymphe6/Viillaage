'use client';

import { useState } from 'react';
import ImageUpload from './ImageUpload';

interface AlertFormProps {
    onSuccess?: () => void;
    initialData?: any;
}

const alertTypes = [
    { value: 'ANIMAL', label: '🐾 Animal perdu' },
    { value: 'DANGER', label: '⚠️ Danger' },
    { value: 'ACCIDENT', label: '🚗 Accident' },
    { value: 'SUSPICIOUS', label: '🕵️ Présence suspecte' },
    { value: 'WORKS', label: '🚧 Travaux' },
    { value: 'OTHER', label: '📢 Autre' },
];

export default function AlertForm({ onSuccess, initialData }: AlertFormProps) {
    const [type, setType] = useState(initialData?.type || 'ANIMAL');
    const [description, setDescription] = useState(initialData?.description || '');
    const [latitude, setLatitude] = useState<number | null>(initialData?.latitude || null);
    const [longitude, setLongitude] = useState<number | null>(initialData?.longitude || null);
    const [photoUrl, setPhotoUrl] = useState(initialData?.photoUrl || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);

    // Address input state
    const [locationType, setLocationType] = useState<'gps' | 'address'>('gps');
    const [address, setAddress] = useState('');

    const getLocation = () => {
        setLocationLoading(true);
        setError('');

        if (!navigator.geolocation) {
            setError('La géolocalisation n\'est pas supportée par votre navigateur');
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
                setLocationLoading(false);
            },
            (error) => {
                setError('Impossible d\'obtenir votre position. Vérifiez les autorisations.');
                setLocationLoading(false);
                console.error(error);
            }
        );
    };

    const geocodeAddress = async () => {
        if (!address.trim()) {
            setError('Veuillez saisir une adresse');
            return;
        }

        setLocationLoading(true);
        setError('');

        try {
            // Using Nominatim (OpenStreetMap) for geocoding
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
            );

            if (!response.ok) {
                throw new Error('Erreur lors de la recherche d\'adresse');
            }

            const data = await response.json();

            if (data.length === 0) {
                setError('Adresse introuvable. Essayez d\'être plus précis.');
                setLocationLoading(false);
                return;
            }

            setLatitude(parseFloat(data[0].lat));
            setLongitude(parseFloat(data[0].lon));
            setLocationLoading(false);
        } catch (err: any) {
            setError('Erreur lors de la recherche d\'adresse. Réessayez.');
            setLocationLoading(false);
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!latitude || !longitude) {
            setError('Veuillez définir une localisation avant de soumettre');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const isEdit = initialData && initialData.id;
            const url = isEdit ? `/api/alerts/${initialData.id}` : '/api/alerts';
            const method = isEdit ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    description,
                    latitude,
                    longitude,
                    photoUrl,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Erreur lors de l\'enregistrement');
            }

            if (!isEdit) {
                setDescription('');
                setLatitude(null);
                setLongitude(null);
                setType('ANIMAL');
                setPhotoUrl('');
                setAddress('');
            }

            onSuccess?.();
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Type d'alerte</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        fontSize: '1rem',
                    }}
                >
                    {alertTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    placeholder="Décrivez la situation..."
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                    }}
                />
            </div>

            <ImageUpload onUpload={setPhotoUrl} currentImage={photoUrl} />

            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Localisation</label>

                {/* Location Type Toggle */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <button
                        type="button"
                        onClick={() => setLocationType('gps')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            backgroundColor: locationType === 'gps' ? 'var(--primary)' : 'var(--secondary)',
                            color: locationType === 'gps' ? 'white' : 'var(--text-main)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                        }}
                    >
                        📍 GPS
                    </button>
                    <button
                        type="button"
                        onClick={() => setLocationType('address')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            backgroundColor: locationType === 'address' ? 'var(--primary)' : 'var(--secondary)',
                            color: locationType === 'address' ? 'white' : 'var(--text-main)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                        }}
                    >
                        🏠 Adresse
                    </button>
                </div>

                {/* GPS Option */}
                {locationType === 'gps' && (
                    <button
                        type="button"
                        onClick={getLocation}
                        disabled={locationLoading}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: latitude && longitude ? 'var(--primary)' : 'var(--accent-light)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: locationLoading ? 'wait' : 'pointer',
                        }}
                    >
                        {locationLoading ? 'Localisation en cours...' : latitude && longitude ? '✓ Position capturée' : '📍 Capturer ma position'}
                    </button>
                )}

                {/* Address Option */}
                {locationType === 'address' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Ex: 12 Rue de la Mairie, Beaupuy"
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem',
                            }}
                        />
                        <button
                            type="button"
                            onClick={geocodeAddress}
                            disabled={locationLoading}
                            style={{
                                padding: '10px 16px',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                cursor: locationLoading ? 'wait' : 'pointer',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {locationLoading ? '...' : '🔍'}
                        </button>
                    </div>
                )}

                {latitude && longitude && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        ✓ Coordonnées: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                    </p>
                )}
            </div>

            {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

            <button
                type="submit"
                disabled={loading || !latitude || !longitude}
                style={{
                    padding: '12px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading || !latitude || !longitude ? 'not-allowed' : 'pointer',
                    opacity: loading || !latitude || !longitude ? 0.6 : 1,
                }}
            >
                {loading ? 'Envoi...' : initialData ? 'Modifier l\'alerte' : 'Créer l\'alerte'}
            </button>
        </form>
    );
}
