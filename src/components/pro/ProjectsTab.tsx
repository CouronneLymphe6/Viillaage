'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Plus } from 'lucide-react';

interface Project {
    id: string;
    title: string;
    description: string;
    photo?: string | null;
    status: string;
    startDate?: string | null;
    createdAt: string;
}

interface ProjectsTabProps {
    businessId: string;
    isOwner: boolean;
}

export function ProjectsTab({ businessId, isOwner }: ProjectsTabProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, [businessId]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/businesses/${businessId}/projects`);
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Chargement...</p>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Projets & Actions</h2>
                {isOwner && (
                    <button
                        onClick={() => setShowForm(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '600',
                            cursor: 'pointer',
                        }}
                    >
                        <Plus size={18} />
                        Ajouter
                    </button>
                )}
            </div>

            {projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <Briefcase size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {isOwner ? 'Ajoutez votre premier projet' : 'Aucun projet en cours'}
                    </p>
                </div>
            ) : (
                <div style={{ position: 'relative', paddingLeft: '30px' }}>
                    <div style={{
                        position: 'absolute',
                        left: '11px',
                        top: '20px',
                        bottom: '20px',
                        width: '2px',
                        backgroundColor: 'var(--border)',
                    }} />

                    {projects.map((project) => {
                        const statusColor = project.status === 'COMPLETED' ? '#27ae60' : project.status === 'IN_PROGRESS' ? 'var(--primary)' : 'var(--text-secondary)';
                        const statusLabel = project.status === 'COMPLETED' ? 'Terminé' : project.status === 'IN_PROGRESS' ? 'En cours' : 'Prévu';

                        return (
                            <div key={project.id} style={{ position: 'relative', marginBottom: '24px' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '-26px',
                                    top: '8px',
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    backgroundColor: statusColor,
                                    border: '3px solid var(--secondary)',
                                }} />

                                <div style={{
                                    backgroundColor: 'var(--secondary)',
                                    padding: '16px',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: 'var(--shadow-sm)',
                                }}>
                                    {project.photo && (
                                        <div style={{
                                            width: '100%',
                                            height: '200px',
                                            backgroundImage: `url(${project.photo})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            borderRadius: 'var(--radius-sm)',
                                            marginBottom: '12px',
                                        }} />
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{project.title}</h3>
                                        <span style={{
                                            backgroundColor: statusColor,
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                        }}>
                                            {statusLabel}
                                        </span>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
                                        {project.description}
                                    </p>
                                    {project.startDate && (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            📅 Début : {new Date(project.startDate).toLocaleDateString('fr-FR')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showForm && (
                <ProjectForm
                    businessId={businessId}
                    onClose={() => setShowForm(false)}
                    onSuccess={() => {
                        fetchProjects();
                        setShowForm(false);
                    }}
                />
            )}
        </div>
    );
}

function ProjectForm({ businessId, onClose, onSuccess }: { businessId: string, onClose: () => void, onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'PLANNED',
        startDate: '',
        photo: '',
    });
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image valide');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('L\'image est trop grande. Maximum 5MB.');
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, photo: reader.result as string });
            setUploading(false);
        };
        reader.onerror = () => {
            alert('Erreur lors de la lecture de l\'image');
            setUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/businesses/${businessId}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    startDate: formData.startDate || null,
                    photo: formData.photo || null,
                }),
            });

            if (response.ok) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
        }} onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} style={{
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
            }}>
                <h2 style={{ marginBottom: '20px' }}>Ajouter un projet</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Titre *</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Description *</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                                resize: 'vertical',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Statut *</label>
                        <select
                            required
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                            }}
                        >
                            <option value="PLANNED">📋 Prévu</option>
                            <option value="IN_PROGRESS">🚀 En cours</option>
                            <option value="COMPLETED">✅ Terminé</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Date de début</label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                            }}
                        />
                        {uploading && <p style={{ marginTop: '8px', color: 'var(--primary)' }}>Chargement...</p>}
                        {formData.photo && (
                            <div style={{ marginTop: '12px' }}>
                                <img src={formData.photo} alt="Preview" style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: 'var(--background)',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: '600',
                                cursor: uploading ? 'not-allowed' : 'pointer',
                                opacity: uploading ? 0.5 : 1,
                            }}
                        >
                            Ajouter
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
