'use client';

import { useState, useEffect } from 'react';
import DailySummaryCard from '@/components/DailySummaryCard';
import WeatherCard from '@/components/WeatherCard';
import { Share2, Users } from 'lucide-react';

export default function FeedWidgets() {
    const [userCount, setUserCount] = useState<number | null>(null);

    useEffect(() => {
        // Fetch user count separately to avoid heavy dashboard query
        // Using dashboard API for now but extracting only what we need
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(data => setUserCount(data.userCount))
            .catch(err => console.error('Error fetching stats:', err));
    }, []);

    const handleInvite = () => {
        const shareText = `Rejoignez-moi sur Viillaage ! 🏘️\n\n${typeof window !== 'undefined' ? window.location.origin : ''}`;
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({
                title: 'Viillaage',
                text: shareText,
            }).catch(() => { });
        } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(shareText);
            alert('Lien copié ! 📋');
        }
    };

    return (
        <div className="feed-widgets">
            {/* Desktop Layout: Grid */}
            <div className="widgets-grid">
                {/* Main Widget: Gazette */}
                <div className="widget-main">
                    <DailySummaryCard />
                </div>

                {/* Side Widgets: Weather & Community */}
                <div className="widget-side">
                    <div className="weather-container">
                        <WeatherCard />
                    </div>

                    <div className="stats-card">
                        <div className="stat-item">
                            <Users size={20} className="stat-icon" />
                            <div className="stat-info">
                                <span className="stat-value">{userCount || '...'}</span>
                                <span className="stat-label">Inscrits</span>
                            </div>
                        </div>
                        <button onClick={handleInvite} className="invite-btn">
                            <Share2 size={16} />
                            <span>Inviter</span>
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .feed-widgets {
                    margin-bottom: 24px;
                }

                .widgets-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                @media (min-width: 768px) {
                    .widgets-grid {
                        display: grid;
                        grid-template-columns: 2fr 1fr;
                        align-items: stretch;
                    }
                }

                .widget-side {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .weather-container {
                    flex: 1;
                }

                .stats-card {
                    background: var(--secondary);
                    border-radius: var(--radius-md);
                    padding: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--border);
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .stat-icon {
                    color: var(--primary);
                    background: rgba(0, 191, 165, 0.1);
                    padding: 6px;
                    box-sizing: content-box;
                    border-radius: 50%;
                }

                .stat-info {
                    display: flex;
                    flex-direction: column;
                }

                .stat-value {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--text-main);
                    line-height: 1;
                }

                .stat-label {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                .invite-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 6px 12px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .invite-btn:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 191, 165, 0.3);
                }
            `}</style>
        </div>
    );
}
