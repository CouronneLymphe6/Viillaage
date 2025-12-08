export interface User {
    id: string;
    name: string | null;
    email?: string | null;
    image?: string | null;
}

export interface Alert {
    id: string;
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    photoUrl?: string | null;
    createdAt: string;
    userId: string;
    user: User;
    confirmations: number;
    reports: number;
    userVote?: 'CONFIRM' | 'REPORT' | null;
    status?: string;
}
