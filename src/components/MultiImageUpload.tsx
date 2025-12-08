'use client';

import { useState } from 'react';

interface MultiImageUploadProps {
    onUpload: (urls: string[]) => void;
    currentImages?: string[];
    maxImages?: number;
}

export default function MultiImageUpload({ onUpload, currentImages = [], maxImages = 3 }: MultiImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<string[]>(currentImages);

    const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions while maintaining aspect ratio
                    if (width > height) {
                        if (width > maxWidth) {
                            height = (height * maxWidth) / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = (width * maxHeight) / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas to Blob conversion failed'));
                        }
                    }, 'image/jpeg', 0.85); // 85% quality JPEG
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const remainingSlots = maxImages - images.length;
        if (remainingSlots <= 0) {
            alert(`Vous pouvez ajouter maximum ${maxImages} photos`);
            return;
        }

        setUploading(true);

        try {
            const filesToUpload = Array.from(files).slice(0, remainingSlots);
            const uploadedUrls: string[] = [];

            for (const file of filesToUpload) {
                // Resize image to max 1200x1200px
                const resizedBlob = await resizeImage(file, 1200, 1200);

                const formData = new FormData();
                formData.append('file', resizedBlob, file.name);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    uploadedUrls.push(data.url);
                }
            }

            const newImages = [...images, ...uploadedUrls];
            setImages(newImages);
            onUpload(newImages);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Erreur lors du téléchargement des images');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        onUpload(newImages);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Photos ({images.length}/{maxImages})
            </label>

            {/* Display current images */}
            {images.length > 0 && (
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                    {images.map((url, index) => (
                        <div key={index} style={{ position: 'relative', width: '120px', height: '120px' }}>
                            <img
                                src={url}
                                alt={`Photo ${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload button */}
            {images.length < maxImages && (
                <label style={{
                    display: 'inline-block',
                    padding: '10px 16px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    borderRadius: 'var(--radius-sm)',
                    cursor: uploading ? 'wait' : 'pointer',
                    textAlign: 'center',
                    width: 'fit-content',
                }}>
                    {uploading ? 'Téléchargement...' : `+ Ajouter ${images.length === 0 ? 'des photos' : 'une photo'}`}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        disabled={uploading}
                        style={{ display: 'none' }}
                    />
                </label>
            )}

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Les images seront automatiquement redimensionnées pour optimiser le chargement
            </p>
        </div>
    );
}
