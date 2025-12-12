'use client';

export default function DashboardSkeleton() {
    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
            <div className="dashboard-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px'
            }}>
                {/* Skeleton cards */}
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        style={{
                            backgroundColor: 'var(--secondary)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '24px',
                            minHeight: '200px',
                            animation: 'pulse 2s infinite',
                        }}
                    >
                        <div style={{
                            height: '24px',
                            width: '60%',
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            borderRadius: '4px',
                            marginBottom: '16px',
                        }} />
                        <div style={{
                            height: '16px',
                            width: '80%',
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            borderRadius: '4px',
                            marginBottom: '8px',
                        }} />
                        <div style={{
                            height: '16px',
                            width: '70%',
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            borderRadius: '4px',
                        }} />
                    </div>
                ))}
            </div>
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
