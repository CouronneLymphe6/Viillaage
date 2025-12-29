import { 
  FeedPost, 
  Alert, 
  ProPost, 
  AssociationPost, 
  Event, 
  Listing,
  User,
  Business,
  Association,
  Village
} from '@prisma/client';

export type FeedItemType = 
  | 'FEED_POST' 
  | 'ALERT' 
  | 'PRO_POST' 
  | 'ASSOCIATION_POST' 
  | 'EVENT' 
  | 'ASSOCIATION_EVENT'
  | 'LISTING';

export interface FeedAuthor {
  id: string;
  name: string;
  image: string | null;
  type: 'USER' | 'BUSINESS' | 'ASSOCIATION' | 'SYSTEM';
  subline?: string; // e.g., "Boulangerie", "Maire", etc.
}

export interface FeedItem {
  id: string;
  type: FeedItemType;
  createdAt: Date;
  author: FeedAuthor;
  content: {
    title?: string;
    text: string;
    mediaUrl?: string | null;
    mediaType?: 'PHOTO' | 'VIDEO' | 'NONE' | null;
  };
  metrics: {
    likes: number;
    comments: number;
    isLiked?: boolean; // Contextual to current user
  };
  metadata?: {
    // Specific fields
    alertType?: string;
    eventDate?: Date;
    price?: number;
    listingCategory?: string;
    location?: string;
    status?: string;
  };
  originalId: string; // ID in the source table
}
