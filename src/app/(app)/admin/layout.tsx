import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth/isAdmin';
import Link from 'next/link';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const admin = await isAdmin();

    if (!admin) {
        redirect('/feed');
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            {/* Sidebar */}
            <aside style={{
                width: '250px',
                backgroundColor: '#1f2937',
                color: 'white',
                padding: 'var(--spacing-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-md)'
            }}>
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px' }}>Admin</h2>
                    <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Viillaage</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                    <Link
                        href="/admin/dashboard"
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            color: 'inherit',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        📊 Dashboard
                    </Link>
                    <Link
                        href="/admin/contact-messages"
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            color: 'inherit',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        💬 Messages
                    </Link>
                    <Link
                        href="/admin/users"
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            color: 'inherit',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        👥 Utilisateurs
                    </Link>
                    <Link
                        href="/admin/moderation"
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            color: 'inherit',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        🛡️ Modération
                    </Link>
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid #374151' }}>
                    <Link
                        href="/feed"
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'block',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        ← Retour au site
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <main style={{ flex: 1, padding: 'var(--spacing-xl)' }}>
                {children}
            </main>
        </div>
    );
}
