'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Loader from '@/components/Loader';

interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
    village?: {
        name: string;
    };
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><Loader size="large" text="Chargement des utilisateurs..." /></div>;
    }

    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: 'var(--spacing-xl)' }}>
                Gestion des Utilisateurs
            </h1>

            <div style={{
                backgroundColor: 'white',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border)',
                overflow: 'hidden'
            }}>
                <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Total : <strong>{users.length}</strong> utilisateur{users.length > 1 ? 's' : ''}
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--background)', borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: '600' }}>Nom</th>
                                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: '600' }}>Email</th>
                                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: '600' }}>Rôle</th>
                                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: '600' }}>Village</th>
                                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: '600' }}>Inscrit le</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: 'var(--spacing-md)' }}>{user.name || 'N/A'}</td>
                                    <td style={{ padding: 'var(--spacing-md)', fontSize: '0.875rem' }}>{user.email}</td>
                                    <td style={{ padding: 'var(--spacing-md)' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            backgroundColor: user.role === 'ADMIN' ? '#fee2e2' : '#f3f4f6',
                                            color: user.role === 'ADMIN' ? '#991b1b' : '#374151'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: 'var(--spacing-md)', fontSize: '0.875rem' }}>
                                        {user.village?.name || 'Aucun'}
                                    </td>
                                    <td style={{ padding: 'var(--spacing-md)', fontSize: '0.875rem' }}>
                                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{
                marginTop: 'var(--spacing-lg)',
                padding: 'var(--spacing-md)',
                backgroundColor: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem'
            }}>
                💡 <strong>Note :</strong> La gestion avancée des utilisateurs (changement de rôle, suspension) sera disponible prochainement.
            </div>
        </div>
    );
}
