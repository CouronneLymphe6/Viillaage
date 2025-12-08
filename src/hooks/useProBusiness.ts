import { useState, useEffect } from 'react';

export function useProBusiness(businessId: string | null) {
    const [business, setBusiness] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        if (businessId) {
            fetchBusiness();
            fetchFollowStatus();
            incrementViewCount();
        }
    }, [businessId]);

    const fetchBusiness = async () => {
        if (!businessId) return;
        try {
            const response = await fetch(`/api/businesses/${businessId}`);
            if (response.ok) {
                const data = await response.json();
                setBusiness(data);
            }
        } catch (error) {
            console.error('Error fetching business:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFollowStatus = async () => {
        if (!businessId) return;
        try {
            const response = await fetch(`/api/businesses/${businessId}/follow`);
            if (response.ok) {
                const data = await response.json();
                setIsFollowing(data.isFollowing);
            }
        } catch (error) {
            console.error('Error fetching follow status:', error);
        }
    };

    const incrementViewCount = async () => {
        if (!businessId) return;
        try {
            await fetch(`/api/businesses/${businessId}/stats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'view' }),
            });
        } catch (error) {
            console.error('Error incrementing view count:', error);
        }
    };

    const toggleFollow = async () => {
        if (!businessId) return;
        try {
            const response = await fetch(`/api/businesses/${businessId}/follow`, {
                method: 'POST',
            });
            if (response.ok) {
                const data = await response.json();
                setIsFollowing(data.following);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    return { business, loading, isFollowing, toggleFollow, refetch: fetchBusiness };
}
