'use client';

import { FeedItemType } from '@/lib/feedService';
import styles from './Feed.module.css';

interface Category {
    id: FeedItemType;
    label: string;
    icon: string;
    color: string;
}

const CATEGORIES: Category[] = [
    { id: 'ALERT', label: 'Alertes & Sécurité', icon: '🚨', color: '#EF4444' },
    { id: 'PRO_POST', label: 'Actu des Pros', icon: '💼', color: '#8B5CF6' },
    { id: 'ASSO_POST', label: 'Actu des Assos', icon: '🎭', color: '#EC4899' },
    { id: 'EVENT', label: 'Agenda', icon: '📅', color: '#3B82F6' },
    { id: 'OFFICIAL', label: 'Panneau Officiel', icon: '📢', color: '#10B981' },
    { id: 'LISTING', label: 'Marché', icon: '🛒', color: '#F59E0B' },
];

interface FeedFiltersProps {
    activeFilters: FeedItemType[];
    onChange: (filters: FeedItemType[]) => void;
}

export default function FeedFilters({ activeFilters, onChange }: FeedFiltersProps) {
    const toggleFilter = (categoryId: FeedItemType) => {
        if (activeFilters.includes(categoryId)) {
            onChange(activeFilters.filter(f => f !== categoryId));
        } else {
            onChange([...activeFilters, categoryId]);
        }
    };

    const clearFilters = () => {
        onChange([]);
    };

    return (
        <div className={styles.filters}>
            <button
                className={`${styles.filterButton} ${activeFilters.length === 0 ? styles.active : ''}`}
                onClick={clearFilters}
            >
                Tout
            </button>

            {CATEGORIES.map((category) => {
                const isActive = activeFilters.includes(category.id);

                return (
                    <button
                        key={category.id}
                        className={`${styles.filterButton} ${isActive ? styles.active : ''}`}
                        onClick={() => toggleFilter(category.id)}
                        style={{
                            borderColor: isActive ? category.color : 'transparent',
                            backgroundColor: isActive ? `${category.color}15` : 'white',
                            color: isActive ? category.color : 'var(--text-main)',
                        }}
                    >
                        <span className={styles.filterIcon}>{category.icon}</span>
                        <span className={styles.filterLabel}>{category.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
