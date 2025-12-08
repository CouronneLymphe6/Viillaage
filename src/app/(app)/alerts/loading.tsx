
export default function Loading() {
    return (
        <div style={{ height: 'calc(100vh - 64px)', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid var(--primary)',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto var(--spacing-md)',
                }} />
                <p>Chargement de la carte...</p>
            </div>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
