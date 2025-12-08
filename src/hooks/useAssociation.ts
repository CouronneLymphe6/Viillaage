import { useState, useEffect } from 'react';

export function useAssociation(associationId: string | null) {
    const [association, setAssociation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        if (associationId) {
            fetchAssociation();
            fetchFollowStatus();
            incrementViewCount();
        }
    }, [associationId]);

    const fetchAssociation = async () => {
        try {
            const response = await fetch(`/api/associations/${associationId}`);
            if (response.ok) {
                const data = await response.json();
                setAssociation(data);
            }
        } catch (error) {
            console.error('Error fetching association:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFollowStatus = async () => {
        try {
            const response = await fetch(`/api/associations/${associationId}/follow`);
            if (response.ok) {
                const data = await response.json();
                setIsFollowing(data.isFollowing);
            }
        } catch (error) {
            console.error('Error fetching follow status:', error);
        }
    };

    const incrementViewCount = async () => {
        try {
            await fetch(`/api/associations/${associationId}/stats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'view' }),
            });
        } catch (error) {
            console.error('Error incrementing view count:', error);
        }
    };

    const toggleFollow = async () => {
        try {
            const response = await fetch(`/api/associations/${associationId}/follow`, {
                method: 'POST',
            });
            if (response.ok) {
                setIsFollowing(!isFollowing);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    return {
        association,
        loading,
        isFollowing,
        toggleFollow,
        refetch: fetchAssociation,
    };
}
