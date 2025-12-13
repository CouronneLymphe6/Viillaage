'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
    onUpload: (url: string) => void;
    currentImage?: string | null;
}

export default function ImageUpload({ onUpload, currentImage }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState<string | null>(currentImage || null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Veuillez sélectionner une image valide');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('L\'image ne doit pas dépasser 5 Mo');
            return;
        }

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'upload');
            }

            const data = await response.json();
            setPreview(data.url);
            onUpload(data.url);
        } catch (err) {
            console.error(err);
            setError('Erreur lors du téléchargement de l\'image');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Photo (optionnel)</label>

            {preview && (
                <div style={{ marginBottom: '10px', position: 'relative', width: 'fit-content' }}>
                    <Image
                        src={preview}
                        alt="Aperçu"
                        width={400}
                        height={200}
                        style={{
                            maxWidth: '100%',
                            height: 'auto',
                            maxHeight: '200px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            objectFit: 'cover'
                        }}
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setPreview(null);
                            onUpload('');
                        }}
                        style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            backgroundColor: 'red',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}

            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'white'
                }}
            />
            {uploading && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Téléchargement en cours...</p>}
            {error && <p style={{ fontSize: '0.8rem', color: 'red' }}>{error}</p>}
        </div>
    );
}
