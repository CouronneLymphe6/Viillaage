'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FileText } from 'lucide-react';

interface FileUploadProps {
    onUpload: (url: string, type: 'IMAGE' | 'PDF') => void;
    currentFile?: { url: string; type: 'IMAGE' | 'PDF' } | null;
    label?: string;
}

export default function FileUpload({ onUpload, currentFile, label = "Pièce jointe (optionnel)" }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState<{ url: string; type: 'IMAGE' | 'PDF' } | null>(currentFile || null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isPDF = file.type === 'application/pdf';

        if (!isImage && !isPDF) {
            setError('Veuillez sélectionner une image ou un PDF');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('Le fichier ne doit pas dépasser 10 Mo');
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
            const fileType = data.type as 'IMAGE' | 'PDF';

            setPreview({ url: data.url, type: fileType });
            onUpload(data.url, fileType);
        } catch (err) {
            console.error(err);
            setError('Erreur lors du téléchargement du fichier');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onUpload('', 'IMAGE');
    };

    return (
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                {label}
            </label>

            {preview && (
                <div style={{ marginBottom: '10px', position: 'relative', width: 'fit-content' }}>
                    {preview.type === 'IMAGE' ? (
                        <Image
                            src={preview.url}
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
                    ) : (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            backgroundColor: 'var(--secondary)',
                            border: '2px solid var(--primary)',
                            borderRadius: 'var(--radius-md)',
                            maxWidth: '400px'
                        }}>
                            <FileText size={32} color="var(--primary)" />
                            <div>
                                <p style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>
                                    Document PDF
                                </p>
                                <a
                                    href={preview.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: 'var(--primary)',
                                        fontSize: '0.9rem',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    Voir le document
                                </a>
                            </div>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={handleRemove}
                        style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}

            <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                disabled={uploading}
                style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '1rem',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-main)',
                    cursor: 'pointer'
                }}
            />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Images (JPEG, PNG, WebP) ou PDF - Max 10 Mo
            </p>
            {uploading && <p style={{ fontSize: '0.9rem', color: 'var(--primary)', marginTop: '8px' }}>⏳ Téléchargement en cours...</p>}
            {error && <p style={{ fontSize: '0.9rem', color: '#e74c3c', marginTop: '8px' }}>❌ {error}</p>}
        </div>
    );
}
