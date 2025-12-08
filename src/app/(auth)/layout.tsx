import Link from 'next/link';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--background)',
            padding: 'var(--spacing-md)',
        }}>
            <Link href="/" style={{
                marginBottom: 'var(--spacing-lg)',
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--primary)',
            }}>
                Viillaage
            </Link>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                backgroundColor: 'var(--secondary)',
                padding: 'var(--spacing-xl)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
            }}>
                {children}
            </div>
        </div>
    );
}
