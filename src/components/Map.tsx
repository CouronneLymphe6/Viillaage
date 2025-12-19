'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Alert } from '@/types';
import { renderToStaticMarkup } from 'react-dom/server';
import { AlertTriangle, Car, Construction, Dog, HelpCircle, Megaphone, ShieldAlert, UserPlus, ScrollText, Users, Vote, Info, Flame, AlertOctagon } from 'lucide-react';
import { useSession } from 'next-auth/react';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
    alerts: Alert[];
    center?: [number, number];
    onVote?: (id: string, type: 'CONFIRM' | 'REPORT') => void;
    onDelete?: (id: string) => void;
    onEdit?: (alert: Alert) => void;
    onMapClick?: (lat: number, lon: number) => void;
    clickMode?: boolean;
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

function MapClickHandler({ onMapClick, clickMode }: { onMapClick?: (lat: number, lon: number) => void; clickMode?: boolean }) {
    const map = useMapEvents({
        click: (e) => {
            if (clickMode && onMapClick) {
                onMapClick(e.latlng.lat, e.latlng.lng);
            }
        },
    });

    useEffect(() => {
        if (clickMode) {
            map.getContainer().style.cursor = 'crosshair';
        } else {
            map.getContainer().style.cursor = '';
        }
    }, [clickMode, map]);

    return null;
}

const getIconForType = (type: string) => {
    let iconComponent;
    let color = '#3B82F6'; // Default blue

    switch (type) {
        case 'ANIMAL':
            iconComponent = <Dog size={20} color="white" />;
            color = '#8B5CF6'; // Purple
            break;
        case 'ROAD_HAZARD':
            iconComponent = <Construction size={20} color="white" />;
            color = '#F97316'; // Orange
            break;
        case 'ACCIDENT':
            iconComponent = <Car size={20} color="white" />;
            color = '#F59E0B'; // Amber
            break;
        case 'SUSPICIOUS':
            iconComponent = <UserPlus size={20} color="white" />;
            color = '#10B981'; // Emerald
            break;
        case 'THEFT':
            iconComponent = <ShieldAlert size={20} color="white" />;
            color = '#DC2626'; // Red
            break;
        case 'FIRE':
            iconComponent = <Flame size={20} color="white" />;
            color = '#EF4444'; // Red
            break;
        case 'OFFICIAL':
            iconComponent = <Megaphone size={20} color="white" />;
            color = '#2563EB'; // Blue
            break;
        case 'OFFICIAL_DECREE':
            iconComponent = <ScrollText size={20} color="white" />;
            color = '#7C3AED'; // Purple
            break;
        case 'OFFICIAL_MEETING':
            iconComponent = <Users size={20} color="white" />;
            color = '#0891B2'; // Cyan
            break;
        case 'OFFICIAL_VOTE':
            iconComponent = <Vote size={20} color="white" />;
            color = '#DC2626'; // Red
            break;
        case 'OFFICIAL_INFO':
            iconComponent = <Info size={20} color="white" />;
            color = '#2563EB'; // Blue
            break;
        case 'OTHER':
            iconComponent = <Megaphone size={20} color="white" />;
            color = '#6B7280'; // Gray
            break;
        default:
            iconComponent = <Megaphone size={20} color="white" />;
            color = '#6B7280'; // Gray
    }

    const iconHtml = renderToStaticMarkup(
        <div style={{
            backgroundColor: color,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
            {iconComponent}
        </div>
    );

    return L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

const typeLabels: Record<string, string> = {
    ANIMAL: 'Animal perdu',
    ROAD_HAZARD: 'Danger / Travaux',
    ACCIDENT: 'Accident',
    SUSPICIOUS: 'Présence suspecte',
    THEFT: 'Vol / Cambriolage',
    FIRE: 'Incendie',
    OFFICIAL: 'Officiel',
    OFFICIAL_DECREE: 'Arrêté municipal',
    OFFICIAL_MEETING: 'Réunion publique',
    OFFICIAL_VOTE: 'Vote / Sondage',
    OFFICIAL_INFO: 'Information',
    OTHER: 'Autre',
};

export default function Map({ alerts, center, onVote, onDelete, onEdit, onMapClick, clickMode }: MapProps) {
    const { data: session } = useSession();
    const defaultCenter: [number, number] = [43.6487, 1.5536];

    return (
        <>
            <MapContainer
                center={center || defaultCenter}
                zoom={14}
                style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-md)' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater center={center || defaultCenter} />
                <MapClickHandler onMapClick={onMapClick} clickMode={clickMode} />
                {alerts.map((alert) => (
                    <Marker
                        key={alert.id}
                        position={[alert.latitude, alert.longitude]}
                        icon={getIconForType(alert.type)}
                    >
                        <Popup>
                            <div style={{ minWidth: '220px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <h4 style={{ margin: 0, color: 'var(--primary)' }}>{typeLabels[alert.type] || alert.type}</h4>
                                    <span style={{ fontSize: '0.8rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' }}>
                                        {alert.confirmations || 0} 👍
                                    </span>
                                </div>

                                <p style={{ marginBottom: '8px', fontSize: '0.9rem' }}>{alert.description}</p>

                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                    Par {alert.user.name || 'Anonyme'} • {new Date(alert.createdAt).toLocaleDateString('fr-FR')}
                                </p>

                                {alert.photoUrl && (
                                    <img
                                        src={alert.photoUrl}
                                        alt="Alert"
                                        style={{ width: '100%', marginBottom: '12px', borderRadius: '4px' }}
                                    />
                                )}

                                {onVote && (
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <button
                                            onClick={() => onVote(alert.id, 'CONFIRM')}
                                            disabled={alert.userVote === 'CONFIRM'}
                                            style={{
                                                flex: 1,
                                                padding: '6px',
                                                backgroundColor: alert.userVote === 'CONFIRM' ? '#10b981' : '#f3f4f6',
                                                color: alert.userVote === 'CONFIRM' ? 'white' : '#374151',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: alert.userVote === 'CONFIRM' ? 'default' : 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                            }}
                                        >
                                            👍 Toujours là
                                        </button>
                                        <button
                                            onClick={() => onVote(alert.id, 'REPORT')}
                                            disabled={alert.userVote === 'REPORT'}
                                            style={{
                                                flex: 1,
                                                padding: '6px',
                                                backgroundColor: alert.userVote === 'REPORT' ? '#ef4444' : '#f3f4f6',
                                                color: alert.userVote === 'REPORT' ? 'white' : '#374151',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: alert.userVote === 'REPORT' ? 'default' : 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                            }}
                                        >
                                            👎 Pas là
                                        </button>
                                    </div>
                                )}

                                {(session?.user?.id === alert.userId || session?.user?.role === 'ADMIN') && onEdit && onDelete && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                                        <button
                                            onClick={() => onEdit(alert)}
                                            style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                                        >
                                            ✏️ Modifier
                                        </button>
                                        <button
                                            onClick={() => onDelete(alert.id)}
                                            style={{ fontSize: '0.8rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                                        >
                                            🗑️ Supprimer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Indicateur visuel en mode clic */}
            {clickMode && (
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    pointerEvents: 'none',
                }}>
                    👆 Cliquez sur la carte pour localiser l'alerte
                </div>
            )}
        </>
    );
}
