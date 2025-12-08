'use client';

import { useState } from 'react';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'envoi');
            }

            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setSubmitted(false), 5000);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: 'var(--spacing-xl) var(--spacing-md)' }}>
            <h1 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--primary)' }}>
                Nous Contacter
            </h1>

            <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
                Une question, une suggestion ou un problème ? N'hésitez pas à nous contacter.
            </p>

            {submitted && (
                <div style={{
                    padding: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-lg)',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #c3e6cb'
                }}>
                    ✓ Votre message a été envoyé avec succès !
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                <div>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '600' }}>
                        Nom complet *
                    </label>
                    <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{
                            width: '100%',
                            padding: 'var(--spacing-sm)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '600' }}>
                        Email *
                    </label>
                    <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{
                            width: '100%',
                            padding: 'var(--spacing-sm)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div>
                    <label htmlFor="subject" style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '600' }}>
                        Sujet *
                    </label>
                    <select
                        id="subject"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        style={{
                            width: '100%',
                            padding: 'var(--spacing-sm)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            fontSize: '1rem'
                        }}
                    >
                        <option value="">-- Sélectionnez --</option>
                        <option value="question">Question</option>
                        <option value="technique">Problème technique</option>
                        <option value="autre">Autre</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="message" style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '600' }}>
                        Message *
                    </label>
                    <textarea
                        id="message"
                        required
                        rows={8}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        style={{
                            width: '100%',
                            padding: 'var(--spacing-sm)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            fontSize: '1rem',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Envoyer
                </button>
            </form>
        </div>
    );
}
