'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { X, MessageSquare, Calendar, ShoppingBag, AlertTriangle, Megaphone, Loader2 } from 'lucide-react';
import styles from './NewPostSelector.module.css';

interface NewPostSelectorProps {
    onClose: () => void;
    onPostCreated: () => void;
}

interface PostType {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    action: 'modal' | 'redirect';
    redirectUrl?: string;
    adminOnly?: boolean;
}

export default function NewPostSelector({ onClose, onPostCreated }: NewPostSelectorProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [showSimplePostForm, setShowSimplePostForm] = useState(false);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isAdmin = (session?.user as any)?.role === 'ADMIN';

    const postTypes: PostType[] = [
        {
            id: 'simple',
            label: 'Post simple',
            description: 'Partagez une actualité, une photo ou une pensée',
            icon: <MessageSquare size={24} />,
            color: '#95a5a6',
            action: 'modal',
        },
        {
            id: 'event',
            label: 'Événement',
            description: 'Créez un événement pour votre village',
            icon: <Calendar size={24} />,
            color: '#3498db',
            action: 'redirect',
            redirectUrl: '/agenda',
        },
        {
            id: 'market',
            label: 'Annonce marché',
            description: 'Vendez ou donnez un objet',
            icon: <ShoppingBag size={24} />,
            color: '#f39c12',
            action: 'redirect',
            redirectUrl: '/market',
        },
        {
            id: 'alert',
            label: 'Alerte de sécurité',
            description: 'Signalez un incident ou un danger',
            icon: <AlertTriangle size={24} />,
            color: '#e74c3c',
            action: 'redirect',
            redirectUrl: '/alerts',
            adminOnly: true,
        },
        {
            id: 'official',
            label: 'Annonce officielle',
            description: 'Communication officielle de la mairie',
            icon: <Megaphone size={24} />,
            color: '#00BFA5',
            action: 'redirect',
            redirectUrl: '/official',
            adminOnly: true,
        },
    ];

    const availableTypes = postTypes.filter(type => !type.adminOnly || isAdmin);

    const handleTypeSelect = (type: PostType) => {
        if (type.action === 'modal') {
            setShowSimplePostForm(true);
        } else if (type.redirectUrl) {
            router.push(type.redirectUrl);
            onClose();
        }
    };

    const handleSimplePostSubmit = async (e: React.FormEvent) => {
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
                    category: 'GENERAL',
                    mediaType: 'NONE',
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

    if (showSimplePostForm) {
        return (
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.header}>
                        <h2>Nouveau post</h2>
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSimplePostSubmit}>
                        <div className={styles.formGroup}>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Que voulez-vous partager avec votre village ?"
                                className={styles.textarea}
                                rows={6}
                                maxLength={1000}
                                autoFocus
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
                                onClick={() => setShowSimplePostForm(false)}
                                className={styles.cancelBtn}
                                disabled={loading}
                            >
                                Retour
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

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Que voulez-vous partager ?</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.typeGrid}>
                    {availableTypes.map((type) => (
                        <button
                            key={type.id}
                            className={styles.typeCard}
                            onClick={() => handleTypeSelect(type)}
                            style={{ borderLeftColor: type.color }}
                        >
                            <div className={styles.typeIcon} style={{ color: type.color }}>
                                {type.icon}
                            </div>
                            <div className={styles.typeContent}>
                                <h3 className={styles.typeLabel}>{type.label}</h3>
                                <p className={styles.typeDescription}>{type.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
