'use client';

import { useState } from 'react';
import ImageUpload from './ImageUpload';

interface OfficialFormProps {
    onSuccess?: () => void;
    initialData?: any;
}

const officialTypes = [
    { value: 'OFFICIAL_DECREE', label: '📜 Arrêté municipal' },
    { value: 'OFFICIAL_MEETING', label: '🤝 Réunion publique' },
    { value: 'OFFICIAL_VOTE', label: '🗳️ Vote / Sondage' },
    { value: 'OFFICIAL_INFO', label: 'ℹ️ Information' },
];

export default function OfficialForm({ onSuccess, initialData }: OfficialFormProps) {
    const [type, setType] = useState(initialData?.type || 'OFFICIAL_INFO');
    const [description, setDescription] = useState(initialData?.description || '');
    const [photoUrl, setPhotoUrl] = useState(initialData?.photoUrl || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Default to Beaupuy village center (Mairie)
    const defaultLatitude = 43.6487;
    const defaultLongitude = 1.5536;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
                    latitude: initialData?.latitude || defaultLatitude,
                    longitude: initialData?.longitude || defaultLongitude,
                    photoUrl,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Erreur lors de l\'enregistrement');
            }

            if (!isEdit) {
                setDescription('');
                setType('OFFICIAL_INFO');
                setPhotoUrl('');
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
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Type d'annonce</label>
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
                    {officialTypes.map((t) => (
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
                    placeholder="Décrivez l'annonce officielle..."
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

            {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

            <button
                type="submit"
                disabled={loading}
                style={{
                    padding: '12px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                }}
            >
                {loading ? 'Envoi...' : initialData ? 'Modifier l\'annonce' : 'Créer l\'annonce'}
            </button>
        </form>
    );
}
