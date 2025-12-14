'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, FolderOpen, Briefcase } from 'lucide-react';
import Loader from '@/components/Loader';
import { compressImage, formatFileSize } from '@/lib/imageUtils';

interface AssociationProject {
    id: string;
    title: string;
    description: string;
    status: string;
    photo?: string | null;
    startDate?: string | null;
    createdAt: string;
}

interface ProjectsTabProps {
    associationId: string;
    isOwner: boolean;
}

export function ProjectsTab({ associationId, isOwner }: ProjectsTabProps) {
    const [projects, setProjects] = useState<AssociationProject[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState<AssociationProject | null>(null);

    useEffect(() => {
        fetchProjects();
    }, [associationId]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/associations/${associationId}/projects`);
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

    const getStatusInfo = (status: string) => {
        const statusMap: Record<string, { label: string, color: string, emoji: string }> = {
            'PLANNED': { label: 'Prévu', color: '#3b82f6', emoji: '📋' },
            'IN_PROGRESS': { label: 'En cours', color: '#f59e0b', emoji: '🚀' },
            'COMPLETED': { label: 'Terminé', color: '#10b981', emoji: '✅' },
        };
        return statusMap[status] || { label: status, color: '#6b7280', emoji: '📌' };
    };

    const handleDelete = async (projectId: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce projet ?')) return;

        // OPTIMISTIC UI: Remove immediately
        const previousProjects = [...projects];
        setProjects(projects.filter(p => p.id !== projectId));

        try {
            const response = await fetch(`/api/associations/${associationId}/projects/${projectId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                // Rollback on error
                setProjects(previousProjects);
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            // Rollback on error
            setProjects(previousProjects);
            console.error('Error deleting project:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleEdit = (project: AssociationProject) => {
        setEditingProject(project);
        setShowForm(true);
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}><Loader text="Chargement des projets..." /></div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Projets</h2>
                {isOwner && (
                    <button
                        onClick={() => {
                            setEditingProject(null);
                            setShowForm(true);
                        }}
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
                        {isOwner ? 'Ajoutez votre premier projet' : 'Aucun projet pour le moment'}
                    </p>
                </div>
            ) : (
                <div style={{ position: 'relative', paddingLeft: '40px' }}>
                    {/* Timeline line */}
                    <div style={{
                        position: 'absolute',
                        left: '15px',
                        top: '20px',
                        bottom: '20px',
                        width: '2px',
                        backgroundColor: 'var(--border)',
                    }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {projects.map((project) => {
                            const statusInfo = getStatusInfo(project.status);

                            return (
                                <div key={project.id} style={{ position: 'relative' }}>
                                    {/* Timeline dot */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '-32px',
                                        top: '8px',
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        backgroundColor: statusInfo.color,
                                        border: '3px solid var(--background)',
                                        boxShadow: '0 0 0 2px var(--border)',
                                    }} />

                                    <div style={{
                                        backgroundColor: 'var(--secondary)',
                                        padding: '20px',
                                        borderRadius: 'var(--radius-md)',
                                        boxShadow: 'var(--shadow-sm)',
                                        position: 'relative',
                                    }}>
                                        {isOwner && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                display: 'flex',
                                                gap: '8px',
                                                zIndex: 1,
                                            }}>
                                                <button
                                                    onClick={() => handleEdit(project)}
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    }}
                                                    title="Modifier"
                                                >
                                                    <Edit2 size={16} color="#666" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(project.id)}
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    }}
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={16} color="#c33" />
                                                </button>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{project.title}</h3>
                                            <span style={{
                                                padding: '4px 12px',
                                                backgroundColor: `${statusInfo.color}20`,
                                                color: statusInfo.color,
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {statusInfo.emoji} {statusInfo.label}
                                            </span>
                                        </div>

                                        {project.photo && (
                                            <div style={{
                                                width: '100%',
                                                maxHeight: '300px',
                                                borderRadius: 'var(--radius-md)',
                                                overflow: 'hidden',
                                                marginBottom: '12px',
                                            }}>
                                                <img src={project.photo} alt={project.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                                            </div>
                                        )}

                                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
                                            {project.description}
                                        </p>

                                        {project.startDate && (
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                📅 Démarré le {new Date(project.startDate).toLocaleDateString('fr-FR')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {showForm && (
                <ProjectForm
                    associationId={associationId}
                    project={editingProject}
                    projects={projects}
                    setProjects={setProjects}
                    onClose={() => {
                        setShowForm(false);
                        setEditingProject(null);
                    }}
                    onSuccess={() => {
                        setShowForm(false);
                        setEditingProject(null);
                    }}
                />
            )}
        </div>
    );
}

function ProjectForm({ associationId, project, projects, setProjects, onClose, onSuccess }: {
    associationId: string,
    project: AssociationProject | null,
    projects: AssociationProject[],
    setProjects: React.Dispatch<React.SetStateAction<AssociationProject[]>>,
    onClose: () => void,
    onSuccess: () => void
}) {
    const [formData, setFormData] = useState({
        title: project?.title || '',
        description: project?.description || '',
        status: project?.status || 'PLANNED',
        startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        photo: project?.photo || '',
    });
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError(null);

        if (!file.type.startsWith('image/')) {
            setUploadError('Veuillez sélectionner une image valide (JPG, PNG, etc.)');
            return;
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 10) {
            setUploadError(`Image trop grande (${formatFileSize(file.size)}). Maximum 10MB.`);
            return;
        }

        setUploading(true);
        try {
            const compressed = await compressImage(file, 1200, 1200, 0.8);
            setFormData({ ...formData, photo: compressed });
            setUploadError(null);
        } catch (error) {
            console.error('Image compression error:', error);
            setUploadError('Erreur lors du traitement de l\'image. Veuillez réessayer.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // OPTIMISTIC UI: Add/Update immediately
        const previousProjects = [...projects];

        const projectData = {
            ...formData,
            startDate: formData.startDate || null,
            photo: formData.photo || null,
        };

        if (project) {
            // Update existing
            setProjects(projects.map(p =>
                p.id === project.id
                    ? { ...p, ...projectData, createdAt: p.createdAt }
                    : p
            ));
        } else {
            // Create new with temp ID
            const tempProject: AssociationProject = {
                id: 'temp-' + Date.now(),
                ...projectData,
                createdAt: new Date().toISOString(),
            };
            setProjects([tempProject, ...projects]);
        }

        onSuccess(); // Close form immediately

        try {
            const url = project
                ? `/api/associations/${associationId}/projects/${project.id}`
                : `/api/associations/${associationId}/projects`;
            const method = project ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData),
            });

            if (response.ok) {
                if (!project) {
                    // Replace temp with real data
                    const realProject = await response.json();
                    setProjects(prev => prev.map(p =>
                        p.id.startsWith('temp-') ? realProject : p
                    ));
                }
            } else {
                // Rollback on error
                setProjects(previousProjects);
                alert('Erreur lors de l\'enregistrement');
            }
        } catch (error) {
            // Rollback on error
            setProjects(previousProjects);
            console.error('Error saving project:', error);
            alert('Erreur lors de l\'enregistrement');
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
                <h2 style={{ marginBottom: '20px' }}>{project ? 'Modifier le projet' : 'Ajouter un projet'}</h2>
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
                            rows={4}
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
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Date de début (optionnelle)</label>
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
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Photo (optionnelle)</label>
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
                        {uploading && <p style={{ marginTop: '8px', color: 'var(--primary)' }}>Compression en cours...</p>}
                        {uploadError && <p style={{ marginTop: '8px', color: '#c33', fontSize: '0.9rem' }}>{uploadError}</p>}
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
                            {project ? 'Modifier' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
