'use client';

interface LoaderProps {
    size?: 'small' | 'medium' | 'large';
    text?: string;
    fullScreen?: boolean;
}

export default function Loader({ size = 'medium', text, fullScreen = false }: LoaderProps) {
    const sizeMap = {
        small: 24,
        medium: 40,
        large: 60,
    };

    const loaderSize = sizeMap[size];

    const loaderContent = (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-md)',
        }}>
            {/* Modern spinner with Mimiru theme */}
            <div
                style={{
                    width: `${loaderSize}px`,
                    height: `${loaderSize}px`,
                    border: `3px solid rgba(52, 211, 153, 0.2)`,
                    borderTop: '3px solid var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }}
            />

            {text && (
                <p style={{
                    margin: 0,
                    color: 'var(--text-secondary)',
                    fontSize: size === 'small' ? '0.875rem' : '1rem',
                    fontWeight: '500',
                }}>
                    {text}
                </p>
            )}

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );

    if (fullScreen) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                zIndex: 9999,
            }}>
                {loaderContent}
            </div>
        );
    }

    return loaderContent;
}
