"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Image as ImageIcon, Send } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/Toast';


export default function CreatePost() {
    const { data: session } = useSession();
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && !imageUrl) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/feed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    mediaUrl: imageUrl,
                    mediaType: imageUrl ? 'PHOTO' : 'NONE',
                    category: 'GENERAL'
                })
            });

            if (!res.ok) throw new Error('Failed to post');

            setContent('');
            setImageUrl(null);
            setShowImageUpload(false);

            // Refresh the page to show the new post
            router.refresh();
            toast('Publication créée avec succès !', 'success');
        } catch (error) {
            console.error(error);
            toast('Erreur lors de la publication. Veuillez réessayer.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!session) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex space-x-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {session?.user?.image ? (
                        <Image
                            src={session.user.image}
                            alt={session.user.name || 'User'}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={`Quoi de neuf, ${session.user.name?.split(' ')[0]} ?`}
                            className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-gray-700 placeholder-gray-400 resize-none"
                            rows={2}
                        />

                        {showImageUpload && (
                            <div className="mt-3">
                                {imageUrl ? (
                                    <div className="relative w-full h-48 rounded-lg overflow-hidden group">
                                        <Image src={imageUrl} alt="Upload preview" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => { setImageUrl(null); setShowImageUpload(false); }}
                                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                                        >
                                            X
                                        </button>
                                    </div>
                                ) : (
                                    <ImageUpload
                                        currentImage={imageUrl}
                                        onUpload={(url: string) => setImageUrl(url)}
                                    />
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-3">
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowImageUpload(!showImageUpload)}
                                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${showImageUpload ? 'text-primary bg-primary/10' : 'text-gray-500'}`}
                                >
                                    <ImageIcon className="w-6 h-6" />
                                </button>
                                {/* Add more attachment types here later */}
                            </div>

                            <button
                                type="submit"
                                disabled={(!content.trim() && !imageUrl) || isLoading}
                                className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Publier</span>
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
