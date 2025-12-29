import { DefaultSession } from "next-auth";

// Extend the default session types
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            villageId: string;
            role: string;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        villageId: string;
        role: string;
    }
}

// Session user type for use in components
export interface SessionUser {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    villageId: string;
    role: string;
}
