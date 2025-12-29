"use client";

import { useState, useRef, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { FeedItem } from "@/lib/feed/types";
import { FeedCard } from "./FeedCard";
import { Loader } from "@/components/Loader";

interface FeedListProps {
    initialItems?: FeedItem[];
}

export function FeedList({ initialItems = [] }: FeedListProps) {
    const [items, setItems] = useState<FeedItem[]>(initialItems);
    const [page, setPage] = useState(2); // Start fetching from page 2 since initialItems is page 1
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const { ref, inView } = useInView();

    const loadMore = async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/feed?page=${page}&limit=20`);
            if (!res.ok) throw new Error("Failed to fetch feed");

            const data = await res.json();

            if (data.items.length === 0) {
                setHasMore(false);
            } else {
                // Prevent duplicates (simple check by ID)
                setItems(prev => {
                    const newItems = data.items.filter((newItem: FeedItem) => !prev.some(p => p.id === newItem.id));
                    return [...prev, ...newItems];
                });
                setPage(prev => prev + 1);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (inView && hasMore) {
            loadMore();
        }
    }, [inView, hasMore]);


    // Refresh triggered by parent or new post creation could be handled via context or refetch method?
    // For now simple infinite scroll.

    return (
        <div className="space-y-6">
            {items.map((item) => (
                <FeedCard key={item.id} item={item} />
            ))}

            {loading && (
                <div className="flex justify-center p-4">
                    <Loader />
                </div>
            )}

            {hasMore && <div ref={ref} className="h-10" />}

            {!hasMore && items.length > 0 && (
                <div className="text-center text-gray-400 py-8 text-sm">
                    Vous êtes à jour !
                </div>
            )}

            {!loading && items.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Aucune publication pour le moment.</p>
                    <p className="text-gray-400 text-sm mt-2">Soyez le premier à poster quelque chose !</p>
                </div>
            )}
        </div>
    );
}
