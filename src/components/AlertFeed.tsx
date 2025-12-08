'use client';

import { useSession } from 'next-auth/react';
import { Alert } from '@/types';
import { AlertTriangle, Car, Construction, Dog, HelpCircle, Megaphone, ShieldAlert, UserPlus, ScrollText, Users, Vote, Info } from 'lucide-react';

interface AlertFeedProps {
    alerts: Alert[];
    onAlertClick?: (alert: Alert) => void;
    onDelete: (id: string) => void;
    onEdit: (alert: Alert) => void;
    onVote?: (id: string, type: 'CONFIRM' | 'REPORT') => void;
}

export default function AlertFeed({ alerts, onAlertClick, onDelete, onEdit, onVote }: AlertFeedProps) {
    const { data: session } = useSession();

    const typeConfig: Record<string, { label: string, icon: React.ReactNode, color: string, bgColor: string }> = {
        ANIMAL: { label: 'Animal perdu', icon: <Dog size={20} />, color: '#8B5CF6', bgColor: '#F3E8FF' },
        DANGER: { label: 'Danger', icon: <ShieldAlert size={20} />, color: '#EF4444', bgColor: '#FEE2E2' },
        ACCIDENT: { label: 'Accident', icon: <Car size={20} />, color: '#F59E0B', bgColor: '#FEF3C7' },
        SUSPICIOUS: { label: 'Présence suspecte', icon: <UserPlus size={20} />, color: '#10B981', bgColor: '#D1FAE5' },
        WORKS: { label: 'Travaux', icon: <Construction size={20} />, color: '#F97316', bgColor: '#FFEDD5' },
        OFFICIAL: { label: 'Officiel (Mairie)', icon: <Megaphone size={20} />, color: '#2563EB', bgColor: '#DBEAFE' },
        OFFICIAL_DECREE: { label: 'Arrêté municipal', icon: <ScrollText size={20} />, color: '#7C3AED', bgColor: '#EDE9FE' },
        OFFICIAL_MEETING: { label: 'Réunion publique', icon: <Users size={20} />, color: '#0891B2', bgColor: '#CFFAFE' },
        OFFICIAL_VOTE: { label: 'Vote / Sondage', icon: <Vote size={20} />, color: '#DC2626', bgColor: '#FEE2E2' },
        OFFICIAL_INFO: { label: 'Information', icon: <Info size={20} />, color: '#2563EB', bgColor: '#DBEAFE' },
        OTHER: { label: 'Autre', icon: <HelpCircle size={20} />, color: '#6B7280', bgColor: '#F3F4F6' },
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {alerts.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>Aucun signalement visible sur la carte.</p>
            ) : (
                alerts.map((alert) => {
                    const config = typeConfig[alert.type] || typeConfig['OTHER'];
                    return (
                        <div
                            key={alert.id}
                            onClick={() => onAlertClick && onAlertClick(alert)}
                            style={{
                                padding: 'var(--spacing-md)',
                                backgroundColor: 'var(--background)',
                                borderRadius: 'var(--radius-md)',
                                cursor: onAlertClick ? 'pointer' : 'default',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                border: '1px solid var(--border)',
                                transition: 'transform 0.1s ease',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{
                                    backgroundColor: config.bgColor,
                                    color: config.color,
                                    padding: '8px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {config.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                            {config.label}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {new Date(alert.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            Par {alert.user.name || 'Anonyme'}
                                        </span>
                                        {alert.confirmations > 0 && (
                                            <span style={{ fontSize: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '10px', marginLeft: '6px' }}>
                                                {alert.confirmations} 👍
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                {alert.description}
                            </p>

                            {alert.photoUrl && (
                                <img
                                    src={alert.photoUrl}
                                    alt="Alerte"
                                    style={{
                                        width: '100%',
                                        height: '160px',
                                        objectFit: 'cover',
                                        borderRadius: 'var(--radius-sm)',
                                        marginBottom: 'var(--spacing-sm)'
                                    }}
                                />
                            )}

                            {/* Voting buttons */}
                            {onVote && (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onVote(alert.id, 'CONFIRM');
                                        }}
                                        disabled={alert.userVote === 'CONFIRM'}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            backgroundColor: alert.userVote === 'CONFIRM' ? '#d1fae5' : 'transparent',
                                            color: alert.userVote === 'CONFIRM' ? '#065f46' : 'var(--text-secondary)',
                                            border: alert.userVote === 'CONFIRM' ? '1px solid #10b981' : '1px solid var(--border)',
                                            borderRadius: 'var(--radius-full)',
                                            cursor: alert.userVote === 'CONFIRM' ? 'default' : 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        👍 Toujours là
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onVote(alert.id, 'REPORT');
                                        }}
                                        disabled={alert.userVote === 'REPORT'}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            backgroundColor: alert.userVote === 'REPORT' ? '#fee2e2' : 'transparent',
                                            color: alert.userVote === 'REPORT' ? '#991b1b' : 'var(--text-secondary)',
                                            border: alert.userVote === 'REPORT' ? '1px solid #ef4444' : '1px solid var(--border)',
                                            borderRadius: 'var(--radius-full)',
                                            cursor: alert.userVote === 'REPORT' ? 'default' : 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        👎 Pas là
                                    </button>
                                </div>
                            )}

                            {session?.user?.id === alert.userId && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(alert);
                                        }}
                                        style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(alert.id);
                                        }}
                                        style={{ fontSize: '0.8rem', color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}
