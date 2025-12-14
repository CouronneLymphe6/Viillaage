'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserPlus, X, Trash2, Users } from 'lucide-react';
import Loader from '@/components/Loader';

interface Member {
    id: string;
    role: string;
    user: {
        name: string | null;
        email: string | null;
        image: string | null;
    };
    joinedAt: string;
}

interface MembersTabProps {
    associationId: string;
    isOwner: boolean;
}

export function MembersTab({ associationId, isOwner }: MembersTabProps) {
    const { data: session } = useSession();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        fetchMembers();
        checkMembership();
    }, [associationId]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/associations/${associationId}/members`);
            if (response.ok) {
                const data = await response.json();
                setMembers(data);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkMembership = async () => {
        if (!session) return;
        try {
            const response = await fetch(`/api/associations/${associationId}/members/check`);
            if (response.ok) {
                const data = await response.json();
                setIsMember(data.isMember);
            }
        } catch (error) {
            console.error('Error checking membership:', error);
        }
    };

    const toggleMembership = async () => {
        // OPTIMISTIC UI: Toggle immediately
        const previousIsMember = isMember;
        const previousMembers = [...members];

        setIsMember(!isMember);

        // Optimistically update members list (add/remove current user)
        if (!isMember && session?.user) {
            // Joining - add temp member
            const tempMember: Member = {
                id: 'temp-' + Date.now(),
                role: 'MEMBER',
                user: {
                    name: session.user.name ?? null,
                    email: session.user.email ?? null,
                    image: session.user.image ?? null,
                },
                joinedAt: new Date().toISOString(),
            };
            setMembers([...members, tempMember]);
        } else {
            // Leaving - remove current user
            setMembers(members.filter(m => m.user.email !== session?.user?.email));
        }

        try {
            const response = await fetch(`/api/associations/${associationId}/members`, {
                method: previousIsMember ? 'DELETE' : 'POST',
            });

            if (response.ok) {
                // Refresh to get real data
                const membersResponse = await fetch(`/api/associations/${associationId}/members`);
                if (membersResponse.ok) {
                    const data = await membersResponse.json();
                    setMembers(data);
                }
            } else {
                // Rollback on error
                setIsMember(previousIsMember);
                setMembers(previousMembers);
                alert('Erreur lors de l\'opération');
            }
        } catch (error) {
            // Rollback on error
            setIsMember(previousIsMember);
            setMembers(previousMembers);
            console.error('Error toggling membership:', error);
            alert('Erreur lors de l\'opération');
        }
    };

    const getRoleLabel = (role: string) => {
        const roleMap: Record<string, string> = {
            'PRESIDENT': '👑 Président',
            'TREASURER': '💰 Trésorier',
            'SECRETARY': '📝 Secrétaire',
            'MEMBER': '👤 Membre',
        };
        return roleMap[role] || role;
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}><Loader text="Chargement des membres..." /></div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Membres</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                        {members.length} membre{members.length > 1 ? 's' : ''}
                    </p>
                </div>
                {session && !isOwner && (
                    <button
                        onClick={toggleMembership}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            backgroundColor: isMember ? 'var(--background)' : 'var(--primary)',
                            color: isMember ? 'var(--text)' : 'white',
                            border: isMember ? '2px solid var(--border)' : 'none',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '600',
                            cursor: 'pointer',
                        }}
                    >
                        <UserPlus size={18} />
                        {isMember ? 'Quitter' : 'Rejoindre'}
                    </button>
                )}
            </div>

            {members.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <Users size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Aucun membre pour le moment</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {members.map((member) => (
                        <div key={member.id} style={{
                            backgroundColor: 'var(--secondary)',
                            padding: '20px',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                marginBottom: '12px',
                            }}>
                                {member.user.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
                                {member.user.name || 'Utilisateur'}
                            </h3>
                            <p style={{
                                fontSize: '0.85rem',
                                color: 'var(--primary)',
                                fontWeight: '600',
                                marginBottom: '8px',
                            }}>
                                {getRoleLabel(member.role)}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Membre depuis {new Date(member.joinedAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
