
export default function Loading() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-md)' }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{
                    backgroundColor: 'var(--secondary)',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    height: '200px',
                    animation: 'pulse 1.5s infinite ease-in-out',
                }}>
                    <div style={{ height: '24px', width: '60%', backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: '16px', borderRadius: '4px' }} />
                    <div style={{ height: '16px', width: '100%', backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: '8px', borderRadius: '4px' }} />
                    <div style={{ height: '16px', width: '80%', backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: '8px', borderRadius: '4px' }} />
                </div>
            ))}
            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.6; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
