import { getUnifiedFeed } from '@/lib/feed/feed-service';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FeedList } from "@/components/feed/FeedList";
import CreatePost from "@/components/feed/CreatePost";
import { redirect } from "next/navigation";

export default async function FeedPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const user = session.user as any;
    // Fetch initial data on server side for SEO and speed
    const initialItems = await getUnifiedFeed(1, 20, user.id, user.villageId);

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Fil d&apos;actualité</h1>
                <p className="text-gray-500 mt-1">Ce qui se passe dans votre village</p>
            </div>

            <CreatePost />

            <FeedList initialItems={initialItems} />
        </div>
    );
}
