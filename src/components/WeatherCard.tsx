'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, Moon, CloudLightning, CloudSnow } from 'lucide-react';

interface DayPart {
    temp: number;
    condition: string;
    code: number;
}

interface WeatherData {
    current: DayPart;
    morning: DayPart;
    noon: DayPart;
    evening: DayPart;
    success: boolean;
}

export default function WeatherCard() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const res = await fetch('/api/weather');
                if (res.ok) {
                    const data = await res.json();
                    setWeather(data);
                }
            } catch (error) {
                console.error('Failed to load weather', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    const getWeatherIcon = (condition: string, size: number = 24) => {
        const lower = condition.toLowerCase();
        if (lower.includes('orage')) return <CloudLightning size={size} color="#6366f1" />;
        if (lower.includes('neige')) return <CloudSnow size={size} color="#93c5fd" />;
        if (lower.includes('pluie') || lower.includes('averse') || lower.includes('bruine')) return <CloudRain size={size} color="#3B82F6" />;
        if (lower.includes('brouillard') || lower.includes('givre')) return <Wind size={size} color="#9CA3AF" />;
        if (lower.includes('nuage') || lower.includes('couvert') || lower.includes('partiel')) return <Cloud size={size} color="#9CA3AF" />;
        if (lower.includes('nuit')) return <Moon size={size} color="#6366F1" />;
        return <Sun size={size} color="#F59E0B" />;
    };

    const getBackgroundGradient = (condition: string) => {
        const lower = condition.toLowerCase();
        if (lower.includes('pluie') || lower.includes('averse')) return 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)';
        if (lower.includes('nuage') || lower.includes('brouillard')) return 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)';
        if (lower.includes('orage')) return 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)';
        return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'; // Soleil par défaut
    };

    if (loading) {
        return (
            <div style={{
                backgroundColor: 'var(--background)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-md)',
                boxShadow: 'var(--shadow-sm)',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px'
            }}>
                <div style={{ color: 'var(--text-secondary)' }}>Chargement de la météo...</div>
            </div>
        );
    }

    if (!weather || !weather.success) {
        return null;
    }

    return (
        <div style={{
            background: getBackgroundGradient(weather.current.condition),
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-md)',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',
            overflow: 'hidden',
            color: 'var(--text-main)',
            border: '1px solid rgba(0,0,0,0.05)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '700' }}>
                        Beaupuy
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
                        Météo du jour
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1 }}>
                        {weather.current.temp}°
                    </div>
                    {getWeatherIcon(weather.current.condition, 40)}
                </div>
            </div>

            {/* Prévisions horaires */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(255,255,255,0.4)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 8px',
                marginTop: '12px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', opacity: 0.7 }}>MATIN</span>
                    {getWeatherIcon(weather.morning.condition, 24)}
                    <span style={{ fontWeight: '700' }}>{weather.morning.temp}°</span>
                </div>
                <div style={{ width: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', opacity: 0.7 }}>MIDI</span>
                    {getWeatherIcon(weather.noon.condition, 24)}
                    <span style={{ fontWeight: '700' }}>{weather.noon.temp}°</span>
                </div>
                <div style={{ width: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', opacity: 0.7 }}>SOIR</span>
                    {getWeatherIcon(weather.evening.condition, 24)}
                    <span style={{ fontWeight: '700' }}>{weather.evening.temp}°</span>
                </div>
            </div>
        </div>
    );
}
