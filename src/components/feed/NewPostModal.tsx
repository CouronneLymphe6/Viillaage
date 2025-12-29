'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import styles from './NewPostModal.module.css';

interface NewPostModalProps {
    onClose: () => void;
    onPostCreated: () => void;
}

const categories = [
    { value: 'GENERAL', label: 'Général', emoji: '💬' },
    { value: 'ALERT', label: 'Alerte & Sécurité', emoji: '🚨' },
    { value: 'EVENT', label: 'Événement', emoji: '📅' },
    { value: 'MARKET', label: 'Marché', emoji: '🛒' },
];

export default function NewPostModal({ onClose, onPostCreated }: NewPostModalProps) {
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('GENERAL');
    const [mediaUrl, setMediaUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            setError('Veuillez écrire quelque chose');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/feed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: content.trim(),
                    category,
                    mediaUrl: mediaUrl || undefined,
                    mediaType: mediaUrl ? 'PHOTO' : 'NONE',
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la publication');
            }

            onPostCreated();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Nouveau post</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Catégorie</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={styles.select}
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.emoji} {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Votre message</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Que voulez-vous partager avec votre village ?"
                            className={styles.textarea}
                            rows={6}
                            maxLength={1000}
                        />
                        <div className={styles.charCount}>
                            {content.length}/1000
                        </div>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelBtn}
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading || !content.trim()}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className={styles.spinner} />
                                    Publication...
                                </>
                            ) : (
                                'Publier'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
