'use client';

import { useState } from 'react';
import styles from './FeedFilters.module.css';

export type FeedCategory = 'ALL' | 'ALERT' | 'PRO' | 'ASSOCIATION' | 'EVENT' | 'OFFICIAL' | 'MARKET';

interface FeedFiltersProps {
    activeCategory: FeedCategory;
    onCategoryChange: (category: FeedCategory) => void;
}

const categories = [
    { id: 'ALL' as FeedCategory, label: 'Tout', icon: '🏠' },
    { id: 'ALERT' as FeedCategory, label: 'Alertes & Sécurité', icon: '🚨' },
    { id: 'PRO' as FeedCategory, label: 'Actu des Pros', icon: '💼' },
    { id: 'ASSOCIATION' as FeedCategory, label: 'Actu des Assos', icon: '🤝' },
    { id: 'EVENT' as FeedCategory, label: 'Agenda', icon: '📅' },
    { id: 'OFFICIAL' as FeedCategory, label: 'Panneau Officiel', icon: '📢' },
    { id: 'MARKET' as FeedCategory, label: 'Marché', icon: '🛒' },
];

export default function FeedFilters({ activeCategory, onCategoryChange }: FeedFiltersProps) {
    return (
        <div className={styles.filtersContainer}>
            <div className={styles.filtersScroll}>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        className={`${styles.filterBtn} ${activeCategory === cat.id ? styles.active : ''}`}
                        onClick={() => onCategoryChange(cat.id)}
                    >
                        <span className={styles.icon}>{cat.icon}</span>
                        <span className={styles.label}>{cat.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
