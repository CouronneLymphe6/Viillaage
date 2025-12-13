'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Package, Plus, Edit2, Trash2 } from 'lucide-react';
import { compressImage, formatFileSize } from '@/lib/imageUtils';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    description: string;
    price?: number | null;
    photos: string;
    isAvailable: boolean;
    tags: string;
}

interface ProductsTabProps {
    businessId: string;
    isOwner: boolean;
}

export function ProductsTab({ businessId, isOwner }: ProductsTabProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts();
    }, [businessId]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/businesses/${businessId}/products`);
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;

        try {
            const response = await fetch(`/api/businesses/${businessId}/products/${productId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchProducts();
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    if (loading) {
        return <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Chargement...</p>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Produits & Services</h2>
                {isOwner && (
                    <button
                        onClick={() => {
                            setEditingProduct(null);
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

            {products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <Package size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {isOwner ? 'Ajoutez votre premier produit' : 'Aucun produit pour le moment'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                    {products.map((product) => {
                        const productPhotos = JSON.parse(product.photos || '[]');
                        const productTags = JSON.parse(product.tags || '[]');

                        return (
                            <div key={product.id} style={{
                                backgroundColor: 'var(--secondary)',
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                boxShadow: 'var(--shadow-sm)',
                                position: 'relative',
                            }}>
                                {isOwner && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        display: 'flex',
                                        gap: '8px',
                                        zIndex: 1,
                                    }}>
                                        <button
                                            onClick={() => handleEdit(product)}
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
                                            onClick={() => handleDelete(product.id)}
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
                                {productPhotos[0] && (
                                    <div style={{
                                        width: '100%',
                                        height: '200px',
                                        backgroundImage: `url(${productPhotos[0]})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }} />
                                )}
                                <div style={{ padding: '16px' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{product.name}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>
                                        {product.description}
                                    </p>
                                    {product.price && (
                                        <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>
                                            {product.price.toFixed(2)} €
                                        </p>
                                    )}
                                    {productTags.length > 0 && (
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                            {productTags.map((tag: string, idx: number) => (
                                                <span key={idx} style={{
                                                    backgroundColor: 'var(--primary)',
                                                    color: 'white',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {!product.isAvailable && (
                                        <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '8px', fontWeight: '600' }}>
                                            Indisponible
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showForm && (
                <ProductForm
                    businessId={businessId}
                    product={editingProduct}
                    onClose={() => {
                        setShowForm(false);
                        setEditingProduct(null);
                    }}
                    onSuccess={() => {
                        fetchProducts();
                        setShowForm(false);
                        setEditingProduct(null);
                    }}
                />
            )}
        </div>
    );
}

// Formulaire modal pour ajouter/modifier un produit
function ProductForm({ businessId, product, onClose, onSuccess }: {
    businessId: string;
    product: Product | null;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price?.toString() || '',
        photos: product ? JSON.parse(product.photos)[0] || '' : '',
        tags: product ? JSON.parse(product.tags).join(', ') : '',
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
            // Compress image to ensure it's under size limit
            const compressed = await compressImage(file, 1200, 1200, 0.8);
            setFormData({ ...formData, photos: compressed });
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
        try {
            const photos = formData.photos ? JSON.stringify([formData.photos]) : '[]';
            const tags = formData.tags ? JSON.stringify(formData.tags.split(',').map((t: string) => t.trim())) : '[]';

            const url = product
                ? `/api/businesses/${businessId}/products/${product.id}`
                : `/api/businesses/${businessId}/products`;

            const method = product ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: formData.price ? parseFloat(formData.price) : null,
                    photos,
                    tags,
                }),
            });

            if (response.ok) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error saving product:', error);
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
                <h2 style={{ marginBottom: '20px' }}>{product ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Nom *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Prix (€)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Tags (séparés par des virgules)</label>
                        <input
                            type="text"
                            placeholder="Bio, Local, Nouveauté"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
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
                        {uploading && <p style={{ marginTop: '8px', color: 'var(--primary)' }}>Compression en cours...</p>}
                        {uploadError && <p style={{ marginTop: '8px', color: '#c33', fontSize: '0.9rem' }}>{uploadError}</p>}
                        {formData.photos && (
                            <div style={{ marginTop: '12px', position: 'relative', width: '100%', height: '200px' }}>
                                <Image src={formData.photos} alt="Preview" fill style={{ borderRadius: 'var(--radius-md)', objectFit: 'cover' }} loading="lazy" sizes="600px" />
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
                            {product ? 'Modifier' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
